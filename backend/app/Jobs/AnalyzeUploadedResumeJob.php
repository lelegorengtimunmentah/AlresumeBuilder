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

    public  = 1;
    public  = 150;

    public function __construct(public string ) {}

    public function handle(AIService ): void
    {
         = UploadedAnalysis::findOrFail(->analysisId);
        ->update(['status' => 'processing']);

        try {
             = PromptBuilder::buildUploadedATSPrompt(->extracted_text);
             = ->callWithFallback();

             = json_decode(, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('AI returned invalid JSON for ATS score');
            }

            ->update([
                'status' => 'completed',
                'score' => ['score'] ?? null,
                'recommendations' => ['recommendations'] ?? null,
            ]);
        } catch (\Exception ) {
            ->update([
                'status' => 'failed',
                'error_message' => ->getMessage(),
            ]);
        }
    }
}
