'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';

export interface AISummaryConfirmProps {
  resumeId: string;
  result: string;
  onConfirmed: (text: string) => void;
  onCancel: () => void;
}

// ─── Parser ───────────────────────────────────────────────────────────────────
// Ekstrak dua pilihan dari format:
//   ###PILIHAN_1###\n...\n###PILIHAN_2###\n...\n###SELESAI###
// Fallback: jika format tidak dikenali, seluruh teks dijadikan pilihan 1.

function parsePilihan(raw: string): [string, string | null] {
  const p1Match = raw.match(/###PILIHAN_1###\s*([\s\S]*?)###PILIHAN_2###/);
  const p2Match = raw.match(/###PILIHAN_2###\s*([\s\S]*?)(?:###SELESAI###|$)/);

  if (p1Match && p2Match) {
    return [p1Match[1].trim(), p2Match[1].trim()];
  }

  // Fallback: coba split dengan label bold "**Pilihan 1" dan "**Pilihan 2"
  const boldMatch = raw.split(/\*{0,2}Pilihan\s*2\*{0,2}/i);
  if (boldMatch.length === 2) {
    const p1 = boldMatch[0].replace(/\*{0,2}Pilihan\s*1\*{0,2}/i, '').trim();
    const p2 = boldMatch[1].replace(/^[\s:"]+/, '').trim();
    return [p1, p2 || null];
  }

  return [raw.trim(), null];
}

// ─── Sub-komponen: Card Pilihan ───────────────────────────────────────────────

interface PilihanCardProps {
  nomor: 1 | 2;
  label: string;
  teks: string;
  dipilih: boolean;
  onClick: () => void;
}

function PilihanCard({ nomor, label, teks, dipilih, onClick }: PilihanCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border-2 p-4 text-left transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        dipilih
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/50 hover:bg-muted/40',
      )}
      aria-pressed={dipilih}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
              dipilih
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {dipilih ? <Check className="h-3.5 w-3.5" /> : nomor}
          </span>
          <span className="text-sm font-semibold text-foreground">Pilihan {nomor}</span>
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">{teks}</p>
    </button>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

export function AISummaryConfirm({
  resumeId,
  result,
  onConfirmed,
  onCancel,
}: AISummaryConfirmProps) {
  const [pilihan1, pilihan2] = parsePilihan(result);
  const hasDuaPilihan = pilihan2 !== null;

  const [selected, setSelected] = useState<1 | 2>(1);
  const [editedText, setEditedText] = useState(pilihan1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(nomor: 1 | 2) {
    setSelected(nomor);
    setEditedText(nomor === 1 ? pilihan1 : (pilihan2 ?? ''));
  }

  const handleSave = async () => {
    if (!editedText.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      await apiClient.post<ApiResponse<unknown>>(
        `/api/resumes/${resumeId}/ai/summary/confirm`,
        { summary_text: editedText },
      );
      onConfirmed(editedText);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal menyimpan ringkasan. Silakan coba lagi.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in-up space-y-5">

      {/* Judul seksi */}
      <div>
        <p className="text-sm font-semibold text-foreground">
          Ringkasan yang dihasilkan AI
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {hasDuaPilihan
            ? 'Pilih salah satu versi, edit jika perlu, lalu simpan.'
            : 'Edit teks di bawah sebelum menyimpan.'}
        </p>
      </div>

      {/* Dua card pilihan */}
      {hasDuaPilihan && (
        <div className="grid gap-3 sm:grid-cols-2">
          <PilihanCard
            nomor={1}
            label="Formal & Padat"
            teks={pilihan1}
            dipilih={selected === 1}
            onClick={() => handleSelect(1)}
          />
          <PilihanCard
            nomor={2}
            label="Dinamis & Modern"
            teks={pilihan2!}
            dipilih={selected === 2}
            onClick={() => handleSelect(2)}
          />
        </div>
      )}

      {/* Editor teks — selalu tampil, pre-filled dari pilihan yang dipilih */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">
          {hasDuaPilihan ? `Edit Pilihan ${selected}` : 'Edit ringkasan'}
        </p>
        <Textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          rows={5}
          className="resize-y text-sm"
          placeholder="Ringkasan profil profesional..."
          disabled={isSaving}
        />
        <p className="text-right text-xs text-muted-foreground">
          {editedText.trim().split(/\s+/).filter(Boolean).length} kata
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isSaving || !editedText.trim()}>
          {isSaving ? 'Menyimpan...' : 'Simpan ke Profil'}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Batal
        </Button>
      </div>

    </div>
  );
}
