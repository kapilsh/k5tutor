// What goes in each square of a mystery picture. Every crayon in the picture is
// given its own answer(s); each square shows a problem whose answer tells the
// crayon. The same seed always builds the same page.
import { makeRng } from '../lib/rng.js'
import { CRAYONS, PICTURES } from './pictures.js'

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)

function addOrSub(rng, v, max, minPart = 0) {
  const canSub = v + Math.max(minPart, 1) <= max
  if ((!canSub || rng.bool()) && v - minPart >= minPart) {
    const a = rng.int(minPart, v - minPart)
    return `${a} + ${v - a}`
  }
  const a = rng.int(v + Math.max(minPart, 1), max)
  return `${a} − ${a - v}`
}

// Products with at least two different fact pairs (12 = 2 × 6 = 3 × 4), so the
// squares aren't all the same fact over and over.
const pairsOf = (v) => range(2, 10).filter((a) => v % a === 0 && v / a >= a && v / a <= 10)
const PRODUCTS = [...new Set(range(2, 10).flatMap((a) => range(2, 10).map((b) => a * b)))].filter((v) => pairsOf(v).length >= 2)

export const MODES = [
  {
    id: 'numbers',
    label: 'Color by number',
    grades: 'K',
    perColor: 1,
    values: (rng, k) => range(1, k),
    cell: (rng, v) => String(v),
  },
  {
    id: 'add10',
    label: 'Add & subtract to 10',
    grades: 'K–1',
    perColor: 1,
    values: (rng, k) => rng.sample(range(2, 10), k),
    cell: (rng, v) => addOrSub(rng, v, 10),
  },
  {
    id: 'add20',
    label: 'Add & subtract to 20',
    grades: '1–2',
    perColor: 1,
    values: (rng, k) => rng.sample(range(5, 18), k),
    cell: (rng, v) => addOrSub(rng, v, 20, 2),
  },
  {
    id: 'add100',
    label: 'Add & subtract to 100',
    grades: '2–3',
    perColor: 1,
    values: (rng, k) => rng.sample(range(25, 85), k),
    cell: (rng, v) => addOrSub(rng, v, 99, 10),
  },
  {
    id: 'times',
    label: 'Times tables',
    grades: '3–4',
    perColor: 1,
    values: (rng, k) => rng.sample(PRODUCTS, k),
    cell: (rng, v) => {
      const pairs = range(2, 10).filter((a) => v % a === 0 && v / a >= 2 && v / a <= 10)
      const a = rng.pick(pairs)
      return `${a} × ${v / a}`
    },
  },
  {
    id: 'divide',
    label: 'Division facts',
    grades: '3–4',
    perColor: 1,
    values: (rng, k) => rng.sample(range(2, 10), k),
    cell: (rng, v) => {
      const d = rng.int(2, 10)
      return `${v * d} ÷ ${d}`
    },
  },
]

export const MODE = Object.fromEntries(MODES.map((m) => [m.id, m]))
export const PICTURE = Object.fromEntries(PICTURES.map((p, i) => [p.id, { ...p, number: i + 1, size: p.rows.length }]))

// Crayons used by a picture, most-used first.
export function crayonsOf(pic) {
  const count = {}
  for (const row of pic.rows) for (const ch of row) count[ch] = (count[ch] || 0) + 1
  return Object.keys(count).sort((a, b) => count[b] - count[a])
}

// Builds a page: the key (crayon → answers) and every square's problem.
export function buildPage(pic, mode, seed) {
  const rng = makeRng(seed)
  const crayons = rng.shuffle(crayonsOf(pic))
  const vals = mode.values(rng, crayons.length)
  const key = crayons.map((ch, i) => ({
    ch,
    ...CRAYONS[ch],
    values: vals.slice(i * mode.perColor, (i + 1) * mode.perColor).sort((a, b) => a - b),
  }))
  // number order reads best in the key
  key.sort((a, b) => a.values[0] - b.values[0])
  const byCh = Object.fromEntries(key.map((k) => [k.ch, k]))
  const cells = pic.rows.map((row) =>
    [...row].map((ch) => {
      const v = rng.pick(byCh[ch].values)
      return { ch, value: v, text: mode.cell(rng, v) }
    }),
  )
  return { key, cells }
}
