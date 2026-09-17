<?php

namespace App\Http\Controllers;

use App\Exceptions\InsufficientCreditsException;
use App\Jobs\AnalyzeUploadedResumeJob;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Project;
use App\Models\Resume;
use App\Models\Skill;
use App\Models\UploadedAnalysis;
use App\Services\ResumeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\IOFactory as WordIOFactory;
use Smalot\PdfParser\Parser as PdfParser;

class UploadedAnalysisController extends Controller
{
    public function __construct(private readonly ResumeService $resumeService) {}

    /**
     * Upload a resume file (PDF/DOCX) and trigger deep ATS analysis.
     * POST /api/resume-analyses
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ]);

        $file   = $request->file('file');
        $userId = Auth::id();

        // Store file
        $filePath = $file->store('uploads/resumes', 'local');

        // Extract text
        $extractedText = $this->extractText($file->getRealPath(), $file->getClientOriginalExtension());

        if (empty(trim($extractedText))) {
            Storage::disk('local')->delete($filePath);

            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat mengekstrak teks dari file. Pastikan file tidak kosong.',
            ], 422);
        }

        // Create analysis record
        $analysis = UploadedAnalysis::create([
            'user_id'        => $userId,
            'file_path'      => $filePath,
            'original_name'  => $file->getClientOriginalName(),
            'extracted_text' => $extractedText,
            'status'         => 'pending',
        ]);

        // Dispatch analysis job
        AnalyzeUploadedResumeJob::dispatch($analysis->id);

        return response()->json([
            'success' => true,
            'data'    => [
                'analysis_id'   => $analysis->id,
                'status'        => $analysis->status,
                'original_name' => $analysis->original_name,
            ],
            'message' => 'File berhasil diupload dan analisis sedang diproses.',
        ], 202);
    }

    /**
     * Get analysis status and results (includes rich fields once completed).
     * GET /api/resume-analyses/{analysis}
     */
    public function show(UploadedAnalysis $analysis): JsonResponse
    {
        if ($analysis->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $isCompleted = $analysis->status === 'completed';

        return response()->json([
            'success' => true,
            'data'    => [
                'analysis_id'      => $analysis->id,
                'original_name'    => $analysis->original_name,
                'status'           => $analysis->status,
                'score'            => $isCompleted ? $analysis->score : null,
                'recommendations'  => $isCompleted ? $analysis->recommendations : null,
                'section_scores'   => $isCompleted ? $analysis->section_scores : null,
                'keywords_found'   => $isCompleted ? $analysis->keywords_found : null,
                'keywords_missing' => $isCompleted ? $analysis->keywords_missing : null,
                'parsed_data'      => $isCompleted ? $analysis->parsed_data : null,
                'error_message'    => $analysis->status === 'failed' ? $analysis->error_message : null,
            ],
        ]);
    }

    /**
     * Generate a new builder resume from AI-parsed data in the analysis.
     *
     * Requires: analysis must be completed and have parsed_data.
     * Creates Resume + all sections in a transaction; credit-gated via ResumeService.
     *
     * POST /api/resume-analyses/{analysis}/generate-resume
     * → 201 { success: true, data: { resume_id: string, resume_title: string } }
     * → 402 if user has insufficient credits
     * → 422 if analysis not completed or parsed_data missing
     */
    public function generateResume(UploadedAnalysis $analysis): JsonResponse
    {
        if ($analysis->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        if ($analysis->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Analisis belum selesai. Tunggu hingga proses selesai sebelum membuat resume.',
            ], 422);
        }

        if (empty($analysis->parsed_data)) {
            return response()->json([
                'success' => false,
                'message' => 'Data terstruktur tidak tersedia. Coba upload ulang resume Anda.',
            ], 422);
        }

        $user   = Auth::user();
        $parsed = $analysis->parsed_data;

        // Derive a sensible title from the file name
        $baseName     = pathinfo($analysis->original_name, PATHINFO_FILENAME);
        $resumeTitle  = ($parsed['full_name'] ?? null)
            ? "Resume {$parsed['full_name']}"
            : "Resume dari {$baseName}";

        try {
            $resume = DB::transaction(function () use ($user, $parsed, $resumeTitle): Resume {
                // Credit-gated creation
                $resume = $this->resumeService->create($user, [
                    'title'     => $resumeTitle,
                    'template'  => 'default',
                    'full_name' => $parsed['full_name'] ?? null,
                    'phone'     => $parsed['phone'] ?? null,
                    'address'   => $parsed['address'] ?? null,
                    'summary'   => $parsed['summary'] ?? null,
                ]);

                // Education
                foreach ($parsed['education'] ?? [] as $edu) {
                    if (empty($edu['institution'])) {
                        continue;
                    }
                    Education::create([
                        'resume_id'      => $resume->id,
                        'institution'    => $edu['institution'],
                        'degree'         => $edu['degree'] ?? null,
                        'field_of_study' => $edu['field_of_study'] ?? null,
                        'start_date'     => $this->sanitizeDate($edu['start_date'] ?? null),
                        'end_date'       => $this->sanitizeDate($edu['end_date'] ?? null),
                        'gpa'            => $edu['gpa'] ?? null,
                    ]);
                }

                // Experience
                foreach ($parsed['experience'] ?? [] as $exp) {
                    if (empty($exp['company']) || empty($exp['position'])) {
                        continue;
                    }
                    Experience::create([
                        'resume_id'   => $resume->id,
                        'company'     => $exp['company'],
                        'position'    => $exp['position'],
                        'start_date'  => $this->sanitizeDate($exp['start_date'] ?? null),
                        'end_date'    => $this->sanitizeDate($exp['end_date'] ?? null),
                        'is_current'  => (bool) ($exp['is_current'] ?? false),
                        'description' => $exp['description'] ?? null,
                    ]);
                }

                // Skills
                $validLevels = ['beginner', 'intermediate', 'advanced'];
                foreach ($parsed['skills'] ?? [] as $sk) {
                    if (empty($sk['name'])) {
                        continue;
                    }
                    $level = in_array($sk['level'] ?? '', $validLevels, true)
                        ? $sk['level']
                        : 'intermediate';
                    Skill::create([
                        'resume_id' => $resume->id,
                        'name'      => $sk['name'],
                        'level'     => $level,
                    ]);
                }

                // Projects
                foreach ($parsed['projects'] ?? [] as $proj) {
                    if (empty($proj['name'])) {
                        continue;
                    }
                    Project::create([
                        'resume_id'   => $resume->id,
                        'name'        => $proj['name'],
                        'description' => $proj['description'] ?? null,
                        'url'         => $proj['url'] ?? null,
                        'tech_stack'  => $proj['tech_stack'] ?? null,
                    ]);
                }

                return $resume;
            });
        } catch (InsufficientCreditsException) {
            return response()->json([
                'success' => false,
                'message' => 'Kredit resume tidak cukup. Upgrade ke Pro atau tunggu kredit direset.',
            ], 402);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'resume_id'    => $resume->id,
                'resume_title' => $resume->title,
            ],
            'message' => 'Resume berhasil dibuat dari hasil analisis. Silakan edit di builder.',
        ], 201);
    }

    // ─── Text extraction ───────────────────────────────────────────────────────

    /**
     * Extract text from PDF or DOCX file.
     */
    private function extractText(string $filePath, string $extension): string
    {
        try {
            return match (strtolower($extension)) {
                'pdf'        => $this->extractPdfText($filePath),
                'doc', 'docx' => $this->extractWordText($filePath),
                default      => '',
            };
        } catch (\Exception) {
            return '';
        }
    }

    private function extractPdfText(string $filePath): string
    {
        // First attempt: fast native parser (works for text-layer PDFs)
        try {
            $parser = new PdfParser();
            $pdf    = $parser->parseFile($filePath);
            $text   = trim($pdf->getText() ?? '');

            \Illuminate\Support\Facades\Log::debug('[PDF Extract] smalot result length: ' . strlen($text) . ' | file exists: ' . (file_exists($filePath) ? 'yes' : 'no') . ' | path: ' . $filePath);

            if ($text !== '') {
                return $text;
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::debug('[PDF Extract] smalot exception: ' . $e->getMessage());
            // Fall through to Vision fallback below
        }

        // Fallback: send the PDF to Gemini Vision for OCR-style extraction.
        // This handles image-based / scanned PDFs where the parser finds no text.
        try {
            \Illuminate\Support\Facades\Log::debug('[PDF Extract] trying Gemini Vision fallback');
            $gemini = new \App\Services\AI\GeminiProvider();
            $text   = trim($gemini->extractTextFromFile($filePath, 'application/pdf'));

            \Illuminate\Support\Facades\Log::debug('[PDF Extract] Gemini result length: ' . strlen($text));

            return $text;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::debug('[PDF Extract] Gemini exception: ' . $e->getMessage());

            return '';
        }
    }

    private function extractWordText(string $filePath): string
    {
        $phpWord = WordIOFactory::load($filePath);
        $text    = '';

        foreach ($phpWord->getSections() as $section) {
            $text .= $this->extractElementsText($section->getElements());
        }

        return $text;
    }

    /**
     * Recursively extract plain text from a PhpWord element collection.
     *
     * @param  iterable<\PhpOffice\PhpWord\Element\AbstractElement>  $elements
     */
    private function extractElementsText(iterable $elements): string
    {
        $text = '';

        foreach ($elements as $element) {
            if ($element instanceof \PhpOffice\PhpWord\Element\TextBreak
                || $element instanceof \PhpOffice\PhpWord\Element\PageBreak) {
                $text .= "\n";
                continue;
            }

            if (method_exists($element, 'getElements')) {
                $inner = $this->extractElementsText($element->getElements());
                if ($inner !== '') {
                    $text .= $inner . "\n";
                }
                continue;
            }

            if (method_exists($element, 'getText')) {
                $line = (string) $element->getText();
                if ($line !== '') {
                    $text .= $line . "\n";
                }
            }
        }

        return $text;
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Ensure a date string is a valid YYYY-MM-DD, or return null.
     * Handles partial dates like "2020" → "2020-01-01".
     */
    private function sanitizeDate(?string $date): ?string
    {
        if (empty($date)) {
            return null;
        }

        // Already a full date
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return $date;
        }

        // Year only → Jan 1
        if (preg_match('/^\d{4}$/', $date)) {
            return "{$date}-01-01";
        }

        // Year-month (e.g. "2020-03") → first day of month
        if (preg_match('/^(\d{4})-(\d{2})$/', $date)) {
            return "{$date}-01";
        }

        // Try Carbon as last resort
        try {
            return \Carbon\Carbon::parse($date)->format('Y-m-d');
        } catch (\Exception) {
            return null;
        }
    }
}
