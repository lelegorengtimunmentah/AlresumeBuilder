'use client';

import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface ATSScoreCardProps {
 result: string;
}

interface ATSResult {
 score: number;
 recommendations: string[];
}

function parseATSResult(raw: string): ATSResult | null {
 try {
 const parsed = JSON.parse(raw) as unknown;
 if (
 typeof parsed === 'object' &&
 parsed !== null &&
 'score' in parsed &&
 'recommendations' in parsed &&
 typeof (parsed as ATSResult).score === 'number' &&
 Array.isArray((parsed as ATSResult).recommendations)
 ) {
 return parsed as ATSResult;
 }
 return null;
 } catch {
 return null;
 }
}

export function ATSScoreCard({ result }: ATSScoreCardProps) {
 const parsed = useMemo(() => parseATSResult(result), [result]);

 if (!parsed) {
 return (
 <Alert variant="destructive">
 <AlertDescription>
 Gagal memproses hasil analisis ATS. Format data tidak valid.
 </AlertDescription>
 </Alert>
 );
 }

 const { score, recommendations } = parsed;
 const clampedScore = Math.min(100, Math.max(0, Math.round(score)));

 const scoreColor =
 clampedScore >= 80
 ? 'text-green-400'
 : clampedScore >= 50
 ? 'text-amber-600 dark:text-amber-400'
 : 'text-red-400';

 const barColor =
 clampedScore >= 80
 ? '[&>div]:!bg-gradient-to-r [&>div]:!from-green-500 [&>div]:!to-emerald-400'
 : clampedScore >= 50
 ? '[&>div]:!bg-gradient-to-r [&>div]:!from-amber-500 [&>div]:!to-yellow-400'
 : '[&>div]:!bg-gradient-to-r [&>div]:!from-red-500 [&>div]:!to-rose-400';

 const label =
 clampedScore >= 80
 ? 'Sangat Baik'
 : clampedScore >= 50
 ? 'Perlu Peningkatan'
 : 'Perlu Perhatian';

 return (
 <div className="animate-fade-in-up space-y-6">
 {/* Score section */}
 <div className="rounded-xl border bg-card shadow-sm p-6">
 <p className="mb-1 text-sm font-medium text-muted-foreground">Skor ATS</p>
 <div className="flex items-end gap-3">
 <span className={`text-6xl font-bold leading-none ${scoreColor}`}>
 {clampedScore}
 </span>
 <span className="mb-1 text-lg text-muted-foreground">/100</span>
 </div>
 <p className={`mt-1 text-sm font-medium ${scoreColor}`}>{label}</p>

 <div className="mt-4">
 <Progress
 value={clampedScore}
 className={`h-3 ${barColor}`}
 aria-label={`Skor ATS: ${clampedScore} dari 100`}
 />
 <p className="mt-2 flex justify-between text-xs text-muted-foreground">
 <span>0</span>
 <span>50</span>
 <span>100</span>
 </p>
 </div>
 </div>

 {/* Recommendations */}
 {recommendations.length > 0 && (
 <div
 className="animate-fade-in-up rounded-xl border bg-card shadow-sm p-6"
 style={{ animationDelay: '120ms' }}
 >
 <h3 className="mb-4 text-sm font-semibold text-foreground">
 Rekomendasi Perbaikan
 </h3>
 <ul className="space-y-3">
 {recommendations.map((rec, index) => (
 <li key={index} className="flex gap-3 text-sm text-muted-foreground">
 <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-xs font-semibold text-teal-600 dark:text-teal-400 border border-teal-500/20">
 {index + 1}
 </span>
 <span className="leading-relaxed">{rec}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 </div>
 );
}

