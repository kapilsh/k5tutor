import gradeK from './gradeK.js'
import grade1 from './grade1.js'
import grade2 from './grade2.js'
import grade3 from './grade3.js'
import grade4 from './grade4.js'
import grade5 from './grade5.js'
import { makeRng } from '../lib/rng.js'

export const GRADES = [
  { id: 'k', label: 'Kindergarten', short: 'K', art: 'pig', color: 'var(--g-k)', blurb: 'Counting, shapes, and adding & taking away to 10.', topics: gradeK },
  { id: '1', label: 'Grade 1', short: '1', art: 'chick', color: 'var(--g-1)', blurb: 'Facts to 20, tens and ones, time and coins.', topics: grade1 },
  { id: '2', label: 'Grade 2', short: '2', art: 'frog', color: 'var(--g-2)', blurb: 'Regrouping, place value to 1,000, money and measuring.', topics: grade2 },
  { id: '3', label: 'Grade 3', short: '3', art: 'bunny', color: 'var(--g-3)', blurb: 'Times tables, division, fractions, area and perimeter.', topics: grade3 },
  { id: '4', label: 'Grade 4', short: '4', art: 'bear', color: 'var(--g-4)', blurb: 'Long division, multi-digit multiplication, fractions and decimals.', topics: grade4 },
  { id: '5', label: 'Grade 5', short: '5', art: 'cat', color: 'var(--g-5)', blurb: 'Fraction and decimal operations, volume and coordinates.', topics: grade5 },
]

export const TOPICS = Object.fromEntries(
  GRADES.flatMap((g) => g.topics.map((t, i) => [t.id, { ...t, grade: g.id, gradeLabel: g.label, order: i }])),
)

export const valueFor = (x, level) => (typeof x === 'function' ? x(level) : x)

// Problems are keyed by what they show so a sheet never repeats one.
const keyOf = (p) => JSON.stringify([p.prompt, p.body, p.figure && stripSeeds(p.figure), p.answers])
const stripSeeds = (f) => (Array.isArray(f) ? f.map(stripSeeds) : { ...f, seed: undefined })

export function generateProblem(topic, level, seed) {
  return topic.gen(makeRng(seed), level)
}

// A worksheet: `count` problems at `level`, or ramping from level 1 up to the
// top level across the sheet when level === 'mix'.
export function generateSheet(topic, level, count, seed) {
  const rng = makeRng(seed)
  const top = topic.levels.length
  const out = []
  const seen = new Set()
  for (let i = 0; i < count; i++) {
    const lvl = level === 'mix' ? Math.min(top, 1 + Math.floor((i * top) / count)) : level
    let p
    for (let tries = 0; tries < 60; tries++) {
      p = topic.gen(makeRng(rng.int(1, 2 ** 31)), lvl)
      if (!seen.has(keyOf(p))) break
    }
    seen.add(keyOf(p))
    out.push({ ...p, level: lvl })
  }
  return out
}

export function layoutFor(topic, level) {
  // In a ramped sheet use the tightest level's layout so everything fits.
  if (level === 'mix') {
    const lvls = topic.levels.map((_, i) => i + 1)
    const cols = Math.min(...lvls.map((l) => valueFor(topic.cols, l)))
    const rows = Math.min(...lvls.map((l) => Math.floor(valueFor(topic.perPage, l) / valueFor(topic.cols, l))))
    return { cols, perPage: cols * rows }
  }
  return { cols: valueFor(topic.cols, level), perPage: valueFor(topic.perPage, level) }
}

export function nextTopic(topicId) {
  const t = TOPICS[topicId]
  const g = GRADES.find((x) => x.id === t.grade)
  const i = g.topics.findIndex((x) => x.id === topicId)
  if (i < g.topics.length - 1) return TOPICS[g.topics[i + 1].id]
  const gi = GRADES.indexOf(g)
  return gi < GRADES.length - 1 ? TOPICS[GRADES[gi + 1].topics[0].id] : null
}
