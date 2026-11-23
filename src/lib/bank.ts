import raw from '../data/questions.json'
import type { Question, QuestionBank } from '../types'

export const bank = raw as QuestionBank
export const questions: Question[] = bank.questions
export const byId = new Map<number, Question>(questions.map((q) => [q.id, q]))

const unique = <T,>(xs: T[]) => Array.from(new Set(xs))

export const sections = unique(questions.map((q) => q.section))
export const difficulties = ['متوسط', 'تطبيقي', 'صعب'].filter((d) => questions.some((q) => q.difficulty === d))
export const INTEGRATION_THEORY = 'تكامل ومقارنة'
export const theories = unique(questions.map((q) => q.theory))
export const namedTheories = theories.filter((t) => t !== INTEGRATION_THEORY)

export const OPTION_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و']

export function getQuestion(id: number): Question {
  const q = byId.get(id)
  if (!q) throw new Error(`Unknown question id ${id}`)
  return q
}

/** Structural validation of the bank. Returns a list of human-readable problems (empty = valid). */
export function validateBank(b: QuestionBank): string[] {
  const problems: string[] = []
  const seen = new Set<number>()
  for (const q of b.questions) {
    if (seen.has(q.id)) problems.push(`سؤال مكرر المعرف ${q.id}`)
    seen.add(q.id)
    if (!q.question?.trim()) problems.push(`السؤال ${q.id} بلا نص`)
    if (q.options.length !== 4) problems.push(`السؤال ${q.id} لا يحتوي على 4 اختيارات`)
    if (new Set(q.options).size !== q.options.length) problems.push(`السؤال ${q.id} به اختيارات مكررة`)
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length)
      problems.push(`السؤال ${q.id} مؤشر الإجابة الصحيحة غير صالح`)
    if (!q.explanation?.trim()) problems.push(`السؤال ${q.id} بلا تفسير`)
    if (q.theory !== INTEGRATION_THEORY && q.options[q.correctIndex] !== q.theory)
      problems.push(`السؤال ${q.id}: الإجابة الصحيحة لا تطابق النظرية المصنفة`)
  }
  return problems
}
