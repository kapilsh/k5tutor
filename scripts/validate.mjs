// Generates many problems for every topic × level and checks that each one is
// well-formed: every answer is referenced by exactly one blank, the correct
// answer typed into the UI's fields is accepted, choices contain the answer,
// figures exist, and each level can fill a page without repeats.
import { GRADES, TOPICS, generateSheet, layoutFor, valueFor } from '../src/curriculum/index.js'
import { assemble, checkAnswer, fieldsOf, partsOf } from '../src/lib/answers.js'
import { makeRng } from '../src/lib/rng.js'
import { CRAYONS, PICTURES } from '../src/coloring/pictures.js'
import { MODES, buildPage, crayonsOf } from '../src/coloring/modes.js'

const FIG_TYPES = new Set(['critters', 'critter', 'tenFrame', 'baseTen', 'array', 'groups', 'clock', 'coins', 'ruler', 'angle', 'fraction', 'numberLine', 'decimalGrid', 'shape', 'pattern', 'rect', 'prism', 'coord', 'pictograph', 'bars', 'digital', 'sky', 'dice', 'track', 'board', 'chessPiece', 'ticTacToe', 'sudoku'])
const SAMPLES = 400
let errors = 0
const fail = (t, lvl, msg, p) => {
  errors++
  if (errors <= 40) console.error(`✗ ${t.id} L${lvl}: ${msg}\n   ${JSON.stringify(p).slice(0, 300)}`)
}

function blanksIn(node, acc = []) {
  if (Array.isArray(node)) node.forEach((n) => blanksIn(n, acc))
  else if (node && typeof node === 'object') {
    if (typeof node.blank === 'number' && !('type' in node)) acc.push(node.blank)
    for (const [k, v] of Object.entries(node)) if (k !== 'blank' && k !== 'fig') blanksIn(v, acc)
  }
  return acc
}

function figsIn(p) {
  const out = []
  const f = p.figure ? (Array.isArray(p.figure) ? p.figure : [p.figure]) : []
  out.push(...f)
  const walk = (n) => {
    if (Array.isArray(n)) n.forEach(walk)
    else if (n && typeof n === 'object') {
      if (n.fig) out.push(n.fig)
      Object.values(n).forEach(walk)
    }
  }
  walk(p.body)
  for (const a of p.answers || []) if (a.optionFigs) out.push(...Object.values(a.optionFigs))
  return out
}

let total = 0
for (const g of GRADES) {
  for (const t0 of g.topics) {
    const t = TOPICS[t0.id]
    for (const k of ['id', 'title', 'blurb', 'instructions', 'levels', 'gen', 'strand']) if (!t[k]) fail(t, 0, `missing ${k}`, {})
    t.levels.forEach((_, li) => {
      const lvl = li + 1
      const keys = new Set()
      for (let s = 1; s <= SAMPLES; s++) {
        total++
        let p
        try {
          p = t.gen(makeRng(s * 7919 + lvl), lvl)
        } catch (e) {
          fail(t, lvl, `threw ${e.message}`, {})
          continue
        }
        const json = JSON.stringify(p)
        keys.add(json.replace(/"seed":\d+,?/g, ''))
        if (/null|NaN|Infinity|undefined/.test(json.replace(/"items":\[[^\]]*\]/g, ''))) fail(t, lvl, 'null/NaN in problem', p)
        if (!p.body || !p.answers?.length) {
          fail(t, lvl, 'no body/answers', p)
          continue
        }
        // blanks ↔ answers
        let refs
        if (p.body.type === 'vertical' || p.body.type === 'bond' || p.body.type === 'choices') refs = [0]
        else if (p.body.type === 'longdiv') refs = p.answers.map((_, i) => i)
        else refs = blanksIn(p.body.tokens)
        const sorted = [...refs].sort((a, b) => a - b)
        if (sorted.join() !== p.answers.map((_, i) => i).join()) fail(t, lvl, `blanks ${sorted} vs ${p.answers.length} answers`, p)
        for (const f of figsIn(p)) if (!FIG_TYPES.has(f.type)) fail(t, lvl, `unknown figure ${f.type}`, p)
        p.answers.forEach((a, i) => {
          if (a.kind === 'choice') {
            if (!a.options.includes(a.value)) fail(t, lvl, `choice ${i} missing answer`, p)
            if (new Set(a.options).size !== a.options.length) fail(t, lvl, `duplicate options`, p)
            if (a.options.length < 2) fail(t, lvl, `too few options`, p)
            return
          }
          if (a.kind === 'number' && !Number.isFinite(a.value)) fail(t, lvl, `bad number`, p)
          if (a.kind === 'number' && a.value < 0) fail(t, lvl, `negative answer`, p)
          if (a.kind === 'fraction' && (!a.d || a.d < 0)) fail(t, lvl, `bad fraction`, p)
          const parts = partsOf(a)
          for (const k of Object.keys(parts)) if (!fieldsOf(a).includes(k)) fail(t, lvl, `part ${k} not a field`, p)
          if (!checkAnswer(a, assemble(a, parts))) fail(t, lvl, `correct answer ${JSON.stringify(parts)} rejected`, p)
        })
      }
      // Small fact pools (e.g. doubles) may repeat on a sheet; flag only very thin ones.
      const need = valueFor(t.perPage, lvl)
      if (keys.size < need / 2) fail(t, lvl, `only ${keys.size} distinct problems for ${need} per page`, {})
      else if (keys.size < need && process.argv.includes('--verbose')) console.warn(`  ${t.id} L${lvl}: ${keys.size} distinct for ${need} per page (repeats allowed)`)
    })
    // sheets build in both modes
    for (const level of [1, 'mix']) {
      const { perPage } = layoutFor(t, level)
      const sheet = generateSheet(t, level, perPage, 42)
      if (sheet.length !== perPage) fail(t, level, 'sheet length', {})
    }
  }
}

// answer-checker spot checks
const spot = [
  [{ kind: 'number', value: 1250 }, '1,250', true],
  [{ kind: 'number', value: 0.5 }, '.5', true],
  [{ kind: 'fraction', n: 3, d: 4 }, '6/8', true],
  [{ kind: 'fraction', n: 3, d: 4, simplest: true }, '6/8', false],
  [{ kind: 'fraction', n: 7, d: 4, mixed: true }, '1 3/4', true],
  [{ kind: 'fraction', n: 7, d: 4, mixed: true, mixedOnly: true }, '7/4', false],
  [{ kind: 'time', h: 3, m: 5 }, '3:05', true],
  [{ kind: 'time', h: 3, m: 5 }, '3:5', true],
  [{ kind: 'point', x: 3, y: 5 }, '(3, 5)', true],
  [{ kind: 'point', x: 3, y: 5 }, '(5, 3)', false],
]
for (const [spec, raw, want] of spot) {
  if (checkAnswer(spec, raw) !== want) {
    errors++
    console.error(`✗ checkAnswer(${JSON.stringify(spec)}, ${raw}) should be ${want}`)
  }
}

// CIE76 color difference; ~40+ reads as clearly different colors.
function deltaE(h1, h2) {
  const lab = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92))
    const [x, y, z] = [[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]].map((r) => r[0] * c[0] + r[1] * c[1] + r[2] * c[2])
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
    const [fx, fy, fz] = [f(x / 0.95047), f(y), f(z / 1.08883)]
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
  }
  const [a, b] = [lab(h1), lab(h2)]
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

// mystery pictures: every square's problem must equal an answer of its crayon
const evalCell = (t) => {
  const m = t.match(/^(\d+)(?: ([+−×÷]) (\d+))?$/)
  if (!m) return NaN
  const [, a, op, b] = m
  return !op ? +a : op === '+' ? +a + +b : op === '−' ? a - b : op === '×' ? a * b : a / b
}
for (const pic of PICTURES) {
  const n = pic.rows.length
  const bad = (msg) => {
    errors++
    console.error(`✗ picture ${pic.id}: ${msg}`)
  }
  if (pic.rows.some((r) => r.length !== n)) bad('not square')
  if (pic.rows.join('').split('').some((ch) => !CRAYONS[ch])) bad('unknown crayon')
  if (crayonsOf(pic).length > 6) bad('more than 6 crayons')
  const cs = crayonsOf(pic)
  for (let i = 0; i < cs.length; i++)
    for (let j = i + 1; j < cs.length; j++) {
      const d = deltaE(CRAYONS[cs[i]].hex, CRAYONS[cs[j]].hex)
      if (d < 40) bad(`${CRAYONS[cs[i]].name} and ${CRAYONS[cs[j]].name} look too alike (ΔE ${d.toFixed(0)})`)
    }
  for (const mode of MODES) {
    for (let s = 1; s <= 60; s++) {
      const { key, cells } = buildPage(pic, mode, s)
      const all = key.flatMap((k) => k.values)
      if (new Set(all).size !== all.length) bad(`${mode.id}: answers shared between crayons`)
      const of = Object.fromEntries(key.map((k) => [k.ch, k.values]))
      for (const c of cells.flat()) {
        const v = evalCell(c.text)
        if (v !== c.value || !of[c.ch].includes(v) || !Number.isInteger(v) || v < 0) bad(`${mode.id}: "${c.text}" should be ${c.value} for ${c.ch}`)
      }
    }
  }
}

const topics = Object.keys(TOPICS).length
const levels = Object.values(TOPICS).reduce((s, t) => s + t.levels.length, 0)
if (errors) {
  console.error(`\n${errors} problem(s) found across ${total} generated problems`)
  process.exit(1)
}
console.log(`✓ ${topics} topics, ${levels} levels, ${total} problems generated, ${PICTURES.length} mystery pictures × ${MODES.length} modes — all valid`)
