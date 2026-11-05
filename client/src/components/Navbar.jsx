import { TrendingUp, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500">
            <TrendingUp className="h-5 w-5 text-slate-950" />
          </div>
          <span className="text-lg font-bold text-white">WealthTrack</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-400">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  )
}