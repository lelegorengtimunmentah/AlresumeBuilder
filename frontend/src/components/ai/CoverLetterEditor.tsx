'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Printer, Copy, Check, Pencil, Eye } from 'lucide-react';
import { useAIJob } from '@/hooks/useAIJob';
import { useAuth } from '@/hooks/useAuth';
import { AIJobStatus } from '@/components/ai/AIJobStatus';
import { copyToClipboard } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Resume } from '@/types/resume';

// ─── Validation schema ────────────────────────────────────────────────────────

const coverLetterFormSchema = z.object({
  company_name: z.string().min(1, 'Nama perusahaan tidak boleh kosong').max(200),
  position_name: z.string().min(1, 'Nama posisi tidak boleh kosong').max(200),
  recruiter_name: z.string().max(200).optional(),
});

type CoverLetterFormValues = z.infer<typeof coverLetterFormSchema>;

const COVER_LETTER_LOADING_MESSAGES = [
  'Sedang memproses...',
  'Membaca ringkasan dan pengalaman Anda...',
  'Menyesuaikan surat dengan perusahaan dan posisi...',
  'Menulis paragraf pembuka yang menarik...',
  'Memfinalisikan cover letter Anda...',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format today's date as "DD Bulan YYYY" in Indonesian */
function formatDateIndonesian(): string {
  return new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Escape HTML special characters for safe injection into a print window */
function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Opens a dedicated print window containing a clean A4-formatted cover letter.
 * This avoids @media print hacks entirely and works consistently across browsers.
 */
function printCoverLetter(params: {
  bodyText: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  companyName: string;
  positionName: string;
  recruiterName: string;
}) {
  const {
    bodyText, fullName, phone, email, address,
    companyName, positionName, recruiterName,
  } = params;

  const today = formatDateIndonesian();

  // Build paragraphs from body text
  const paragraphsHtml = bodyText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((para) => {
      const lines = para.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        return `<p>${lines.map(esc).join('<br>')}</p>`;
      }
      return `<p>${esc(para)}</p>`;
    })
    .join('\n');

  // Sender block lines
  const senderLines = [fullName, phone, email, address]
    .filter(Boolean)
    .map((l, i) => `<p${i === 0 ? ' class="sender-name"' : ''}>${esc(l)}</p>`)
    .join('\n');

  // Recipient block
  const recipientLines = [recruiterName, companyName]
    .filter(Boolean)
    .map((l) => `<p>${esc(l)}</p>`)
    .join('\n');

  const salutation = recruiterName
    ? `Yth. ${esc(recruiterName)},`
    : 'Yth. Bapak/Ibu HRD,';

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Cover Letter — ${esc(positionName)} di ${esc(companyName)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 2.5cm 3cm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: Georgia, "Times New Roman", Times, serif;
      font-size: 11pt;
      line-height: 1.75;
      color: #111827;
      background: #ffffff;
    }

    .block {
      margin-bottom: 1.4em;
    }

    p {
      margin: 0 0 0.25em;
    }

    .sender-name {
      font-weight: bold;
    }

    .salutation {
      font-weight: bold;
      margin-bottom: 0.25em;
    }

    .subject {
      font-weight: bold;
      margin-bottom: 1.4em;
    }

    .body-paragraphs p {
      text-align: justify;
      margin-bottom: 0.75em;
      orphans: 3;
      widows: 3;
    }

    .signoff {
      margin-top: 1.4em;
    }

    .signoff-name {
      margin-top: 3em;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="block">${senderLines}</div>

  <div class="block"><p>${today}</p></div>

  <div class="block">${recipientLines}</div>

  <p class="salutation">${salutation}</p>
  <p class="subject">Perihal: Lamaran Pekerjaan sebagai ${esc(positionName)}</p>

  <div class="body-paragraphs">
    ${paragraphsHtml}
  </div>

  <div class="signoff">
    <p>Hormat saya,</p>
    <p class="signoff-name">${esc(fullName || '_________________')}</p>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=794,height=1123');
  if (!win) return; // popup blocked
  win.document.write(html);
  win.document.close();
  win.focus();
  // Small delay so fonts/layout render before the dialog opens
  setTimeout(() => {
    win.print();
    win.close();
  }, 250);
}

// ─── Cover Letter Preview ─────────────────────────────────────────────────────

interface CoverLetterPreviewProps {
  bodyText: string;
  fullName: string;
  phone: string;
  address: string;
  email: string;
  companyName: string;
  positionName: string;
  recruiterName: string;
}

/**
 * Renders a formal Indonesian cover letter layout:
 *   Sender info → Date → Recipient info → Subject → Salutation →
 *   Body paragraphs → Sign-off → Name
 *
 * The document always uses white paper styling regardless of dark/light mode
 * so it looks the same on screen and when printed.
 */
function CoverLetterPreview({
  bodyText,
  fullName,
  phone,
  address,
  email,
  companyName,
  positionName,
  recruiterName,
}: CoverLetterPreviewProps) {
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const recipientLabel = recruiterName
    ? `Yth. ${recruiterName},`
    : 'Yth. Bapak/Ibu HRD,';

  return (
    /* Paper: always white background, dark text — independent of theme */
    <div
      id="cover-letter-print-area"
      className="rounded-xl border border-zinc-200 shadow-sm"
      style={{
        backgroundColor: '#ffffff',
        color: '#111827',
        fontFamily: 'Georgia, "Times New Roman", Times, serif',
      }}
    >
      <div className="px-10 py-10 text-[0.875rem] leading-relaxed">

        {/* ── Sender block ─────────────────────────────────────────────── */}
        <div className="mb-6 space-y-0.5" style={{ color: '#111827' }}>
          {fullName  && <p className="font-semibold">{fullName}</p>}
          {phone     && <p>{phone}</p>}
          {email     && <p>{email}</p>}
          {address   && <p>{address}</p>}
        </div>

        {/* ── Date ─────────────────────────────────────────────────────── */}
        <p className="mb-6" style={{ color: '#111827' }}>
          {formatDateIndonesian()}
        </p>

        {/* ── Recipient block ───────────────────────────────────────────── */}
        <div className="mb-6 space-y-0.5" style={{ color: '#111827' }}>
          {recruiterName && <p>{recruiterName}</p>}
          <p>{companyName}</p>
        </div>

        {/* ── Salutation ───────────────────────────────────────────────── */}
        <p className="mb-1 font-semibold" style={{ color: '#111827' }}>
          {recipientLabel}
        </p>

        {/* ── Subject ──────────────────────────────────────────────────── */}
        <p className="mb-6 font-semibold" style={{ color: '#111827' }}>
          Perihal: Lamaran Pekerjaan sebagai {positionName}
        </p>

        {/* ── Body paragraphs ──────────────────────────────────────────── */}
        <div className="mb-6 space-y-3">
          {paragraphs.map((para, i) => {
            const lines = para.split('\n').map((l) => l.trim()).filter(Boolean);
            if (lines.length > 1) {
              return (
                <div key={i} style={{ color: '#111827' }}>
                  {lines.map((line, j) => (
                    <p key={j}>{line}</p>
                  ))}
                </div>
              );
            }
            return (
              <p
                key={i}
                style={{ color: '#111827', textAlign: 'justify' }}
              >
                {para}
              </p>
            );
          })}
        </div>

        {/* ── Sign-off ─────────────────────────────────────────────────── */}
        <div style={{ color: '#111827' }}>
          <p>Hormat saya,</p>
          <p className="mt-12 font-semibold">{fullName || '_________________'}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CoverLetterEditorProps {
  resumeId: string;
  resume: Resume | null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CoverLetterEditor({ resumeId, resume }: CoverLetterEditorProps) {
  const { user } = useAuth();
  const { status, result, error, dispatch, reset } = useAIJob();
  const [editedResult, setEditedResult] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState<boolean | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  // Track submitted form values so preview can render the full letter
  const [submittedValues, setSubmittedValues] = useState<{
    company: string;
    position: string;
    recruiter: string;
  }>({ company: '', position: '', recruiter: '' });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CoverLetterFormValues>({
    resolver: zodResolver(coverLetterFormSchema),
  });

  const onSubmit = async (values: CoverLetterFormValues) => {
    reset();
    setEditedResult('');
    setCopySuccess(null);
    setDispatchError(null);
    setIsEditMode(false);
    setSubmittedValues({
      company: values.company_name,
      position: values.position_name,
      recruiter: values.recruiter_name ?? '',
    });

    try {
      await dispatch(`/api/resumes/${resumeId}/ai/cover-letter`, {
        company_name: values.company_name,
        position_name: values.position_name,
        recruiter_name: values.recruiter_name || undefined,
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
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  const handlePrint = () => {
    printCoverLetter({
      bodyText: displayResult,
      fullName: resume?.full_name ?? '',
      phone: resume?.phone ?? '',
      email: user?.email ?? '',
      address: resume?.address ?? '',
      companyName: submittedValues.company,
      positionName: submittedValues.position,
      recruiterName: submittedValues.recruiter,
    });
  };

  const isGenerating = status === 'pending' || status === 'processing';

  return (
    <div className="space-y-6">
      {/* ── Input form ──────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="company_name" className="text-sm font-medium text-foreground">
            Nama Perusahaan
          </label>
          <Input
            id="company_name"
            placeholder="Contoh: PT. Tokopedia"
            {...register('company_name')}
            disabled={isSubmitting || isGenerating}
          />
          {errors.company_name && (
            <p className="text-xs text-destructive">{errors.company_name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="position_name" className="text-sm font-medium text-foreground">
            Nama Posisi
          </label>
          <Input
            id="position_name"
            placeholder="Contoh: Backend Engineer"
            {...register('position_name')}
            disabled={isSubmitting || isGenerating}
          />
          {errors.position_name && (
            <p className="text-xs text-destructive">{errors.position_name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="recruiter_name" className="text-sm font-medium text-foreground">
            Nama HRD{' '}
            <span className="font-normal text-muted-foreground">(opsional)</span>
          </label>
          <Input
            id="recruiter_name"
            placeholder="Contoh: Budi Santoso"
            {...register('recruiter_name')}
            disabled={isSubmitting || isGenerating}
          />
          {errors.recruiter_name && (
            <p className="text-xs text-destructive">{errors.recruiter_name.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || isGenerating}
          className={
            isGenerating
              ? ''
              : 'gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20 transition-all hover:opacity-90 hover:shadow-lg hover:shadow-fuchsia-500/30'
          }
        >
          {isGenerating ? 'Sedang Membuat...' : 'Buat Cover Letter'}
        </Button>
      </form>

      {/* ── Job status ──────────────────────────────────────────────────── */}
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

      {/* ── Result section ──────────────────────────────────────────────── */}
      {status === 'completed' && displayResult && (
        <div className="animate-fade-in-up space-y-3">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Hasil Cover Letter</p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode((v) => !v)}
                className="gap-1.5"
              >
                {isEditMode ? (
                  <>
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    Pratinjau
                  </>
                ) : (
                  <>
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5"
              >
                {copySuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    Salin
                  </>
                )}
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm shadow-fuchsia-500/20 hover:opacity-90"
              >
                <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                Cetak
              </Button>
            </div>
          </div>

          {isEditMode ? (
            <Textarea
              value={displayResult}
              onChange={(e) => setEditedResult(e.target.value)}
              rows={20}
              className="resize-y font-mono text-sm"
              placeholder="Edit isi cover letter di sini (hanya bagian isi surat)..."
            />
          ) : (
            <CoverLetterPreview
              bodyText={displayResult}
              fullName={resume?.full_name ?? ''}
              phone={resume?.phone ?? ''}
              address={resume?.address ?? ''}
              email={user?.email ?? ''}
              companyName={submittedValues.company}
              positionName={submittedValues.position}
              recruiterName={submittedValues.recruiter}
            />
          )}

          {copySuccess === false && (
            <Alert variant="destructive">
              <AlertDescription>
                Gagal menyalin. Silakan salin manual dari mode Edit.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
