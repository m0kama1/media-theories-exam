import { useEffect } from 'react'
import { useApp } from '../state'
import { getQuestion } from '../lib/bank'
import { grade } from '../lib/exam'
import { navigate } from '../lib/router'
import { Icon } from '../components/Icon'
import { OptionButton } from '../components/OptionButton'
import { DifficultyChip, ProgressBar, Stat } from '../components/ui'
import { optionState } from './Review'

export function StudyRun() {
  const { study, answer, goTo, discard } = useApp()

  useEffect(() => {
    if (!study) return
    const onKey = (e: KeyboardEvent) => {
      const qid = study.questionIds[study.current]
      if (e.key === 'ArrowLeft' || e.key === 'Enter') { if (study.revealed.includes(qid)) goTo('study', study.current + 1) }
      else if (e.key === 'ArrowRight') goTo('study', study.current - 1)
      else if (['1', '2', '3', '4'].includes(e.key)) answer('study', qid, Number(e.key) - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [study, answer, goTo])

  if (!study) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <p className="mb-4 text-slate-600 dark:text-slate-400">لا توجد جلسة مذاكرة مفتوحة.</p>
        <a href="#/study" className="btn-primary">ابدأ جلسة مذاكرة</a>
      </div>
    )
  }

  const total = study.questionIds.length
  const qid = study.questionIds[study.current]
  const q = getQuestion(qid)
  const chosen = study.answers[qid]
  const revealed = study.revealed.includes(qid)
  const g = grade(study.revealed, study.answers)
  const finished = study.revealed.length === total
  const isLast = study.current === total - 1

  return (
    <div className="animate-fade-in">
      <div className="card mb-5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><Icon name="book" className="h-4 w-4" /> وضع المذاكرة</div>
            <div className="truncate text-sm font-bold">{study.title}</div>
          </div>
          <div className="flex gap-3 text-sm tabular-nums">
            <span className="text-emerald-600 dark:text-emerald-400">✓ {g.correct}</span>
            <span className="text-rose-600 dark:text-rose-400">✗ {g.wrong}</span>
          </div>
          <button className="btn-ghost !px-3 text-sm" onClick={() => { discard('study'); navigate('/study') }}>إنهاء الجلسة</button>
        </div>
        <ProgressBar value={study.revealed.length} max={total} className="mt-3" />
      </div>

      <article key={qid} className="card mx-auto max-w-3xl p-5 animate-fade-in sm:p-7">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="chip bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">السؤال {study.current + 1} من {total}</span>
          <DifficultyChip d={q.difficulty} />
          {revealed && <span className="chip bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">{q.theory}</span>}
        </div>
        <h2 className="mb-6 text-lg font-semibold leading-loose sm:text-xl" data-testid="question-text">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map((o, i) => (
            <OptionButton key={i} index={i} text={o} state={revealed ? optionState(i, q.correctIndex, chosen) : 'idle'} disabled={revealed} onClick={() => answer('study', qid, i)} />
          ))}
        </div>

        {revealed && (
          <div className={`mt-5 rounded-xl p-4 text-sm leading-relaxed animate-fade-in ${chosen === q.correctIndex ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100' : 'bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-100'}`} role="status">
            <p className="mb-1 font-bold">{chosen === q.correctIndex ? 'إجابة صحيحة!' : `إجابة خاطئة — الصحيحة: ${q.options[q.correctIndex]}`}</p>
            <p><b>التفسير: </b>{q.explanation}</p>
          </div>
        )}

        <div className="mt-7 flex items-center gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
          <button className="btn-ghost" disabled={study.current === 0} onClick={() => goTo('study', study.current - 1)}><Icon name="prev" className="h-4 w-4" /> السابق</button>
          <div className="ms-auto">
            {isLast && revealed ? (
              <button className="btn-primary" onClick={() => navigate('/weak')}>عرض نقاط الضعف</button>
            ) : (
              <button className="btn-primary" onClick={() => goTo('study', study.current + 1)} disabled={isLast}>
                {revealed ? 'السؤال التالي' : 'تخطَّ'} <Icon name="next" className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </article>

      {finished && (
        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-3 gap-3">
          <Stat label="أنهيت الجلسة" value={`${g.percent}%`} tone="brand" />
          <Stat label="صحيحة" value={g.correct} tone="emerald" />
          <Stat label="خاطئة" value={g.wrong} tone="rose" />
        </div>
      )}
    </div>
  )
}
