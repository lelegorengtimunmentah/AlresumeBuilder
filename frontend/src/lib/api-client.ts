import axios, { type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ─── Token storage ─────────────────────────────────────────────────────────────
// Stored in localStorage so it persists across page reloads.

const TOKEN_KEY = 'auth_token';

export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// ─── Axios instance ────────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor:
// On 401: clear token and redirect to /login (unless already on auth page
// or this is the session-check request which AuthContext handles silently).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && typeof window !== 'undefined') {
      const url = (error.config?.url as string) ?? '';
      const pathname = window.location.pathname;

      const isAuthPage = pathname === '/login' || pathname === '/register';
      const isSessionCheck = url.includes('/api/auth/me');

      if (!isAuthPage && !isSessionCheck) {
        clearToken();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
