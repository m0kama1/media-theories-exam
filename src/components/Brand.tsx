export const LOGO = `${import.meta.env.BASE_URL}logo-256.webp`
export const FACULTY = 'كلية الإعلام — جامعة بني سويف'
export const SUPERVISOR = { name: 'أ.د. محمد زين', title: 'أستاذ الصحافة بكلية الإعلام' }
export const AUTHOR = 'محمد كمال'

export function Logo({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <img
      src={LOGO}
      alt="شعار كلية الإعلام بجامعة بني سويف"
      width={256}
      height={256}
      className={`shrink-0 rounded-full bg-white object-contain ring-1 ring-slate-200 dark:ring-slate-700 ${className}`}
    />
  )
}

/** إعداد وإشراف */
export function Credits({ tone = 'card' }: { tone?: 'card' | 'print' }) {
  return (
    <div className={tone === 'card' ? 'card grid gap-4 p-5 text-center sm:grid-cols-2 sm:text-start' : 'grid grid-cols-2 gap-4 text-sm'} data-testid="credits">
      <div>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">إشراف</div>
        <div className="mt-0.5 font-bold">{SUPERVISOR.name}</div>
        <div className="text-sm text-slate-600 dark:text-slate-400">{SUPERVISOR.title}</div>
      </div>
      <div className="sm:border-s sm:border-slate-200 sm:ps-4 dark:sm:border-slate-700">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">إعداد الباحث</div>
        <div className="mt-0.5 font-bold">{AUTHOR}</div>
        <div className="text-sm text-slate-600 dark:text-slate-400">تمهيدي ماجستير الصحافة الإخبارية</div>
      </div>
    </div>
  )
}
