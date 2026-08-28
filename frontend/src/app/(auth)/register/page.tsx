'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import {
 registerSchema,
 type RegisterInput,
} from '@/lib/validations/auth.schema';

import {
 Card,
 CardContent,
 CardDescription,
 CardFooter,
 CardHeader,
 CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
 const router = useRouter();
 const { register: registerUser } = useAuth();
 const [serverError, setServerError] = useState<string | null>(null);

 const {
 register,
 handleSubmit,
 formState: { errors, isSubmitting },
 } = useForm<RegisterInput>({
 resolver: zodResolver(registerSchema),
 });

 async function onSubmit(values: RegisterInput) {
 setServerError(null);
 try {
 await registerUser({
 name: values.name,
 email: values.email,
 password: values.password,
 });
 router.push('/dashboard');
 } catch (err: unknown) {
 const axiosError = err as {
 response?: { data?: { message?: string } };
 message?: string;
 };
 const message =
 axiosError?.response?.data?.message ??
 axiosError?.message ??
 'Terjadi kesalahan. Silakan coba lagi.';
 setServerError(message);
 }
 }

 return (
 <div className="relative z-10 w-full max-w-sm">
 <Card className="!rounded-3xl !p-8">
 <CardHeader className="text-center !p-0 !mb-6">
 <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/20">
 <FileText className="h-6 w-6 text-white" aria-hidden="true" />
 </div>
 <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
 AlresumeBuilder
 </CardTitle>
 <CardDescription className=" text-muted-foreground">Buat akun gratis Anda</CardDescription>
 </CardHeader>

 <CardContent>
 <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
 {serverError && (
 <div
 role="alert"
 className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
 >
 {serverError}
 </div>
 )}

 <div className="space-y-1.5">
 <label htmlFor="name" className="text-sm font-medium text-foreground">
 Nama lengkap
 </label>
 <Input
 id="name"
 type="text"
 placeholder="Budi Santoso"
 autoComplete="name"
 aria-invalid={!!errors.name}
 aria-describedby={errors.name ? 'name-error' : undefined}
 {...register('name')}
 />
 {errors.name && (
 <p id="name-error" className="text-xs text-red-400">
 {errors.name.message}
 </p>
 )}
 </div>

 <div className="space-y-1.5">
 <label htmlFor="email" className="text-sm font-medium text-foreground">
 Email
 </label>
 <Input
 id="email"
 type="email"
 placeholder="nama@email.com"
 autoComplete="email"
 aria-invalid={!!errors.email}
 aria-describedby={errors.email ? 'email-error' : undefined}
 {...register('email')}
 />
 {errors.email && (
 <p id="email-error" className="text-xs text-red-400">
 {errors.email.message}
 </p>
 )}
 </div>

 <div className="space-y-1.5">
 <label htmlFor="password" className="text-sm font-medium text-foreground">
 Password
 </label>
 <Input
 id="password"
 type="password"
 placeholder="Minimal 8 karakter"
 autoComplete="new-password"
 aria-invalid={!!errors.password}
 aria-describedby={errors.password ? 'password-error' : undefined}
 {...register('password')}
 />
 {errors.password && (
 <p id="password-error" className="text-xs text-red-400">
 {errors.password.message}
 </p>
 )}
 </div>

 <div className="space-y-1.5">
 <label htmlFor="password_confirmation" className="text-sm font-medium text-foreground">
 Konfirmasi password
 </label>
 <Input
 id="password_confirmation"
 type="password"
 placeholder="Ulangi password"
 autoComplete="new-password"
 aria-invalid={!!errors.password_confirmation}
 aria-describedby={
 errors.password_confirmation
 ? 'password-confirm-error'
 : undefined
 }
 {...register('password_confirmation')}
 />
 {errors.password_confirmation && (
 <p id="password-confirm-error" className="text-xs text-red-400">
 {errors.password_confirmation.message}
 </p>
 )}
 </div>

 <Button type="submit" className="w-full" disabled={isSubmitting}>
 {isSubmitting ? 'Memproses…' : 'Daftar'}
 </Button>
 </form>
 </CardContent>

 <CardFooter className="justify-center text-sm !pt-4">
 <span className=" text-muted-foreground">Sudah punya akun?&nbsp;</span>
 <Link href="/login" className="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
 Masuk di sini
 </Link>
 </CardFooter>
 </Card>
 </div>
 );
}


