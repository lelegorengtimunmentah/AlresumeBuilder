'use client';

import React, {
 createContext,
 useCallback,
 useContext,
 useEffect,
 useMemo,
 useState,
} from 'react';
import apiClient, { saveToken, getToken, clearToken } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';

// --- Types --------------------------------------------------------------------

export interface User {
 id: string;
 name: string;
 email: string;
 plan: 'free' | 'pro';
 resume_credits: number;
}

export interface LoginCredentials {
 email: string;
 password: string;
}

export interface RegisterData {
 name: string;
 email: string;
 password: string;
}

interface AuthState {
 user: User | null;
 isLoading: boolean;
 isAuthenticated: boolean;
}

interface AuthActions {
 login: (credentials: LoginCredentials) => Promise<void>;
 logout: () => Promise<void>;
 register: (data: RegisterData) => Promise<void>;
}

export type AuthContextValue = AuthState & AuthActions;

// --- Context ------------------------------------------------------------------

export const AuthContext = createContext<AuthContextValue | null>(null);

// --- Cookie helpers (synced with proxy.ts middleware) --------------------------

const IS_AUTH_COOKIE = 'is_authenticated';

function setAuthCookie() {
 if (typeof document !== 'undefined') {
 document.cookie = `${IS_AUTH_COOKIE}=1; path=/; max-age=86400; SameSite=Lax`;
 }
}

function clearAuthCookie() {
 if (typeof document !== 'undefined') {
 document.cookie = `${IS_AUTH_COOKIE}=; path=/; max-age=0`;
 }
}

// --- Provider -----------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
 const [user, setUser] = useState<User | null>(null);
 const [isLoading, setIsLoading] = useState(true);

 // -- Bootstrap: check existing session on mount ----------------------------
 useEffect(() => {
 let cancelled = false;

 async function fetchCurrentUser() {
 // No token = definitely not logged in
 if (!getToken()) {
 if (!cancelled) {
 setUser(null);
 setIsLoading(false);
 }
 return;
 }

 try {
 const { data: envelope } = await apiClient.get<ApiResponse<{ user: User }>>(
 '/api/auth/me',
 );
 if (!cancelled) {
 setUser(envelope.data.user);
 }
 } catch {
 clearToken();
 if (!cancelled) setUser(null);
 } finally {
 if (!cancelled) setIsLoading(false);
 }
 }

 fetchCurrentUser();
 return () => { cancelled = true; };
 }, []);

 // -- Actions ---------------------------------------------------------------

 const login = useCallback(async (credentials: LoginCredentials) => {
 const { data: envelope } = await apiClient.post<
 ApiResponse<{ user: User; token: string }>
 >('/api/auth/login', credentials);

 saveToken(envelope.data.token);
 setAuthCookie();
 setUser(envelope.data.user);
 }, []);

 const register = useCallback(async (data: RegisterData) => {
 const { data: envelope } = await apiClient.post<
 ApiResponse<{ user: User; token: string }>
 >('/api/auth/register', data);

 saveToken(envelope.data.token);
 setAuthCookie();
 setUser(envelope.data.user);
 }, []);

 const logout = useCallback(async () => {
 try {
 await apiClient.post('/api/auth/logout');
 } finally {
 clearToken();
 clearAuthCookie();
 setUser(null);
 }
 }, []);

 // -- Memoised context value ------------------------------------------------

 const value = useMemo<AuthContextValue>(
 () => ({
 user,
 isLoading,
 isAuthenticated: user !== null,
 login,
 logout,
 register,
 }),
 [user, isLoading, login, logout, register],
 );

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- Internal hook ------------------------------------------------------------

export function useAuthContext(): AuthContextValue {
 const ctx = useContext(AuthContext);
 if (!ctx) {
 throw new Error('useAuth must be used inside <AuthProvider>');
 }
 return ctx;
}

