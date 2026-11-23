import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { bank, questions, validateBank, sections, namedTheories } from '../lib/bank'

const root = resolve(__dirname, '../..')

describe('بنك الأسئلة', () => {
  it('لم يتغير عن الملف الأصلي (بصمة SHA-256)', () => {
    const buf = readFileSync(resolve(root, 'src/data/questions.json'))
    expect(createHash('sha256').update(buf).digest('hex')).toBe('c48f492c500b0d635e5460b2f64016e9073d68faa8b5bb8b4a59882e1dd75997')
  })

  it('يحتوي على 100 سؤال بمعرفات 1..100 بالترتيب', () => {
    expect(questions).toHaveLength(100)
    expect(questions.map((q) => q.id)).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
  })

  it('اجتاز التحقق البنيوي: 4 اختيارات، إجابة صحيحة واحدة صالحة، تطابق النظرية', () => {
    expect(validateBank(bank)).toEqual([])
  })

  it('كل سؤال له إجابة صحيحة واحدة فقط (لا اختيارات مكررة)', () => {
    for (const q of questions) {
      expect(new Set(q.options).size).toBe(4)
      expect(q.options.filter((o) => o === q.options[q.correctIndex])).toHaveLength(1)
    }
  })

  it('مفتاح الإجابة يطابق ملف Markdown المرجعي', () => {
    const md = readFileSync(resolve(root, 'docs/media_theories_exam_100.md'), 'utf8')
    const letters = ['أ', 'ب', 'ج', 'د']
    const key = [...md.matchAll(/\*\*(\d+)\. (.) — /g)].map((m) => [Number(m[1]), letters.indexOf(m[2])] as const)
    expect(key).toHaveLength(100)
    for (const [id, idx] of key) expect(questions[id - 1].correctIndex).toBe(idx)
  })

  it('يعكس البنية المتوقعة: 3 أقسام و31 نظرية', () => {
    expect(sections).toHaveLength(3)
    expect(namedTheories).toHaveLength(31)
  })
})
