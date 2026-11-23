import { useState } from 'react'
import { useApp } from '../state'
import { OPTION_LETTERS } from '../lib/bank'
import { formatDuration, grade, gradeLabel, orderOf, type QStatus } from '../lib/exam'
import { Icon } from '../components/Icon'
import { OptionButton, optionState } from '../components/OptionButton'
import { BarList, DifficultyChip, Donut, Legend, Stat } from '../components/ui'
import { StartExamModal } from '../components/StartExamModal'
import { Credits, FACULTY, Logo } from '../components/Brand'

const toneCls = {
  great: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  good: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  ok: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  low: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

type Filter = 'all' | 'wrong' | 'skipped' | 'correct'
const FILTERS: { k: Filter; label: string }[] = [
  { k: 'all', label: 'كل الأسئلة' },
  { k: 'wrong', label: 'الخاطئة' },
  { k: 'skipped', label: 'المتروكة' },
  { k: 'correct', label: 'الصحيحة' },
]

const statusBadge: Record<QStatus, [string, string]> = {
  correct: ['إجابة صحيحة', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'],
  wrong: ['إجابة خاطئة', 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'],
  skipped: ['لم تُجب', 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'],
}

export function Results({ id }: { id: string | null }) {
  const { history } = useApp()
  const [startOpen, setStartOpen] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const attempt = history.find((a) => a.id === id) ?? (id ? undefined : history[0])
  if (!attempt) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <p className="mb-4 text-slate-600 dark:text-slate-400">لم يتم العثور على هذه النتيجة.</p>
        <a href="#/" className="btn-primary">العودة إلى الرئيسية</a>
      </div>
    )
  }
  const g = grade(attempt.questionIds, attempt.answers)
  const lbl = gradeLabel(g.percent)
  const items = g.items
    .map((it, n) => ({ ...it, n: n + 1 }))
    .filter((it) => filter === 'all' || it.status === filter)
  const counts: Record<Filter, number> = { all: g.total, wrong: g.wrong, skipped: g.skipped, correct: g.correct }
  const half = Math.ceil(g.byTheory.length / 2)

  return (
    <div className="space-y-6 animate-fade-in">
      <StartExamModal open={startOpen} onClose={() => setStartOpen(false)} />

      <div className="hidden space-y-3 border-b border-slate-300 pb-4 print:block">
        <div className="flex items-center gap-3">
          <Logo className="h-16 w-16" />
          <div>
            <div className="text-sm font-semibold">{FACULTY}</div>
            <h1 className="text-xl font-bold">تقرير نتيجة – امتحان نظريات التأثير الإعلامي</h1>
            <p className="text-sm">{new Date(attempt.submittedAt).toLocaleString('ar-EG')}</p>
          </div>
        </div>
        <Credits tone="print" />
      </div>

      <section className="card overflow-hidden">
        <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr]">
          <div className="mx-auto"><Donut correct={g.correct} wrong={g.wrong} skipped={g.skipped} /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`chip ${toneCls[lbl.tone]} !text-sm`}>{lbl.label}</span>
              {attempt.timedOut && <span className="chip bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">سُلِّم تلقائيًا بانتهاء الوقت</span>}
            </div>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">نتيجة الامتحان</h1>
            <div className="mt-2 text-5xl font-bold tabular-nums text-brand-600 dark:text-brand-300" data-testid="score">
              {g.correct}<span className="text-2xl text-slate-400"> / {g.total}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {new Date(attempt.submittedAt).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })} · المدة {formatDuration(attempt.durationSeconds)}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 print:hidden">
              <button className="btn-primary" onClick={() => document.getElementById('review')?.scrollIntoView({ behavior: 'smooth' })}><Icon name="book" className="h-4 w-4" /> مراجعة الإجابات والملاحظات</button>
              <button className="btn-ghost" onClick={() => setStartOpen(true)}><Icon name="refresh" className="h-4 w-4" /> امتحان جديد</button>
              <button className="btn-ghost" onClick={() => window.print()}><Icon name="printer" className="h-4 w-4" /> طباعة / PDF</button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="الدرجة" value={`${g.correct}/${g.total}`} tone="brand" />
        <Stat label="النسبة المئوية" value={`${g.percent}%`} tone="brand" />
        <Stat label="صحيحة" value={g.correct} tone="emerald" />
        <Stat label="خاطئة" value={g.wrong} tone="rose" />
        <Stat label="متروكة" value={g.skipped} tone="amber" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">الأداء حسب محور الأسئلة</h2><Legend /></div>
          <BarList rows={g.bySection} />
        </div>
        <div className="card space-y-6 p-5">
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">الأداء حسب فصول الكتاب</h2><Legend /></div>
            <BarList rows={g.byChapter} />
          </div>
          <div>
            <h2 className="mb-4 font-bold">الأداء حسب المستوى المعرفي</h2>
            <BarList rows={g.byDifficulty} />
          </div>
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">الأداء حسب النظرية أو الموضوع</h2><Legend /></div>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">مرتبة من الأضعف إلى الأقوى.</p>
        <div className="grid gap-x-10 gap-y-3 md:grid-cols-2"><BarList rows={g.byTheory.slice(0, half)} /><BarList rows={g.byTheory.slice(half)} /></div>
      </section>

      {/* Review */}
      <section id="review" className="scroll-mt-20">
        <h2 className="mb-1 text-xl font-bold">مراجعة الإجابات</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">لكل سؤال: إجابتك، والإجابة الصحيحة، وملاحظة تعليمية مختصرة.</p>
        <div className="mb-5 flex flex-wrap gap-2 print:hidden" role="tablist">
          {FILTERS.map((f) => (
            <button key={f.k} role="tab" aria-selected={filter === f.k} onClick={() => setFilter(f.k)}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${filter === f.k ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'}`}>
              {f.label} <span className="tabular-nums opacity-75">({counts[f.k]})</span>
            </button>
          ))}
        </div>
        {items.length === 0 && <div className="card p-8 text-center text-slate-500">لا توجد أسئلة في هذا التصنيف.</div>}
        <div className="space-y-5">
          {items.map(({ question: q, chosen, status, n }) => {
            const order = orderOf(attempt.optionOrder, q)
            const letter = (orig: number) => OPTION_LETTERS[order.indexOf(orig)]
            return (
              <article key={q.id} className="card p-5 sm:p-6" data-testid="review-item">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="chip bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">سؤال {n}</span>
                  <span className={`chip ${statusBadge[status][1]}`}>{statusBadge[status][0]}</span>
                  <DifficultyChip d={q.difficulty} />
                  <span className="chip bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">{q.theory}</span>
                </div>
                <h3 className="mb-4 font-semibold leading-loose">{q.question}</h3>
                <div className="grid gap-2">
                  {order.map((orig, i) => <OptionButton key={orig} index={i} text={q.options[orig]} state={optionState(orig, q.correctIndex, chosen)} disabled />)}
                </div>

                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div className={`rounded-xl p-3 ${status === 'correct' ? 'bg-emerald-50 dark:bg-emerald-500/10' : status === 'wrong' ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-amber-50 dark:bg-amber-500/10'}`}>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">إجابتك</dt>
                    <dd className="font-semibold" data-testid="my-answer">{chosen !== undefined ? `(${letter(chosen)}) ${q.options[chosen]}` : 'لم تُجب عن هذا السؤال'}</dd>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
                    <dt className="text-xs text-slate-500 dark:text-slate-400">الإجابة الصحيحة</dt>
                    <dd className="font-semibold text-emerald-800 dark:text-emerald-300" data-testid="correct-answer">({letter(q.correctIndex)}) {q.options[q.correctIndex]}</dd>
                  </div>
                </dl>

                <div className="mt-3 flex gap-3 rounded-xl bg-brand-50 p-4 text-sm leading-relaxed text-brand-950 dark:bg-brand-500/10 dark:text-brand-50" data-testid="note">
                  <Icon name="bulb" className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <p><b>ملاحظة تعليمية: </b>{q.explanation}</p>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400" data-testid="ref"><b>المرجع في الكتاب:</b> {q.ref}</p>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
