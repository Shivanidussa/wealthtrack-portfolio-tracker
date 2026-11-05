const tones = {
  neutral: 'text-white',
  up: 'text-emerald-400',
  down: 'text-rose-400',
}

export default function StatCard({ label, value, sub, icon: Icon, tone = 'neutral' }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-800">
          <Icon className={`h-4 w-4 ${tone === 'neutral' ? 'text-slate-300' : tones[tone]}`} />
        </div>
      </div>
      <p className={`mt-3 text-2xl font-bold ${tones[tone]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}