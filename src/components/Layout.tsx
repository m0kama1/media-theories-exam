import type { ReactNode } from 'react'
import { useApp } from '../state'
import { navigate } from '../lib/router'
import { Icon } from './Icon'

export function Layout({ children, focus = false }: { children: ReactNode; focus?: boolean }) {
  const { theme, toggleTheme } = useApp()
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg print:hidden dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <button onClick={() => !focus && navigate('/')} className="flex items-center gap-2.5 text-start" aria-label="الصفحة الرئيسية">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-md shadow-brand-500/30">
              <Icon name="chart" className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold">نظريات التأثير الإعلامي</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">منصة الامتحان التفاعلية</span>
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
    </div>
  )
}
