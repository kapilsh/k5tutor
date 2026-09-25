// Seeded PRNG so a worksheet can be regenerated exactly from its seed
// (shareable links, matching answer keys, printable later).

export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function newSeed() {
  return Math.floor(Math.random() * 900000) + 100000
}

// Wraps a raw [0,1) generator with the helpers every topic generator uses.
export function makeRng(seed) {
  const next = mulberry32(seed)
  const rng = {
    next,
    // inclusive integer in [lo, hi]
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    bool: (p = 0.5) => next() < p,
    shuffle: (arr) => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    },
    // k distinct values from arr
    sample: (arr, k) => rng.shuffle(arr).slice(0, k),
  }
  return rng
}
