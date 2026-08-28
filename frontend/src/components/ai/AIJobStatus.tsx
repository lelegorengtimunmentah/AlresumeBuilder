'use client';

import { Sparkles } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AIGeneratingState } from '@/components/ai/AIGeneratingState';
import type { AIJobHookStatus } from '@/hooks/useAIJob';

export interface AIJobStatusProps {
 status: AIJobHookStatus;
 result?: string | null;
 error?: string | null;
 loadingMessages?: string[];
}

export function AIJobStatus({ status, result, error, loadingMessages }: AIJobStatusProps) {
 if (status === 'idle') {
 return null;
 }

 if (status === 'pending' || status === 'processing') {
 return <AIGeneratingState messages={loadingMessages} />;
 }

 if (status === 'completed' && result) {
 return (
 <div className="animate-fade-in-up rounded-xl border bg-card shadow-sm p-5">
 <div className="mb-3 flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20">
 <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
 </span>
 <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
 Hasil AI
 </p>
 </div>
 <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
 {result}
 </pre>
 </div>
 );
 }

 if (status === 'failed') {
 return (
 <Alert variant="destructive">
 <AlertTitle>Gagal memproses</AlertTitle>
 <AlertDescription>
 {error ?? 'Terjadi kesalahan saat memproses permintaan AI. Silakan coba lagi.'}
 </AlertDescription>
 </Alert>
 );
 }

 return null;
}

