import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import api from '../api'

const today = () => new Date().toISOString().slice(0, 10)

const inputClass =
  'w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'

export default function EditHoldingModal({ holding, onClose, onSaved }) {
  const [quantity, setQuantity] = useState(String(holding.quantity))
  const [buyPrice, setBuyPrice] = useState(String(holding.buyPrice))
  const [buyDate, setBuyDate] = useState(
    holding.buyDate ? holding.buyDate.slice(0, 10) : today()
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!(Number(quantity) > 0) || !(Number(buyPrice) > 0))
      return setError('Enter a valid quantity and buy price')

    setSaving(true)
    try {
      await api.put(`/holdings/${holding.id}`, {
        quantity: Number(quantity),
        buyPrice: Number(buyPrice),
        buyDate,
      })
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update holding')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Edit holding</h2>
            <p className="text-xs text-slate-500">{holding.name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                {holding.type === 'stock' ? 'Quantity (shares)' : 'Units'}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                {holding.type === 'stock' ? 'Buy price (₹)' : 'Buy NAV (₹)'}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
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
            Save changes
          </button>
        </form>
      </div>
    </div>
  )
}