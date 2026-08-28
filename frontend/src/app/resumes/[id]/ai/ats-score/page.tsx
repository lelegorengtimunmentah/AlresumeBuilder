'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BarChart2, RefreshCw } from 'lucide-react';

import { useAIJob } from '@/hooks/useAIJob';
import { AIJobStatus } from '@/components/ai/AIJobStatus';
import { ATSScoreCard } from '@/components/ai/ATSScoreCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ATS_LOADING_MESSAGES = [
 'Sedang memproses...',
 'Memindai struktur dan format resume...',
 'Mengevaluasi kata kunci untuk posisi target...',
 'Menghitung skor kompatibilitas ATS...',
 'Menyusun rekomendasi perbaikan...',
];

export default function ATSScorePage() {
 const params = useParams<{ id: string }>();
 const id = params.id;

 const { status, result, error, dispatch, reset } = useAIJob();
 const [dispatchError, setDispatchError] = useState<string | null>(null);

 const handleAnalyze = async () => {
 setDispatchError(null);
 try {
 await dispatch(`/api/resumes/${id}/ai/ats-score`);
 } catch {
 reset();
 setDispatchError(
 'Gagal memulai analisis ATS. Periksa kuota harian Anda lalu coba lagi.',
 );
 }
 };

 const handleReanalyze = () => {
 reset();
 };

 const isInFlight = status === 'pending' || status === 'processing';

 return (
 <div className="max-w-2xl space-y-6">
 {/* Header */}
 <div className="flex items-center gap-3">
 <Button variant="ghost" size="icon" asChild>
 <Link href={`/resumes/${id}`} aria-label="Kembali ke Resume Builder">
 <ArrowLeft className="h-4 w-4" aria-hidden="true" />
 </Link>
 </Button>
 <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
 Skor <span className="text-primary">ATS</span>
 </h1>
 </div>

 <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
 Analisis seberapa baik resume Anda terhadap sistem pelacak pelamar (ATS)
 dan dapatkan rekomendasi perbaikan spesifik.
 </p>

 {(status === 'idle' || status === 'failed') && (
 <Button
 onClick={handleAnalyze}
 disabled={isInFlight}
 className="gap-2"
 >
 <BarChart2 className="h-4 w-4" aria-hidden="true" />
 Analisis ATS
 </Button>
 )}

 {status === 'completed' && (
 <Button variant="outline" onClick={handleReanalyze} className="gap-2">
 <RefreshCw className="h-4 w-4" aria-hidden="true" />
 Analisis Ulang
 </Button>
 )}

 {dispatchError && (
 <Alert variant="destructive">
 <AlertDescription>{dispatchError}</AlertDescription>
 </Alert>
 )}

 {(isInFlight || status === 'failed') && (
 <AIJobStatus
 status={status}
 error={error}
 loadingMessages={ATS_LOADING_MESSAGES}
 />
 )}

 {status === 'completed' && result && (
 <ATSScoreCard result={result} />
 )}
 </div>
 );
}


