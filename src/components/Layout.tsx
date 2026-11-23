import type { ReactNode } from 'react'
import { useApp } from '../state'
import { navigate } from '../lib/router'
import { Icon } from './Icon'
import { AUTHOR, FACULTY, Logo, SUPERVISOR } from './Brand'

export function Layout({ children, focus = false }: { children: ReactNode; focus?: boolean }) {
  const { theme, toggleTheme } = useApp()
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg print:hidden dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <button onClick={() => !focus && navigate('/')} className="flex items-center gap-2.5 text-start" aria-label="الصفحة الرئيسية">
            <Logo className="h-10 w-10" />
            <span className="leading-tight">
              <span className="block text-sm font-bold">نظريات التأثير الإعلامي</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">{FACULTY}</span>
            </span>
          </button>
          <button
            onClick={toggleTheme}
            className="btn-ghost ms-auto h-10 w-10 !p-0"
            aria-label={theme === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
            title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 pb-12">{children}</main>
      {!focus && (
        <footer className="border-t border-slate-200/70 py-6 text-center text-xs text-slate-500 print:hidden dark:border-slate-800 dark:text-slate-400">
          {FACULTY} · إشراف {SUPERVISOR.name} · إعداد الباحث {AUTHOR}
        </footer>
      )}
    </div>
  )
}
