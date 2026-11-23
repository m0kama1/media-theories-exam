import { questions } from '../lib/bank'
import { createExam, grade, gradeLabel, shuffle, formatDuration, orderOf } from '../lib/exam'

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
  })
  it('تحليلات الفصل والصعوبة والنظرية متسقة مع المجموع', () => {
    const g = grade(shuffle(all), perfect)
    for (const b of [g.bySection, g.byDifficulty, g.byChapter, g.byTheory]) {
      expect(b.reduce((s, x) => s + x.total, 0)).toBe(100)
      expect(b.reduce((s, x) => s + x.correct, 0)).toBe(100)
    }
    expect(g.bySection.map((b) => b.total)).toEqual([11, 17, 20, 20, 12, 20])
    expect(g.byChapter.map((b) => b.key)).toEqual(['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث', 'تكاملي'])
    expect(g.byDifficulty.map((b) => b.key)).toEqual(['فهم', 'تطبيق', 'تحليل'])
  })
})

describe('الترتيب العشوائي', () => {
  it('كل امتحان يحتوي الأسئلة الـ100 مرة واحدة فقط', () => {
    const e = createExam()
    expect(e.questionIds).toHaveLength(100)
    expect(new Set(e.questionIds).size).toBe(100)
    expect([...e.questionIds].sort((a, b) => a - b)).toEqual(all)
  })
  it('ترتيب الاختيارات تبديل صالح لكل سؤال', () => {
    const e = createExam()
    for (const q of questions) expect([...e.optionOrder[q.id]].sort()).toEqual([0, 1, 2, 3])
  })
  it('يختلف الترتيب بين محاولتين', () => {
    const a = createExam(), b = createExam()
    expect(a.questionIds).not.toEqual(b.questionIds)
    expect(questions.some((q) => a.optionOrder[q.id].join() !== b.optionOrder[q.id].join())).toBe(true)
  })
  it('الإجابة الصحيحة تبقى صحيحة أيًّا كان موضعها المعروض', () => {
    const e = createExam()
    const ans: Record<number, number> = {}
    for (const q of questions) {
      const order = orderOf(e.optionOrder, q)
      const displayed = order.indexOf(q.correctIndex) // موضعها على الشاشة
      ans[q.id] = order[displayed] // ما يُحفظ عند الضغط عليها
      expect(q.options[order[displayed]]).toBe(q.options[q.correctIndex])
    }
    expect(grade(e.questionIds, ans).correct).toBe(100)
  })
  it('بلا ترتيب محفوظ (محاولات قديمة) يُستخدم الترتيب الأصلي', () => {
    expect(orderOf(undefined, questions[0])).toEqual([0, 1, 2, 3])
  })
})

describe('أدوات مساعدة', () => {
  it('تسميات التقدير والمدة والمؤقت', () => {
    expect(gradeLabel(95).label).toBe('ممتاز')
    expect(gradeLabel(40).tone).toBe('low')
    expect(formatDuration(3725)).toBe('1:02:05')
    expect(createExam({ timerEnabled: true, timeLimitMinutes: 2 }).timeLimitSeconds).toBe(120)
  })
})
