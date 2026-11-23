import { useEffect, useRef, useState } from 'react'
import { useApp } from '../state'
import { getQuestion } from '../lib/bank'
import { answeredCount, formatDuration } from '../lib/exam'
import { navigate } from '../lib/router'
import { Icon } from '../components/Icon'
import { OptionButton } from '../components/OptionButton'
import { DifficultyChip, Modal, ProgressBar } from '../components/ui'

export function Exam() {
  const { exam, answer, toggleFlag, goTo, tick, submitExam, discard } = useApp()
  const [confirm, setConfirm] = useState(false)
  const [quit, setQuit] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [showTimer, setShowTimer] = useState(true)
  const submitted = useRef(false)

  // Clock: counts elapsed time while the page is open.
  useEffect(() => {
    if (!exam) return
    const t = window.setInterval(() => tick(1), 1000)
    return () => window.clearInterval(t)
  }, [!!exam, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  const remaining = exam && exam.timerEnabled ? exam.timeLimitSeconds - exam.elapsedSeconds : null

  useEffect(() => {
    if (remaining !== null && remaining <= 0 && !submitted.current) {
      submitted.current = true
      const a = submitExam(true)
      if (a) navigate(`/results?id=${a.id}`)
    }
  }, [remaining, submitExam])

  // Keyboard shortcuts (RTL: ArrowLeft = next)
  useEffect(() => {
    if (!exam) return
    const onKey = (e: KeyboardEvent) => {
      if (confirm || quit || (e.target as HTMLElement)?.tagName === 'INPUT') return
      const qid = exam.questionIds[exam.current]
      if (e.key === 'ArrowLeft') goTo('exam', exam.current + 1)
      else if (e.key === 'ArrowRight') goTo('exam', exam.current - 1)
      else if (['1', '2', '3', '4'].includes(e.key)) answer('exam', qid, Number(e.key) - 1)
      else if (e.key.toLowerCase() === 'f') toggleFlag(qid)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [exam, confirm, quit, goTo, answer, toggleFlag])

  if (!exam) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <p className="mb-4 text-slate-600 dark:text-slate-400">لا يوجد امتحان جارٍ حاليًا.</p>
        <a href="#/" className="btn-primary">العودة إلى الرئيسية</a>
      </div>
    )
  }

  const total = exam.questionIds.length
  const qid = exam.questionIds[exam.current]
  const q = getQuestion(qid)
  const chosen = exam.answers[qid]
  const flagged = exam.flagged.includes(qid)
  const done = answeredCount(exam)
  const unanswered = total - done
  const isLast = exam.current === total - 1

  const doSubmit = () => {
    submitted.current = true
    const a = submitExam(false)
    setConfirm(false)
    if (a) navigate(`/results?id=${a.id}`)
  }

  const navigator = (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold">لوحة التنقل</h2>
        <span className="text-xs text-slate-500">{done}/{total}</span>
      </div>
      <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-6 xl:grid-cols-7">
        {exam.questionIds.map((id, i) => {
          const a = exam.answers[id] !== undefined
          const f = exam.flagged.includes(id)
          const cur = i === exam.current
          return (
            <button
              key={id}
              onClick={() => { goTo('exam', i); setNavOpen(false) }}
              aria-label={`السؤال ${i + 1}${a ? '، مُجاب' : '، غير مُجاب'}${f ? '، عليه علامة' : ''}`}
              aria-current={cur ? 'step' : undefined}
              className={`relative grid aspect-square place-items-center rounded-lg text-xs font-semibold tabular-nums transition ${
                a ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              } ${cur ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''}`}
            >
              {i + 1}
              {f && <span className="absolute -top-1 -left-1 h-3 w-3 rounded-full border-2 border-white bg-amber-400 dark:border-slate-900" />}
            </button>
          )
        })}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-brand-600" /> مُجاب</span>
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-slate-200 dark:bg-slate-700" /> متبقٍّ</span>
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded-full bg-amber-400" /> مُعلَّم</span>
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in">
      {/* Top status */}
      <div className="card mb-5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{exam.title}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">أُجيب <b className="tabular-nums" data-testid="answered">{done}</b> · متبقٍّ <b className="tabular-nums">{unanswered}</b> · مُعلَّم <b className="tabular-nums">{exam.flagged.length}</b></div>
          </div>
          {showTimer && (
            <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold tabular-nums ${remaining !== null && remaining < 60 ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800'}`} aria-live="polite">
              <Icon name="clock" className="h-4 w-4" />
              {remaining !== null ? formatDuration(remaining) : formatDuration(exam.elapsedSeconds)}
            </div>
          )}
          <button className="text-xs text-slate-500 underline-offset-2 hover:underline" onClick={() => setShowTimer((v) => !v)}>{showTimer ? 'إخفاء الوقت' : 'إظهار الوقت'}</button>
          <button className="btn-ghost !px-3 lg:hidden" onClick={() => setNavOpen(true)} aria-label="فتح لوحة التنقل"><Icon name="grid" className="h-4 w-4" /></button>
        </div>
        <ProgressBar value={done} max={total} className="mt-3" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* Question */}
        <article key={qid} className="card p-5 animate-fade-in sm:p-7">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">السؤال {exam.current + 1} من {total}</span>
            <DifficultyChip d={q.difficulty} />
            <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{q.section}</span>
          </div>
          <h2 className="mb-6 text-lg font-semibold leading-loose sm:text-xl" data-testid="question-text">{q.question}</h2>
          <div className="space-y-3" role="group" aria-label="الاختيارات">
            {q.options.map((o, i) => (
              <OptionButton key={i} index={i} text={o} state={chosen === i ? 'selected' : 'idle'} onClick={() => answer('exam', qid, i)} />
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
            <button className="btn-ghost" disabled={exam.current === 0} onClick={() => goTo('exam', exam.current - 1)}>
              <Icon name="prev" className="h-4 w-4" /> السابق
            </button>
            <button
              className={`btn ${flagged ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-400 dark:text-amber-950' : 'btn-ghost'}`}
              aria-pressed={flagged}
              onClick={() => toggleFlag(qid)}
            >
              <Icon name="flag" className="h-4 w-4" /> {flagged ? 'إزالة العلامة' : 'وضع علامة'}
            </button>
            <div className="ms-auto flex gap-2">
              {isLast ? (
                <button className="btn-primary" onClick={() => setConfirm(true)}>تسليم الامتحان</button>
              ) : (
                <button className="btn-primary" onClick={() => goTo('exam', exam.current + 1)}>
                  التالي <Icon name="next" className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </article>

        {/* Navigator (desktop) */}
        <aside className="hidden space-y-4 lg:block">
          <div className="card p-4">{navigator}</div>
          <button className="btn-primary w-full" onClick={() => setConfirm(true)}>تسليم الامتحان</button>
          <button className="btn-ghost w-full text-rose-600 dark:text-rose-400" onClick={() => setQuit(true)}><Icon name="trash" className="h-4 w-4" /> إلغاء الامتحان</button>
          <p className="text-center text-xs text-slate-400">اختصارات: ← → للتنقل، 1–4 للاختيار، F للعلامة</p>
        </aside>
      </div>

      <div className="mt-5 flex gap-2 lg:hidden">
        <button className="btn-primary flex-1" onClick={() => setConfirm(true)}>تسليم الامتحان</button>
        <button className="btn-ghost text-rose-600" onClick={() => setQuit(true)} aria-label="إلغاء الامتحان"><Icon name="trash" className="h-4 w-4" /></button>
      </div>

      {/* Mobile navigator drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={() => setNavOpen(false)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-3xl bg-white p-5 animate-fade-in dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
            {navigator}
          </div>
        </div>
      )}

      <Modal open={confirm} onClose={() => setConfirm(false)} title="تأكيد تسليم الامتحان">
        <div className="mb-5 space-y-2 text-sm">
          <p>أجبت عن <b>{done}</b> من <b>{total}</b> سؤالًا.</p>
          {unanswered > 0 && <p className="rounded-lg bg-amber-50 p-2.5 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">يوجد {unanswered} سؤالًا دون إجابة وستُحتسب متروكة.</p>}
          {exam.flagged.length > 0 && <p className="rounded-lg bg-sky-50 p-2.5 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300">لديك {exam.flagged.length} سؤالًا عليه علامة للمراجعة.</p>}
          <p className="text-slate-500">لا يمكن تعديل الإجابات بعد التسليم.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={doSubmit}>نعم، سلّم الامتحان</button>
          <button className="btn-ghost" onClick={() => setConfirm(false)}>متابعة الحل</button>
        </div>
      </Modal>

      <Modal open={quit} onClose={() => setQuit(false)} title="إلغاء الامتحان؟">
        <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">ستُحذف إجاباتك في هذا الامتحان ولن تُسجَّل نتيجة.</p>
        <div className="flex gap-2">
          <button className="btn-danger flex-1" onClick={() => { discard('exam'); setQuit(false); navigate('/') }}>إلغاء الامتحان</button>
          <button className="btn-ghost" onClick={() => setQuit(false)}>تراجع</button>
        </div>
      </Modal>
    </div>
  )
}
