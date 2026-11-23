import { useEffect, type ReactNode } from 'react'
import { pct } from '../lib/exam'

export function ProgressBar({ value, max, className = '' }: { value: number; max: number; className?: string }) {
  const p = max ? (value / max) * 100 : 0
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className="h-full rounded-full bg-gradient-to-l from-brand-500 to-violet-500 transition-[width] duration-500" style={{ width: `${p}%` }} />
    </div>
  )
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="card w-full max-w-md p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-3 text-lg font-bold">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function Stat({ label, value, tone = 'slate', sub }: { label: string; value: ReactNode; tone?: 'slate' | 'emerald' | 'rose' | 'amber' | 'brand'; sub?: ReactNode }) {
  const tones = {
    slate: 'text-slate-900 dark:text-white',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    rose: 'text-rose-600 dark:text-rose-400',
    amber: 'text-amber-600 dark:text-amber-400',
    brand: 'text-brand-600 dark:text-brand-300',
  }
  return (
    <div className="card p-4">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${tones[tone]}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
    </div>
  )
}

const DIFF_TONE: Record<string, string> = {
  فهم: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  تطبيق: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  تحليل: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}
export function DifficultyChip({ d }: { d: string }) {
  return <span className={`chip ${DIFF_TONE[d] ?? 'bg-slate-100 text-slate-700'}`}>{d}</span>
}

/** Donut of correct / wrong / skipped. */
export function Donut({ correct, wrong, skipped, size = 168 }: { correct: number; wrong: number; skipped: number; size?: number }) {
  const total = correct + wrong + skipped || 1
  const r = 60
  const c = 2 * Math.PI * r
  const segs = [
    { v: correct, cls: 'stroke-emerald-500' },
    { v: wrong, cls: 'stroke-rose-500' },
    { v: skipped, cls: 'stroke-slate-300 dark:stroke-slate-600' },
  ]
  let offset = 0
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label={`صحيحة ${correct}، خاطئة ${wrong}، متروكة ${skipped}`}>
      <g transform="rotate(-90 80 80)">
        <circle cx="80" cy="80" r={r} fill="none" strokeWidth="18" className="stroke-slate-100 dark:stroke-slate-800" />
        {segs.map((s, i) => {
          const len = (s.v / total) * c
          const el = (
            <circle key={i} cx="80" cy="80" r={r} fill="none" strokeWidth="18" className={s.cls} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />
          )
          offset += len
          return el
        })}
      </g>
      <text x="80" y="76" textAnchor="middle" className="fill-slate-900 text-[26px] font-bold dark:fill-white">{pct(correct, total)}%</text>
      <text x="80" y="100" textAnchor="middle" className="fill-slate-500 text-[11px]">نسبة النجاح</text>
    </svg>
  )
}

/** Horizontal stacked bars per bucket. */
export function BarList({ rows }: { rows: { key: string; correct: number; wrong: number; skipped: number; total: number; percent: number }[] }) {
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium">{r.key}</span>
            <span className="shrink-0 tabular-nums text-slate-500 dark:text-slate-400">
              {r.correct}/{r.total} · <b className={r.percent >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{r.percent}%</b>
            </span>
          </div>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="bg-emerald-500" style={{ width: `${(r.correct / r.total) * 100}%` }} />
            <div className="bg-rose-500" style={{ width: `${(r.wrong / r.total) * 100}%` }} />
            <div className="bg-slate-300 dark:bg-slate-600" style={{ width: `${(r.skipped / r.total) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function Legend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
      <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> صحيحة</span>
      <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-rose-500" /> خاطئة</span>
      <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" /> متروكة</span>
    </div>
  )
}

export function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-sm font-medium">{label}</span>
      <span className="relative">
        <input id={id} type="checkbox" role="switch" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="block h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 dark:bg-slate-700" />
        <span className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:-translate-x-5" />
      </span>
    </label>
  )
}

export function PageTitle({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-600 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
