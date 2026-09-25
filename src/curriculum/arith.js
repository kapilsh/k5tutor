// Operand pickers with control over regrouping (carrying / borrowing).

const digitsOf = (n) => String(n).split('').reverse().map(Number)

export function carries(a, b) {
  const x = digitsOf(a)
  const y = digitsOf(b)
  let c = 0
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const s = (x[i] || 0) + (y[i] || 0) + c
    if (s >= 10) return true
    c = 0
  }
  return false
}

export function borrows(a, b) {
  const x = digitsOf(a)
  const y = digitsOf(b)
  return y.some((d, i) => (x[i] || 0) < d)
}

const lo = (digits) => (digits === 1 ? 1 : 10 ** (digits - 1))
const hi = (digits) => 10 ** digits - 1

// regroup: 'none' | 'yes' | 'any'
export function addPair(rng, da, db, regroup = 'any') {
  for (let t = 0; t < 500; t++) {
    const a = rng.int(lo(da), hi(da))
    const b = rng.int(lo(db), hi(db))
    const c = carries(a, b)
    if (regroup === 'any' || (regroup === 'yes') === c) return [a, b]
  }
  return [lo(da), lo(db)]
}

// a − b with a having da digits, b having db digits, a ≥ b.
export function subPair(rng, da, db, regroup = 'any', { acrossZero = false } = {}) {
  for (let t = 0; t < 1000; t++) {
    let a = rng.int(lo(da), hi(da))
    if (acrossZero) {
      const s = String(a).split('')
      for (let i = 1; i < s.length - 1; i++) s[i] = '0'
      a = Number(s.join(''))
    }
    const b = rng.int(lo(db), Math.min(hi(db), a))
    if (b > a) continue
    const r = borrows(a, b)
    if (regroup === 'any' || (regroup === 'yes') === r) return [a, b]
  }
  return [hi(da), lo(db)]
}
