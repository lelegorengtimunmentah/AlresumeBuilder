'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { Menu, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/landing/ThemeToggle';

const NAV_LINKS = [
  { label: 'Beranda',  href: '#beranda'  },
  { label: 'Fitur',    href: '#fitur'    },
  { label: 'Analisis', href: '#analisis' },
  { label: 'Harga',    href: '#harga'    },
] as const;

function LogoMark() {
  return (
    <span className="relative flex h-9 w-9 items-center justify-center rounded-xl shadow-md"
      style={{ background: 'linear-gradient(135deg, var(--lp-teal), var(--lp-mint))', boxShadow: '0 4px 12px color-mix(in srgb, var(--lp-teal) 30%, transparent)' }}>
      <FileText className="h-4 w-4 drop-shadow-sm" style={{ color: 'var(--lp-text)' }} aria-hidden="true" />
    </span>
  );
}

function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const STRENGTH = 0.42;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * STRENGTH, y: (e.clientY - r.top - r.height / 2) * STRENGTH, duration: 0.2, ease: 'power2.out' });
    };
    const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);
  return <div ref={ref} style={{ display: 'inline-flex' }}>{children}</div>;
}

export function FloatingNavbar() {
  const pillRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    gsap.fromTo(pill,
      { y: -72, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: 'back.out(1.5)', delay: 0.1 },
    );
  }, []);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4" aria-label="Navigasi utama">
        <div ref={pillRef} className="pointer-events-auto w-full max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl"
            style={{
              background: 'var(--lp-nav-bg)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid var(--lp-nav-border)',
              boxShadow: 'var(--lp-nav-shadow)',
            }}
          >
            {/* shimmer */}
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, var(--lp-teal), transparent)', opacity: 0.5 }} />

            <div className="relative flex h-14 items-center justify-between gap-4 px-4 sm:px-5">

              <Link href="/" className="flex shrink-0 items-center gap-2.5 font-bold tracking-tight">
                <LogoMark />
                <span className="text-base font-bold" style={{ color: 'var(--lp-text)' }}>
                  Alresume<span className="text-gradient-ai">Builder</span>
                </span>
              </Link>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-0.5">
                {NAV_LINKS.map(({ label, href }) => (
                  <a key={label} href={href}
                    className="group relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-200"
                    style={{ color: 'var(--lp-text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--lp-text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--lp-text-muted)')}
                  >
                    <span aria-hidden="true"
                      className="absolute inset-0 scale-90 rounded-lg opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
                      style={{ background: 'color-mix(in srgb, var(--lp-teal) 12%, transparent)' }} />
                    <span aria-hidden="true"
                      className="absolute inset-x-3.5 bottom-1 h-px origin-center scale-x-0 rounded-full transition-transform duration-200 group-hover:scale-x-100"
                      style={{ background: 'var(--lp-teal)' }} />
                    <span className="relative">{label}</span>
                  </a>
                ))}
              </nav>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <ThemeToggle />
                <MagneticButton>
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg text-sm font-medium"
                    style={{ color: 'var(--lp-text-muted)' }} asChild>
                    <Link href="/login">Masuk</Link>
                  </Button>
                </MagneticButton>
                <MagneticButton>
                  <Button size="sm" className="h-8 rounded-xl font-semibold shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
                    style={{ background: 'linear-gradient(135deg, var(--lp-teal), var(--lp-mint))', color: 'var(--lp-text)', border: 'none' }}
                    asChild>
                    <Link href="/register">Mulai Gratis</Link>
                  </Button>
                </MagneticButton>
              </div>

              {/* Mobile */}
              <div className="flex md:hidden items-center gap-2">
                <ThemeToggle />
                <MagneticButton>
                  <button type="button"
                    aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
                    aria-expanded={mobileOpen}
                    aria-controls="mobile-nav"
                    onClick={() => setMobileOpen(v => !v)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                    style={{
                      border: '1px solid color-mix(in srgb, var(--lp-teal) 25%, transparent)',
                      background: 'color-mix(in srgb, var(--lp-teal) 10%, transparent)',
                      color: 'var(--lp-text-muted)',
                    }}
                  >
                    {mobileOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </MagneticButton>
              </div>
            </div>

            {/* Mobile dropdown */}
            {mobileOpen && (
              <div id="mobile-nav" className="px-4 pb-4 pt-1 md:hidden"
                style={{ borderTop: '1px solid color-mix(in srgb, var(--lp-teal) 20%, transparent)' }}>
                <nav className="flex flex-col gap-0.5">
                  {NAV_LINKS.map(({ label, href }) => (
                    <a key={label} href={href} onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                      style={{ color: 'var(--lp-text-muted)' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'color-mix(in srgb, var(--lp-teal) 10%, transparent)'; el.style.color = 'var(--lp-text)'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = ''; el.style.color = 'var(--lp-text-muted)'; }}
                    >
                      {label}
                    </a>
                  ))}
                </nav>
                <div className="mt-3 flex flex-col gap-2 pt-3"
                  style={{ borderTop: '1px solid color-mix(in srgb, var(--lp-teal) 20%, transparent)' }}>
                  <Button variant="outline" size="sm" className="w-full rounded-xl"
                    style={{ borderColor: 'var(--lp-teal)', color: 'var(--lp-teal)' }} asChild>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>Masuk</Link>
                  </Button>
                  <Button size="sm" className="w-full rounded-xl font-semibold"
                    style={{ background: 'linear-gradient(135deg, var(--lp-teal), var(--lp-mint))', color: 'var(--lp-text)', border: 'none' }}
                    asChild>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>Mulai Gratis</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="h-0" aria-hidden="true" />
    </>
  );
}
