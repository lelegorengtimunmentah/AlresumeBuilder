<?php

namespace App\Services\AI;

use GuzzleHttp\Client;

class GeminiProvider
{
    public function generate(string $prompt): string
    {
        $apiKey = config('services.gemini.key');
        $model  = 'gemini-3.6-flash';

        $client = new Client([
            // Di environment lokal Windows, verifikasi SSL bisa dinonaktifkan
            // untuk menghindari cURL SSL error. Di production, selalu true.
            'verify'  => app()->isProduction() ? true : (config('services.ai.ca_bundle') ?: false),
            'timeout' => 30,
        ]);

        $response = $client->post(
            "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
            [
                'headers' => ['Content-Type' => 'application/json'],
                'json'    => [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]],
                    ],
                ],
            ]
        );

        $data = json_decode($response->getBody(), true);
        $text = data_get($data, 'candidates.0.content.parts.0.text');

        if (empty($text)) {
            throw new AIProviderException('Gemini returned empty response.');
        }

        return $text;
    }
}
