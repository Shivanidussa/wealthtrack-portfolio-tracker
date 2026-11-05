import { useEffect, useState } from 'react'
import { X, Search, Loader2, Check } from 'lucide-react'
import api from '../api'

const today = () => new Date().toISOString().slice(0, 10)

const inputClass =
  'w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'

export default function AddHoldingModal({ onClose, onAdded }) {
  const [type, setType] = useState('stock')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [picked, setPicked] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [buyDate, setBuyDate] = useState(today())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (picked || query.trim().length < 2) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get('/portfolio/search', {
          params: { type, q: query.trim() },
        })
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [query, type, picked])

  const switchType = (t) => {
    setType(t)
    setQuery('')
    setPicked(null)
    setResults([])
  }

  const pick = (item) => {
    setPicked(item)
    setQuery(item.name)
    setResults([])
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!picked) return setError('Please search and select a stock or fund')
    if (!(Number(quantity) > 0) || !(Number(buyPrice) > 0))
      return setError('Enter a valid quantity and buy price')

    setSaving(true)
    try {
      await api.post('/holdings', {
        type: picked.type,
        name: picked.name,
        symbol: picked.symbol,
        quantity: Number(quantity),
        buyPrice: Number(buyPrice),
        buyDate,
      })
      onAdded()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save holding')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Add holding</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-900 p-1">
          {[
            ['stock', 'Stock'],
            ['mutualfund', 'Mutual Fund'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => switchType(value)}
              className={`rounded-lg py-2 text-sm font-medium transition ${
                type === value
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="relative">
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              {type === 'stock' ? 'Search company (e.g. Infosys)' : 'Search fund (e.g. Parag Parikh Flexi Cap)'}
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPicked(null)
                }}
                placeholder="Start typing..."
                className={inputClass + ' pl-10 pr-10'}
              />
              {searching && (
                <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-500" />
              )}
              {picked && (
                <Check className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
              )}
            </div>

            {results.length > 0 && (
              <ul className="absolute z-10 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
                {results.map((r) => (
                  <li key={r.symbol}>
                    <button
                      type="button"
                      onClick={() => pick(r)}
                      className="w-full px-4 py-2.5 text-left transition hover:bg-slate-800"
                    >
                      <p className="text-sm text-white">{r.name}</p>
                      <p className="text-xs text-slate-500">{r.symbol}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                {type === 'stock' ? 'Quantity (shares)' : 'Units'}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                {type === 'stock' ? 'Buy price (₹)' : 'Buy NAV (₹)'}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="1200"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Buy date</label>
            <input
              type="date"
              value={buyDate}
              max={today()}
              onChange={(e) => setBuyDate(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Add to portfolio
          </button>
        </form>
      </div>
    </div>
  )
}