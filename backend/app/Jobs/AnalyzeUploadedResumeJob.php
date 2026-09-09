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
    public $timeout = 150;

    public function __construct(public string $analysisId) {}

    public function handle(AIService $aiService): void
    {
        $analysis = UploadedAnalysis::findOrFail($this->analysisId);
        $analysis->update(['status' => 'processing']);

        try {
            $prompt = PromptBuilder::buildUploadedATSPrompt($analysis->extracted_text);
            $result = $aiService->callWithFallback($prompt);

            $data = json_decode($result, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('AI returned invalid JSON for ATS score');
            }

            $analysis->update([
                'status' => 'completed',
                'score' => $data['score'] ?? null,
                'recommendations' => $data['recommendations'] ?? null,
            ]);
        } catch (\Exception $e) {
            $analysis->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }
}