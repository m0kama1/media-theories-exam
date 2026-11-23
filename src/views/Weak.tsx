import { useMemo, useState } from 'react'
import { useApp } from '../state'
import { INTEGRATION_THEORY } from '../lib/bank'
import { createSession, filterQuestions, pct } from '../lib/exam'
import { navigate } from '../lib/router'
import { Icon } from '../components/Icon'
import { Modal, PageTitle } from '../components/ui'

export function Weak() {
  const { theoryStats, start, clearAllData, history } = useApp()
  const [confirmClear, setConfirmClear] = useState(false)
  const rows = useMemo(
    () =>
      Object.entries(theoryStats)
        .map(([theory, s]) => ({ theory, ...s, rate: pct(s.wrong, s.attempts) }))
        .sort((a, b) => b.wrong - a.wrong || b.rate - a.rate),
    [theoryStats],
  )
  const weak = rows.filter((r) => r.wrong > 0)
  const top = weak.slice(0, 5).map((r) => r.theory)

  const studyTheories = (ts: string[], label: string) => {
    const qs = filterQuestions({ theories: ts })
    start(createSession({ mode: 'study', title: label, questionIds: qs.map((q) => q.id) }))
    navigate('/study/run')
  }

  return (
    <div className="animate-fade-in">
      <PageTitle
        title="النظريات الأكثر خطأً"
        subtitle="يُحدَّث تلقائيًا من إجاباتك في الامتحانات ووضع المذاكرة، ويُحفظ على هذا الجهاز."
        actions={
          weak.length > 0 && (
            <button className="btn-primary" onClick={() => studyTheories(top, `مراجعة أضعف ${top.length} نظريات`)}>
              <Icon name="target" className="h-4 w-4" /> ذاكر أضعف {top.length} نظريات
            </button>
          )
        }
      />
      {rows.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15"><Icon name="chart" className="h-7 w-7" /></div>
          <p className="text-slate-600 dark:text-slate-400">لا توجد بيانات بعد. أكمل امتحانًا أو جلسة مذاكرة لتظهر النظريات التي تحتاج إلى مراجعة.</p>
          <div className="mt-5 flex justify-center gap-2"><a className="btn-primary" href="#/study">وضع المذاكرة</a><a className="btn-ghost" href="#/setup">امتحان مخصص</a></div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="p-3 text-start font-semibold">النظرية</th>
                <th className="p-3 font-semibold">محاولات</th>
                <th className="p-3 font-semibold">أخطاء</th>
                <th className="hidden p-3 text-start font-semibold sm:table-cell">نسبة الخطأ</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((r) => (
                <tr key={r.theory}>
                  <td className="p-3 font-medium">{r.theory}{r.theory === INTEGRATION_THEORY && <span className="ms-1 text-xs text-slate-400">(أسئلة المقارنة)</span>}</td>
                  <td className="p-3 text-center tabular-nums">{r.attempts}</td>
                  <td className="p-3 text-center font-bold tabular-nums text-rose-600 dark:text-rose-400">{r.wrong}</td>
                  <td className="hidden p-3 sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full bg-rose-500" style={{ width: `${r.rate}%` }} /></div>
                      <span className="tabular-nums text-slate-500">{r.rate}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-end">
                    <button className="rounded-lg px-2.5 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10" onClick={() => studyTheories([r.theory], `مذاكرة: ${r.theory}`)}>ذاكر</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(rows.length > 0 || history.length > 0) && (
        <div className="mt-6 text-center">
          <button className="text-sm text-slate-500 hover:text-rose-600 hover:underline" onClick={() => setConfirmClear(true)}>مسح جميع البيانات المحفوظة على هذا الجهاز</button>
        </div>
      )}
      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="مسح جميع البيانات؟">
        <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">سيُحذف سجل المحاولات وإحصاءات النظريات وأي امتحان أو جلسة مذاكرة مفتوحة. لا يمكن التراجع.</p>
        <div className="flex gap-2">
          <button className="btn-danger flex-1" onClick={() => { clearAllData(); setConfirmClear(false) }}>مسح</button>
          <button className="btn-ghost" onClick={() => setConfirmClear(false)}>إلغاء</button>
        </div>
      </Modal>
    </div>
  )
}
