import { OPTION_LETTERS } from '../lib/bank'
import { Icon } from './Icon'

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'missed' | 'dim'

const styles: Record<OptionState, string> = {
  idle: 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/60 dark:hover:bg-brand-500/5',
  selected: 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20 dark:border-brand-400 dark:bg-brand-500/10',
  correct: 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10',
  wrong: 'border-rose-500 bg-rose-50 dark:border-rose-400 dark:bg-rose-500/10',
  missed: 'border-emerald-500 border-dashed bg-emerald-50/50 dark:border-emerald-400 dark:bg-emerald-500/5',
  dim: 'border-slate-200 bg-white opacity-60 dark:border-slate-800 dark:bg-slate-900',
}
const badge: Record<OptionState, string> = {
  idle: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  selected: 'bg-brand-600 text-white',
  correct: 'bg-emerald-600 text-white',
  wrong: 'bg-rose-600 text-white',
  missed: 'bg-emerald-600 text-white',
  dim: 'bg-slate-100 text-slate-500 dark:bg-slate-800',
}

export function OptionButton({ index, text, state, onClick, disabled }: { index: number; text: string; state: OptionState; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === 'selected'}
      data-state={state}
      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-start text-[15px] font-medium transition sm:p-4 sm:text-base ${styles[state]} ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold ${badge[state]}`}>
        {state === 'correct' || state === 'missed' ? <Icon name="check" className="h-4 w-4" /> : state === 'wrong' ? <Icon name="x" className="h-4 w-4" /> : OPTION_LETTERS[index]}
      </span>
      <span className="flex-1">{text}</span>
    </button>
  )
}
