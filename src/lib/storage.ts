import type { AttemptRecord, Session } from '../types'
import { byId } from './bank'

const PREFIX = 'mte:'
export const KEYS = {
  // v2: new question bank — older sessions/attempts referred to different questions
  exam: PREFIX + 'v2:exam-session',
  history: PREFIX + 'v2:history',
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
  return { ...s, flagged: s.flagged ?? [], optionOrder: s.optionOrder ?? {} }
}

export const loadHistory = () => load<AttemptRecord[]>(KEYS.history, [])
export function pushHistory(a: AttemptRecord): AttemptRecord[] {
  const h = [a, ...loadHistory().filter((x) => x.id !== a.id)].slice(0, MAX_HISTORY)
  save(KEYS.history, h)
  return h
}

/** Remove data left by earlier versions (study mode, theory stats). */
export function cleanupLegacy() {
  for (const k of ['study-session', 'theory-stats', 'exam-session', 'history']) save(PREFIX + k, null)
}
