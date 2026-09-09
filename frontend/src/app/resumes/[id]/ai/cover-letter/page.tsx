'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { CoverLetterEditor } from '@/components/ai/CoverLetterEditor';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import type { Resume } from '@/types/resume';

export default function CoverLetterPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [resume, setResume] = useState<Resume | null>(null);

  const fetchResume = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data: { resume: Resume } }>(`/api/resumes/${id}`);
      setResume(res.data.data.resume);
    } catch {
      // If fetch fails, CoverLetterEditor still works — preview will just
      // show empty sender fields. Not a blocking error.
    }
  }, [id]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/resumes/${id}`} aria-label="Kembali ke Resume Builder">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-foreground">
          <span className="text-gradient-ai">Cover</span> Letter
        </h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Buat surat lamaran kerja yang dipersonalisasi berdasarkan data resume Anda
        dan informasi perusahaan yang ingin Anda lamar.
      </p>

      <CoverLetterEditor resumeId={id} resume={resume} />
    </div>
  );
}
