'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAIJob } from '@/hooks/useAIJob';
import { AIJobStatus } from '@/components/ai/AIJobStatus';
import { copyToClipboard } from '@/lib/utils';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Loader2, Printer } from 'lucide-react';

// ─── Validation schema ────────────────────────────────────────────────────────

const coverLetterFormSchema = z.object({
 company_name: z.string().min(1, 'Nama perusahaan tidak boleh kosong').max(200),
 position_name: z.string().min(1, 'Nama posisi tidak boleh kosong').max(200),
 recruiter_name: z.string().max(200).optional(),
 company_address: z.string().max(200).optional(),
 job_source: z.string().max(100).optional(),
});

type CoverLetterFormValues = z.infer<typeof coverLetterFormSchema>;

const COVER_LETTER_LOADING_MESSAGES = [
 'Sedang memproses...',
 'Membaca ringkasan dan pengalaman Anda...',
 'Menyesuaikan surat dengan perusahaan dan posisi...',
 'Menulis paragraf pembuka yang menarik...',
 'Memfinalisasi cover letter Anda...',
];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CoverLetterEditorProps {
 resumeId: string;
}

export function CoverLetterEditor({ resumeId }: CoverLetterEditorProps) {
 const { status, result, error, dispatch, reset } = useAIJob();
 const [editedResult, setEditedResult] = useState<string>('');
 const [copySuccess, setCopySuccess] = useState<boolean | null>(null);
 const [dispatchError, setDispatchError] = useState<string | null>(null);
 const [isPdfBusy, setIsPdfBusy] = useState(false);
 const [pdfError, setPdfError] = useState<string | null>(null);

 const {
 register,
 handleSubmit,
 getValues,
 formState: { errors, isSubmitting },
 } = useForm<CoverLetterFormValues>({
 resolver: zodResolver(coverLetterFormSchema),
 });

 const onSubmit = async (values: CoverLetterFormValues) => {
 reset();
 setEditedResult('');
 setCopySuccess(null);
 setDispatchError(null);
 setPdfError(null);

 try {
 await dispatch(`/api/resumes/${resumeId}/ai/cover-letter`, {
 company_name: values.company_name,
 position_name: values.position_name,
 ...(values.recruiter_name?.trim()
 ? { recruiter_name: values.recruiter_name.trim() }
 : {}),
 ...(values.company_address?.trim()
 ? { company_address: values.company_address.trim() }
 : {}),
 ...(values.job_source?.trim() ? { job_source: values.job_source.trim() } : {}),
 });
 } catch {
 reset();
 setDispatchError(
 'Gagal memulai pembuatan cover letter. Periksa kuota harian Anda lalu coba lagi.',
 );
 }
 };

 useEffect(() => {
 if (status === 'completed' && result) {
 setEditedResult(result);
 }
 }, [status, result]);

 const displayResult = editedResult || result || '';

 const handleCopy = async () => {
 if (!displayResult) return;
 const succeeded = await copyToClipboard(displayResult);
 setCopySuccess(succeeded);
 if (succeeded) {
 setTimeout(() => setCopySuccess(false), 2000);
 }
 };

 const fetchCoverLetterPdf = async (): Promise<Blob> => {
 const values = getValues();
 const companyName = values.company_name?.trim();
 const positionName = values.position_name?.trim();
 const recruiterName = values.recruiter_name?.trim();
 const companyAddress = values.company_address?.trim();

 const response = await apiClient.post(
 `/api/resumes/${resumeId}/export/cover-letter-pdf`,
 {
 content: displayResult,
 ...(companyName ? { company_name: companyName } : {}),
 ...(positionName ? { position_name: positionName } : {}),
 ...(recruiterName ? { recruiter_name: recruiterName } : {}),
 ...(companyAddress ? { company_address: companyAddress } : {}),
 },
 { responseType: 'blob' },
 );

 return new Blob([response.data as BlobPart], { type: 'application/pdf' });
 };

 const handleDownloadPdf = async () => {
 if (!displayResult || isPdfBusy) return;
 setIsPdfBusy(true);
 setPdfError(null);

 try {
 const blob = await fetchCoverLetterPdf();
 const url = URL.createObjectURL(blob);
 const anchor = document.createElement('a');
 anchor.href = url;
 anchor.download = 'cover-letter.pdf';
 document.body.appendChild(anchor);
 anchor.click();
 document.body.removeChild(anchor);
 URL.revokeObjectURL(url);
 } catch {
 setPdfError('Gagal mengunduh PDF cover letter. Silakan coba lagi.');
 } finally {
 setIsPdfBusy(false);
 }
 };

 const handlePrintPdf = async () => {
 if (!displayResult || isPdfBusy) return;
 setIsPdfBusy(true);
 setPdfError(null);

 try {
 const blob = await fetchCoverLetterPdf();
 const url = URL.createObjectURL(blob);
 const printWindow = window.open(url, '_blank');
 if (!printWindow) {
 setPdfError(
 'Popup diblokir browser. Izinkan popup atau gunakan tombol Download PDF.',
 );
 URL.revokeObjectURL(url);
 return;
 }
 printWindow.addEventListener('load', () => {
 printWindow.focus();
 printWindow.print();
 });
 setTimeout(() => URL.revokeObjectURL(url), 60000);
 } catch {
 setPdfError('Gagal membuka PDF untuk dicetak. Silakan coba lagi.');
 } finally {
 setIsPdfBusy(false);
 }
 };

 return (
 <div className="space-y-6">
 {/* Input form */}
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
 <div className="space-y-1.5">
 <label htmlFor="company_name" className="text-sm font-medium text-muted-foreground">
 Nama Perusahaan
 </label>
 <Input
 id="company_name"
 placeholder="Contoh: PT. Tokopedia"
 {...register('company_name')}
 disabled={isSubmitting || status === 'pending' || status === 'processing'}
 />
 {errors.company_name && (
 <p className="text-xs text-red-400">{errors.company_name.message}</p>
 )}
 </div>

 <div className="space-y-1.5">
 <label htmlFor="position_name" className="text-sm font-medium text-muted-foreground">
 Nama Posisi
 </label>
 <Input
 id="position_name"
 placeholder="Contoh: Backend Engineer"
 {...register('position_name')}
 disabled={isSubmitting || status === 'pending' || status === 'processing'}
 />
 {errors.position_name && (
 <p className="text-xs text-red-400">{errors.position_name.message}</p>
 )}
 </div>

 <div className="space-y-1.5">
 <label htmlFor="recruiter_name" className="text-sm font-medium text-muted-foreground">
 Nama Perekrut <span className="text-muted-foreground/60">(opsional)</span>
 </label>
 <Input
 id="recruiter_name"
 placeholder="Contoh: Budi Santoso, HRD Manager"
 {...register('recruiter_name')}
 disabled={isSubmitting || status === 'pending' || status === 'processing'}
 />
 {errors.recruiter_name && (
 <p className="text-xs text-red-400">{errors.recruiter_name.message}</p>
 )}
 </div>

 <div className="space-y-1.5">
 <label htmlFor="company_address" className="text-sm font-medium text-muted-foreground">
 Alamat Perusahaan <span className="text-muted-foreground/60">(opsional)</span>
 </label>
 <Input
 id="company_address"
 placeholder="Contoh: Jl. Gatot Subroto No. 12, Jakarta Selatan"
 {...register('company_address')}
 disabled={isSubmitting || status === 'pending' || status === 'processing'}
 />
 {errors.company_address && (
 <p className="text-xs text-red-400">{errors.company_address.message}</p>
 )}
 </div>

 <div className="space-y-1.5">
 <label htmlFor="job_source" className="text-sm font-medium text-muted-foreground">
 Sumber Lowongan <span className="text-muted-foreground/60">(opsional)</span>
 </label>
 <Input
 id="job_source"
 placeholder="Contoh: JobStreet, LinkedIn, situs perusahaan"
 {...register('job_source')}
 disabled={isSubmitting || status === 'pending' || status === 'processing'}
 />
 {errors.job_source && (
 <p className="text-xs text-red-400">{errors.job_source.message}</p>
 )}
 </div>

 <Button
 type="submit"
 disabled={isSubmitting || status === 'pending' || status === 'processing'}
 className={
 status === 'pending' || status === 'processing'
 ? ''
 : 'gap-2'
 }
 >
 {status === 'pending' || status === 'processing'
 ? 'Sedang Membuat...'
 : 'Buat Cover Letter'}
 </Button>
 </form>

 {/* Job status */}
 {(status === 'pending' || status === 'processing' || status === 'failed') && (
 <AIJobStatus
 status={status}
 error={error}
 loadingMessages={COVER_LETTER_LOADING_MESSAGES}
 />
 )}

 {dispatchError && (
 <Alert variant="destructive">
 <AlertDescription>{dispatchError}</AlertDescription>
 </Alert>
 )}

 {/* Result editor */}
 {status === 'completed' && displayResult && (
 <div className="animate-fade-in-up space-y-3">
 <div className="flex items-center justify-between">
 <p className="text-sm font-medium text-foreground">Hasil Cover Letter</p>
 <div className="flex items-center gap-2">
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={handleCopy}
 >
 {copySuccess ? '✓ Tersalin!' : 'Salin ke Clipboard'}
 </Button>
 <Button
 type="button"
 variant="outline"
 size="sm"
 className="gap-1.5"
 onClick={handleDownloadPdf}
 disabled={isPdfBusy}
 >
 {isPdfBusy ? (
 <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
 ) : (
 <Download className="h-3.5 w-3.5" aria-hidden="true" />
 )}
 Download PDF
 </Button>
 <Button
 type="button"
 variant="outline"
 size="sm"
 className="gap-1.5"
 onClick={handlePrintPdf}
 disabled={isPdfBusy}
 >
 {isPdfBusy ? (
 <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
 ) : (
 <Printer className="h-3.5 w-3.5" aria-hidden="true" />
 )}
 Cetak
 </Button>
 </div>
 </div>

 {pdfError && (
 <Alert variant="destructive">
 <AlertDescription>{pdfError}</AlertDescription>
 </Alert>
 )}

 <Textarea
 value={displayResult}
 onChange={(e) => setEditedResult(e.target.value)}
 rows={16}
 className="resize-y font-mono text-sm"
 placeholder="Hasil cover letter akan muncul di sini..."
 />

 {copySuccess && (
 <Alert>
 <AlertDescription>
 Teks berhasil disalin ke clipboard.
 </AlertDescription>
 </Alert>
 )}

 {copySuccess === false && (
 <Alert variant="destructive">
 <AlertDescription>
 Gagal menyalin. Silakan salin manual dari teks di atas.
 </AlertDescription>
 </Alert>
 )}
 </div>
 )}
 </div>
 );
}

