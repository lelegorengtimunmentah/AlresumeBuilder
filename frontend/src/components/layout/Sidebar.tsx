'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  LogOut,
  ChevronDown,
  Plus,
  BarChart3,
  Sun,
  Moon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { CreditBadge } from '@/components/layout/CreditBadge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthContext } from '@/contexts/AuthContext';
import { useResumes } from '@/hooks/useResumes';
import { useTheme } from '@/hooks/useTheme';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const { resumes, isLoading: resumesLoading } = useResumes();
  const { theme, toggleTheme } = useTheme();
  const [resumeDropdownOpen, setResumeDropdownOpen] = useState(true);

  const isResumeActive =
    pathname.startsWith('/resumes/') &&
    !pathname.startsWith('/resumes/analyze') &&
    !pathname.startsWith('/resumes/new');

  const navItemClass = (active: boolean) =>
    cn(
      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full',
      active
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    );

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r bg-card">
      {/* Brand */}
      <div className="flex h-14 items-center px-4 gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
          <FileText className="h-3.5 w-3.5 text-primary-foreground" aria-hidden="true" />
        </span>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-foreground hover:opacity-80 transition-opacity"
        >
          AlresumeBuilder
        </Link>
      </div>

      <Separator />

      <nav className="flex flex-col gap-0.5 p-2 flex-1" aria-label="Main navigation">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={navItemClass(pathname === '/dashboard')}
          aria-current={pathname === '/dashboard' ? 'page' : undefined}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
          Dashboard
        </Link>

        {/* Resume Saya dropdown */}
        <div>
          <button
            type="button"
            onClick={() => setResumeDropdownOpen((prev) => !prev)}
            className={navItemClass(isResumeActive)}
            aria-expanded={resumeDropdownOpen}
          >
            <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 text-left">Resume Saya</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 transition-transform duration-200',
                resumeDropdownOpen && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </button>

          {resumeDropdownOpen && (
            <div className="ml-3 mt-0.5 border-l pl-3 space-y-0.5">
              {resumesLoading ? (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">Memuat...</p>
              ) : resumes.length === 0 ? (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">Belum ada resume</p>
              ) : (
                resumes.map((resume) => (
                  <Link
                    key={resume.id}
                    href={`/resumes/${resume.id}`}
                    className={cn(
                      'flex items-center rounded-md px-2 py-1.5 text-sm transition-colors truncate',
                      pathname === `/resumes/${resume.id}`
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                    title={resume.title || 'Untitled Resume'}
                  >
                    {resume.title || 'Untitled Resume'}
                  </Link>
                ))
              )}
              <Link
                href="/resumes/new"
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-primary hover:bg-primary/10 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Resume Baru
              </Link>
            </div>
          )}
        </div>

        {/* Analisis Resume */}
        <Link
          href="/resumes/analyze"
          className={navItemClass(pathname === '/resumes/analyze')}
          aria-current={pathname === '/resumes/analyze' ? 'page' : undefined}
        >
          <BarChart3 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Analisis Resume
        </Link>
      </nav>

      <Separator />

      {/* Footer */}
      <div className="flex flex-col gap-1 p-2">
        {user && (
          <div className="px-1 py-1">
            <CreditBadge plan={user.plan} credits={user.resume_credits} />
          </div>
        )}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2.5 text-muted-foreground hover:text-foreground"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Keluar
        </Button>
      </div>
    </aside>
  );
}

export default Sidebar;
