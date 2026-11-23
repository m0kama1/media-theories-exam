import { useState } from 'react'
import { useApp } from '../state'
import { grade, type QStatus } from '../lib/exam'
import { navigate } from '../lib/router'
import { Icon } from '../components/Icon'
import { OptionButton, type OptionState } from '../components/OptionButton'
import { DifficultyChip, PageTitle } from '../components/ui'

type Filter = 'all' | 'wrong' | 'skipped' | 'correct'
const FILTERS: { k: Filter; label: string }[] = [
  { k: 'all', label: 'الكل' },
  { k: 'wrong', label: 'الخاطئة والمتروكة' },
  { k: 'skipped', label: 'المتروكة' },
  { k: 'correct', label: 'الصحيحة' },
]

export function optionState(i: number, correct: number, chosen: number | undefined): OptionState {
  if (i === correct) return chosen === i ? 'correct' : 'missed'
  if (i === chosen) return 'wrong'
  return 'dim'
}

const statusBadge: Record<QStatus, [string, string]> = {
  correct: ['صحيحة', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'],
  wrong: ['خاطئة', 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'],
  skipped: ['متروكة', 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'],
}

export function Review({ id, initial }: { id: string | null; initial: string | null }) {
  const { history } = useApp()
  const [filter, setFilter] = useState<Filter>(initial === 'wrong' ? 'wrong' : 'all')
  const attempt = history.find((a) => a.id === id)
  if (!attempt) return <div className="card p-8 text-center">لم يتم العثور على المحاولة. <a className="text-brand-600" href="#/">الرئيسية</a></div>
  const g = grade(attempt.questionIds, attempt.answers)
  const items = g.items
    .map((it, n) => ({ ...it, n: n + 1 }))
    .filter((it) => filter === 'all' || (filter === 'wrong' ? it.status !== 'correct' : it.status === filter))

  return (
    <div className="animate-fade-in">
      <PageTitle
        title="مراجعة الإجابات"
        subtitle={attempt.title}
        actions={<button className="btn-ghost print:hidden" onClick={() => navigate(`/results?id=${attempt.id}`)}><Icon name="chart" className="h-4 w-4" /> النتيجة</button>}
      />
      <div className="mb-5 flex flex-wrap gap-2 print:hidden" role="tablist">
        {FILTERS.map((f) => {
          const count = f.k === 'all' ? g.total : f.k === 'wrong' ? g.wrong + g.skipped : f.k === 'skipped' ? g.skipped : g.correct
          return (
            <button key={f.k} role="tab" aria-selected={filter === f.k} onClick={() => setFilter(f.k)}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${filter === f.k ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'}`}>
              {f.label} <span className="tabular-nums opacity-75">({count})</span>
            </button>
          )
        })}
      </div>
      {items.length === 0 && <div className="card p-8 text-center text-slate-500">لا توجد أسئلة في هذا التصنيف.</div>}
      <div className="space-y-5">
        {items.map(({ question: q, chosen, status, n }) => (
          <article key={q.id} className="card p-5 sm:p-6" data-testid="review-item">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="chip bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">سؤال {n}</span>
              <span className={`chip ${statusBadge[status][1]}`}>{statusBadge[status][0]}</span>
              <DifficultyChip d={q.difficulty} />
              <span className="chip bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">{q.theory}</span>
            </div>
            <h2 className="mb-4 font-semibold leading-loose">{q.question}</h2>
            <div className="grid gap-2">
              {q.options.map((o, i) => <OptionButton key={i} index={i} text={o} state={optionState(i, q.correctIndex, chosen)} disabled />)}
            </div>
            <div className="mt-4 flex gap-3 rounded-xl bg-brand-50 p-4 text-sm leading-relaxed text-brand-900 dark:bg-brand-500/10 dark:text-brand-100">
              <Icon name="bulb" className="mt-0.5 h-5 w-5 shrink-0" />
              <p><b>التفسير: </b>{q.explanation}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
