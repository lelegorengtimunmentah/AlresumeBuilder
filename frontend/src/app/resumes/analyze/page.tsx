'use client';

import { useState } from 'react';
import { BarChart3, RefreshCw, ArrowLeft, Wand2, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { FileUploadZone } from '@/components/ui/file-upload-zone';
import { DetailedAnalysisCard } from '@/components/ai/DetailedAnalysisCard';
import { AIGeneratingState } from '@/components/ai/AIGeneratingState';
import { useUploadedAnalysis } from '@/hooks/useUploadedAnalysis';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LOADING_MESSAGES = [
  'Sedang memproses file...',
  'Mengekstrak teks dari resume...',
  'Menganalisis struktur dan format ATS...',
  'Mendeteksi kata kunci dan bagian resume...',
  'Mengekstrak data terstruktur...',
  'Menyusun rekomendasi perbaikan...',
  'Hampir selesai...',
];

export default function AnalyzeResumePage() {
  const {
    status,
    result,
    error,
    uploadAndAnalyze,
    reset,
    generateResumeStatus,
    generateResumeError,
    generateResume,
  } = useUploadedAnalysis();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isAnalyzing = status === 'uploading' || status === 'pending' || status === 'processing';
  const isGenerating = generateResumeStatus === 'generating';

  const handleAnalyze = () => {
    if (selectedFile && !isAnalyzing) {
      uploadAndAnalyze(selectedFile);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard" aria-label="Kembali ke Dashboard">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
          Analisis <span className="text-primary">Resume</span>
        </h1>
      </div>

      <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
        Upload resume kamu dalam format PDF atau DOCX. AI akan menganalisis skor ATS,
        mengevaluasi setiap bagian, mendeteksi kata kunci, dan mengekstrak data resume
        agar bisa langsung diedit di builder.
      </p>

      {/* Upload zone — only shown while idle or after failure */}
      {(status === 'idle' || status === 'failed') && (
        <>
          <FileUploadZone
            onFileSelect={setSelectedFile}
            disabled={isAnalyzing}
          />
          {selectedFile && (
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              Analisis Sekarang
            </Button>
          )}
        </>
      )}

      {/* Upload / analysis error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {isAnalyzing && (
        <AIGeneratingState
          title="AI sedang menganalisis resume"
          messages={LOADING_MESSAGES}
        />
      )}

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {status === 'completed' && result && result.score !== null && (
        <div className="space-y-4">
          {/* File name + status badge */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              File:{' '}
              <span className="font-medium text-foreground">{result.original_name}</span>
            </p>
            <span className="text-xs font-medium text-green-500">Selesai</span>
          </div>

          {/* Detailed analysis */}
          <DetailedAnalysisCard result={result} />

          {/* ── Generate Resume CTA ──────────────────────────────────────────── */}
          {result.parsed_data && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Buat Resume di Builder
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Data resume kamu sudah diekstrak. Buat resume baru yang langsung terisi
                    dan bisa kamu edit, tambahkan AI summary, skor ATS, serta export PDF.
                  </p>
                </div>
                <Button
                  onClick={generateResume}
                  disabled={isGenerating}
                  className="shrink-0 gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Membuat resume...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" aria-hidden="true" />
                      Generate Resume
                    </>
                  )}
                </Button>
              </div>

              {/* Generate error */}
              {generateResumeError && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{generateResumeError}</span>
                </div>
              )}
            </div>
          )}

          {/* Reset */}
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Analisis Resume Lain
          </Button>
        </div>
      )}
    </div>
  );
}
