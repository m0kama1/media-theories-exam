import { useState } from 'react'
import { useApp } from '../state'
import { bank, difficulties, namedTheories, questions, sections } from '../lib/bank'
import { answeredCount, formatDuration, grade } from '../lib/exam'
import { navigate } from '../lib/router'
import { Icon } from '../components/Icon'
import { DifficultyChip, Modal, ProgressBar } from '../components/ui'
import { StartExamModal } from '../components/StartExamModal'

const sectionTone = ['from-brand-500 to-violet-600', 'from-sky-500 to-cyan-600', 'from-amber-500 to-orange-600']

export function Home() {
  const { exam, history, clearHistory } = useApp()
  const [startOpen, setStartOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="space-y-8 animate-fade-in">
      <StartExamModal open={startOpen} onClose={() => setStartOpen(false)} />

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800 p-6 text-white shadow-xl shadow-brand-700/20 sm:p-10">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative">
          <span className="chip bg-white/15 text-white ring-1 ring-white/20">تمهيدي ماجستير الصحافة الإخبارية</span>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{bank.title}</h1>
          <p className="mt-2 max-w-2xl text-brand-100">المرجع: {bank.source}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['سؤال', questions.length],
              ['أقسام', sections.length],
              ['نظرية', namedTheories.length],
              ['اختيارات لكل سؤال', 4],
            ].map(([l, v]) => (
              <div key={l as string} className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur">
                <div className="text-2xl font-bold tabular-nums">{v}</div>
                <div className="text-xs text-brand-100">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button onClick={() => setStartOpen(true)} className="btn bg-white text-brand-700 shadow-lg hover:bg-brand-50">
              <Icon name="play" className="h-4 w-4" /> {history.length ? 'ابدأ امتحانًا جديدًا' : 'ابدأ الامتحان'}
            </button>
            <span className="text-sm text-brand-100">ترتيب الأسئلة والاختيارات يتغير في كل محاولة.</span>
          </div>
        </div>
      </section>

      {exam && (
        <section className="card flex flex-col gap-3 border-brand-200 p-5 dark:border-brand-500/30">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300"><Icon name="history" className="h-4 w-4" /> امتحان غير مكتمل</div>
          <ProgressBar value={answeredCount(exam)} max={exam.questionIds.length} />
          <div className="text-sm text-slate-500 dark:text-slate-400">أُجيب عن {answeredCount(exam)} من {exam.questionIds.length} · الوقت المنقضي {formatDuration(exam.elapsedSeconds)}</div>
          <button className="btn-primary self-start" onClick={() => navigate('/exam')}>متابعة الامتحان</button>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold">محتوى الامتحان</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {sections.map((s, i) => {
            const qs = questions.filter((q) => q.section === s)
            const th = new Set(qs.map((q) => q.theory)).size
            return (
              <div key={s} className="card flex flex-col p-5">
                <div className={`mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-lg font-bold text-white ${sectionTone[i % 3]}`}>{i + 1}</div>
                <h3 className="font-bold leading-snug">{s}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{qs.length} سؤالًا{th > 1 ? ` · ${th} نظرية` : ''}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {difficulties.map((d) => {
                    const n = qs.filter((q) => q.difficulty === d).length
                    return n ? <span key={d} className="flex items-center gap-1 text-xs"><DifficultyChip d={d} /><span className="tabular-nums text-slate-500">{n}</span></span> : null
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">سجل المحاولات</h2>
          {history.length > 0 && <button className="text-sm text-slate-500 hover:text-rose-600 hover:underline" onClick={() => setConfirmClear(true)}>مسح السجل</button>}
        </div>
        {history.length === 0 ? (
          <div className="card p-8 text-center text-slate-500 dark:text-slate-400">لا توجد محاولات بعد. ابدأ أول امتحان لتظهر نتائجك هنا.</div>
        ) : (
          <div className="card divide-y divide-slate-100 dark:divide-slate-800">
            {history.slice(0, 10).map((a, idx) => {
              const g = grade(a.questionIds, a.answers)
              return (
                <a key={a.id} href={`#/results?id=${a.id}`} className="flex items-center gap-4 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-bold tabular-nums ${g.percent >= 60 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'}`}>{Math.round(g.percent)}%</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">المحاولة {history.length - idx}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(a.submittedAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })} · {g.correct}/{g.total} · {formatDuration(a.durationSeconds)}
                    </div>
                  </div>
                  <Icon name="next" className="h-4 w-4 text-slate-400" />
                </a>
              )
            })}
          </div>
        )}
      </section>

      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="مسح سجل المحاولات؟">
        <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">ستُحذف جميع النتائج المحفوظة على هذا الجهاز. لا يمكن التراجع.</p>
        <div className="flex gap-2">
          <button className="btn-danger flex-1" onClick={() => { clearHistory(); setConfirmClear(false) }}>مسح</button>
          <button className="btn-ghost" onClick={() => setConfirmClear(false)}>إلغاء</button>
        </div>
      </Modal>
    </div>
  )
}
