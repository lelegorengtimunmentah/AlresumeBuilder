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
    public function store(Request ): JsonResponse
    {
        ->validate([
            'file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ]);

         = ->file('file');
         = Auth::id();

        // Store file
         = "uploads/resumes/{}";
         = ->store(, 'local');

        // Extract text
         = ->extractText(->getRealPath(), ->getClientOriginalExtension());

        if (empty(trim())) {
            Storage::disk('local')->delete();
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat mengekstrak teks dari file. Pastikan file tidak kosong.',
            ], 422);
        }

        // Create analysis record
         = UploadedAnalysis::create([
            'user_id' => ,
            'file_path' => ,
            'original_name' => ->getClientOriginalName(),
            'extracted_text' => ,
            'status' => 'pending',
        ]);

        // Dispatch analysis job
        AnalyzeUploadedResumeJob::dispatch(->id);

        return response()->json([
            'success' => true,
            'data' => [
                'analysis_id' => ->id,
                'status' => ->status,
                'original_name' => ->original_name,
            ],
            'message' => 'File berhasil diupload dan analisis sedang diproses.',
        ], 202);
    }

    /**
     * Get analysis status and results.
     * GET /api/resume-analyses/{analysis}
     */
    public function show(UploadedAnalysis ): JsonResponse
    {
        if (->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'analysis_id' => ->id,
                'original_name' => ->original_name,
                'status' => ->status,
                'score' => ->status === 'completed' ? ->score : null,
                'recommendations' => ->status === 'completed' ? ->recommendations : null,
                'error_message' => ->status === 'failed' ? ->error_message : null,
            ],
        ]);
    }

    /**
     * Extract text from PDF or DOCX file.
     */
    private function extractText(string , string ): string
    {
        try {
            return match (strtolower()) {
                'pdf' => ->extractPdfText(),
                'doc', 'docx' => ->extractWordText(),
                default => '',
            };
        } catch (\Exception ) {
            return '';
        }
    }

    private function extractPdfText(string ): string
    {
         = new PdfParser();
         = ->parseFile();
        return ->getText() ?? '';
    }

    private function extractWordText(string ): string
    {
         = WordIOFactory::load();
         = '';

        foreach (->getSections() as ) {
            foreach (->getElements() as ) {
                 .= ->getText() . "\n";
            }
        }

        return ;
    }
}
