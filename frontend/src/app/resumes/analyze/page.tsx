'use client';

import { useState } from 'react';
import { BarChart3, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { FileUploadZone } from '@/components/ui/file-upload-zone';
import { ATSScoreCard } from '@/components/ai/ATSScoreCard';
import { AIGeneratingState } from '@/components/ai/AIGeneratingState';
import { useUploadedAnalysis } from '@/hooks/useUploadedAnalysis';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LOADING_MESSAGES = [
 'Sedang memproses...',
 'Mengekstrak teks dari file...',
 'Menganalisis struktur resume...',
 'Mengevaluasi kata kunci dan format ATS...',
 'Menyusun rekomendasi perbaikan...',
];

export default function AnalyzeResumePage() {
 const { status, result, error, uploadAndAnalyze, reset } = useUploadedAnalysis();
 const [selectedFile, setSelectedFile] = useState<File | null>(null);

 const isAnalyzing = status === 'uploading' || status === 'pending' || status === 'processing';

 const handleAnalyze = () => {
 if (selectedFile && !isAnalyzing) {
 uploadAndAnalyze(selectedFile);
 }
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
 Upload resume kamu dalam format PDF atau DOCX untuk mendapatkan skor ATS
 dan rekomendasi perbaikan dari AI.
 </p>

 {/* Upload zone */}
 {status === 'idle' || status === 'failed' ? (
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
 ) : null}

 {/* Error */}
 {error && (
 <Alert variant="destructive">
 <AlertDescription>{error}</AlertDescription>
 </Alert>
 )}

 {/* Loading state */}
 {isAnalyzing && (
 <AIGeneratingState messages={LOADING_MESSAGES} />
 )}

 {/* Results */}
 {status === 'completed' && result && result.score !== null && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <p className="text-sm text-muted-foreground">
 File: <span className="font-medium text-foreground">{result.original_name}</span>
 </p>
 <span className="text-xs text-green-400 font-medium">Selesai</span>
 </div>
 <ATSScoreCard
 result={JSON.stringify({
 score: result.score,
 recommendations: result.recommendations,
 })}
 />
 <Button
 onClick={() => {
 reset();
 setSelectedFile(null);
 }}
 variant="outline"
 className="gap-2"
 >
 <RefreshCw className="h-4 w-4" aria-hidden="true" />
 Upload Baru
 </Button>
 </div>
 )}
 </div>
 );
}

