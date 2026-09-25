export const gcd = (a, b) => {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a
}
export const lcm = (a, b) => (a / gcd(a, b)) * b

export function simplify(n, d) {
  const g = gcd(n, d) || 1
  return [n / g, d / g]
}

// Rounds away float noise (0.1 + 0.2) for decimal answers.
export const clean = (x, places = 6) => Number(x.toFixed(places))

export const range = (lo, hi, step = 1) => {
  const out = []
  for (let v = lo; step > 0 ? v <= hi : v >= hi; v += step) out.push(v)
  return out
}

export const isPrime = (n) => {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false
  return true
}

export const factors = (n) => range(1, n).filter((f) => n % f === 0)

export const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 6 })

export const money = (cents) => `$${(cents / 100).toFixed(2)}`
