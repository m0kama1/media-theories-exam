import type { ReactNode } from 'react'
import { useApp } from '../state'
import { navigate } from '../lib/router'
import { Icon } from './Icon'

const links = [
  { to: '/', label: 'الرئيسية', icon: 'home' },
  { to: '/setup', label: 'امتحان مخصص', icon: 'sliders' },
  { to: '/study', label: 'وضع المذاكرة', icon: 'book' },
  { to: '/weak', label: 'نقاط الضعف', icon: 'target' },
]

export function Layout({ path, children, focus = false }: { path: string; children: ReactNode; focus?: boolean }) {
  const { theme, toggleTheme } = useApp()
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg print:hidden dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 text-start" aria-label="الصفحة الرئيسية">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-md shadow-brand-500/30">
              <Icon name="chart" className="h-5 w-5" />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-bold">نظريات التأثير الإعلامي</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">منصة الامتحانات التفاعلية</span>
            </span>
          </button>
          {!focus && (
            <nav className="ms-auto hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
              {links.map((l) => (
                <a
                  key={l.to}
                  href={'#' + l.to}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    path === l.to
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon name={l.icon} className="h-4 w-4" />
                  {l.label}
                </a>
              ))}
            </nav>
          )}
          <button
            onClick={toggleTheme}
            className={`btn-ghost h-10 w-10 !p-0 ${focus ? 'ms-auto' : 'ms-auto md:ms-2'}`}
            aria-label={theme === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
            title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
        </div>
      </header>
      <main className={`mx-auto max-w-6xl px-4 py-6 ${focus ? '' : 'pb-28 md:pb-10'}`}>{children}</main>
      {!focus && (
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white/95 backdrop-blur print:hidden md:hidden dark:border-slate-800 dark:bg-slate-950/95" aria-label="التنقل السفلي">
          {links.map((l) => (
            <a key={l.to} href={'#' + l.to} className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${path === l.to ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500'}`}>
              <Icon name={l.icon} className="h-5 w-5" />
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}
