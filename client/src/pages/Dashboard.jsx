// import { LogOut } from 'lucide-react'
// import { useAuth } from '../context/AuthContext'

// export default function Dashboard() {
//   const { user, logout } = useAuth()

//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center gap-4">
//       <h1 className="text-3xl font-bold text-white">
//         Welcome, <span className="text-emerald-400">{user?.name}</span> 👋
//       </h1>
//       <p className="text-slate-400">{user?.email}</p>
//       <p className="text-sm text-slate-500">The full dashboard comes in the next step.</p>
//       <button
//         onClick={logout}
//         className="mt-2 flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
//       >
//         <LogOut className="h-4 w-4" /> Log out
//       </button>
//     </div>
//   )
// }


import { useCallback, useEffect, useState } from 'react'
import {
  Wallet, TrendingUp, TrendingDown, CalendarClock,
  Plus, RefreshCw, Trash2, Briefcase, Loader2, Pencil,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import AddHoldingModal from '../components/AddHoldingModal'
import EditHoldingModal from '../components/EditHoldingModal'
import { inr, pct } from '../utils'

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444', '#84cc16']
const short = (s) => (s.length > 14 ? s.slice(0, 13) + '…' : s)
const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 12,
  color: '#e2e8f0',
  fontSize: 13,
}

export default function Dashboard() {
  const { logout } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await api.get('/portfolio/summary')
      setData(res.data)
      setError('')
    } catch (err) {
      if (err.response?.status === 401) logout()
      setError(err.response?.data?.message || 'Could not load your portfolio')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [logout])

  useEffect(() => {
    load()
    const timer = setInterval(() => load(true), 60000)
    return () => clearInterval(timer)
  }, [load])

  const remove = async (id, name) => {
    if (!window.confirm(`Remove ${name} from your portfolio?`)) return
    await api.delete(`/holdings/${id}`)
    load(true)
  }

  const t = data?.totals
  const holdings = data?.holdings ?? []
  const pieData = holdings.map((h) => ({ name: h.name, value: h.currentValue }))
  const barData = holdings.map((h) => ({ name: short(h.name), pnl: h.pnl }))

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Portfolio Overview</h1>
            <p className="text-sm text-slate-400">Live prices, refreshed every minute</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => load(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" /> Add holding
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-24 flex items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading your portfolio...
          </div>
        ) : holdings.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10">
              <Briefcase className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-white">Your portfolio is empty</h2>
            <p className="mt-2 text-sm text-slate-400">
              Add your first stock or mutual fund to see live profit and loss.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="mt-6 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Add your first holding
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total invested"
                value={inr(t.invested)}
                sub={`${t.holdingsCount} holding${t.holdingsCount > 1 ? 's' : ''}`}
                icon={Wallet}
              />
              <StatCard
                label="Current value"
                value={inr(t.currentValue)}
                sub="At latest market prices"
                icon={Briefcase}
              />
              <StatCard
                label="Total profit / loss"
                value={inr(t.pnl)}
                sub={pct(t.returnPct) + ' overall return'}
                icon={t.pnl >= 0 ? TrendingUp : TrendingDown}
                tone={t.pnl >= 0 ? 'up' : 'down'}
              />
              <StatCard
                label="Today's change"
                value={inr(t.dayChange)}
                sub="Versus previous close"
                icon={CalendarClock}
                tone={t.dayChange >= 0 ? 'up' : 'down'}
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-2">
                <h3 className="font-semibold text-white">Allocation</h3>
                <p className="text-xs text-slate-500">Share of each holding in your portfolio</p>
                <div className="relative mt-2 h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => inr(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Total value</p>
                      <p className="text-lg font-bold text-white">{inr(t.currentValue)}</p>
                    </div>
                  </div>
                </div>
                <ul className="mt-3 space-y-2">
                  {holdings.map((h, i) => (
                    <li key={h.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        {short(h.name)}
                      </span>
                      <span className="text-slate-400">{h.allocationPct}%</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-3">
                <h3 className="font-semibold text-white">Profit / loss by holding</h3>
                <p className="text-xs text-slate-500">Green is profit, red is loss</p>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                        formatter={(v) => [inr(v), 'P&L']}
                      />
                      <Bar dataKey="pnl" radius={[8, 8, 0, 0]} maxBarSize={56}>
                        {barData.map((d, i) => (
                          <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="border-b border-slate-800 px-6 py-4">
                <h3 className="font-semibold text-white">Your holdings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-225 text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 text-right font-medium">Qty</th>
                      <th className="px-4 py-3 text-right font-medium">Avg buy</th>
                      <th className="px-4 py-3 text-right font-medium">Current</th>
                      <th className="px-4 py-3 text-right font-medium">Invested</th>
                      <th className="px-4 py-3 text-right font-medium">Value</th>
                      <th className="px-4 py-3 text-right font-medium">P&amp;L</th>
                      <th className="px-4 py-3 text-right font-medium">Return</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {holdings.map((h) => {
                      const gain = h.pnl >= 0
                      return (
                        <tr key={h.id} className="transition hover:bg-slate-800/40">
                          <td className="px-6 py-4">
                            <p className="font-medium text-white">{h.name}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                                  h.type === 'stock'
                                    ? 'bg-cyan-500/10 text-cyan-400'
                                    : 'bg-violet-500/10 text-violet-400'
                                }`}
                              >
                                {h.type === 'stock' ? 'Stock' : 'Mutual fund'}
                              </span>
                              <span className="text-xs text-slate-500">{h.symbol}</span>
                              {!h.live && (
                                <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-400">
                                  Price unavailable
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right text-slate-300">{h.quantity}</td>
                          <td className="px-4 py-4 text-right text-slate-300">{inr(h.buyPrice)}</td>
                          <td className="px-4 py-4 text-right text-white">{inr(h.currentPrice)}</td>
                          <td className="px-4 py-4 text-right text-slate-300">{inr(h.invested)}</td>
                          <td className="px-4 py-4 text-right text-white">{inr(h.currentValue)}</td>
                          <td className={`px-4 py-4 text-right font-medium ${gain ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {inr(h.pnl)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                                gain ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {pct(h.returnPct)}
                            </span>
                          </td>
                          {/* <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => remove(h.id, h.name)}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td> */}
                               <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditing(h)}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-700 hover:text-white"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => remove(h.id, h.name)}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {open && (
        <AddHoldingModal
          onClose={() => setOpen(false)}
          onAdded={() => {
            setOpen(false)
            load(true)
          }}
        />
      )}
            {editing && (
        <EditHoldingModal
          holding={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load(true)
          }}
        />
      )}
    </div>
  )
}