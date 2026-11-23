import type { AttemptRecord, Session, TheoryStat } from '../types'
import { byId } from './bank'

const PREFIX = 'mte:'
export const KEYS = {
  exam: PREFIX + 'exam-session',
  study: PREFIX + 'study-session',
  history: PREFIX + 'history',
  theoryStats: PREFIX + 'theory-stats',
  theme: PREFIX + 'theme',
} as const

const MAX_HISTORY = 30

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable or full – app keeps working in memory */
  }
}

/** Accept a stored session only if every referenced question still exists. */
export function loadSession(key: string): Session | null {
  const s = load<Session | null>(key, null)
  if (!s || !Array.isArray(s.questionIds) || !s.questionIds.length) return null
  if (!s.questionIds.every((id) => byId.has(id))) return null
  return { ...s, revealed: s.revealed ?? [], flagged: s.flagged ?? [] }
}

export const loadHistory = () => load<AttemptRecord[]>(KEYS.history, [])
export function pushHistory(a: AttemptRecord): AttemptRecord[] {
  const h = [a, ...loadHistory().filter((x) => x.id !== a.id)].slice(0, MAX_HISTORY)
  save(KEYS.history, h)
  return h
}

export const loadTheoryStats = () => load<Record<string, TheoryStat>>(KEYS.theoryStats, {})
export function recordTheoryAnswers(entries: { theory: string; correct: boolean }[]) {
  const stats = loadTheoryStats()
  for (const e of entries) {
    const s = stats[e.theory] ?? { attempts: 0, wrong: 0 }
    s.attempts++
    if (!e.correct) s.wrong++
    stats[e.theory] = s
  }
  save(KEYS.theoryStats, stats)
  return stats
}
