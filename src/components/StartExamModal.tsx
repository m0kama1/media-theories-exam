import { useState } from 'react'
import { Modal, Toggle } from './ui'
import { useApp } from '../state'
import { createSession } from '../lib/exam'
import { navigate } from '../lib/router'

export interface StartRequest {
  title: string
  questionIds: number[]
}

/** Confirms options (timer / shuffle) before starting a pre-defined exam. */
export function StartExamModal({ req, onClose }: { req: StartRequest | null; onClose: () => void }) {
  const { start, exam } = useApp()
  const [timer, setTimer] = useState(false)
  const [minutes, setMinutes] = useState(60)
  const [shuffle, setShuffle] = useState(false)
  if (!req) return null
  const go = () => {
    start(createSession({ mode: 'exam', title: req.title, questionIds: req.questionIds, shuffle, timerEnabled: timer, timeLimitMinutes: minutes }))
    onClose()
    navigate('/exam')
  }
  return (
    <Modal open onClose={onClose} title={req.title}>
      <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">{req.questionIds.length} سؤالًا · سؤال واحد في كل شاشة · لن تظهر الإجابات الصحيحة إلا بعد التسليم.</p>
      <div className="space-y-4">
        <Toggle id="m-shuffle" label="ترتيب عشوائي للأسئلة" checked={shuffle} onChange={setShuffle} />
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
