import { KEYS, loadSession, pushHistory, loadHistory, recordTheoryAnswers, save } from '../lib/storage'
import { createSession, toAttempt } from '../lib/exam'

describe('الحفظ المحلي', () => {
  it('يستعيد جلسة محفوظة', () => {
    const s = createSession({ mode: 'exam', title: 'x', questionIds: [1, 2, 3] })
    s.answers = { 1: 3 }
    save(KEYS.exam, s)
    expect(loadSession(KEYS.exam)?.answers).toEqual({ 1: 3 })
  })
  it('يتجاهل البيانات التالفة أو أسئلة غير موجودة', () => {
    localStorage.setItem(KEYS.exam, '{not json')
    expect(loadSession(KEYS.exam)).toBeNull()
    save(KEYS.exam, { ...createSession({ mode: 'exam', title: 'x', questionIds: [1] }), questionIds: [999] })
    expect(loadSession(KEYS.exam)).toBeNull()
  })
  it('سجل المحاولات وإحصاءات النظريات', () => {
    const s = createSession({ mode: 'exam', title: 'x', questionIds: [1] })
    pushHistory(toAttempt(s))
    expect(loadHistory()).toHaveLength(1)
    const st = recordTheoryAnswers([{ theory: 'التأطير', correct: false }, { theory: 'التأطير', correct: true }])
    expect(st['التأطير']).toEqual({ attempts: 2, wrong: 1 })
  })
})
