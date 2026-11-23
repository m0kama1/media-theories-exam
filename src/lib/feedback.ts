import type { Question } from '../types'
import { integrationNotes, questionExtras, theoryNotes } from '../data/notes'
import { INTEGRATION_THEORY } from './bank'

export interface Feedback {
  /** لماذا الإجابة الصحيحة صحيحة */
  why: string
  /** لماذا اختيارك خاطئ (عند الخطأ فقط) */
  wrongWhy?: string
  /** مفتاح للتذكر */
  tip: string
  extra?: string
}

/** Learning note for a question; `chosen` is the ORIGINAL option index (or undefined if skipped). */
export function feedbackFor(q: Question, chosen: number | undefined): Feedback {
  const extra = questionExtras[q.id]
  if (q.theory === INTEGRATION_THEORY) {
    const n = integrationNotes[q.id]
    return {
      why: n.why,
      wrongWhy: chosen !== undefined && chosen !== q.correctIndex ? n.wrong[chosen] : undefined,
      tip: n.tip,
      extra,
    }
  }
  const correct = theoryNotes[q.theory]
  let wrongWhy: string | undefined
  if (chosen !== undefined && chosen !== q.correctIndex) {
    const name = q.options[chosen]
    wrongWhy = `«${name}» تعني: ${theoryNotes[name].core} وهذا لا ينطبق على المطلوب هنا.`
  }
  return { why: `«${q.theory}»: ${correct.core}`, wrongWhy, tip: correct.tip, extra }
}
