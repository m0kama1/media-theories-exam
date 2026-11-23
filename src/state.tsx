import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AttemptRecord, Session, TheoryStat } from './types'
import { getQuestion } from './lib/bank'
import { toAttempt } from './lib/exam'
import {
  KEYS,
  loadHistory,
  loadSession,
  loadTheoryStats,
  pushHistory,
  recordTheoryAnswers,
  save,
} from './lib/storage'

type Kind = 'exam' | 'study'

interface Ctx {
  exam: Session | null
  study: Session | null
  history: AttemptRecord[]
  theoryStats: Record<string, TheoryStat>
  theme: 'light' | 'dark'
  toggleTheme: () => void
  start: (s: Session) => void
  answer: (kind: Kind, qid: number, option: number) => void
  toggleFlag: (qid: number) => void
  goTo: (kind: Kind, index: number) => void
  tick: (seconds?: number) => void
  submitExam: (timedOut?: boolean) => AttemptRecord | null
  discard: (kind: Kind) => void
  clearAllData: () => void
}

const AppCtx = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [exam, setExam] = useState<Session | null>(() => loadSession(KEYS.exam))
  const [study, setStudy] = useState<Session | null>(() => loadSession(KEYS.study))
  const [history, setHistory] = useState<AttemptRecord[]>(loadHistory)
  const [theoryStats, setTheoryStats] = useState<Record<string, TheoryStat>>(loadTheoryStats)
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )

  useEffect(() => save(KEYS.exam, exam), [exam])
  useEffect(() => save(KEYS.study, study), [study])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    save(KEYS.theme, theme)
  }, [theme])

  const setFor = (kind: Kind) => (kind === 'exam' ? setExam : setStudy)

  const start = useCallback((s: Session) => (s.mode === 'exam' ? setExam(s) : setStudy(s)), [])

  const answer = useCallback(
    (kind: Kind, qid: number, option: number) => {
      if (kind === 'study') {
        if (!study || study.revealed.includes(qid)) return
        const q = getQuestion(qid)
        setTheoryStats(recordTheoryAnswers([{ theory: q.theory, correct: option === q.correctIndex }]))
        setStudy({ ...study, answers: { ...study.answers, [qid]: option }, revealed: [...study.revealed, qid] })
      } else {
        setExam((s) => (s ? { ...s, answers: { ...s.answers, [qid]: option } } : s))
      }
    },
    [study],
  )

  const toggleFlag = useCallback((qid: number) => {
    setExam((s) =>
      s ? { ...s, flagged: s.flagged.includes(qid) ? s.flagged.filter((x) => x !== qid) : [...s.flagged, qid] } : s,
    )
  }, [])

  const goTo = useCallback((kind: Kind, index: number) => {
    setFor(kind)((s) => (s ? { ...s, current: Math.min(Math.max(0, index), s.questionIds.length - 1) } : s))
  }, [])

  const tick = useCallback((seconds = 1) => {
    setExam((s) => (s ? { ...s, elapsedSeconds: s.elapsedSeconds + seconds } : s))
  }, [])

  const submitExam = useCallback(
    (timedOut = false) => {
      if (!exam) return null
      const attempt = toAttempt(exam, timedOut)
      setHistory(pushHistory(attempt))
      const answered = exam.questionIds.filter((id) => exam.answers[id] !== undefined)
      setTheoryStats(
        recordTheoryAnswers(
          answered.map((id) => {
            const q = getQuestion(id)
            return { theory: q.theory, correct: exam.answers[id] === q.correctIndex }
          }),
        ),
      )
      setExam(null)
      return attempt
    },
    [exam],
  )

  const discard = useCallback((kind: Kind) => setFor(kind)(null), [])

  const clearAllData = useCallback(() => {
    for (const k of [KEYS.exam, KEYS.study, KEYS.history, KEYS.theoryStats]) save(k, null)
    setExam(null)
    setStudy(null)
    setHistory([])
    setTheoryStats({})
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      exam,
      study,
      history,
      theoryStats,
      theme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      start,
      answer,
      toggleFlag,
      goTo,
      tick,
      submitExam,
      discard,
      clearAllData,
    }),
    [exam, study, history, theoryStats, theme, start, answer, toggleFlag, goTo, tick, submitExam, discard, clearAllData],
  )
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp must be used within AppProvider')
  return c
}
