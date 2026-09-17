'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { usePolling } from '@/hooks/usePolling';
import type { ApiResponse } from '@/types/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnalysisStatus =
  | 'idle'
  | 'uploading'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface SectionScores {
  contact: number;
  summary: number;
  experience: number;
  education: number;
  skills: number;
  formatting: number;
}

export interface ParsedResumeData {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  summary: string | null;
  education: Array<{
    institution: string;
    degree: string | null;
    field_of_study: string | null;
    start_date: string | null;
    end_date: string | null;
    gpa: string | null;
  }>;
  experience: Array<{
    company: string;
    position: string;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
  }>;
  skills: Array<{ name: string; level: 'beginner' | 'intermediate' | 'advanced' }>;
  projects: Array<{
    name: string;
    description: string | null;
    tech_stack: string | null;
    url: string | null;
  }>;
}

export interface AnalysisResult {
  analysis_id: string;
  original_name: string;
  status: string;
  score: number | null;
  recommendations: string[] | null;
  section_scores: SectionScores | null;
  keywords_found: string[] | null;
  keywords_missing: string[] | null;
  parsed_data: ParsedResumeData | null;
  error_message: string | null;
}

export type GenerateResumeStatus = 'idle' | 'generating' | 'done' | 'error';

export interface UseUploadedAnalysisReturn {
  status: AnalysisStatus;
  result: AnalysisResult | null;
  error: string | null;
  uploadAndAnalyze: (file: File) => Promise<void>;
  reset: () => void;
  generateResumeStatus: GenerateResumeStatus;
  generateResumeError: string | null;
  generateResume: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUploadedAnalysis(): UseUploadedAnalysisReturn {
  const router = useRouter();

  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [generateResumeStatus, setGenerateResumeStatus] = useState<GenerateResumeStatus>('idle');
  const [generateResumeError, setGenerateResumeError] = useState<string | null>(null);

  // ── Polling ────────────────────────────────────────────────────────────────

  const pollStatus = useCallback(async () => {
    if (!analysisId) return;

    try {
      const { data: envelope } = await apiClient.get<ApiResponse<AnalysisResult>>(
        `/api/resume-analyses/${analysisId}`,
      );
      const data = envelope.data;

      if (data.status === 'completed' || data.status === 'failed') {
        setResult(data);
        setStatus(data.status as AnalysisStatus);
        setAnalysisId(null);
      }
    } catch {
      // Swallow network errors during polling — will retry on next tick
    }
  }, [analysisId]);

  const isPolling = status === 'pending' || status === 'processing';
  usePolling(pollStatus, isPolling ? 2000 : null);

  // ── Upload & Analyze ───────────────────────────────────────────────────────

  const uploadAndAnalyze = useCallback(async (file: File): Promise<void> => {
    setStatus('uploading');
    setResult(null);
    setError(null);
    setAnalysisId(null);
    setGenerateResumeStatus('idle');
    setGenerateResumeError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data: envelope } = await apiClient.post<
        ApiResponse<{ analysis_id: string; status: string; original_name: string }>
      >('/api/resume-analyses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAnalysisId(envelope.data.analysis_id);
      setStatus((envelope.data.status as AnalysisStatus) ?? 'pending');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr?.response?.data?.message ?? 'Gagal mengupload file. Silakan coba lagi.',
      );
      setStatus('failed');
    }
  }, []);

  // ── Generate Resume ────────────────────────────────────────────────────────

  const generateResume = useCallback(async (): Promise<void> => {
    if (!result?.analysis_id) return;

    setGenerateResumeStatus('generating');
    setGenerateResumeError(null);

    try {
      const { data: envelope } = await apiClient.post<
        ApiResponse<{ resume_id: string; resume_title: string }>
      >(`/api/resume-analyses/${result.analysis_id}/generate-resume`);

      setGenerateResumeStatus('done');
      router.push(`/resumes/${envelope.data.resume_id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      const httpStatus = axiosErr?.response?.status;
      const message =
        httpStatus === 402
          ? 'Kredit resume tidak cukup. Upgrade ke Pro atau tunggu kredit direset.'
          : (axiosErr?.response?.data?.message ?? 'Gagal membuat resume. Silakan coba lagi.');

      setGenerateResumeError(message);
      setGenerateResumeStatus('error');
    }
  }, [result, router]);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setStatus('idle');
    setAnalysisId(null);
    setResult(null);
    setError(null);
    setGenerateResumeStatus('idle');
    setGenerateResumeError(null);
  }, []);

  return {
    status,
    result,
    error,
    uploadAndAnalyze,
    reset,
    generateResumeStatus,
    generateResumeError,
    generateResume,
  };
}
