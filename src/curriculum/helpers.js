// Builders for the problem shape rendered by components/Problem.jsx.
//
// problem = {
//   prompt?:  string                       question text above the work
//   figure?:  fig | fig[]                  pictures above the work (see figures/Figure.jsx)
//   body:     { type: 'inline', tokens, style? }       3 + 4 = [ ]
//           | { type: 'vertical', rows, op }           column arithmetic, answer 0 below
//           | { type: 'longdiv', divisor, dividend }   answers: quotient [, remainder]
//           | { type: 'choices' }                      answers[0] is a choice
//           | { type: 'bond', whole, parts, missing }  number bond, answer 0 in the missing circle
//   answers:  answer spec[] (see lib/answers.js)
// }
// Inline tokens: strings/numbers, B(i) blanks, F(n, d) fractions (n or d may be a blank),
// MX(w, n, d) mixed numbers, fig(type, props) pictures, { digits, mark } underlined digit.

export const num = (value, extra) => ({ kind: 'number', value, ...extra })
export const frac = (n, d, extra) => ({ kind: 'fraction', n, d, ...extra })
export const time = (h, m) => ({ kind: 'time', h, m })
export const point = (x, y) => ({ kind: 'point', x, y })
export const choice = (options, value, optionFigs) => ({ kind: 'choice', options: options.map(String), value: String(value), ...(optionFigs ? { optionFigs } : {}) })

export const B = (i = 0) => ({ blank: i })
export const F = (n, d) => ({ frac: [n, d] })
export const MX = (w, n, d) => ({ mixed: [w, n, d] })
export const fig = (type, props) => ({ fig: { type, ...props } })
export const BR = { br: true }

export const inline = (tokens, answers, extra = {}) => ({ body: { type: 'inline', tokens, ...(extra.style ? { style: extra.style } : {}) }, answers, ...omit(extra, 'style') })
export const vertical = (rows, op, answer, extra = {}) => ({ body: { type: 'vertical', rows: rows.map(String), op }, answers: [answer], ...extra })
export const mc = (prompt, options, value, extra = {}) => ({ prompt, body: { type: 'choices' }, answers: [choice(options, value, extra.optionFigs)], ...omit(extra, 'optionFigs') })
// With withRemainder the R box is always shown (so it doesn't give away which
// problems divide evenly); a remainder of 0 may be left blank.
export const longdiv = (dividend, divisor, withRemainder = true) => {
  const q = Math.floor(dividend / divisor)
  const r = dividend % divisor
  return {
    body: { type: 'longdiv', divisor, dividend },
    answers: withRemainder ? [num(q), num(r, r === 0 ? { emptyOk: true } : {})] : [num(q)],
  }
}

function omit(o, k) {
  const { [k]: _drop, ...rest } = o
  return rest
}

export const cmp = (a, b) => (a > b ? '>' : a < b ? '<' : '=')
export const CMP = ['<', '=', '>']

// Unique choice options that include the right answer, shuffled.
export function options(rng, correct, distractors, n = 4) {
  const seen = new Set([String(correct)])
  const out = [correct]
  for (const d of rng.shuffle(distractors)) {
    if (out.length >= n) break
    if (!seen.has(String(d))) {
      seen.add(String(d))
      out.push(d)
    }
  }
  return rng.shuffle(out)
}

// Numeric distractors near the answer (off-by-one, off-by-ten, swapped digits …).
export function nearMisses(rng, v, spread = [1, 2, 10]) {
  const out = []
  for (const s of spread) out.push(v + s, v - s)
  return rng.shuffle(out.filter((x) => x >= 0 && x !== v))
}

// Level-dependent pick: lv(level, [a, b, c]) → value for level (clamped).
export const lv = (level, arr) => arr[Math.min(level, arr.length) - 1]

export const NAMES = ['Mia', 'Leo', 'Ava', 'Sam', 'Zoe', 'Max', 'Ivy', 'Ben', 'Nora', 'Eli', 'Ruby', 'Omar', 'Lily', 'Jay', 'Priya', 'Kai']
