import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import App from '../App'
import { AppProvider } from '../state'
import { byId } from '../lib/bank'
import { KEYS } from '../lib/storage'
import type { Session } from '../types'

const mount = () => render(<AppProvider><App /></AppProvider>)
const go = async (hash: string) => act(async () => { window.location.hash = hash; window.dispatchEvent(new HashChangeEvent('hashchange')) })
const session = () => JSON.parse(localStorage.getItem(KEYS.exam)!) as Session
const currentQ = () => { const s = session(); return byId.get(s.questionIds[s.current])! }

async function startExam(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /ابدأ الامتحان|ابدأ امتحانًا جديدًا/ }))
  await user.click(screen.getByRole('button', { name: 'ابدأ الآن' }))
}
const optionButtons = () => within(screen.getByRole('group', { name: 'الاختيارات' })).getAllByRole('button')

describe('تدفق الامتحان', () => {
  it('index.html معدّ للعربية RTL', () => {
    expect(readFileSync(resolve(__dirname, '../../index.html'), 'utf8')).toMatch(/<html lang="ar" dir="rtl">/)
  })

  it('لا توجد أوضاع إضافية: لا مذاكرة ولا امتحان مخصص', async () => {
    mount()
    expect(screen.queryByText(/وضع المذاكرة/)).toBeNull()
    expect(screen.queryByText(/امتحان مخصص/)).toBeNull()
    expect(screen.queryByText(/امتحان القسم/)).toBeNull()
    await go('/study')
    expect(window.location.hash).toBe('#/')
  })

  it('الامتحان: ترتيب عشوائي، لا تغذية راجعة أثناء الحل، حفظ، تسليم، ومراجعة بالملاحظات', async () => {
    const user = userEvent.setup()
    const view = mount()
    await startExam(user)
    const s = session()
    expect(s.questionIds).toHaveLength(100)
    expect(new Set(s.questionIds).size).toBe(100)

    // option buttons rendered in the randomized order
    const q1 = currentQ()
    expect(screen.getByTestId('question-text')).toHaveTextContent(q1.question)
    const shown = optionButtons().map((b) => b.querySelector('.flex-1')!.textContent)
    expect(shown).toEqual(s.optionOrder[q1.id].map((i) => q1.options[i]))

    // answer Q1 correctly by clicking the correct TEXT wherever it is
    await user.click(screen.getByRole('button', { name: new RegExp(q1.options[q1.correctIndex]) }))
    expect(document.querySelector('[data-state="correct"],[data-state="wrong"]')).toBeNull()
    expect(screen.queryByTestId('note')).toBeNull()
    expect(screen.queryByText(/لماذا/)).toBeNull()

    // Q2 wrong + flag
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    const q2 = currentQ()
    const wrong2 = q2.options[(q2.correctIndex + 1) % 4]
    await user.click(screen.getByRole('button', { name: new RegExp(wrong2) }))
    await user.click(screen.getByRole('button', { name: /وضع علامة/ }))

    // reload keeps order & answers
    view.unmount()
    mount()
    await go('/exam')
    expect(screen.getByTestId('question-text')).toHaveTextContent(q2.question)
    expect(screen.getByTestId('answered')).toHaveTextContent('2')
    expect(session().questionIds).toEqual(s.questionIds)

    await user.click(screen.getAllByRole('button', { name: 'تسليم الامتحان' })[0])
    const dlg = screen.getByRole('dialog', { name: 'تأكيد تسليم الامتحان' })
    expect(dlg).toHaveTextContent('98 سؤالًا دون إجابة')
    await user.click(within(dlg).getByRole('button', { name: /نعم، سلّم/ }))

    expect(screen.getByTestId('score')).toHaveTextContent('1')
    const items = screen.getAllByTestId('review-item')
    expect(items).toHaveLength(100)

    // every item shows my answer, the correct answer, and a note
    expect(screen.getAllByTestId('note')).toHaveLength(100)
    expect(screen.getAllByTestId('correct-answer')).toHaveLength(100)

    // Q1 (correct): note without "why wrong"
    const i1 = items[0]
    expect(within(i1).getByTestId('my-answer')).toHaveTextContent(q1.options[q1.correctIndex])
    expect(within(i1).getByTestId('note')).toHaveTextContent('لماذا هي الصحيحة')
    expect(within(i1).getByTestId('note')).not.toHaveTextContent('لماذا اختيارك خطأ')

    // Q2 (wrong): shows both answers + why my choice is wrong
    const i2 = items[1]
    expect(within(i2).getByTestId('my-answer')).toHaveTextContent(wrong2)
    expect(within(i2).getByTestId('correct-answer')).toHaveTextContent(q2.options[q2.correctIndex])
    expect(within(i2).getByTestId('note')).toHaveTextContent('لماذا اختيارك خطأ')
    expect(i2).toHaveTextContent(q2.explanation)
    // review keeps the attempt's option order
    const letters = within(i2).getAllByRole('button').map((b) => b.querySelector('.flex-1')!.textContent)
    expect(letters).toEqual(s.optionOrder[q2.id].map((i) => q2.options[i]))

    // skipped item
    expect(within(items[2]).getByTestId('my-answer')).toHaveTextContent('لم تُجب')

    await user.click(screen.getByRole('tab', { name: /الخاطئة/ }))
    expect(screen.getAllByTestId('review-item')).toHaveLength(1)
    await user.click(screen.getByRole('tab', { name: /الصحيحة/ }))
    expect(screen.getAllByTestId('review-item')).toHaveLength(1)
  })

  it('امتحان جديد يأتي بترتيب مختلف', async () => {
    const user = userEvent.setup()
    mount()
    await startExam(user)
    const a = session().questionIds
    await user.click(screen.getAllByRole('button', { name: 'تسليم الامتحان' })[0])
    await user.click(screen.getByRole('button', { name: /نعم، سلّم/ }))
    await user.click(screen.getByRole('button', { name: /امتحان جديد/ }))
    await user.click(screen.getByRole('button', { name: 'ابدأ الآن' }))
    const b = session().questionIds
    expect(b).toHaveLength(100)
    expect(b).not.toEqual(a)
  })

  it('مؤقت الامتحان يسلّم تلقائيًا عند انتهاء الوقت', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mount()
    await user.click(screen.getByRole('button', { name: /ابدأ الامتحان/ }))
    await user.click(screen.getByRole('switch', { name: 'تفعيل المؤقت' }))
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1' } })
    await user.click(screen.getByRole('button', { name: 'ابدأ الآن' }))
    for (let i = 0; i < 61; i++) await act(async () => { vi.advanceTimersByTime(1000) })
    expect(screen.getByText('سُلِّم تلقائيًا بانتهاء الوقت')).toBeInTheDocument()
    vi.useRealTimers()
  })
})
