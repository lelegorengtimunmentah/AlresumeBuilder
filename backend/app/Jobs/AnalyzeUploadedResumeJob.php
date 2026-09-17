<?php

namespace App\Jobs;

use App\Models\UploadedAnalysis;
use App\Services\AIService;
use App\Services\PromptBuilder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AnalyzeUploadedResumeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 1;
    public $timeout = 180;

    public function __construct(public string $analysisId) {}

    public function handle(AIService $aiService): void
    {
        $analysis = UploadedAnalysis::findOrFail($this->analysisId);
        $analysis->update(['status' => 'processing']);

        try {
            $prompt = PromptBuilder::buildUploadedATSPrompt($analysis->extracted_text);
            $result = $aiService->callWithFallback($prompt);

            $data = $this->parseJson($result);

            // Validate required top-level keys
            if (! isset($data['score'])) {
                throw new \Exception('AI response missing required "score" field.');
            }

            $analysis->update([
                'status'           => 'completed',
                'score'            => (int) ($data['score'] ?? 0),
                'recommendations'  => $data['recommendations'] ?? [],
                'section_scores'   => $data['section_scores'] ?? null,
                'keywords_found'   => $data['keywords_found'] ?? [],
                'keywords_missing' => $data['keywords_missing'] ?? [],
                'parsed_data'      => $data['parsed_data'] ?? null,
            ]);
        } catch (\Exception $e) {
            $analysis->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Parse JSON from AI response, stripping markdown code fences if present.
     *
     * @throws \Exception on invalid JSON
     */
    private function parseJson(string $raw): array
    {
        // Strip ```json ... ``` or ``` ... ``` wrappers
        $cleaned = preg_replace('/^```(?:json)?\s*/i', '', trim($raw)) ?? $raw;
        $cleaned = preg_replace('/\s*```$/', '', $cleaned) ?? $cleaned;

        $data = json_decode(trim($cleaned), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('AI returned invalid JSON: ' . json_last_error_msg());
        }

        return $data;
    }
}
