<?php

namespace App\Services\AI;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;

class GeminiProvider
{
    /**
     * Extract plain text from a PDF or image file using Gemini Vision.
     * Useful as a fallback when smalot/pdfparser cannot extract text
     * (e.g. image-based / scanned PDFs).
     *
     * @param  string  $filePath  Absolute path to the file on disk.
     * @param  string  $mimeType  MIME type, e.g. 'application/pdf' or 'image/png'.
     */
    public function extractTextFromFile(string $filePath, string $mimeType = 'application/pdf'): string
    {
        $apiKey = config('services.gemini.key');
        // Use a vision-capable model; fall back to the configured model if it supports vision.
        $model  = 'gemini-1.5-flash';

        $base64 = base64_encode(file_get_contents($filePath));

        $client = new Client([
            'verify'  => app()->isProduction() ? true : (config('services.ai.ca_bundle') ?: false),
            'timeout' => 60,
        ]);

        try {
            $response = $client->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
                [
                    'headers' => ['Content-Type' => 'application/json'],
                    'json'    => [
                        'contents' => [
                            [
                                'parts' => [
                                    [
                                        'inline_data' => [
                                            'mime_type' => $mimeType,
                                            'data'      => $base64,
                                        ],
                                    ],
                                    [
                                        'text' => 'Extract ALL text from this document exactly as written. '
                                            . 'Preserve the structure (section headings, bullet points, dates). '
                                            . 'Output only the raw extracted text — no commentary, no markdown formatting.',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ]
            );
        } catch (GuzzleException $e) {
            $res = $e instanceof RequestException ? $e->getResponse() : null;

            throw new AIProviderException(
                $res
                    ? 'Gemini Vision request failed (HTTP ' . $res->getStatusCode() . ').'
                    : 'Gemini Vision request failed: ' . $e->getMessage()
            );
        }

        $data = json_decode($response->getBody(), true);
        $text = data_get($data, 'candidates.0.content.parts.0.text');

        return (string) ($text ?? '');
    }

    public function generate(string $prompt): string
    {
        $apiKey = config('services.gemini.key');
        $model  = config('services.gemini.model', 'gemini-1.5-flash');

        $client = new Client([
            // Di environment lokal Windows, verifikasi SSL bisa dinonaktifkan
            // untuk menghindari cURL SSL error. Di production, selalu true.
            'verify' => app()->isProduction() ? true : (config('services.ai.ca_bundle') ?: false),
            'timeout' => 30,
        ]);

        try {
            $response = $client->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
                [
                    'headers' => ['Content-Type' => 'application/json'],
                    'json' => [
                        'contents' => [
                            ['parts' => [['text' => $prompt]]],
                        ],
                    ],
                ]
            );
        } catch (GuzzleException $e) {
            // Selalu konversi ke AIProviderException agar retry/fallback di
            // AIService ikut berjalan. Untuk error HTTP hanya tampilkan status
            // code — pesan Guzzle memuat URL berisi API key (tidak boleh bocor).
            $response = $e instanceof RequestException ? $e->getResponse() : null;

            if ($response !== null) {
                throw new AIProviderException(
                    'Gemini API request failed (HTTP '.$response->getStatusCode().').'
                );
            }

            throw new AIProviderException('Gemini API request failed: '.$e->getMessage());
        }

        $data = json_decode($response->getBody(), true);
        $text = data_get($data, 'candidates.0.content.parts.0.text');

        if (empty($text)) {
            throw new AIProviderException('Gemini returned empty response.');
        }

        return $text;
    }
}
