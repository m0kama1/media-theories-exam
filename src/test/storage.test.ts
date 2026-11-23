import { KEYS, loadSession, pushHistory, loadHistory, save, cleanupLegacy } from '../lib/storage'
import { createExam, toAttempt } from '../lib/exam'

describe('الحفظ المحلي', () => {
  it('يستعيد الجلسة بنفس ترتيب الأسئلة والاختيارات', () => {
    const s = createExam()
    s.answers = { 1: 3 }
    save(KEYS.exam, s)
    const r = loadSession(KEYS.exam)!
    expect(r.answers).toEqual({ 1: 3 })
    expect(r.questionIds).toEqual(s.questionIds)
    expect(r.optionOrder).toEqual(s.optionOrder)
  })
  it('يتجاهل البيانات التالفة أو أسئلة غير موجودة', () => {
    localStorage.setItem(KEYS.exam, '{not json')
    expect(loadSession(KEYS.exam)).toBeNull()
    save(KEYS.exam, { ...createExam(), questionIds: [999] })
    expect(loadSession(KEYS.exam)).toBeNull()
  })
  it('سجل المحاولات يحفظ ترتيب الاختيارات', () => {
    const s = createExam()
    pushHistory(toAttempt(s))
    expect(loadHistory()[0].optionOrder).toEqual(s.optionOrder)
  })
  it('يحذف بيانات الإصدار السابق', () => {
    localStorage.setItem('mte:study-session', '{}')
    localStorage.setItem('mte:theory-stats', '{}')
    cleanupLegacy()
    expect(localStorage.getItem('mte:study-session')).toBeNull()
    expect(localStorage.getItem('mte:theory-stats')).toBeNull()
  })
})
