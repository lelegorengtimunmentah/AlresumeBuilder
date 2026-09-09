<?php

namespace App\Services;

use App\Jobs\AnalyzeATSScoreJob;
use App\Jobs\GenerateAISummaryJob;
use App\Jobs\GenerateCoverLetterJob;
use App\Jobs\RewriteExperienceJob;
use App\Models\AiJob;
use App\Models\Resume;
use App\Services\AI\AIProviderException;
use App\Services\AI\GeminiProvider;
use App\Services\AI\OpenAIProvider;

class AIService
{
    /**
     * Attempts per provider before giving up on it. Retrying a couple times
     * recovers from transient failures (network blip, momentary 429/5xx,
     * Gemini "high demand" 503) without requiring the user to re-trigger.
     */
    private const MAX_PROVIDER_ATTEMPTS = 3;

    public function __construct(
        private readonly RateLimitService $rateLimitService,
        private readonly GeminiProvider $gemini,
        private readonly OpenAIProvider $openAI,
    ) {}

    /**
     * Check rate limit, create an AiJob record with status=pending,
     * dispatch to the queue, and return the job.
     *
     * Note: Queue job dispatch is commented out pending Task 8 implementation.
     */
    public function dispatchJob(string $type, Resume $resume, array $extra = []): AiJob
    {
        $this->rateLimitService->checkOrFail($resume->user, $type);

        $job = AiJob::create([
            'user_id' => $resume->user_id,
            'resume_id' => $resume->id,
            'type' => $type,
            'status' => 'pending',
            'payload' => $extra,
        ]);

        // Dispatch sesuai tipe
        match ($type) {
            'summary' => GenerateAISummaryJob::dispatch($job->id),
            'experience_rewrite' => RewriteExperienceJob::dispatch($job->id),
            'ats_score' => AnalyzeATSScoreJob::dispatch($job->id),
            'cover_letter' => GenerateCoverLetterJob::dispatch($job->id),
            default => null,
        };

        return $job;
    }

    /**
     * Call Gemini first; if it fails and OpenAI key is configured, fall back.
     * Each provider is retried before moving on.
     *
     * @throws AIProviderException when all providers/attempts fail.
     */
    public function callWithFallback(string $prompt): string
    {
        $geminiKey = config('services.gemini.key');
        $openaiKey = config('services.openai.key');

        // Jangan coba provider kalau key-nya tidak dikonfigurasi
        $useGemini = ! empty($geminiKey);
        $useOpenAI = ! empty($openaiKey) && $openaiKey !== $geminiKey;

        if (! $useGemini && ! $useOpenAI) {
            throw new AIProviderException('Tidak ada AI provider yang dikonfigurasi. Harap isi GEMINI_API_KEY di .env.');
        }

        if ($useGemini) {
            try {
                return $this->withRetries(fn (): string => $this->gemini->generate($prompt));
            } catch (AIProviderException $e) {
                if (! $useOpenAI) {
                    // Tidak ada fallback — lempar error Gemini langsung
                    throw $e;
                }
                // Gemini gagal — coba OpenAI sebagai fallback
            }
        }

        if ($useOpenAI) {
            return $this->withRetries(fn (): string => $this->openAI->generate($prompt));
        }

        throw new AIProviderException('Semua AI provider gagal.');
    }

    /**
     * Run a provider call, retrying after a short pause so transient
     * failures don't fail the whole AI job.
     *
     * @throws AIProviderException when every attempt fails.
     */
    private function withRetries(callable $call): string
    {
        $lastException = null;
        $delayMs = 500;

        for ($attempt = 1; $attempt <= self::MAX_PROVIDER_ATTEMPTS; $attempt++) {
            try {
                return $call();
            } catch (AIProviderException $e) {
                $lastException = $e;

                if ($attempt < self::MAX_PROVIDER_ATTEMPTS) {
                    // Exponential backoff + jitter memberi jeda sebelum retry
                    // supaya tidak menekan provider yang sedang burst/sibuk.
                    usleep(($delayMs * 1000) + random_int(0, 400_000));
                    $delayMs *= 2;
                }
            }
        }

        throw $lastException;
    }
}
