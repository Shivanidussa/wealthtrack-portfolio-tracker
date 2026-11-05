import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, Mail, Lock, User, Eye, EyeOff,
  ShieldCheck, PieChart, Activity, Loader2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Field({ icon: Icon, children }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl bg-slate-900/80 border border-slate-800 pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const isLogin = mode === 'login'
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const switchMode = () => {
    setMode(isLogin ? 'register' : 'login')
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) await login(form.email, form.password)
      else await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Cannot reach the server. Is the backend running?'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-linear-to-br from-emerald-950 via-slate-950 to-slate-950 p-12">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <TrendingUp className="h-6 w-6 text-slate-950" />
          </div>
          <span className="text-xl font-bold text-white">WealthTrack</span>
        </div>

        <div className="relative space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight text-white">
              All your investments.
              <br />
              <span className="text-emerald-400">One clear picture.</span>
            </h1>
            <p className="mt-4 max-w-md text-slate-400">
              Track stocks and mutual funds with live prices, instant profit and
              loss, and smart allocation insights.
            </p>
          </div>

          <div className="max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Sample portfolio value
            </p>
            <p className="mt-1 text-3xl font-bold text-white">₹13,110</p>
            <p className="mt-1 text-sm font-medium text-emerald-400">
              ▲ ₹1,110 (+9.25%)
            </p>
            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="w-3/5 bg-emerald-500" />
              <div className="w-1/4 bg-cyan-500" />
              <div className="w-[15%] bg-violet-500" />
            </div>
          </div>

          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-emerald-400" /> Live stock prices
              and mutual fund NAVs
            </li>
            <li className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-emerald-400" /> Allocation and
              performance charts
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" /> Secure login
              with encrypted passwords
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          Built with MongoDB, Express, React and Node.js
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500">
              <TrendingUp className="h-5 w-5 text-slate-950" />
            </div>
            <span className="text-lg font-bold text-white">WealthTrack</span>
          </div>

          <h2 className="text-3xl font-bold text-white">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isLogin
              ? 'Log in to view your portfolio.'
              : 'Start tracking your investments in minutes.'}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {!isLogin && (
              <Field icon={User}>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Full name"
                  required
                  className={inputClass}
                />
              </Field>
            )}

            <Field icon={Mail}>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="Email address"
                required
                className={inputClass}
              />
            </Field>

            <Field icon={Lock}>
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={onChange}
                placeholder="Password (min 6 characters)"
                required
                minLength={6}
                className={inputClass + ' pr-12'}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPw ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </Field>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={switchMode}
              className="font-semibold text-emerald-400 hover:text-emerald-300"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}