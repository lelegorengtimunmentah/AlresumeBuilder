'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ArrowRight, Sparkles, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const badgeRef    = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const paraRef     = useRef<HTMLParagraphElement>(null);
  const btnsRef     = useRef<HTMLDivElement>(null);
  const statsRef    = useRef<HTMLDivElement>(null);
  const illustRef   = useRef<HTMLDivElement>(null);
  const blob1Ref    = useRef<HTMLDivElement>(null);
  const blob2Ref    = useRef<HTMLDivElement>(null);

  // ── Entrance timeline ──────────────────────────────────────────────────────
  useEffect(() => {
    const badge    = badgeRef.current;
    const headline = headlineRef.current;
    const para     = paraRef.current;
    const btns     = btnsRef.current;
    const stats    = statsRef.current;
    const illust   = illustRef.current;
    if (!badge || !headline || !para || !btns) return;

    const original = headline.innerHTML;
    headline.innerHTML = headline.innerText
      .split(' ')
      .map((w) => `<span style="display:inline-block;overflow:hidden"><span class="hw" style="display:inline-block">${w}</span></span>`)
      .join(' ');
    const words = headline.querySelectorAll<HTMLSpanElement>('.hw');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(badge,  { y: 16, opacity: 0, scale: 0.92 }, { y: 0, opacity: 1, scale: 1, duration: 0.5 });
    tl.fromTo(words,  { y: '105%', opacity: 0, rotateX: -30 }, { y: '0%', opacity: 1, rotateX: 0, duration: 0.6, stagger: 0.055, ease: 'back.out(1.2)' }, '-=0.3');
    tl.fromTo(para,   { y: 14, opacity: 0, filter: 'blur(5px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.55 }, '-=0.3');
    tl.fromTo(Array.from(btns.querySelectorAll<HTMLElement>('a,button')), { y: 18, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.09, ease: 'back.out(1.5)' }, '-=0.35');

    if (stats) {
      tl.fromTo(stats, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, '-=0.25');
      stats.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const target = parseInt(el.dataset.count ?? '0', 10);
        const obj = { val: 0 };
        tl.to(obj, { val: target, duration: 1.3, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString('id-ID') + (el.dataset.suffix ?? ''); } }, '<');
      });
    }
    if (illust) {
      tl.fromTo(illust, { x: 60, opacity: 0, scale: 0.95 }, { x: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.1)' }, 0.2);
    }

    return () => { if (headline) headline.innerHTML = original; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mouse parallax blobs ───────────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    const b1 = blob1Ref.current;
    const b2 = blob2Ref.current;
    if (!section || !b1 || !b2) return;
    let tick = false;
    const onMove = (e: MouseEvent) => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        const { left, top, width, height } = section.getBoundingClientRect();
        const rx = ((e.clientX - left) / width  - 0.5) * 2;
        const ry = ((e.clientY - top)  / height - 0.5) * 2;
        gsap.to(b1, { x: rx * 18, y: ry * 12, duration: 1.4, ease: 'power1.out' });
        gsap.to(b2, { x: rx * -12, y: ry * -16, duration: 1.8, ease: 'power1.out' });
        tick = false;
      });
    };
    section.addEventListener('mousemove', onMove);
    return () => section.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="beranda"
      className="relative overflow-hidden"
      style={{ background: 'var(--lp-hero-bg)', minHeight: '100vh' }}
    >
      {/* BG decoration */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div ref={blob1Ref} className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full will-change-transform"
          style={{ background: 'radial-gradient(circle, rgba(109,175,167,0.25) 0%, transparent 70%)' }} />
        <div ref={blob2Ref} className="absolute -bottom-24 right-0 h-80 w-80 rounded-full will-change-transform"
          style={{ background: 'radial-gradient(circle, rgba(184,216,199,0.35) 0%, transparent 70%)' }} />
        <div className="absolute right-[18%] top-[12%] h-5 w-5 rounded-full opacity-60" style={{ background: 'var(--lp-yellow)' }} />
        <div className="absolute left-[10%] bottom-[20%] h-3.5 w-3.5 rounded-full opacity-50" style={{ background: 'var(--lp-orange)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      {/* Two-column grid */}
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 pt-24 pb-10 sm:pt-28 sm:pb-14 lg:grid-cols-2 lg:gap-12">

        {/* Left: text */}
        <div className="relative z-20 flex flex-col items-start gap-5 text-left">

          <span ref={badgeRef}
            className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold shadow-sm"
            style={{ borderColor: 'var(--lp-teal)', background: 'color-mix(in srgb, var(--lp-teal) 15%, transparent)', color: 'var(--lp-text)' }}
          >
            <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--lp-teal)' }} aria-hidden="true" />
            Ditenagai Kecerdasan Buatan
          </span>

          <h1
            ref={headlineRef}
            style={{ perspective: '600px', color: 'var(--lp-text)' }}
            className="max-w-lg text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl"
          >
            Buat Resume Profesional dengan{' '}
            <span className="text-gradient-ai">Bantuan AI</span>
          </h1>

          <p ref={paraRef} className="max-w-md text-base leading-relaxed" style={{ color: 'var(--lp-text-muted)' }}>
            Upload resume lamamu atau mulai dari nol — AI menganalisis skor ATS
            secara mendalam, mengekstrak data otomatis, dan membantu kamu tampil
            menonjol di hadapan rekruter.
          </p>

          <div ref={btnsRef} className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="gap-2 rounded-xl font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--lp-teal), var(--lp-mint))', color: 'var(--lp-text)', border: 'none' }}
              asChild>
              <Link href="/register">
                Mulai Gratis <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
              style={{ borderColor: 'var(--lp-teal)', color: 'var(--lp-teal)', background: 'transparent' }}
              asChild>
              <Link href="/resumes/analyze">
                <Upload className="h-4 w-4" aria-hidden="true" />
                Analisis Resume
              </Link>
            </Button>
          </div>

          <div ref={statsRef} className="mt-2 flex flex-wrap gap-x-8 gap-y-3 border-t pt-5"
            style={{ borderColor: 'var(--lp-mint)' }}>
            {[
              { count: 5000, suffix: '+',   label: 'Resume dibuat' },
              { count: 98,   suffix: '%',   label: 'Kepuasan pengguna' },
              { count: 3,    suffix: ' AI', label: 'Provider AI aktif' },
            ].map(({ count, suffix, label }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span data-count={count} data-suffix={suffix}
                  className="text-2xl font-extrabold tabular-nums"
                  style={{ color: 'var(--lp-teal)' }}>
                  0{suffix}
                </span>
                <span className="text-xs" style={{ color: 'var(--lp-text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: illustration */}
        <div ref={illustRef} className="relative z-10 flex items-center justify-center lg:justify-end">
          <div className="absolute inset-6 rounded-3xl shadow-xl"
            style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--lp-mint) 35%, transparent), color-mix(in srgb, var(--lp-yellow) 20%, transparent))' }} />
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full border-4 opacity-50"
            style={{ borderColor: 'var(--lp-yellow)' }} />
          <div className="absolute -bottom-3 -left-3 h-14 w-14 rounded-full border-4 opacity-40"
            style={{ borderColor: 'var(--lp-pink)' }} />
          <div className="animate-illus-float relative z-10 w-full max-w-sm drop-shadow-xl lg:max-w-md">
            <Image
              src="/images/illustrations/illus-3.svg"
              alt="Ilustrasi membuat resume profesional"
              width={520} height={520} priority
              className="w-full h-auto select-none"
            />
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div aria-hidden="true" className="absolute bottom-0 inset-x-0 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" className="w-full h-10 sm:h-14 block"
          style={{ fill: 'var(--lp-wave-fill)' }}>
          <path d="M0,32 C360,56 1080,0 1440,32 L1440,56 L0,56 Z" />
        </svg>
      </div>
    </section>
  );
}
