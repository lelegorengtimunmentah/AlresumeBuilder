<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use App\Services\PDFService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PDFController extends Controller
{
    public function __construct(private readonly PDFService $pdfService) {}

    /**
     * Return the list of PDF templates available for the authenticated user.
     *
     * Free users only receive non-pro templates; pro users receive all templates.
     *
     * GET /api/pdf-templates (requires auth:sanctum)
     * → 200 { success: true, data: { templates: [...] } }
     *
     * Requirement: 8.2, 8.4
     */
    public function templates(Request $request): JsonResponse
    {
        $templates = $this->pdfService->getAvailableTemplates($request->user());

        return response()->json([
            'success' => true,
            'data'    => [
                'templates' => $templates,
            ],
            'message' => 'Daftar template PDF berhasil diambil.',
        ]);
    }

    /**
     * Export a resume as a PDF file.
     *
     * Resolves the requested template (falls back to 'default' if not found).
     * Returns 403 if the template is pro-only and the user is on a free plan.
     *
     * GET /api/resumes/{resume}/export/pdf?template={slug} (requires auth:sanctum)
     * → 200  Content-Type: application/pdf
     *        Content-Disposition: attachment; filename="resume-{id}.pdf"
     * → 403  if template is pro-only and user is free
     *
     * Requirement: 8.1, 8.3, 8.5, 8.6
     */
    public function export(Request $request, Resume $resume): Response
    {
        $this->authorize('view', $resume);

        $slug     = $request->query('template', 'default');
        $user     = $request->user();
        $template = $this->pdfService->resolveTemplate($slug, $user);

        $pdfBinary = $this->pdfService->generate($resume, $template);

        // Determine filename using public_slug or resume id
        $filename = 'resume-' . ($resume->public_slug ?? $resume->id) . '.pdf';

        return response($pdfBinary, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length'      => strlen($pdfBinary),
        ]);
    }

    /**
     * Export a cover letter as a PDF file.
     *
     * The letter body is the (possibly user-edited) AI result sent by the
     * client; identity block (phone/email), date, recipient and signature
     * are rendered by the server-side template.
     *
     * POST /api/resumes/{resume}/export/cover-letter-pdf (requires auth:sanctum)
     * Body: { content: string, company_name?: string, position_name?: string }
     * → 200  Content-Type: application/pdf
     *        Content-Disposition: attachment; filename="cover-letter-{id}.pdf"
     */
    public function exportCoverLetter(Request $request, Resume $resume): Response
    {
        $this->authorize('view', $resume);

        $validated = $request->validate([
            'content'         => ['required', 'string', 'max:20000'],
            'company_name'    => ['nullable', 'string', 'max:200'],
            'position_name'   => ['nullable', 'string', 'max:200'],
            'recruiter_name'  => ['nullable', 'string', 'max:200'],
            'company_address' => ['nullable', 'string', 'max:200'],
        ]);

        $pdfBinary = $this->pdfService->generateCoverLetter(
            $resume,
            $validated['content'],
            $validated['company_name'] ?? null,
            $validated['position_name'] ?? null,
            $validated['recruiter_name'] ?? null,
            $validated['company_address'] ?? null,
        );

        $filename = 'cover-letter-' . ($resume->public_slug ?? $resume->id) . '.pdf';

        return response($pdfBinary, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length'      => strlen($pdfBinary),
        ]);
    }
}
