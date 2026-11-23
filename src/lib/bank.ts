import raw from '../data/questions.json'
import type { Question, QuestionBank } from '../types'

export const bank = raw as QuestionBank
export const questions: Question[] = bank.questions
export const byId = new Map<number, Question>(questions.map((q) => [q.id, q]))

const unique = <T,>(xs: T[]) => Array.from(new Set(xs))

export const sections = unique(questions.map((q) => q.section))
export const topics = unique(questions.map((q) => q.theory))
export const LEVELS = ['فهم', 'تطبيق', 'تحليل']
export const chapters = ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث', 'تكاملي']

export const OPTION_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و']

export function getQuestion(id: number): Question {
  const q = byId.get(id)
  if (!q) throw new Error(`Unknown question id ${id}`)
  return q
}

export const NOTE_MAX = 180

/** Structural validation of the bank. Returns a list of human-readable problems (empty = valid). */
export function validateBank(b: QuestionBank): string[] {
  const problems: string[] = []
  const seenIds = new Set<number>()
  const seenText = new Set<string>()
  for (const q of b.questions) {
    if (seenIds.has(q.id)) problems.push(`معرف مكرر ${q.id}`)
    seenIds.add(q.id)
    if (seenText.has(q.question)) problems.push(`نص سؤال مكرر ${q.id}`)
    seenText.add(q.question)
    if (!q.question?.trim()) problems.push(`السؤال ${q.id} بلا نص`)
    if (q.options.length !== 4) problems.push(`السؤال ${q.id} لا يحتوي على 4 اختيارات`)
    if (new Set(q.options).size !== q.options.length) problems.push(`السؤال ${q.id} به اختيارات مكررة`)
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length)
      problems.push(`السؤال ${q.id}: مؤشر الإجابة الصحيحة غير صالح`)
    if (!q.explanation?.trim()) problems.push(`السؤال ${q.id} بلا ملاحظة تعليمية`)
    if (q.explanation.length > NOTE_MAX) problems.push(`السؤال ${q.id}: الملاحظة أطول من سطرين`)
    if (!q.ref?.trim()) problems.push(`السؤال ${q.id} بلا مرجع في الكتاب`)
    if (!LEVELS.includes(q.difficulty)) problems.push(`السؤال ${q.id}: مستوى غير معروف`)
    if (!chapters.includes(q.chapter)) problems.push(`السؤال ${q.id}: فصل غير معروف`)
  }
  return problems
}
