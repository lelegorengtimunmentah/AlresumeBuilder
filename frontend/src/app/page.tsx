'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles, FileSearch, MailPlus, Check, Zap, ArrowRight,
  FileText, Upload, BarChart3, Tags, PenLine, ChevronRight,
  Mail, MessageCircle, Globe, MapPin,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AuthRedirect } from '@/components/landing/AuthRedirect';
import { FloatingNavbar } from '@/components/landing/FloatingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Feature { icon: LucideIcon; title: string; description: string; accentVar: string; }

const features: Feature[] = [
  { icon: Sparkles,  title: 'AI Summary',      description: 'Buat ringkasan profil profesional secara otomatis berdasarkan pengalaman kerjamu.', accentVar: '--lp-teal' },
  { icon: FileSearch, title: 'Analisis ATS',   description: 'Cek kompatibilitas resume kamu dengan sistem ATS dan dapatkan rekomendasi perbaikan per bagian.', accentVar: '--lp-rose' },
  { icon: MailPlus,  title: 'Cover Letter',     description: 'Generate cover letter yang dipersonalisasi untuk setiap lamaran kerja.', accentVar: '--lp-orange' },
  { icon: Upload,    title: 'Upload & Analisis', description: 'Upload resume PDF/DOCX yang sudah kamu punya, analisis ATS mendalam, lalu langsung edit di builder.', accentVar: '--lp-mint' },
];

const plans = [
  { name: 'Gratis', price: 'Rp 0', period: '', highlight: false,
    perks: ['5 kredit resume', 'AI features terbatas', 'Export PDF (template ATS)'], cta: 'Daftar Gratis', href: '/register' },
  { name: 'Pro', price: 'Rp 49.000', period: '/bulan', highlight: true,
    perks: ['Resume tanpa batas', 'AI features penuh', 'Export semua template', 'Prioritas support'], cta: 'Coba Pro', href: '/register' },
];

const analyzeSteps = [
  { step: '01', icon: Upload,    title: 'Upload Resume',         description: 'Upload file PDF atau DOCX resume yang sudah kamu punya. Maksimal 5 MB.', accentVar: '--lp-orange' },
  { step: '02', icon: BarChart3, title: 'Analisis Mendalam',     description: 'AI menganalisis skor ATS, mengevaluasi 6 bagian resume, dan mendeteksi keyword yang ada maupun yang kurang.', accentVar: '--lp-teal' },
  { step: '03', icon: Tags,      title: 'Rekomendasi & Keyword', description: 'Dapatkan daftar rekomendasi perbaikan spesifik dan keyword penting agar resume lolos sistem rekrutmen.', accentVar: '--lp-rose' },
  { step: '04', icon: PenLine,   title: 'Edit di Builder',       description: 'Klik "Generate Resume" — data diekstrak otomatis dan langsung dibuka di builder.', accentVar: '--lp-mint' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Inline style helper: accent color from CSS var */
const accent = (v: string) => `var(${v})`;
const accentBg = (v: string) => `color-mix(in srgb, var(${v}) 14%, transparent)`;
const accentBorder = (v: string) => `color-mix(in srgb, var(${v}) 30%, transparent)`;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <AuthRedirect />
      <div className="flex flex-col min-h-full" style={{ background: 'var(--lp-bg)', color: 'var(--lp-text)' }}>

        <FloatingNavbar />

        <main className="flex-1">

          {/* ── Hero ── */}
          <HeroSection />

          {/* ── Features ── */}
          <section id="fitur" className="scroll-mt-20 py-20 sm:py-24"
            style={{ background: 'var(--lp-bg-section)' }}>
            <div className="max-w-5xl mx-auto px-4">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--lp-text)' }}>
                  Semua yang kamu butuhkan
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--lp-text-muted)' }}>
                  Empat fitur AI yang bekerja bersama membuat lamaranmu tidak terbantahkan.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((f) => (
                  <div key={f.title}
                    className="group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    style={{ background: 'var(--lp-card)', borderColor: accentBorder(f.accentVar) }}
                  >
                    <div className="absolute inset-x-0 top-0 h-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: accent(f.accentVar) }} />
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: accentBg(f.accentVar) }}>
                      <f.icon className="h-6 w-6" style={{ color: accent(f.accentVar) }} aria-hidden="true" />
                    </div>
                    <h3 className="mb-1.5 font-semibold" style={{ color: 'var(--lp-text)' }}>{f.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-text-muted)' }}>{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Analisis ── */}
          <section id="analisis" className="scroll-mt-20 py-20 sm:py-28"
            style={{ background: 'var(--lp-bg-alt)' }}>
            <div className="max-w-5xl mx-auto px-4">
              <div className="mb-14 flex flex-col items-center gap-3 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold"
                  style={{ borderColor: accentBorder('--lp-orange'), background: accentBg('--lp-orange'), color: 'var(--lp-text)' }}>
                  <Upload className="h-3.5 w-3.5" style={{ color: accent('--lp-orange') }} aria-hidden="true" />
                  Fitur Unggulan
                </span>
                <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--lp-text)' }}>
                  Upload resume lamamu,{' '}
                  <span className="text-gradient-ai">analisis mendalam</span>, lalu edit langsung
                </h2>
                <p className="max-w-lg text-sm leading-relaxed" style={{ color: 'var(--lp-text-muted)' }}>
                  Sudah punya resume tapi tidak tahu seberapa baik performanya? Upload sekali — AI
                  menganalisis, mengekstrak data, dan kamu langsung bisa edit di builder tanpa mulai dari nol.
                </p>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {analyzeSteps.map((s) => (
                  <div key={s.step}
                    className="relative rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    style={{ background: 'var(--lp-step-bg)', borderColor: accentBorder(s.accentVar) }}>
                    <span className="absolute -top-3 left-4 inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-[10px] font-bold"
                      style={{ background: 'var(--lp-step-num-bg)', borderColor: accentBorder(s.accentVar), color: accent(s.accentVar) }}>
                      {s.step}
                    </span>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: accentBg(s.accentVar) }}>
                      <s.icon className="h-5 w-5" style={{ color: accent(s.accentVar) }} aria-hidden="true" />
                    </div>
                    <h3 className="mb-1.5 text-sm font-semibold" style={{ color: 'var(--lp-text)' }}>{s.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--lp-text-muted)' }}>{s.description}</p>
                  </div>
                ))}
              </div>

              {/* What you get */}
              <div className="mt-12 rounded-2xl border p-6 sm:p-8"
                style={{ borderColor: accentBorder('--lp-teal'), background: 'var(--lp-bg-section)' }}>
                <h3 className="mb-5 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--lp-text-muted)' }}>
                  Apa yang kamu dapatkan dari analisis
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: 'Skor ATS 0–100',     desc: 'Angka jelas seberapa resume kamu dikenali sistem rekruter.' },
                    { label: 'Skor 6 Bagian',       desc: 'Kontak, ringkasan, pengalaman, pendidikan, skills, dan format.' },
                    { label: 'Keyword Ditemukan',   desc: 'Kata kunci relevan yang sudah ada di resumemu.' },
                    { label: 'Keyword Kurang',      desc: 'Keyword penting yang disarankan untuk ditambahkan.' },
                    { label: '≥5 Rekomendasi',      desc: 'Saran perbaikan spesifik dan actionable dari AI.' },
                    { label: 'Generate ke Builder', desc: 'Data diekstrak otomatis — buka langsung di editor.' },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{ background: accentBg('--lp-teal') }}>
                        <Check className="h-3 w-3" style={{ color: accent('--lp-teal') }} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--lp-text)' }}>{label}</p>
                        <p className="text-xs" style={{ color: 'var(--lp-text-muted)' }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <Button size="lg" className="gap-2 rounded-xl font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, var(--lp-teal), var(--lp-mint))', color: 'var(--lp-text)', border: 'none' }}
                    asChild>
                    <Link href="/register">
                      Coba Analisis Gratis
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <p className="text-xs" style={{ color: 'var(--lp-text-muted)' }}>
                    Tidak perlu kartu kredit &middot; Langsung bisa digunakan
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Pricing ── */}
          <section id="harga" className="scroll-mt-20 py-20 sm:py-24"
            style={{ background: 'var(--lp-bg-section)' }}>
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: 'var(--lp-text)' }}>
                Pilih plan kamu
              </h2>
              <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
                {plans.map((plan) => (
                  <div key={plan.name}
                    className="relative flex flex-col overflow-hidden rounded-2xl border shadow-sm"
                    style={{
                      background: 'var(--lp-card)',
                      borderColor: plan.highlight ? 'var(--lp-teal)' : 'var(--lp-card-border)',
                      boxShadow: plan.highlight ? '0 8px 32px color-mix(in srgb, var(--lp-teal) 20%, transparent)' : undefined,
                    }}
                  >
                    {plan.highlight && (
                      <div className="absolute inset-x-0 top-0 h-1"
                        style={{ background: 'linear-gradient(90deg, var(--lp-teal), var(--lp-mint))' }} />
                    )}
                    {plan.highlight && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-0.5 text-xs font-bold shadow-md"
                        style={{ background: 'linear-gradient(90deg, var(--lp-teal), var(--lp-mint))', color: 'var(--lp-text)' }}>
                        <Zap className="h-3 w-3" aria-hidden="true" />
                        Paling Populer
                      </span>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-xl font-bold" style={{ color: 'var(--lp-text)' }}>{plan.name}</p>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold" style={{ color: 'var(--lp-text)' }}>{plan.price}</span>
                        {plan.period && <span className="text-sm" style={{ color: 'var(--lp-text-muted)' }}>{plan.period}</span>}
                      </div>
                      <ul className="mt-5 flex-1 space-y-2.5">
                        {plan.perks.map((perk) => (
                          <li key={perk} className="flex items-center gap-2 text-sm" style={{ color: 'var(--lp-text-muted)' }}>
                            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full"
                              style={{ background: accentBg('--lp-teal') }}>
                              <Check className="h-3 w-3" style={{ color: accent('--lp-teal') }} aria-hidden="true" />
                            </span>
                            {perk}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        <Button className="w-full rounded-xl font-semibold"
                          style={plan.highlight
                            ? { background: 'linear-gradient(135deg, var(--lp-teal), var(--lp-mint))', color: 'var(--lp-text)', border: 'none' }
                            : { borderColor: 'var(--lp-teal)', color: 'var(--lp-teal)', background: 'transparent' }
                          }
                          variant={plan.highlight ? 'default' : 'outline'}
                          asChild>
                          <Link href={plan.href}>{plan.cta}</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Final CTA ── */}
          <section className="px-4 py-20 sm:py-24" style={{ background: 'var(--lp-bg-alt)' }}>
            <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border p-10 text-center"
              style={{
                borderColor: accentBorder('--lp-teal'),
                background: 'linear-gradient(135deg, var(--lp-bg-section), var(--lp-bg-alt))',
              }}>
              <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl"
                style={{ background: accentBg('--lp-teal') }} />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full blur-2xl"
                style={{ background: accentBg('--lp-mint') }} />
              <div className="relative space-y-4">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--lp-text)' }}>
                  Siap mendapatkan pekerjaan impianmu?
                </h2>
                <p className="mx-auto max-w-md text-sm" style={{ color: 'var(--lp-text-muted)' }}>
                  Bergabung sekarang dan buat resume profesional pertamamu dalam hitungan menit —
                  atau upload resume lamamu dan langsung lihat hasilnya.
                </p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button size="lg" className="gap-2 rounded-xl font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, var(--lp-teal), var(--lp-mint))', color: 'var(--lp-text)', border: 'none' }}
                    asChild>
                    <Link href="/register">
                      Mulai Gratis Sekarang
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-xl font-semibold"
                    style={{ borderColor: 'var(--lp-teal)', color: 'var(--lp-teal)', background: 'transparent' }}
                    asChild>
                    <Link href="/login">Sudah punya akun</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* ── Contact ── */}
        <section id="kontak" className="scroll-mt-20 border-t py-20 sm:py-24"
          style={{ borderColor: 'var(--lp-bg-green)', background: 'var(--lp-bg-section)' }}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="mb-12 flex flex-col items-center gap-3 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold"
                style={{ borderColor: accentBorder('--lp-teal'), background: accentBg('--lp-teal'), color: 'var(--lp-text)' }}>
                <Mail className="h-3.5 w-3.5" style={{ color: accent('--lp-teal') }} aria-hidden="true" />
                Hubungi Developer
              </span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--lp-text)' }}>
                Ada pertanyaan atau kolaborasi?
              </h2>
              <p className="max-w-md text-sm leading-relaxed" style={{ color: 'var(--lp-text-muted)' }}>
                Reach out langsung — siap membalas pesan terkait AlresumeBuilder, project web, atau kerja sama lainnya.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* Developer card */}
              <div className="relative overflow-hidden rounded-2xl border p-6 shadow-sm"
                style={{ background: 'var(--lp-card)', borderColor: accentBorder('--lp-teal') }}>
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-2xl"
                  style={{ background: accentBg('--lp-mint') }} />
                <div className="relative flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-md"
                      style={{ border: `2px solid var(--lp-teal)` }}>
                      <Image src="/images/alif.png" alt="Muhammad Alif Sya'bani"
                        fill className="object-cover object-top" sizes="64px" />
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--lp-text)' }}>Muhammad Alif Sya&apos;bani</p>
                      <p className="text-sm" style={{ color: 'var(--lp-text-muted)' }}>Public Speaker &amp; Web Developer</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-text-muted)' }}>
                    Programmer, Graphic Designer, dan Public Speaker dengan pengalaman dalam
                    pengembangan aplikasi berbasis web, desain visual, dan komunikasi publik.
                    Minat pada UI/UX, AI, dan transformasi digital.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['PHP', 'Next.js', 'React.js', 'Tailwind CSS', 'UI/UX', 'AI'].map((t) => (
                      <span key={t} className="rounded-md border px-2 py-0.5 text-xs font-medium"
                        style={{ borderColor: accentBorder('--lp-teal'), background: accentBg('--lp-teal'), color: 'var(--lp-text)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--lp-text-muted)' }}>
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Jenggawah, Jember, Jawa Timur
                  </div>
                </div>
              </div>

              {/* Contact links */}
              <div className="flex flex-col gap-4">
                {[
                  { href: 'mailto:syahbanialif79@gmail.com', label: 'Email',     value: 'syahbanialif79@gmail.com', icon: Mail,          accentVar: '--lp-rose',   target: undefined },
                  { href: 'https://wa.me/6283112088830',    label: 'WhatsApp',  value: '+62 831 1208 8830',         icon: MessageCircle, accentVar: '--lp-teal',   target: '_blank' as const },
                  { href: 'https://syahbanialif.vercel.app', label: 'Portfolio', value: 'syahbanialif.vercel.app',  icon: Globe,         accentVar: '--lp-orange', target: '_blank' as const },
                ].map(({ href, label, value, icon: Icon, accentVar, target }) => (
                  <a key={label} href={href} target={target}
                    rel={target ? 'noopener noreferrer' : undefined}
                    className="group flex items-center gap-4 rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ background: 'var(--lp-card)', borderColor: accentBorder(accentVar) }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = `var(${accentVar})`)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = accentBorder(accentVar))}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: accentBg(accentVar) }}>
                      <Icon className="h-5 w-5" style={{ color: accent(accentVar) }} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--lp-text-muted)' }}>{label}</p>
                      <p className="truncate text-sm font-bold" style={{ color: 'var(--lp-text)' }}>{value}</p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                      style={{ color: `color-mix(in srgb, var(${accentVar}) 60%, transparent)` }} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t" style={{ borderColor: 'var(--lp-bg-green)', background: 'var(--lp-card)' }}>
          <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm"
                    style={{ background: 'linear-gradient(135deg, var(--lp-teal), var(--lp-mint))' }}>
                    <FileText className="h-3.5 w-3.5" style={{ color: 'var(--lp-text)' }} aria-hidden="true" />
                  </span>
                  <span className="font-bold" style={{ color: 'var(--lp-text)' }}>
                    Alresume<span className="text-gradient-ai">Builder</span>
                  </span>
                </div>
                <p className="max-w-xs text-sm leading-relaxed" style={{ color: 'var(--lp-text-muted)' }}>
                  Platform AI untuk membuat resume profesional — analisis ATS mendalam,
                  ekstrak data otomatis, dan export PDF siap kirim.
                </p>
                <div className="flex gap-3">
                  {[
                    { href: 'mailto:syahbanialif79@gmail.com', icon: Mail,          label: 'Email developer',     accentVar: '--lp-rose' },
                    { href: 'https://wa.me/6283112088830',     icon: MessageCircle, label: 'WhatsApp developer',  accentVar: '--lp-teal' },
                    { href: 'https://syahbanialif.vercel.app', icon: Globe,         label: 'Portfolio developer', accentVar: '--lp-orange' },
                  ].map(({ href, icon: Icon, label, accentVar }) => (
                    <a key={label} href={href} aria-label={label}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:-translate-y-0.5"
                      style={{ borderColor: 'var(--lp-bg-green)', color: 'var(--lp-text-muted)' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `var(${accentVar})`; el.style.color = `var(${accentVar})`; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--lp-bg-green)'; el.style.color = 'var(--lp-text-muted)'; }}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--lp-text-muted)' }}>Navigasi</p>
                <ul className="space-y-2 text-sm">
                  {[
                    { label: 'Beranda', href: '#beranda' }, { label: 'Fitur', href: '#fitur' },
                    { label: 'Analisis', href: '#analisis' }, { label: 'Harga', href: '#harga' },
                    { label: 'Kontak', href: '#kontak' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <a href={href} style={{ color: 'var(--lp-text-muted)' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--lp-teal)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--lp-text-muted)')}
                      >{label}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--lp-text-muted)' }}>Akun</p>
                <ul className="space-y-2 text-sm">
                  {[
                    { label: 'Daftar', href: '/register' }, { label: 'Masuk', href: '/login' },
                    { label: 'Dashboard', href: '/dashboard' }, { label: 'Analisis Resume', href: '/resumes/analyze' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} style={{ color: 'var(--lp-text-muted)' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--lp-teal)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--lp-text-muted)')}
                      >{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t" style={{ borderColor: 'var(--lp-bg-green)' }}>
            <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col items-center justify-between gap-2 text-xs sm:flex-row"
              style={{ color: 'var(--lp-text-muted)' }}>
              <p>© 2025 AlresumeBuilder. All rights reserved.</p>
              <p>
                Built by{' '}
                <a href="https://syahbanialif.vercel.app" target="_blank" rel="noopener noreferrer"
                  className="font-semibold transition-colors"
                  style={{ color: 'var(--lp-teal)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--lp-text)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--lp-teal)')}
                >
                  Muhammad Alif Sya&apos;bani
                </a>
              </p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
