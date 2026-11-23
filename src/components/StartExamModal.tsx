import { useState } from 'react'
import { Modal, Toggle } from './ui'
import { useApp } from '../state'
import { createExam } from '../lib/exam'
import { navigate } from '../lib/router'

/** Confirms options (optional timer) before starting a new randomized 100-question exam. */
export function StartExamModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { start, exam } = useApp()
  const [timer, setTimer] = useState(false)
  const [minutes, setMinutes] = useState(100)
  if (!open) return null
  const go = () => {
    start(createExam({ timerEnabled: timer, timeLimitMinutes: minutes }))
    onClose()
    navigate('/exam')
  }
  return (
    <Modal open onClose={onClose} title="بدء امتحان جديد">
      <ul className="mb-5 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
        <li>• 100 سؤال، سؤال واحد في كل شاشة.</li>
        <li>• ترتيب الأسئلة والاختيارات عشوائي ويختلف في كل محاولة.</li>
        <li>• بعد اختيار الإجابة يظهر التصحيح وملاحظة قصيرة فورًا، ولا يمكن تغيير الإجابة.</li>
        <li>• يُفعَّل زر «السؤال التالي» بعد الإجابة، والنتيجة الكاملة بعد التسليم.</li>
      </ul>
      <div className="space-y-4">
        <Toggle id="m-timer" label="تفعيل المؤقت" checked={timer} onChange={setTimer} />
        {timer && (
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600 dark:text-slate-400">المدة بالدقائق (يُسلَّم الامتحان تلقائيًا عند انتهائها)</span>
            <input type="number" min={1} max={300} value={minutes} onChange={(e) => setMinutes(Math.max(1, Math.min(300, Number(e.target.value) || 1)))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
          </label>
        )}
        {exam && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">لديك امتحان غير مكتمل؛ بدء امتحان جديد سيستبدله.</p>}
      </div>
      <div className="mt-6 flex gap-2">
        <button className="btn-primary flex-1" onClick={go}>ابدأ الآن</button>
        <button className="btn-ghost" onClick={onClose}>إلغاء</button>
      </div>
    </Modal>
  )
}
