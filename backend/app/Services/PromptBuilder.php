<?php

namespace App\Services;

use App\Models\Experience;
use App\Models\Resume;

class PromptBuilder
{
    /**
     * Build a prompt for generating a professional summary from a resume.
     */
    public static function buildSummaryPrompt(Resume $resume): string
    {
        $resume->loadMissing(['education', 'experience', 'skills']);

        $education = $resume->education->map(
            fn ($e) => "{$e->degree} in {$e->field_of_study} at {$e->institution}"
        )->join(', ');

        $experience = $resume->experience->map(
            fn ($e) => "{$e->position} at {$e->company}"
        )->join(', ');

        $skills = $resume->skills->pluck('name')->join(', ');

        return <<<PROMPT
        Tulis DUA versi ringkasan profesional dalam Bahasa Indonesia untuk kandidat berikut.
        Nama: {$resume->full_name}
        Pendidikan: {$education}
        Pengalaman: {$experience}
        Skills: {$skills}

        Ketentuan:
        - Setiap ringkasan 2-3 kalimat, sudut pandang orang pertama
        - Pilihan 1: gaya formal dan padat (cocok untuk perusahaan korporat)
        - Pilihan 2: gaya dinamis dan modern (cocok untuk startup/tech)
        - Gunakan format PERSIS seperti di bawah, tanpa teks tambahan di luar format:

        ###PILIHAN_1###
        [isi ringkasan pilihan 1]
        ###PILIHAN_2###
        [isi ringkasan pilihan 2]
        ###SELESAI###
        PROMPT;
    }

    /**
     * Build a prompt for rewriting a job experience entry in STAR format.
     */
    public static function buildExperienceRewritePrompt(Experience $exp): string
    {
        return <<<PROMPT
        Tulis ulang deskripsi pekerjaan berikut dalam format STAR (Situation, Task, Action, Result) untuk CV profesional.
        
        Posisi: {$exp->position}
        Perusahaan: {$exp->company}
        Deskripsi saat ini: {$exp->description}
        
        Ketentuan:
        - Minimal 3 bullet points
        - Mulai setiap bullet dengan action verb kuat
        - Sertakan angka/metrik jika memungkinkan
        - Bahasa Indonesia profesional
        - Format: bullet points dengan tanda "•"
        PROMPT;
    }

    /**
     * Build a prompt for scoring the resume against ATS criteria.
     */
    public static function buildATSPrompt(Resume $resume): string
    {
        $resume->loadMissing(['education', 'experience', 'skills', 'certificates']);

        $sections = json_encode([
            'full_name'    => $resume->full_name,
            'summary'      => $resume->summary,
            'education'    => $resume->education->toArray(),
            'experience'   => $resume->experience->toArray(),
            'skills'       => $resume->skills->pluck('name')->toArray(),
            'certificates' => $resume->certificates->pluck('name')->toArray(),
        ], JSON_UNESCAPED_UNICODE);

        return <<<PROMPT
        Analisis CV berikut dan berikan skor ATS (Applicant Tracking System) dari 0-100.
        
        Data CV:
        {$sections}
        
        Kembalikan HANYA JSON valid dengan format:
        {
            "score": <angka 0-100>,
            "recommendations": [<string rekomendasi 1>, <string rekomendasi 2>, ...]
        }
        
        Pertimbangkan: kelengkapan data, penggunaan kata kunci, format tanggal, deskripsi pengalaman, skills relevan.
        PROMPT;
    }

    /**
     * Build a prompt for scoring an uploaded resume text against ATS criteria.
     */
    public static function buildUploadedATSPrompt(string $extractedText): string
    {
        return <<<PROMPT
        Analisis CV berikut dan berikan skor ATS (Applicant Tracking System) dari 0-100.
        
        Teks CV:
        {$extractedText}
        
        Kembalikan HANYA JSON valid dengan format:
        {
            "score": <angka 0-100>,
            "recommendations": [<string rekomendasi 1>, <string rekomendasi 2>, ...]
        }
        
        Pertimbangkan: kelengkapan data, penggunaan kata kunci, format, struktur, deskripsi pengalaman, skills relevan, dan kesesuaian format ATS.
        PROMPT;
    }

    /**
     * Build a prompt for generating a cover letter for a specific company and position.
     */
    public static function buildCoverLetterPrompt(
        Resume $resume,
        string $company,
        string $position,
        ?string $recruiter = null,
        ?string $companyAddress = null,
        ?string $jobSource = null,
    ): string {
        $resume->loadMissing(['experience', 'skills', 'user']);

        $experience = $resume->experience->map(
            fn ($e) => "{$e->position} di {$e->company}"
        )->join(', ');

        $skills = $resume->skills->pluck('name')->take(5)->join(', ');

        $source = $jobSource ?: 'JobStreet';

        return <<<PROMPT
        Tulis isi surat lamaran kerja profesional dalam Bahasa Indonesia.

        Data pelamar:
        - Nama: {$resume->full_name}
        - Melamar ke: {$company} — posisi {$position}
        - Pengalaman: {$experience}
        - Skills utama: {$skills}

        Ketentuan format (identitas pelamar, tanggal, tujuan, salam pembuka, dan tanda tangan akan dicetak terpisah — JANGAN tulis bagian tersebut):
        1. Paragraf pembuka: sebutkan bahwa Anda melamar posisi {$position} di {$company}, lowongan ditemukan di {$source}.
        2. Paragraf kualifikasi: jelaskan mengapa Anda cocok — sertakan pengalaman relevan, keterampilan utama, dan satu pencapaian/prestasi konkret.
        3. Paragraf ketertarikan: alasan tertarik bekerja di {$company} dan apa yang bisa Anda kontribusikan.
        4. Kalimat penutup: terima kasih, harapan untuk diskusi/wawancara lebih lanjut, dan sebutkan resume dilampirkan.

        Panjang: 200-350 kata. Gunakan Bahasa Indonesia formal dan profesional.
        Keluarkan HANYA paragraf isi surat (poin 1-4). JANGAN menulis kalimat pengantar seperti "Berikut adalah draf surat lamaran kerja..." atau catatan apa pun di luar surat.
        PROMPT;
    }

    /**
     * Strip conversational preamble/epilogue that LLMs sometimes add around
     * a cover letter (e.g. "Berikut adalah draf surat lamaran kerja..."),
     * plus the salutation and sign-off block which are rendered by the
     * PDF template itself.
     */
    public static function cleanCoverLetterResult(string $result): string
    {
        $lines = preg_split('/\R/u', trim($result)) ?: [];

        // Leading chatter ("Berikut adalah draf ...:") or salutation
        while ($lines !== []) {
            $line = trim((string) $lines[0]);

            if ($line === '') {
                array_shift($lines);
                continue;
            }

            if (self::isPreambleLine($line)) {
                array_shift($lines);
                continue;
            }

            if (preg_match('/^(dengan hormat|yang terhormat|kepada yth\.?|yth\.?)/iu', $line)) {
                array_shift($lines);
                continue;
            }

            break;
        }
        // Trailing sign-off block ("Hormat saya," + nama pelamar). Iterate
        // from the bottom: tentatively collect bare-name lines, then only
        // discard them together with the sign-off keyword above.
        while ($lines !== [] && trim((string) end($lines)) === '') {
            array_pop($lines);
        }

        if ($lines !== []) {
            $nameLines = [];

            while ($lines !== []) {
                $last = trim((string) end($lines));
                $isBareName = preg_match('/^[\p{L}\p{M}\.\' ]{2,60}$/u', $last) === 1
                    && ! preg_match('/[.,;:!?]/u', mb_substr($last, -1))
                    && self::wordCount($last) <= 6;

                if (! $isBareName) {
                    break;
                }

                array_unshift($nameLines, array_pop($lines));
            }

            if (
                $nameLines !== []
                && $lines !== []
                && preg_match('/^(hormat saya|salam hangat|best regards|sincerely)\b/iu', trim((string) end($lines))) === 1
            ) {
                array_pop($lines); // drop the sign-off keyword
            } else {
                // Not a signature block — restore the collected lines
                foreach ($nameLines as $line) {
                    $lines[] = $line;
                }
            }
        }

        return implode("\n", $lines);
    }

    private static function isPreambleLine(string $line): bool
    {
        // A preamble line ends with ":" (optionally followed by quotes) and
        // does not look like part of the letter itself.
        if (! preg_match('/:\s*[""\']?$/u', $line)) {
            return false;
        }

        return (bool) preg_match('/^(berikut|dibawah ini|di bawah ini|berikut ini|tentu|baik|oke|pasti|here)/iu', $line);
    }

    /**
     * Unicode-aware word count (str_word_count is ASCII-only).
     */
    private static function wordCount(string $text): int
    {
        return (int) preg_match_all('/[\p{L}\p{M}]+/u', $text);
    }
}