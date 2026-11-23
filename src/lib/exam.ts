import type { AttemptRecord, OptionOrder, Question, Session } from '../types'
import { LEVELS, chapters, getQuestion, questions } from './bank'

export function shuffle<T>(xs: T[], rand: () => number = Math.random): T[] {
  const a = xs.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const EXAM_TITLE = 'امتحان نظريات التأثير الإعلامي – 100 سؤال'

/** A new exam: all 100 questions, with question order AND option order randomized. */
export function createExam(opts: { timerEnabled?: boolean; timeLimitMinutes?: number; rand?: () => number } = {}): Session {
  const rand = opts.rand ?? Math.random
  const questionIds = shuffle(questions.map((q) => q.id), rand)
  const optionOrder: OptionOrder = {}
  for (const q of questions) optionOrder[q.id] = shuffle(q.options.map((_, i) => i), rand)
  return {
    id: newId(),
    title: EXAM_TITLE,
    questionIds,
    optionOrder,
    answers: {},
    flagged: [],
    current: 0,
    startedAt: Date.now(),
    timerEnabled: !!opts.timerEnabled,
    timeLimitSeconds: Math.max(1, Math.round((opts.timeLimitMinutes ?? 0) * 60)),
    elapsedSeconds: 0,
  }
}

/** Display order of a question's options (identity when no order was stored). */
export function orderOf(order: OptionOrder | undefined, q: Question): number[] {
  const o = order?.[q.id]
  return o && o.length === q.options.length ? o : q.options.map((_, i) => i)
}

export type QStatus = 'correct' | 'wrong' | 'skipped'

export interface Bucket {
  key: string
  total: number
  correct: number
  wrong: number
  skipped: number
  percent: number
}

export interface GradeResult {
  total: number
  correct: number
  wrong: number
  skipped: number
  percent: number
  items: { question: Question; chosen: number | undefined; status: QStatus }[]
  bySection: Bucket[]
  byDifficulty: Bucket[]
  byChapter: Bucket[]
  byTheory: Bucket[]
}

export function statusOf(q: Question, chosen: number | undefined): QStatus {
  if (chosen === undefined || chosen === null) return 'skipped'
  return chosen === q.correctIndex ? 'correct' : 'wrong'
}

function bucketize(items: GradeResult['items'], keyOf: (q: Question) => string, order?: string[]): Bucket[] {
  const map = new Map<string, Bucket>()
  for (const it of items) {
    const k = keyOf(it.question)
    const b = map.get(k) ?? { key: k, total: 0, correct: 0, wrong: 0, skipped: 0, percent: 0 }
    b.total++
    b[it.status]++
    map.set(k, b)
  }
  const out = Array.from(map.values()).map((b) => ({ ...b, percent: pct(b.correct, b.total) }))
  if (order) out.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
  return out
}

export const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0)

export function grade(questionIds: number[], answers: Record<number, number>): GradeResult {
  const items = questionIds.map((id) => {
    const question = getQuestion(id)
    const chosen = answers[id]
    return { question, chosen, status: statusOf(question, chosen) }
  })
  const correct = items.filter((i) => i.status === 'correct').length
  const wrong = items.filter((i) => i.status === 'wrong').length
  const skipped = items.length - correct - wrong
  return {
    total: items.length,
    correct,
    wrong,
    skipped,
    percent: pct(correct, items.length),
    items,
    bySection: bucketize(items, (q) => q.section, Array.from(new Set(questions.map((q) => q.section)))),
    byDifficulty: bucketize(items, (q) => q.difficulty, LEVELS),
    byChapter: bucketize(items, (q) => q.chapter, chapters),
    byTheory: bucketize(items, (q) => q.theory).sort((a, b) => a.percent - b.percent || b.total - a.total),
  }
}

export function gradeLabel(percent: number): { label: string; tone: 'great' | 'good' | 'ok' | 'low' } {
  if (percent >= 90) return { label: 'ممتاز', tone: 'great' }
  if (percent >= 75) return { label: 'جيد جدًا', tone: 'good' }
  if (percent >= 60) return { label: 'جيد', tone: 'ok' }
  return { label: 'يحتاج إلى مراجعة', tone: 'low' }
}

export function toAttempt(s: Session, timedOut = false): AttemptRecord {
  return {
    id: s.id,
    title: s.title,
    questionIds: s.questionIds,
    optionOrder: s.optionOrder,
    answers: s.answers,
    startedAt: s.startedAt,
    submittedAt: Date.now(),
    durationSeconds: s.elapsedSeconds,
    timedOut,
  }
}

export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  const two = (n: number) => String(n).padStart(2, '0')
  return h ? `${h}:${two(m)}:${two(r)}` : `${two(m)}:${two(r)}`
}

export const answeredCount = (s: Session) => s.questionIds.filter((id) => s.answers[id] !== undefined).length
