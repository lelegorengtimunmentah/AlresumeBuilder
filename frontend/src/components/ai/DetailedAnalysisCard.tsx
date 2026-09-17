'use client';

import { useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  LayoutTemplate,
} from 'lucide-react';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { AnalysisResult, SectionScores } from '@/hooks/useUploadedAnalysis';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DetailedAnalysisCardProps {
  result: AnalysisResult;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

function barColor(score: number): string {
  if (score >= 80) return '[&>div]:bg-green-500';
  if (score >= 50) return '[&>div]:bg-yellow-500';
  return '[&>div]:bg-red-500';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Sangat Baik';
  if (score >= 50) return 'Perlu Peningkatan';
  return 'Perlu Perhatian';
}

const SECTION_META: {
  key: keyof SectionScores;
  label: string;
  Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: 'true' }>;
}[] = [
  { key: 'contact', label: 'Kontak', Icon: User },
  { key: 'summary', label: 'Ringkasan', Icon: FileText },
  { key: 'experience', label: 'Pengalaman', Icon: Briefcase },
  { key: 'education', label: 'Pendidikan', Icon: GraduationCap },
  { key: 'skills', label: 'Skills', Icon: Wrench },
  { key: 'formatting', label: 'Format', Icon: LayoutTemplate },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function OverallScore({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
      {/* Decorative gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-tr from-violet-500/10 via-fuchsia-500/10 to-sky-500/10 blur-2xl"
      />
      <p className="mb-1 text-sm font-medium text-muted-foreground">Skor ATS Keseluruhan</p>
      <div className="flex items-end gap-3">
        <span className={`text-6xl font-bold leading-none ${scoreColor(clamped)}`}>
          {clamped}
        </span>
        <span className="mb-1 text-lg text-muted-foreground">/100</span>
      </div>
      <p className={`mt-1 text-sm font-medium ${scoreColor(clamped)}`}>
        {scoreLabel(clamped)}
      </p>
      <div className="mt-4">
        <Progress
          value={clamped}
          className={`h-3 ${barColor(clamped)}`}
          aria-label={`Skor ATS: ${clamped} dari 100`}
        />
        <p className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </p>
      </div>
    </div>
  );
}

function SectionScoresCard({ scores }: { scores: SectionScores }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Skor Per Bagian</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTION_META.map(({ key, label, Icon }) => {
          const s = Math.min(100, Math.max(0, Math.round(scores[key] ?? 0)));
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </span>
                <span className={`text-xs font-semibold tabular-nums ${scoreColor(s)}`}>
                  {s}
                </span>
              </div>
              <Progress
                value={s}
                className={`h-1.5 ${barColor(s)}`}
                aria-label={`Skor ${label}: ${s}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KeywordsCard({
  found,
  missing,
}: {
  found: string[];
  missing: string[];
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Analisis Kata Kunci</h3>

      {found.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Ditemukan ({found.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {found.map((kw) => (
              <Badge
                key={kw}
                variant="outline"
                className="border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300 text-xs"
              >
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Disarankan untuk ditambahkan ({missing.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((kw) => (
              <Badge
                key={kw}
                variant="outline"
                className="border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 text-xs"
              >
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {found.length === 0 && missing.length === 0 && (
        <p className="text-sm text-muted-foreground">Tidak ada data kata kunci.</p>
      )}
    </div>
  );
}

function RecommendationsCard({ recommendations }: { recommendations: string[] }) {
  if (recommendations.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Rekomendasi Perbaikan</h3>
      <ul className="space-y-3">
        {recommendations.map((rec, index) => (
          <li key={index} className="flex gap-3 text-sm text-muted-foreground">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span className="leading-relaxed">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ParsedDataSummary({
  parsed,
}: {
  parsed: NonNullable<AnalysisResult['parsed_data']>;
}) {
  const items: { label: string; value: string | null }[] = [
    { label: 'Nama', value: parsed.full_name },
    { label: 'Email', value: parsed.email },
    { label: 'Telepon', value: parsed.phone },
    { label: 'Alamat', value: parsed.address },
    {
      label: 'Pendidikan',
      value:
        parsed.education.length > 0
          ? `${parsed.education.length} entri ditemukan`
          : null,
    },
    {
      label: 'Pengalaman',
      value:
        parsed.experience.length > 0
          ? `${parsed.experience.length} entri ditemukan`
          : null,
    },
    {
      label: 'Skills',
      value:
        parsed.skills.length > 0
          ? `${parsed.skills.length} skill ditemukan`
          : null,
    },
    {
      label: 'Proyek',
      value:
        parsed.projects.length > 0
          ? `${parsed.projects.length} proyek ditemukan`
          : null,
    },
  ];

  const detected = items.filter((i) => i.value !== null);
  const missing = items.filter((i) => i.value === null);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Data Terdeteksi untuk Builder
      </h3>

      {detected.length > 0 && (
        <ul className="mb-3 space-y-2">
          {detected.map(({ label, value }) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-green-500"
                aria-hidden="true"
              />
              <span className="w-24 shrink-0 font-medium text-foreground">{label}</span>
              <span className="truncate text-muted-foreground">{value}</span>
            </li>
          ))}
        </ul>
      )}

      {missing.length > 0 && (
        <ul className="space-y-2">
          {missing.map(({ label }) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              <AlertCircle
                className="h-4 w-4 shrink-0 text-muted-foreground/50"
                aria-hidden="true"
              />
              <span className="w-24 shrink-0 font-medium text-muted-foreground/70">
                {label}
              </span>
              <span className="text-muted-foreground/50 italic">Tidak ditemukan</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Full detailed analysis display card.
 *
 * Shows:
 *  - Overall ATS score with progress bar
 *  - Per-section scores grid
 *  - Keyword found / missing badges
 *  - Actionable recommendations list
 *  - Parsed data summary (preview of what "Generate Resume" will create)
 */
export function DetailedAnalysisCard({ result }: DetailedAnalysisCardProps) {
  const score = useMemo(() => Math.min(100, Math.max(0, Math.round(result.score ?? 0))), [result.score]);

  return (
    <div className="animate-fade-in-up space-y-4">
      {/* Overall score */}
      <OverallScore score={score} />

      {/* Section scores */}
      {result.section_scores && (
        <div style={{ animationDelay: '80ms' }} className="animate-fade-in-up">
          <SectionScoresCard scores={result.section_scores} />
        </div>
      )}

      {/* Keywords */}
      {(result.keywords_found !== null || result.keywords_missing !== null) && (
        <div style={{ animationDelay: '160ms' }} className="animate-fade-in-up">
          <KeywordsCard
            found={result.keywords_found ?? []}
            missing={result.keywords_missing ?? []}
          />
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div style={{ animationDelay: '240ms' }} className="animate-fade-in-up">
          <RecommendationsCard recommendations={result.recommendations} />
        </div>
      )}

      {/* Parsed data summary */}
      {result.parsed_data && (
        <div style={{ animationDelay: '320ms' }} className="animate-fade-in-up">
          <ParsedDataSummary parsed={result.parsed_data} />
        </div>
      )}
    </div>
  );
}
