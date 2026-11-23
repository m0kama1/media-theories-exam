import { useMemo, useState } from 'react'
import { useApp } from '../state'
import { difficulties, sections, theories } from '../lib/bank'
import { createSession, filterQuestions } from '../lib/exam'
import { navigate } from '../lib/router'
import { DifficultyChip, PageTitle, Toggle } from '../components/ui'
import { Icon } from '../components/Icon'

function toggleIn(list: string[], v: string) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v]
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-xl border-2 px-3.5 py-2 text-sm font-medium transition ${
        active
          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-200'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

export function Setup({ mode = 'exam' as 'exam' | 'study' }) {
  const { start } = useApp()
  const [sel, setSel] = useState<string[]>([])
  const [diff, setDiff] = useState<string[]>([])
  const [th, setTh] = useState<string[]>([])
  const [shuffle, setShuffle] = useState(false)
  const [timer, setTimer] = useState(false)
  const [minutes, setMinutes] = useState(60)

  const matches = useMemo(() => filterQuestions({ sections: sel, difficulties: diff, theories: th }), [sel, diff, th])

  const begin = () => {
    const parts = [sel.length ? `${sel.length} قسم` : '', diff.length ? diff.join('، ') : '', th.length ? `${th.length} نظرية` : '']
      .filter(Boolean)
      .join(' · ')
    const title = (mode === 'exam' ? 'امتحان مخصص' : 'مذاكرة مخصصة') + (parts ? ` (${parts})` : '') + ` – ${matches.length} سؤالًا`
    start(createSession({ mode, title, questionIds: matches.map((q) => q.id), shuffle, timerEnabled: mode === 'exam' && timer, timeLimitMinutes: minutes }))
    navigate(mode === 'exam' ? '/exam' : '/study/run')
  }

  return (
    <div className="animate-fade-in">
      <PageTitle
        title={mode === 'exam' ? 'إعداد امتحان مخصص' : 'وضع المذاكرة'}
        subtitle={mode === 'exam' ? 'اختر الفصول ومستويات الصعوبة، أو اترك أي فئة فارغة لتشمل الكل.' : 'أجب عن السؤال لتظهر الإجابة الصحيحة والتفسير مباشرة، ثم انتقل إلى التالي.'}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 font-bold">الفصل / القسم</h2>
            <div className="flex flex-wrap gap-2">
              {sections.map((s) => <Pill key={s} active={sel.includes(s)} onClick={() => setSel(toggleIn(sel, s))}>{s}</Pill>)}
            </div>
          </section>
          <section className="card p-5">
            <h2 className="mb-3 font-bold">مستوى الصعوبة</h2>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((d) => <Pill key={d} active={diff.includes(d)} onClick={() => setDiff(toggleIn(diff, d))}><DifficultyChip d={d} /></Pill>)}
            </div>
          </section>
          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">النظرية <span className="text-sm font-normal text-slate-500">(اختياري)</span></h2>
              {th.length > 0 && <button className="text-sm text-brand-600 hover:underline dark:text-brand-300" onClick={() => setTh([])}>مسح</button>}
            </div>
            <div className="flex flex-wrap gap-2">
              {theories.map((t) => <Pill key={t} active={th.includes(t)} onClick={() => setTh(toggleIn(th, t))}>{t}</Pill>)}
            </div>
          </section>
        </div>
        <aside className="card h-fit space-y-5 p-5 lg:sticky lg:top-24">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">عدد الأسئلة المطابقة</div>
            <div className="text-4xl font-bold tabular-nums text-brand-600 dark:text-brand-300" data-testid="match-count">{matches.length}</div>
          </div>
          <Toggle id="shuffle" label="ترتيب عشوائي للأسئلة" checked={shuffle} onChange={setShuffle} />
          {mode === 'exam' && (
            <>
              <Toggle id="timer" label="تفعيل المؤقت" checked={timer} onChange={setTimer} />
              {timer && (
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600 dark:text-slate-400">المدة بالدقائق</span>
                  <input type="number" min={1} max={300} value={minutes} onChange={(e) => setMinutes(Math.max(1, Math.min(300, Number(e.target.value) || 1)))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
                </label>
              )}
            </>
          )}
          <button className="btn-primary w-full" disabled={!matches.length} onClick={begin}>
            <Icon name="play" className="h-4 w-4" /> {mode === 'exam' ? 'ابدأ الامتحان' : 'ابدأ المذاكرة'}
          </button>
        </aside>
      </div>
    </div>
  )
}
