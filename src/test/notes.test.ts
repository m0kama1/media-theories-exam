import { questions, INTEGRATION_THEORY, namedTheories } from '../lib/bank'
import { integrationNotes, theoryNotes } from '../data/notes'
import { feedbackFor } from '../lib/feedback'

describe('الملاحظات التعليمية', () => {
  it('لكل نظرية من الـ31 ملاحظة وجوهر ومفتاح تذكّر', () => {
    for (const t of namedTheories) {
      expect(theoryNotes[t], t).toBeDefined()
      expect(theoryNotes[t].core.length).toBeGreaterThan(10)
      expect(theoryNotes[t].tip.length).toBeGreaterThan(5)
    }
  })

  it('كل اختيار في أسئلة النظريات له ملاحظة (لشرح سبب الخطأ)', () => {
    for (const q of questions.filter((q) => q.theory !== INTEGRATION_THEORY))
      for (const o of q.options) expect(theoryNotes[o], `Q${q.id}: ${o}`).toBeDefined()
  })

  it('أسئلة المقارنات: ملاحظة لكل اختيار خاطئ ولا ملاحظة خطأ للاختيار الصحيح', () => {
    for (const q of questions.filter((q) => q.theory === INTEGRATION_THEORY)) {
      const n = integrationNotes[q.id]
      expect(n, `Q${q.id}`).toBeDefined()
      const wrongIdx = q.options.map((_, i) => i).filter((i) => i !== q.correctIndex)
      expect(Object.keys(n.wrong).map(Number).sort()).toEqual(wrongIdx)
    }
  })

  it('feedbackFor: صحيح بلا سبب خطأ، خاطئ مع سبب، متروك بلا سبب خطأ', () => {
    for (const q of questions) {
      expect(feedbackFor(q, q.correctIndex).wrongWhy).toBeUndefined()
      expect(feedbackFor(q, undefined).wrongWhy).toBeUndefined()
      const w = (q.correctIndex + 1) % 4
      const fb = feedbackFor(q, w)
      expect(fb.why.length).toBeGreaterThan(10)
      expect(fb.wrongWhy, `Q${q.id}`).toBeTruthy()
    }
  })

  it('الملاحظات مختصرة (سطر أو سطرين)', () => {
    const all = [
      ...Object.values(theoryNotes).flatMap((n) => [n.core, n.tip]),
      ...Object.values(integrationNotes).flatMap((n) => [n.why, n.tip, ...Object.values(n.wrong)]),
    ]
    for (const s of all) expect(s.length, s).toBeLessThanOrEqual(130)
  })
})
