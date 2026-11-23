import { useState } from 'react'
import { useApp } from '../state'
import { bank, questions } from '../lib/bank'
import { answeredCount, formatDuration, grade } from '../lib/exam'
import { navigate } from '../lib/router'
import { Icon } from '../components/Icon'
import { Modal, ProgressBar } from '../components/ui'
import { StartExamModal } from '../components/StartExamModal'

export function Home() {
  const { exam, history, clearHistory } = useApp()
  const [startOpen, setStartOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-fade-in">
      <StartExamModal open={startOpen} onClose={() => setStartOpen(false)} />

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800 p-7 text-center text-white shadow-xl shadow-brand-700/20 sm:p-12">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative">
          <span className="chip bg-white/15 text-white ring-1 ring-white/20">تمهيدي ماجستير الصحافة الإخبارية</span>
          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">{bank.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-100">
            {questions.length} سؤال اختيار من متعدد · ترتيب عشوائي في كل محاولة · تصحيح فوري وملاحظة قصيرة بعد كل إجابة
          </p>
          <button
            onClick={() => (exam ? navigate('/exam') : setStartOpen(true))}
            className="btn mt-8 bg-white px-8 py-3.5 text-base text-brand-700 shadow-lg hover:bg-brand-50"
          >
            <Icon name="play" className="h-5 w-5" /> {exam ? 'متابعة الامتحان' : 'ابدأ الامتحان'}
          </button>
          {exam && (
            <div className="mx-auto mt-5 max-w-sm text-sm text-brand-100">
              <ProgressBar value={answeredCount(exam)} max={exam.questionIds.length} className="!bg-white/20" />
              <p className="mt-2">أُجيب عن {answeredCount(exam)} من {exam.questionIds.length} · {formatDuration(exam.elapsedSeconds)}</p>
              <button className="mt-1 underline underline-offset-4 hover:text-white" onClick={() => setStartOpen(true)}>أو ابدأ امتحانًا جديدًا</button>
            </div>
          )}
        </div>
      </section>

      {history.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">محاولاتك السابقة</h2>
            <button className="text-sm text-slate-500 hover:text-rose-600 hover:underline" onClick={() => setConfirmClear(true)}>مسح السجل</button>
          </div>
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
        </section>
      )}

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
