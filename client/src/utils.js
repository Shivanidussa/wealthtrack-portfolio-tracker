export const inr = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n ?? 0)

export const pct = (n) => `${n > 0 ? '+' : ''}${(n ?? 0).toFixed(2)}%`