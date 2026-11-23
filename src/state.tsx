import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AttemptRecord, Session } from './types'
import { toAttempt } from './lib/exam'
import { KEYS, cleanupLegacy, loadHistory, loadSession, pushHistory, save } from './lib/storage'

interface Ctx {
  exam: Session | null
  history: AttemptRecord[]
  theme: 'light' | 'dark'
  toggleTheme: () => void
  start: (s: Session) => void
  answer: (qid: number, originalOption: number) => void
  toggleFlag: (qid: number) => void
  goTo: (index: number) => void
  tick: (seconds?: number) => void
  submitExam: (timedOut?: boolean) => AttemptRecord | null
  discard: () => void
  clearHistory: () => void
}

const AppCtx = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [exam, setExam] = useState<Session | null>(() => {
    cleanupLegacy()
    return loadSession(KEYS.exam)
  })
  const [history, setHistory] = useState<AttemptRecord[]>(loadHistory)
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )

  useEffect(() => save(KEYS.exam, exam), [exam])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    save(KEYS.theme, theme)
  }, [theme])

  const start = useCallback((s: Session) => setExam(s), [])
  const answer = useCallback((qid: number, option: number) => {
    setExam((s) => (s ? { ...s, answers: { ...s.answers, [qid]: option } } : s))
  }, [])
  const toggleFlag = useCallback((qid: number) => {
    setExam((s) =>
      s ? { ...s, flagged: s.flagged.includes(qid) ? s.flagged.filter((x) => x !== qid) : [...s.flagged, qid] } : s,
    )
  }, [])
  const goTo = useCallback((index: number) => {
    setExam((s) => (s ? { ...s, current: Math.min(Math.max(0, index), s.questionIds.length - 1) } : s))
  }, [])
  const tick = useCallback((seconds = 1) => {
    setExam((s) => (s ? { ...s, elapsedSeconds: s.elapsedSeconds + seconds } : s))
  }, [])
  const submitExam = useCallback(
    (timedOut = false) => {
      if (!exam) return null
      const attempt = toAttempt(exam, timedOut)
      setHistory(pushHistory(attempt))
      setExam(null)
      return attempt
    },
    [exam],
  )
  const discard = useCallback(() => setExam(null), [])
  const clearHistory = useCallback(() => {
    save(KEYS.history, null)
    setHistory([])
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      exam,
      history,
      theme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      start,
      answer,
      toggleFlag,
      goTo,
      tick,
      submitExam,
      discard,
      clearHistory,
    }),
    [exam, history, theme, start, answer, toggleFlag, goTo, tick, submitExam, discard, clearHistory],
  )
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp must be used within AppProvider')
  return c
}
