import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import App from '../App'
import { AppProvider } from '../state'
import { questions } from '../lib/bank'

const mount = () => render(<AppProvider><App /></AppProvider>)
const go = async (hash: string) => act(async () => { window.location.hash = hash; window.dispatchEvent(new HashChangeEvent('hashchange')) })

async function startFullExam(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /ابدأ الامتحان الكامل/ }))
  await user.click(screen.getByRole('button', { name: 'ابدأ الآن' }))
}

describe('تدفق الامتحان', () => {
  it('index.html معدّ للعربية RTL', () => {
    const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf8')
    expect(html).toMatch(/<html lang="ar" dir="rtl">/)
  })

  it('الصفحة الرئيسية تعرض اسم المادة وعدد الأسئلة والأقسام', () => {
    mount()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('امتحان نظريات التأثير الإعلامي')
    expect(screen.getByText('أقسام الامتحان')).toBeInTheDocument()
    expect(screen.getAllByText('100').length).toBeGreaterThan(0)
  })

  it('التنقل، الإجابة، العلامة، الحفظ بعد إعادة التحميل، التسليم والتصحيح', async () => {
    const user = userEvent.setup()
    const view = mount()
    await startFullExam(user)
    expect(screen.getByTestId('question-text')).toHaveTextContent(questions[0].question)
    // theory label must not leak during the exam
    expect(screen.queryByText(questions[0].theory, { selector: '.chip' })).toBeNull()
    expect(screen.getByRole('button', { name: 'السابق' })).toBeDisabled()

    // Q1 correct
    await user.click(screen.getByRole('button', { name: new RegExp(questions[0].options[questions[0].correctIndex]) }))
    expect(screen.getByTestId('answered')).toHaveTextContent('1')
    // no correctness feedback during exam
    expect(document.querySelector('[data-state="correct"],[data-state="wrong"]')).toBeNull()

    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(screen.getByTestId('question-text')).toHaveTextContent(questions[1].question)
    // Q2 wrong + flagged
    const wrong2 = questions[1].options[(questions[1].correctIndex + 1) % 4]
    await user.click(screen.getByRole('button', { name: new RegExp(wrong2) }))
    await user.click(screen.getByRole('button', { name: /وضع علامة/ }))
    expect(screen.getByRole('button', { name: /إزالة العلامة/ })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: /السابق/ }))
    expect(screen.getByTestId('question-text')).toHaveTextContent(questions[0].question)

    // jump via navigator panel to question 50
    await user.click(screen.getAllByRole('button', { name: /^السؤال 50،/ })[0])
    expect(screen.getByTestId('question-text')).toHaveTextContent(questions[49].question)

    // simulate closing the page and reopening
    view.unmount()
    mount()
    await go('/exam')
    expect(screen.getByTestId('question-text')).toHaveTextContent(questions[49].question)
    expect(screen.getByTestId('answered')).toHaveTextContent('2')
    expect(screen.getAllByRole('button', { name: /^السؤال 2، مُجاب، عليه علامة/ }).length).toBeGreaterThan(0)

    // submit with confirmation
    await user.click(screen.getAllByRole('button', { name: 'تسليم الامتحان' })[0])
    const dlg = screen.getByRole('dialog', { name: 'تأكيد تسليم الامتحان' })
    expect(dlg).toHaveTextContent('98 سؤالًا دون إجابة')
    await user.click(within(dlg).getByRole('button', { name: /نعم، سلّم/ }))

    expect(window.location.hash).toMatch(/#\/results\?id=/)
    expect(screen.getByTestId('score')).toHaveTextContent('1')
    expect(screen.getByTestId('score')).toHaveTextContent('100')
    expect(screen.getByText('الأداء حسب الفصل')).toBeInTheDocument()
    expect(screen.getByText('الأداء حسب النظرية')).toBeInTheDocument()

    // review wrong only: 1 wrong + 98 skipped
    await user.click(screen.getByRole('button', { name: /مراجعة الأخطاء فقط/ }))
    expect(screen.getAllByTestId('review-item')).toHaveLength(99)
    const first = screen.getAllByTestId('review-item')[0]
    expect(first).toHaveTextContent(questions[1].explanation)
    expect(first.querySelector('[data-state="wrong"]')).toHaveTextContent(wrong2)
    expect(first.querySelector('[data-state="missed"]')).toHaveTextContent(questions[1].options[questions[1].correctIndex])

    await user.click(screen.getByRole('tab', { name: /الصحيحة/ }))
    expect(screen.getAllByTestId('review-item')).toHaveLength(1)
  })

  it('امتحان مخصص حسب الصعوبة وإعادة اختبار الأخطاء', async () => {
    const user = userEvent.setup()
    mount()
    await go('/setup')
    await user.click(screen.getByRole('button', { name: 'صعب' }))
    expect(screen.getByTestId('match-count')).toHaveTextContent('38')
    await user.click(screen.getByRole('button', { name: /مقارنات وتطبيقات تكاملية/ }))
    expect(screen.getByTestId('match-count')).toHaveTextContent('7')
    await user.click(screen.getByRole('button', { name: /ابدأ الامتحان/ }))
    expect(screen.getByText(/السؤال 1 من 7/)).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'تسليم الامتحان' })[0])
    await user.click(screen.getByRole('button', { name: /نعم، سلّم/ }))
    expect(screen.getByTestId('score')).toHaveTextContent('0')
    await user.click(screen.getByRole('button', { name: /إعادة اختبار الأخطاء/ }))
    await user.click(screen.getByRole('button', { name: 'ابدأ الآن' }))
    expect(screen.getByText(/السؤال 1 من 7/)).toBeInTheDocument()
  })

  it('وضع المذاكرة يظهر الإجابة والتفسير فورًا ويسجل نقاط الضعف', async () => {
    const user = userEvent.setup()
    mount()
    await go('/study')
    await user.click(screen.getByRole('button', { name: /ابدأ المذاكرة/ }))
    const q = questions[0]
    const wrong = q.options[(q.correctIndex + 1) % 4]
    await user.click(screen.getByRole('button', { name: new RegExp(wrong) }))
    expect(screen.getByRole('status')).toHaveTextContent(q.explanation)
    expect(screen.getByRole('status')).toHaveTextContent('إجابة خاطئة')
    await user.click(screen.getByRole('button', { name: /السؤال التالي/ }))
    expect(screen.getByTestId('question-text')).toHaveTextContent(questions[1].question)
    await go('/weak')
    expect(screen.getByRole('cell', { name: q.theory })).toBeInTheDocument()
  })

  it('مؤقت الامتحان يسلّم تلقائيًا عند انتهاء الوقت', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mount()
    await user.click(screen.getByRole('button', { name: /ابدأ الامتحان الكامل/ }))
    await user.click(screen.getByRole('switch', { name: 'تفعيل المؤقت' }))
    const min = screen.getByRole('spinbutton')
    fireEvent.change(min, { target: { value: '1' } })
    expect(min).toHaveValue(1)
    await user.click(screen.getByRole('button', { name: 'ابدأ الآن' }))
    expect(screen.getByText('01:00')).toBeInTheDocument()
    for (let i = 0; i < 61; i++) await act(async () => { vi.advanceTimersByTime(1000) })
    expect(screen.getByText('سُلِّم تلقائيًا بانتهاء الوقت')).toBeInTheDocument()
    vi.useRealTimers()
  })
})
