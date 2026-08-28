import Link from 'next/link';
import Image from 'next/image';
import {
 Sparkles,
 FileSearch,
 MailPlus,
 Check,
 Zap,
 ArrowRight,
 FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AuthRedirect } from '@/components/landing/AuthRedirect';
import type { LucideIcon } from 'lucide-react';

// ─── Feature cards data ────────────────────────────────────────────────────────

interface Feature {
 icon: LucideIcon;
 title: string;
 description: string;
 tileClass: string;
}

const features: Feature[] = [
 {
 icon: Sparkles,
 title: 'AI Summary',
 description:
 'Buat ringkasan profil profesional secara otomatis berdasarkan pengalaman kerjamu.',
 tileClass: 'from-teal-500/20 to-emerald-500/20 text-teal-600 dark:text-teal-400',
 },
 {
 icon: FileSearch,
 title: 'Analisis ATS',
 description:
 'Cek kompatibilitas resume kamu dengan sistem ATS dan dapatkan rekomendasi perbaikan.',
 tileClass: 'from-amber-400/20 to-orange-400/20 text-amber-400',
 },
 {
 icon: MailPlus,
 title: 'Cover Letter',
 description:
 'Generate cover letter yang dipersonalisasi untuk setiap lamaran kerja.',
 tileClass: 'from-rose-400/20 to-pink-400/20 text-rose-400',
 },
];

// ─── Pricing data ─────────────────────────────────────────────────────────────

const plans = [
 {
 name: 'Gratis',
 price: 'Rp 0',
 period: '',
 highlight: false,
 perks: ['5 kredit resume', 'AI features terbatas', 'Export PDF (template ATS)'],
 cta: 'Daftar Gratis',
 href: '/register',
 variant: 'outline' as const,
 },
 {
 name: 'Pro',
 price: 'Rp 49.000',
 period: '/bulan',
 highlight: true,
 perks: ['Resume tanpa batas', 'AI features penuh', 'Export semua template', 'Prioritas support'],
 cta: 'Coba Pro',
 href: '/register',
 variant: 'default' as const,
 },
];

// ─── Logo ──────────────────────────────────────────────────────────────────────

function LogoMark() {
 return (
 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-500 shadow-md shadow-teal-500/25">
 <FileText className="h-4 w-4 text-white" aria-hidden="true" />
 </span>
 );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
 return (
 <>
 {/* Redirect authenticated users to dashboard */}
 <AuthRedirect />

 <div className=" flex flex-col min-h-full text-white">

 {/* ── Ambient background ─────────────────────────────────────────── */}
 <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
 <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full dark:bg-purple-500/8 bg-purple-500/12 blur-[140px]" />
 <div className="absolute top-20 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/6 blur-[120px]" />
 <div className="absolute bottom-1/3 left-1/2 h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-[100px]" />
 <div className="absolute top-1/2 right-1/6 h-[350px] w-[350px] rounded-full bg-orange-500/4 blur-[100px]" />
 </div>

 {/* ── Navbar ──────────────────────────────────────────────────────── */}
 <header className="sticky top-0 z-40 border-b border-black/[0.06] dark:bg-[rgba(5,5,8,0.6)] bg-[rgba(255,255,255,0.6)]">
 <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
 <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
 <LogoMark />
 <span className="text-lg text-foreground">
 Alresume<span className="text-primary">Builder</span>
 </span>
 </Link>
 <nav className="flex items-center gap-3">
 <Button variant="ghost" size="sm" asChild>
 <Link href="/login">Masuk</Link>
 </Button>
 <Button size="sm" asChild>
 <Link href="/register">Mulai Gratis</Link>
 </Button>
 </nav>
 </div>
 </header>

 <main className="flex-1">

 {/* ── Hero ──────────────────────────────────────────────────────── */}
 <section className="relative overflow-hidden py-24 sm:py-32">
 <div className="relative max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
 {/* Text content */}
 <div className="flex-1 flex flex-col items-center lg:items-start gap-6 text-center lg:text-left">
 {/* Badge pill */}
 <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-background px-4 py-1.5 text-xs font-medium dark:text-white/60 text-black/60">
 <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
 Ditenagai kecerdasan buatan
 </span>

 <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl text-foreground">
 Buat Resume Profesional dengan{' '}
 <span className="text-primary">Bantuan AI</span>
 </h1>
 <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
 AlresumeBuilder membantu kamu membuat resume yang menonjol dengan
 teknologi AI — analisis ATS, ringkasan profil, dan cover letter otomatis.
 </p>
 <div className="mt-2 flex flex-col gap-3 sm:flex-row">
 <Button size="lg" className="gap-2" asChild>
 <Link href="/register">
 Mulai Gratis
 <ArrowRight className="h-4 w-4" aria-hidden="true" />
 </Link>
 </Button>
 <Button size="lg" variant="outline" asChild>
 <Link href="/login">Masuk</Link>
 </Button>
 </div>
 </div>

 {/* Illustration */}
 <div className="flex-1 flex justify-center lg:justify-end">
 <div className="relative w-full max-w-lg">
 <div
 aria-hidden="true"
 className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-teal-500/10 via-emerald-500/5 to-amber-400/8 blur-3xl"
 />
 <Image
 src="/images/illustrations/hero-illustration.svg"
 alt="Ilustrasi pembuatan resume profesional"
 width={600}
 height={450}
 className="relative w-full h-auto drop-shadow-2xl"
 priority
 />
 </div>
 </div>
 </div>
 </section>

 {/* ── Features ─────────────────────────────────────────────────── */}
 <section className="py-20 sm:py-24">
 <div className="max-w-5xl mx-auto px-6">
 <h2 className="mb-3 text-center text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
 Semua yang kamu butuhkan
 </h2>
 <p className="mx-auto mb-12 max-w-md text-center text-sm text-muted-foreground">
 Tiga fitur AI yang bekerja bersama membuat lamaranmu tidak terbantahkan.
 </p>
 <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
 {features.map((f) => (
 <Card
 key={f.title}
 className="group relative overflow-hidden text-center p-2"
 >
 <CardHeader>
 <div
 className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.tileClass}`}
 >
 <f.icon className="h-7 w-7" aria-hidden="true" />
 </div>
 <CardTitle className="text-lg">{f.title}</CardTitle>
 </CardHeader>
 <CardContent>
 <CardDescription className="text-sm leading-relaxed">
 {f.description}
 </CardDescription>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 </section>

 {/* ── Pricing ──────────────────────────────────────────────────── */}
 <section className="py-20 sm:py-24">
 <div className="max-w-5xl mx-auto px-6">
 <h2 className="mb-12 text-center text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
 Pilih plan kamu
 </h2>
 <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
 {plans.map((plan) => (
 <Card
 key={plan.name}
 className={
 plan.highlight
 ? 'relative !p-0 overflow-visible border-teal-500/30 bg-teal-500/5'
 : ''
 }
 >
 {plan.highlight ? (
 <>
 <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-3.5 py-1 text-xs font-semibold text-white shadow-lg shadow-teal-500/30 z-10">
 <Zap className="h-3 w-3" aria-hidden="true" />
 Paling Populer
 </span>
 <div className="flex h-full flex-col p-6">
 <PlanBody plan={plan} />
 </div>
 </>
 ) : (
 <PlanBody plan={plan} />
 )}
 </Card>
 ))}
 </div>
 </div>
 </section>

 {/* ── Final CTA ────────────────────────────────────────────────── */}
 <section className="px-6 pb-24">
 <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl rounded-xl border bg-card shadow-sm p-6">
 <div className="relative flex flex-col md:flex-row items-center gap-8 p-10">
 {/* Illustration */}
 <div className="flex-1 flex justify-center">
 <Image
 src="/images/illustrations/cta-illustration.svg"
 alt="Ilustrasi mulai membuat resume"
 width={400}
 height={300}
 className="w-full max-w-xs h-auto drop-shadow-lg"
 />
 </div>
 {/* Text content */}
 <div className="flex-1 space-y-4 text-center md:text-left">
 <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
 Siap mendapatkan pekerjaan impianmu?
 </h2>
 <p className="max-w-md text-sm text-muted-foreground">
 Bergabung sekarang dan buat resume profesional pertamamu dalam hitungan menit.
 </p>
 <Button size="lg" className="mt-2 gap-2" asChild>
 <Link href="/register">
 Mulai Gratis Sekarang
 <ArrowRight className="h-4 w-4" aria-hidden="true" />
 </Link>
 </Button>
 </div>
 </div>
 </div>
 </section>

 </main>

 {/* ── Footer ────────────────────────────────────────────────────────── */}
 <footer className="border-t border-black/[0.06] py-8">
 <div className="max-w-5xl mx-auto px-6 flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
 <div className="flex items-center gap-2">
 <LogoMark />
 <span className="font-medium text-foreground">AlresumeBuilder</span>
 </div>
 <p>© 2025 AlresumeBuilder. All rights reserved.</p>
 </div>
 </footer>

 </div>
 </>
 );
}

// ─── Plan card body (shared between Gratis & Pro) ─────────────────────────────

function PlanBody({
 plan,
}: {
 plan: (typeof plans)[number];
}) {
 return (
 <>
 <CardHeader className="pt-6">
 <CardTitle className="text-xl">{plan.name}</CardTitle>
 <div className="mt-1 flex items-baseline gap-1">
 <span className="text-3xl font-bold text-foreground">{plan.price}</span>
 {plan.period && (
 <span className="text-sm text-muted-foreground">{plan.period}</span>
 )}
 </div>
 </CardHeader>
 <CardContent className="flex-1">
 <ul className="space-y-2.5 text-sm text-muted-foreground">
 {plan.perks.map((perk) => (
 <li key={perk} className="flex items-center gap-2">
 <span
 className={
 plan.highlight
 ? 'flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
 : 'flex h-5 w-5 items-center justify-center rounded-full dark:bg-teal-500/15 bg-teal-500/10 text-teal-600 dark:text-teal-400'
 }
 >
 <Check className="h-3 w-3" aria-hidden="true" />
 </span>
 <span className="dark:text-white/65 text-black/65">{perk}</span>
 </li>
 ))}
 </ul>
 </CardContent>
 <CardFooter>
 <Button
 variant={plan.variant}
 className="w-full"
 asChild
 >
 <Link href={plan.href}>{plan.cta}</Link>
 </Button>
 </CardFooter>
 </>
 );
}


