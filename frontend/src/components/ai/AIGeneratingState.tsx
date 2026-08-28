'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export interface AIGeneratingStateProps {
 title?: string;
 messages?: string[];
}

const DEFAULT_MESSAGES = [
 'Sedang memproses...',
 'Menganalisis data resume Anda...',
 'Menyusun bahasa yang profesional...',
 'Mohon tunggu, jangan tutup halaman ini.',
];

export function AIGeneratingState({
 title = 'AI sedang bekerja',
 messages = DEFAULT_MESSAGES,
}: AIGeneratingStateProps) {
 const [messageIndex, setMessageIndex] = useState(0);
 const [elapsedSeconds, setElapsedSeconds] = useState(0);

 useEffect(() => {
 const timer = setInterval(() => {
 setMessageIndex((index) => Math.min(index + 1, messages.length - 1));
 }, 2600);
 return () => clearInterval(timer);
 }, [messages.length]);

 useEffect(() => {
 const timer = setInterval(() => {
 setElapsedSeconds((seconds) => seconds + 1);
 }, 1000);
 return () => clearInterval(timer);
 }, []);

 const minutes = Math.floor(elapsedSeconds / 60);
 const seconds = elapsedSeconds % 60;

 return (
 <div
 className="animate-fade-in-up rounded-xl border bg-card shadow-sm p-6"
 role="status"
 aria-live="polite"
 >
 <div className="flex items-center gap-4">
 {/* Orb */}
 <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
 <span className="animate-ai-ring absolute inset-0 rounded-full dark:bg-teal-500/15 bg-teal-500/10" />
 <span className="absolute inset-1 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/20 to-amber-400/20 blur-[2px]" />
 <Sparkles
 className="animate-ai-orb relative h-6 w-6 text-teal-600 dark:text-teal-400"
 aria-hidden="true"
 />
 </div>

 {/* Title + rotating message */}
 <div className="min-w-0 flex-1">
 <p className="text-sm font-semibold text-foreground">{title}</p>
 <p
 key={messageIndex}
 className="animate-ai-message-in truncate text-sm text-muted-foreground"
 >
 {messages[messageIndex]}
 </p>
 </div>

 {/* Elapsed time */}
 <span
 className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground"
 aria-label={`Waktu berjalan ${elapsedSeconds} detik`}
 >
 {minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${elapsedSeconds}s`}
 </span>
 </div>

 {/* Shimmering skeleton preview */}
 <div className="mt-5 space-y-2.5" aria-hidden="true">
 {[92, 100, 78, 96, 60].map((widthPercent, index) => (
 <div
 key={index}
 className="ai-shimmer h-3 rounded-full"
 style={{ width: `${widthPercent}%`, animationDelay: `${index * 140}ms` }}
 />
 ))}
 </div>
 </div>
 );
}

