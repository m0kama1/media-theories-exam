import { useState } from 'react'
import { useApp } from '../state'
import { OPTION_LETTERS } from '../lib/bank'
import { formatDuration, grade, gradeLabel } from '../lib/exam'
import { navigate } from '../lib/router'
import { Icon } from '../components/Icon'
import { BarList, Donut, Legend, Stat } from '../components/ui'
import { StartExamModal, type StartRequest } from '../components/StartExamModal'

const toneCls = {
  great: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  good: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  ok: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  low: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

export function Results({ id }: { id: string | null }) {
  const { history } = useApp()
  const [req, setReq] = useState<StartRequest | null>(null)
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
  const wrongIds = g.items.filter((i) => i.status !== 'correct').map((i) => i.question.id)
  const theoryRows = g.byTheory

  return (
    <div className="space-y-6 animate-fade-in">
      <StartExamModal req={req} onClose={() => setReq(null)} />

      {/* Print header */}
      <div className="hidden print:block">
        <h1 className="text-xl font-bold">تقرير نتيجة – امتحان نظريات التأثير الإعلامي</h1>
        <p className="text-sm">{attempt.title} · {new Date(attempt.submittedAt).toLocaleString('ar-EG')}</p>
      </div>

      <section className="card overflow-hidden">
        <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr]">
          <div className="mx-auto"><Donut correct={g.correct} wrong={g.wrong} skipped={g.skipped} /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`chip ${toneCls[lbl.tone]} !text-sm`}>{lbl.label}</span>
              {attempt.timedOut && <span className="chip bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">سُلِّم تلقائيًا بانتهاء الوقت</span>}
            </div>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{attempt.title}</h1>
            <div className="mt-2 text-5xl font-bold tabular-nums text-brand-600 dark:text-brand-300" data-testid="score">
              {g.correct}<span className="text-2xl text-slate-400"> / {g.total}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {new Date(attempt.submittedAt).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })} · المدة {formatDuration(attempt.durationSeconds)}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 print:hidden">
              <button className="btn-primary" onClick={() => navigate(`/review?id=${attempt.id}`)}><Icon name="book" className="h-4 w-4" /> مراجعة كل الأسئلة</button>
              <button className="btn-ghost" disabled={!wrongIds.length} onClick={() => navigate(`/review?id=${attempt.id}&filter=wrong`)}><Icon name="x" className="h-4 w-4" /> مراجعة الأخطاء فقط</button>
              <button className="btn-ghost" onClick={() => setReq({ title: attempt.title.startsWith('إعادة: ') ? attempt.title : `إعادة: ${attempt.title}`, questionIds: attempt.questionIds })}><Icon name="refresh" className="h-4 w-4" /> إعادة الامتحان</button>
              <button className="btn-ghost" disabled={!wrongIds.length} onClick={() => setReq({ title: `اختبار الأخطاء (${wrongIds.length})`, questionIds: wrongIds })}><Icon name="target" className="h-4 w-4" /> إعادة اختبار الأخطاء</button>
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">الأداء حسب الفصل</h2><Legend /></div>
          <BarList rows={g.bySection} />
        </div>
        <div className="card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">الأداء حسب مستوى الصعوبة</h2><Legend /></div>
          <BarList rows={g.byDifficulty} />
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">الأداء حسب النظرية</h2><Legend /></div>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">مرتبة من الأضعف إلى الأقوى.</p>
        <div className="grid gap-x-10 gap-y-3 md:grid-cols-2"><BarList rows={theoryRows.slice(0, Math.ceil(theoryRows.length / 2))} /><BarList rows={theoryRows.slice(Math.ceil(theoryRows.length / 2))} /></div>
      </section>

      {/* Printable answer sheet */}
      <section className="hidden print:block">
        <h2 className="mb-2 mt-4 font-bold">ورقة الإجابات</h2>
        <table className="w-full border-collapse text-xs">
          <thead><tr className="border-b"><th className="p-1 text-start">#</th><th className="p-1 text-start">النظرية</th><th className="p-1">إجابتك</th><th className="p-1">الصحيحة</th><th className="p-1">النتيجة</th></tr></thead>
          <tbody>
            {g.items.map((it, i) => (
              <tr key={it.question.id} className="border-b border-slate-200">
                <td className="p-1">{i + 1}</td>
                <td className="p-1">{it.question.theory}</td>
                <td className="p-1 text-center">{it.chosen !== undefined ? OPTION_LETTERS[it.chosen] : '—'}</td>
                <td className="p-1 text-center">{OPTION_LETTERS[it.question.correctIndex]}</td>
                <td className="p-1 text-center">{it.status === 'correct' ? '✓' : it.status === 'wrong' ? '✗' : 'متروك'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
