import { questions } from '../lib/bank'
import { createSession, filterQuestions, grade, gradeLabel, shuffle, formatDuration } from '../lib/exam'

const all = questions.map((q) => q.id)
const perfect = Object.fromEntries(questions.map((q) => [q.id, q.correctIndex]))

describe('منطق التصحيح', () => {
  it('الإجابات الصحيحة كلها = 100/100', () => {
    const g = grade(all, perfect)
    expect([g.correct, g.wrong, g.skipped, g.percent]).toEqual([100, 0, 0, 100])
  })
  it('بلا إجابات = 100 متروكة', () => {
    const g = grade(all, {})
    expect([g.correct, g.wrong, g.skipped, g.percent]).toEqual([0, 0, 100, 0])
  })
  it('خليط من الصحيح والخاطئ والمتروك', () => {
    const ans: Record<number, number> = {}
    questions.slice(0, 10).forEach((q) => (ans[q.id] = q.correctIndex))
    questions.slice(10, 25).forEach((q) => (ans[q.id] = (q.correctIndex + 1) % 4))
    const g = grade(all, ans)
    expect([g.correct, g.wrong, g.skipped]).toEqual([10, 15, 75])
    expect(g.percent).toBe(10)
  })
  it('تحليلات الفصل والصعوبة والنظرية متسقة مع المجموع', () => {
    const g = grade(all, perfect)
    for (const b of [g.bySection, g.byDifficulty, g.byTheory]) {
      expect(b.reduce((s, x) => s + x.total, 0)).toBe(100)
      expect(b.reduce((s, x) => s + x.correct, 0)).toBe(100)
    }
    expect(g.bySection.map((b) => b.total)).toEqual([60, 33, 7])
  })
  it('النسبة محسوبة على عدد الأسئلة المختارة', () => {
    const ids = all.slice(0, 7)
    const g = grade(ids, { [ids[0]]: questions[0].correctIndex })
    expect(g.total).toBe(7)
    expect(g.percent).toBeCloseTo(14.3, 1)
  })
})

describe('بناء الامتحان', () => {
  it('التصفية حسب الفصل والصعوبة', () => {
    expect(filterQuestions({ sections: ['مقارنات وتطبيقات تكاملية'] })).toHaveLength(7)
    expect(filterQuestions({ difficulties: ['صعب'] })).toHaveLength(38)
    expect(filterQuestions({ difficulties: ['متوسط', 'تطبيقي'] })).toHaveLength(62)
    expect(filterQuestions({})).toHaveLength(100)
  })
  it('الخلط يحافظ على نفس الأسئلة', () => {
    const s = shuffle(all)
    expect([...s].sort((a, b) => a - b)).toEqual(all)
  })
  it('إنشاء جلسة بالمؤقت', () => {
    const s = createSession({ mode: 'exam', title: 't', questionIds: [1, 2], timerEnabled: true, timeLimitMinutes: 2 })
    expect(s.timeLimitSeconds).toBe(120)
    expect(s.current).toBe(0)
    expect(() => createSession({ mode: 'exam', title: 't', questionIds: [] })).toThrow()
  })
  it('تسميات التقدير والمدة', () => {
    expect(gradeLabel(95).label).toBe('ممتاز')
    expect(gradeLabel(40).tone).toBe('low')
    expect(formatDuration(3725)).toBe('1:02:05')
  })
})
