'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, AlertCircle, FileText, LayoutDashboard } from 'lucide-react';

import { useResumes } from '@/hooks/useResumes';
import { useAuth } from '@/hooks/useAuth';
import { ResumeCard } from '@/components/resume/ResumeCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CreditBadge } from '@/components/layout/CreditBadge';

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
 return (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {Array.from({ length: 3 }).map((_, i) => (
 <div key={i} className="rounded-xl border bg-card space-y-3 p-5">
 <Skeleton className="h-5 w-3/4 !rounded-xl" />
 <Skeleton className="h-4 w-1/2 !rounded-xl" />
 <div className="flex gap-2 pt-2">
 <Skeleton className="h-8 flex-1 !rounded-xl" />
 <Skeleton className="h-8 flex-1 !rounded-xl" />
 </div>
 </div>
 ))}
 </div>
 );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onCreateClick, disabled }: { onCreateClick: () => void; disabled: boolean }) {
 return (
 <div className="animate-fade-in-up relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border bg-muted/30 py-16 text-center">
 <span className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border">
 <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
 </span>
 <h3 className="relative mb-1 text-lg font-semibold text-foreground">Belum ada resume</h3>
 <p className="relative mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
 Buat resume pertamamu dan mulai perjalanan karier profesionalmu.
 </p>
 <Button
 onClick={onCreateClick}
 disabled={disabled}
 className="relative gap-2"
 >
 <Plus className="h-4 w-4" aria-hidden="true" />
 Buat Resume Pertama
 </Button>
 </div>
 );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
 const router = useRouter();
 const { resumes, user, isLoading, deleteResume, createResume } = useResumes();
 const { user: authUser } = useAuth();
 const [isCreating, setIsCreating] = useState(false);
 const [createError, setCreateError] = useState<string | null>(null);

 const noCredits = user.plan === 'free' && user.resume_credits === 0;

 async function handleCreateResume() {
 if (noCredits) return;

 setIsCreating(true);
 setCreateError(null);
 try {
 const resume = await createResume();
 router.push(`/resumes/${resume.id}`);
 } catch (err: unknown) {
 const message =
 err instanceof Error ? err.message : 'Gagal membuat resume. Silakan coba lagi.';
 setCreateError(message);
 } finally {
 setIsCreating(false);
 }
 }

 const displayName = authUser?.name?.trim();

 return (
 <div className="mx-auto max-w-5xl space-y-6">
 {/* Header card */}
 <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm p-6">
 {/* Subtle ambient accent */}
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-teal-500/10 blur-[80px]"
 />
 <div className="relative flex flex-wrap items-center justify-between gap-3">
 <div>
 <p className="mb-0.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
 <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
 Dashboard
 </p>
 <h1 className="text-2xl font-semibold tracking-tight text-foreground">
 Selamat datang kembali{displayName ? `, ${displayName}` : ''}
 </h1>
 <p className="mt-0.5 text-sm text-muted-foreground">
 Kelola semua resume kamu di sini.
 </p>
 </div>

 <div className="flex items-center gap-3">
 {!isLoading && (
 <CreditBadge plan={user.plan} credits={user.resume_credits} />
 )}
 <Button
 onClick={handleCreateResume}
 disabled={noCredits || isCreating || isLoading}
 className="gap-2"
 >
 {isCreating ? (
 <>
 <span
 className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
 aria-hidden="true"
 />
 Membuat...
 </>
 ) : (
 <>
 <Plus className="h-4 w-4" aria-hidden="true" />
 Buat Resume Baru
 </>
 )}
 </Button>
 </div>
 </div>
 </div>

 {/* No-credit alert */}
 {!isLoading && noCredits && (
 <Alert variant="destructive">
 <AlertCircle className="h-4 w-4" aria-hidden="true" />
 <AlertTitle>Kredit resume habis</AlertTitle>
 <AlertDescription>
 Kamu telah menggunakan semua kredit gratis.{' '}
 <a href="/pricing" className="font-medium underline underline-offset-2 text-teal-600 dark:text-teal-400">
 Upgrade ke Pro
 </a>{' '}
 untuk membuat resume tanpa batas.
 </AlertDescription>
 </Alert>
 )}

 {/* Create error */}
 {createError && (
 <Alert variant="destructive">
 <AlertCircle className="h-4 w-4" aria-hidden="true" />
 <AlertTitle>Terjadi kesalahan</AlertTitle>
 <AlertDescription>{createError}</AlertDescription>
 </Alert>
 )}

 {/* Content */}
 {isLoading ? (
 <DashboardSkeleton />
 ) : resumes.length === 0 ? (
 <EmptyState onCreateClick={handleCreateResume} disabled={noCredits} />
 ) : (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {resumes.map((resume, index) => (
 <div
 key={resume.id}
 className="animate-fade-in-up"
 style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
 >
 <ResumeCard resume={resume} onDelete={deleteResume} />
 </div>
 ))}
 </div>
 )}

 {/* Resume count footer */}
 {!isLoading && resumes.length > 0 && (
 <p className="text-right text-xs text-muted-foreground">
 {resumes.length} resume tersimpan
 </p>
 )}
 </div>
 );
}

