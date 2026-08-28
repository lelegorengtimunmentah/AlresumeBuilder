'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { usePolling } from '@/hooks/usePolling';
import type { ApiResponse } from '@/types/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnalysisStatus = 'idle' | 'uploading' | 'pending' | 'processing' | 'completed' | 'failed';

export interface AnalysisResult {
  analysis_id: string;
  original_name: string;
  status: string;
  score: number | null;
  recommendations: string[] | null;
  error_message: string | null;
}

export interface UseUploadedAnalysisReturn {
  status: AnalysisStatus;
  result: AnalysisResult | null;
  error: string | null;
  uploadAndAnalyze: (file: File) => Promise<void>;
  reset: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUploadedAnalysis(): UseUploadedAnalysisReturn {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollStatus = useCallback(async () => {
    if (!analysisId) return;

    try {
      const { data: envelope } = await apiClient.get<ApiResponse<AnalysisResult>>(
        `/api/resume-analyses/${analysisId}`,
      );
      const data = envelope.data;

      if (data.status === 'completed' || data.status === 'failed') {
        setResult(data);
        setStatus(data.status);
        setAnalysisId(null);
      }
    } catch {
      // Swallow network errors during polling
    }
  }, [analysisId]);

  const isPolling = status === 'pending' || status === 'processing';
  usePolling(pollStatus, isPolling ? 2000 : null);

  const uploadAndAnalyze = useCallback(async (file: File): Promise<void> => {
    setStatus('uploading');
    setResult(null);
    setError(null);
    setAnalysisId(null);

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
      setError(axiosErr?.response?.data?.message ?? 'Gagal mengupload file. Silakan coba lagi.');
      setStatus('failed');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setAnalysisId(null);
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, uploadAndAnalyze, reset };
}
