import { bank, questions, validateBank, LEVELS, chapters, NOTE_MAX } from '../lib/bank'

const count = (key: 'section' | 'chapter' | 'difficulty') =>
  questions.reduce<Record<string, number>>((m, q) => ((m[q[key]] = (m[q[key]] ?? 0) + 1), m), {})

describe('بنك الأسئلة (الإصدار الثاني)', () => {
  it('100 سؤال بمعرفات 1..100 دون تكرار في المعرفات أو النصوص', () => {
    expect(questions).toHaveLength(100)
    expect(questions.map((q) => q.id)).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
    expect(new Set(questions.map((q) => q.question)).size).toBe(100)
  })

  it('اجتاز التحقق البنيوي: 4 اختيارات مختلفة، إجابة صحيحة واحدة، ملاحظة ومرجع لكل سؤال', () => {
    expect(validateBank(bank)).toEqual([])
  })

  it('الملاحظات قصيرة (سطر أو سطرين)', () => {
    for (const q of questions) expect(q.explanation.length, `Q${q.id}`).toBeLessThanOrEqual(NOTE_MAX)
  })

  it('يغطي الفصول الثلاثة والأسئلة التكاملية', () => {
    const c = count('chapter')
    for (const ch of chapters) expect(c[ch], ch).toBeGreaterThanOrEqual(15)
  })

  it('يغطي المحاور الستة المطلوبة', () => {
    const s = count('section')
    expect(Object.keys(s).sort()).toEqual(
      [
        'التطبيقات البحثية',
        'الفصل الثاني: الوظائف والبينية والمنطلقات',
        'المفاهيم الأساسية',
        'المقارنات بين النظريات',
        'النظريات العشرون',
        'النظريات والمداخل الإحدى عشرة',
      ].sort(),
    )
    expect(s['التطبيقات البحثية']).toBeGreaterThanOrEqual(15)
    expect(s['المقارنات بين النظريات']).toBeGreaterThanOrEqual(10)
  })

  it('الوزن الأكبر للتطبيق والتحليل لا للفهم المباشر', () => {
    const d = count('difficulty')
    expect(Object.keys(d).every((k) => LEVELS.includes(k))).toBe(true)
    expect((d['تطبيق'] ?? 0) + (d['تحليل'] ?? 0)).toBeGreaterThanOrEqual(70)
  })

  it('لا تكشف صياغة السؤال الإجابة: نص الإجابة الصحيحة لا يرد حرفيًا في سؤال التطبيقات', () => {
    for (const q of questions.filter((q) => q.section === 'التطبيقات البحثية'))
      expect(q.question.includes(q.options[q.correctIndex]), `Q${q.id}`).toBe(false)
  })

  it('كل نظرية من النظريات الإحدى والثلاثين ممثلة في البنك', () => {
    const text = questions.map((q) => q.question + q.options.join(' ') + q.theory).join(' ')
    const theories = [
      'ترتيب الأولويات', 'التأطير', 'الغرس الثقافي', 'الاستخدامات والإشباعات', 'الاعتماد على وسائل الإعلام',
      'دوامة الصمت', 'فجوة المعرفة', 'التعلم الاجتماعي', 'انتشار الابتكارات', 'التنافر المعرفي', 'التهيئة',
      'الشخص الثالث', 'الحكم الاجتماعي', 'الاحتمالية الموسعة', 'معالجة المعلومات الاجتماعية', 'ثراء الوسيلة',
      'التعرض الانتقائي', 'التفاعل شبه الاجتماعي', 'إدارة المزاج', 'عدائية وسائل الإعلام',
      'المؤامرة', 'التفاعلية الرمزية', 'التدعيم', 'النمذجة', 'أصحاب المصلحة', 'المقاومة النفسية', 'المجال العام',
      'السياق', 'إدارة الواقع الاجتماعي', 'التأويل', 'الحتمية التكنولوجية',
    ]
    for (const t of theories) expect(text.includes(t), t).toBe(true)
  })
})
