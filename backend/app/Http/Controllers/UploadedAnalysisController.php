<?php

namespace App\Http\Controllers;

use App\Jobs\AnalyzeUploadedResumeJob;
use App\Models\UploadedAnalysis;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\IOFactory as WordIOFactory;
use Smalot\PdfParser\Parser as PdfParser;

class UploadedAnalysisController extends Controller
{
    /**
     * Upload a resume file (PDF/DOCX) and trigger ATS analysis.
     * POST /api/resume-analyses
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ]);

        $file = $request->file('file');
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
            'user_id' => $userId,
            'file_path' => $filePath,
            'original_name' => $file->getClientOriginalName(),
            'extracted_text' => $extractedText,
            'status' => 'pending',
        ]);

        // Dispatch analysis job
        AnalyzeUploadedResumeJob::dispatch($analysis->id);

        return response()->json([
            'success' => true,
            'data' => [
                'analysis_id' => $analysis->id,
                'status' => $analysis->status,
                'original_name' => $analysis->original_name,
            ],
            'message' => 'File berhasil diupload dan analisis sedang diproses.',
        ], 202);
    }

    /**
     * Get analysis status and results.
     * GET /api/resume-analyses/{analysis}
     */
    public function show(UploadedAnalysis $analysis): JsonResponse
    {
        if ($analysis->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'analysis_id' => $analysis->id,
                'original_name' => $analysis->original_name,
                'status' => $analysis->status,
                'score' => $analysis->status === 'completed' ? $analysis->score : null,
                'recommendations' => $analysis->status === 'completed' ? $analysis->recommendations : null,
                'error_message' => $analysis->status === 'failed' ? $analysis->error_message : null,
            ],
        ]);
    }

    /**
     * Extract text from PDF or DOCX file.
     */
    private function extractText(string $filePath, string $extension): string
    {
        try {
            return match (strtolower($extension)) {
                'pdf' => $this->extractPdfText($filePath),
                'doc', 'docx' => $this->extractWordText($filePath),
                default => '',
            };
        } catch (\Exception $e) {
            return '';
        }
    }

    private function extractPdfText(string $filePath): string
    {
        $parser = new PdfParser();
        $pdf = $parser->parseFile($filePath);
        return $pdf->getText() ?? '';
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
     * Handles TextRun, Table, AbstractContainer, and skips elements without text.
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

            // Elements that contain child elements (TextRun, Table rows/cells, etc.)
            if (method_exists($element, 'getElements')) {
                $inner = $this->extractElementsText($element->getElements());
                if ($inner !== '') {
                    $text .= $inner . "\n";
                }
                continue;
            }

            // Simple text-bearing elements
            if (method_exists($element, 'getText')) {
                $line = (string) $element->getText();
                if ($line !== '') {
                    $text .= $line . "\n";
                }
            }
        }

        return $text;
    }
}