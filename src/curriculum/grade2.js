import { ANIMALS, PLURAL } from './vocab.js'
import { addPair, subPair } from './arith.js'
import { B, CMP, NAMES, choice, cmp, inline, lv, mc, num, options, time, vertical } from './helpers.js'
import { money } from '../lib/math.js'

export default [
  {
    id: 'g2-add-2digit',
    strand: 'Addition',
    title: '2-Digit Addition',
    blurb: 'Column addition with and without regrouping.',
    glyph: '+',
    instructions: 'Add. Remember to regroup (carry) when you need to.',
    levels: ['No regrouping', 'With regrouping', 'Mixed', 'Three numbers', 'In your head (row form)'],
    cols: (l) => (l === 5 ? 3 : 5),
    perPage: (l) => (l === 5 ? 30 : 25),
    gen(rng, level) {
      if (level === 4) {
        const [a, b, c] = [rng.int(10, 49), rng.int(10, 29), rng.int(10, 29)]
        return { body: { type: 'vertical', rows: [String(a), String(b), String(c)], op: '+' }, answers: [num(a + b + c)] }
      }
      const [a, b] = addPair(rng, 2, 2, lv(level, ['none', 'yes', 'any', 'any', 'any']))
      if (level === 5) return inline([a, '+', b, '=', B(0)], [num(a + b)])
      return vertical([a, b], '+', num(a + b))
    },
  },
  {
    id: 'g2-sub-2digit',
    strand: 'Subtraction',
    title: '2-Digit Subtraction',
    blurb: 'Column subtraction with and without borrowing.',
    glyph: '−',
    instructions: 'Subtract. Regroup (borrow) when you need to.',
    levels: ['No regrouping', 'With regrouping', 'Mixed', 'In your head (row form)'],
    cols: (l) => (l === 4 ? 3 : 5),
    perPage: (l) => (l === 4 ? 30 : 25),
    gen(rng, level) {
      const [a, b] = subPair(rng, 2, 2, lv(level, ['none', 'yes', 'any', 'any']))
      if (level === 4) return inline([a, '−', b, '=', B(0)], [num(a - b)])
      return vertical([a, b], '−', num(a - b))
    },
  },
  {
    id: 'g2-3digit',
    strand: 'Addition',
    title: '3-Digit Add & Subtract',
    blurb: 'Hundreds, tens and ones in columns.',
    glyph: '±',
    instructions: 'Add or subtract. Watch the signs!',
    levels: ['Add, no regrouping', 'Add with regrouping', 'Subtract, no regrouping', 'Subtract with regrouping', 'Subtract across zeros', 'Mixed'],
    cols: 5,
    perPage: 25,
    gen(rng, level) {
      const L = level === 6 ? rng.int(2, 5) : level
      if (L <= 2) {
        let [a, b] = addPair(rng, 3, 3, L === 1 ? 'none' : 'yes')
        if (a + b > 999) b = 999 - a
        return vertical([a, b], '+', num(a + b))
      }
      const [a, b] = subPair(rng, 3, rng.pick([2, 3]), L === 3 ? 'none' : 'yes', { acrossZero: L === 5 })
      return vertical([a, b], '−', num(a - b))
    },
  },
  {
    id: 'g2-place-value',
    strand: 'Place Value',
    title: 'Hundreds, Tens, Ones',
    blurb: 'Place value up to 1,000 with base-ten blocks.',
    glyph: '100',
    instructions: 'Answer each place value question.',
    levels: ['Blocks to number', 'Hundreds, tens, ones', 'Expanded form', 'Value of a digit'],
    cols: (l) => (l === 1 ? 2 : l === 4 ? 2 : 1),
    perPage: (l) => (l === 1 ? 6 : 12),
    gen(rng, level) {
      const h = rng.int(1, level === 1 ? 3 : 9)
      const t = rng.int(0, 9)
      const o = rng.int(0, 9)
      const n = h * 100 + t * 10 + o
      if (level === 1) return { figure: { type: 'baseTen', hundreds: h, tens: t, ones: o, u: 4.5 }, ...inline(['The number is', B(0)], [num(n)]) }
      if (level === 2) return inline([n, '=', B(0), 'hundreds', B(1), 'tens', B(2), 'ones'], [num(h), num(t), num(o)])
      if (level === 3) return inline([n, '=', B(0), '+', B(1), '+', B(2)], [num(h * 100), num(t * 10), num(o)])
      const pos = rng.int(0, 2)
      const digit = String(n)[pos]
      const value = Number(digit) * 10 ** (2 - pos)
      return { prompt: 'What is the value of the underlined digit?', ...inline([{ digits: String(n), mark: pos }, '→', B(0)], [num(value)]) }
    },
  },
  {
    id: 'g2-compare-1000',
    strand: 'Place Value',
    title: 'Compare to 1,000',
    blurb: 'Compare 3-digit numbers with <, > and =.',
    glyph: '<>',
    instructions: 'Write <, > or = in each circle.',
    levels: ['Different hundreds', 'Same hundreds', 'Mixed'],
    cols: 3,
    perPage: 30,
    gen(rng, level) {
      const a = rng.int(100, 999)
      let b
      const L = level === 3 ? rng.int(1, 2) : level
      if (L === 1) b = rng.int(100, 999)
      else b = Math.floor(a / 100) * 100 + rng.int(0, 99)
      if (rng.bool(0.1)) b = a
      return inline([a, B(0), b], [choice(CMP, cmp(a, b))])
    },
  },
  {
    id: 'g2-skip-count',
    strand: 'Counting',
    title: 'Skip Counting by 5, 10, 100',
    blurb: 'Big hops! Count by 5s, 10s and 100s.',
    art: 'frog',
    instructions: 'Skip count. Fill in the missing numbers.',
    levels: ['By 5s', 'By 10s from any number', 'By 100s', 'By 3s and 4s'],
    cols: 1,
    perPage: 12,
    gen(rng, level) {
      const step = level === 4 ? rng.pick([3, 4]) : lv(level, [5, 10, 100])
      let start
      if (step === 5) start = 5 * rng.int(0, 150)
      else if (step === 10) start = rng.int(1, 900)
      else if (step === 100) start = rng.bool() ? 100 * rng.int(0, 4) : rng.int(1, 400)
      else start = step * rng.int(0, 5)
      const seq = Array.from({ length: 6 }, (_, i) => start + i * step)
      const holes = rng.sample([1, 2, 3, 4, 5], 3).sort((a, b) => a - b)
      const answers = []
      const tokens = seq.map((v, i) => {
        if (!holes.includes(i)) return v
        answers.push(num(v))
        return B(answers.length - 1)
      })
      return { prompt: `Count by ${step}s.`, ...inline(tokens, answers, { style: 'train' }) }
    },
  },
  {
    id: 'g2-even-odd',
    strand: 'Counting',
    title: 'Even and Odd',
    blurb: 'Can everyone get a partner? Even or odd!',
    art: 'ladybug',
    instructions: 'Is the number even or odd? Circle the answer.',
    levels: ['Pairs of pictures', 'Numbers to 20', 'Numbers to 100'],
    cols: (l) => (l === 1 ? 2 : 3),
    perPage: (l) => (l === 1 ? 6 : 18),
    gen(rng, level) {
      if (level === 1) {
        const n = rng.int(2, 12)
        const kind = rng.pick(ANIMALS)
        return { figure: { type: 'critters', kind, count: n, perRow: 2, size: 24 }, ...mc(`${n} ${PLURAL[kind]}: even or odd?`, ['even', 'odd'], n % 2 ? 'odd' : 'even') }
      }
      const n = level === 2 ? rng.int(0, 20) : rng.int(21, 99)
      return mc(`${n}`, ['even', 'odd'], n % 2 ? 'odd' : 'even')
    },
  },
  {
    id: 'g2-time',
    strand: 'Measurement',
    title: 'Time to 5 Minutes',
    blurb: 'Read the clock to the nearest five minutes.',
    glyph: '🕓',
    instructions: 'Write the time shown on each clock.',
    levels: ['Quarter hours', 'Five minutes', 'Five minutes (mixed)'],
    cols: 3,
    perPage: 12,
    gen(rng, level) {
      const h = rng.int(1, 12)
      const m = level === 1 ? rng.pick([0, 15, 30, 45]) : 5 * rng.int(level === 2 ? 1 : 0, 11)
      return { figure: { type: 'clock', h, m, size: 120 }, ...inline([B(0)], [time(h, m)]) }
    },
  },
  {
    id: 'g2-money',
    strand: 'Measurement',
    title: 'Counting Money',
    blurb: 'Quarters, dimes, nickels, pennies and dollar bills.',
    glyph: '$',
    instructions: 'Count the money. Write the total.',
    levels: ['Dimes, nickels, pennies', 'With quarters', 'Dollars and cents'],
    cols: (l) => (l === 3 ? 1 : 2),
    perPage: (l) => (l === 3 ? 8 : 10),
    gen(rng, level) {
      const q = level >= 2 ? rng.int(1, 3) : 0
      const d = rng.int(0, 3)
      const n = rng.int(0, 2)
      const p = rng.int(0, 4)
      const bills = level === 3 ? rng.int(1, 3) : 0
      const coins = [...Array(q).fill('q'), ...Array(d).fill('d'), ...Array(n).fill('n'), ...Array(p).fill('p')]
      if (!coins.length) coins.push('d')
      const cents = coins.reduce((s, c) => s + { q: 25, d: 10, n: 5, p: 1 }[c], 0) + 100 * bills
      if (level === 3) return { figure: { type: 'coins', coins, bills }, ...inline(['$', B(0)], [num(cents / 100, { display: money(cents).slice(1) })]) }
      return { figure: { type: 'coins', coins }, ...inline([B(0), '¢'], [num(cents)]) }
    },
  },
  {
    id: 'g2-measure',
    strand: 'Measurement',
    title: 'Measure Length',
    blurb: 'Use a ruler to measure in inches and centimeters.',
    glyph: '📏',
    instructions: 'How long is each object?',
    levels: ['Inches', 'Centimeters', 'How much longer?'],
    cols: 1,
    perPage: 5,
    gen(rng, level) {
      const unit = level === 2 ? 'cm' : level === 3 ? rng.pick(['in', 'cm']) : 'in'
      const max = unit === 'in' ? 6 : 12
      const object = rng.pick(['pencil', 'crayon', 'worm'])
      const length = rng.int(2, max)
      const uname = unit === 'in' ? 'inches' : 'centimeters'
      if (level === 3) {
        const other = rng.int(1, length - 1 || 1)
        return {
          figure: { type: 'ruler', length, max, unit, object },
          prompt: `A ${other === 1 ? 'bead' : 'string'} is ${other} ${uname} long. How much longer is the ${object} than the ${other === 1 ? 'bead' : 'string'}?`,
          ...inline([B(0), uname], [num(length - other)]),
        }
      }
      return { figure: { type: 'ruler', length, max, unit, object }, prompt: `How long is the ${object}?`, ...inline([B(0), uname], [num(length)]) }
    },
  },
  {
    id: 'g2-arrays',
    strand: 'Multiplication',
    title: 'Arrays',
    blurb: 'Rows and columns — the start of multiplication.',
    art: 'ladybug',
    instructions: 'Look at the array. Fill in the blanks.',
    levels: ['Rows and columns', 'Repeated addition'],
    cols: 2,
    perPage: 6,
    gen(rng, level) {
      const r = rng.int(2, 5)
      const c = rng.int(2, 5)
      const kind = rng.bool() ? rng.pick(ANIMALS) : undefined
      const figure = { type: 'array', rows: r, cols: c, kind }
      if (level === 1) return { figure, ...inline([B(0), 'rows of', B(1), '=', B(2)], [num(r), num(c), num(r * c)]) }
      const tokens = []
      for (let i = 0; i < r; i++) tokens.push(...(i ? ['+'] : []), c)
      return { figure, prompt: 'Add the rows.', ...inline([...tokens, '=', B(0)], [num(r * c)]) }
    },
  },
  {
    id: 'g2-word-problems',
    strand: 'Word Problems',
    title: 'Story Problems to 100',
    blurb: 'One- and two-step stories with bigger numbers.',
    art: 'cow',
    instructions: 'Read each story. Write the answer.',
    levels: ['One step', 'Compare (how many more / fewer)', 'Two steps'],
    cols: 1,
    perPage: 8,
    gen(rng, level) {
      const [x, y] = rng.sample(NAMES, 2)
      const k = rng.pick(ANIMALS)
      const pl = PLURAL[k]
      if (level === 1) {
        if (rng.bool()) {
          const a = rng.int(10, 89)
          const b = rng.int(10, 99 - a < 10 ? 10 : 99 - a)
          return { prompt: `A farm has ${a} ${pl}. It gets ${b} more. How many ${pl} does the farm have now?`, ...inline([B(0)], [num(a + b)]) }
        }
        const [a, b] = subPair(rng, 2, 2, 'any')
        return { prompt: `There were ${a} ${pl} in the meadow. ${b} walked home. How many ${pl} are still in the meadow?`, ...inline([B(0)], [num(a - b)]) }
      }
      if (level === 2) {
        const [a, b] = subPair(rng, 2, 2, 'any')
        if (a === b) return { prompt: `${x} read ${a} pages. ${y} read ${b} pages. How many more pages did ${x} read?`, ...inline([B(0)], [num(0)]) }
        return rng.bool()
          ? { prompt: `${x} collected ${a} shells. ${y} collected ${b} shells. How many more shells did ${x} collect than ${y}?`, ...inline([B(0)], [num(a - b)]) }
          : { prompt: `${y} has ${b} stickers. ${y} has ${a - b} fewer stickers than ${x}. How many stickers does ${x} have?`, ...inline([B(0)], [num(a)]) }
      }
      const a = rng.int(20, 60)
      const b = rng.int(5, 30)
      const c = rng.int(5, Math.min(a + b - 1, 40))
      return { prompt: `${x} had ${a} marbles. ${x} won ${b} more, then gave ${c} to ${y}. How many marbles does ${x} have now?`, ...inline([B(0)], [num(a + b - c)]) }
    },
  },
  {
    id: 'g2-bar-graph',
    strand: 'Data',
    title: 'Bar Graphs',
    blurb: 'Read bar graphs and answer questions.',
    glyph: '▥',
    instructions: 'Use the bar graph to answer the question.',
    levels: ['How many?', 'How many more / fewer?', 'Total of two bars'],
    cols: 2,
    perPage: 4,
    gen(rng, level) {
      const fruits = rng.sample(['Apple', 'Banana', 'Grape', 'Pear', 'Peach', 'Kiwi'], 4)
      const bars = fruits.map((label) => ({ label, value: rng.int(1, 10) }))
      const figure = { type: 'bars', bars, max: 10, step: 1, title: 'Favorite Fruit' }
      const [p, q] = rng.sample(bars, 2)
      if (level === 1) return { figure, prompt: `How many children chose ${p.label}?`, ...inline([B(0)], [num(p.value)]) }
      if (level === 2) {
        if (p.value === q.value) q.value = p.value === 10 ? 9 : p.value + 1
        const [big, small] = p.value > q.value ? [p, q] : [q, p]
        return { figure, prompt: `How many more chose ${big.label} than ${small.label}?`, ...inline([B(0)], [num(big.value - small.value)]) }
      }
      return { figure, prompt: `How many chose ${p.label} or ${q.label}?`, ...inline([B(0)], [num(p.value + q.value)]) }
    },
  },
  {
    id: 'g2-shapes',
    strand: 'Geometry',
    title: 'Polygons',
    blurb: 'Triangles, quadrilaterals, pentagons and hexagons.',
    glyph: '⬠',
    instructions: 'Circle the name of each shape.',
    levels: ['Name the polygon', 'Sides and vertices'],
    cols: 2,
    perPage: 8,
    gen(rng, level) {
      const names = { triangle: 'triangle', square: 'quadrilateral', rectangle: 'quadrilateral', rhombus: 'quadrilateral', trapezoid: 'quadrilateral', pentagon: 'pentagon', hexagon: 'hexagon', octagon: 'octagon' }
      const sides = { triangle: 3, quadrilateral: 4, pentagon: 5, hexagon: 6, octagon: 8 }
      const shape = rng.pick(Object.keys(names))
      const color = rng.pick(['red', 'blue', 'yellow', 'green', 'purple', 'orange'])
      if (level === 1) {
        const all = ['triangle', 'quadrilateral', 'pentagon', 'hexagon', 'octagon']
        return { figure: { type: 'shape', shape, color }, ...mc('What is this polygon called?', options(rng, names[shape], all.filter((x) => x !== names[shape])), names[shape]) }
      }
      const n = sides[names[shape]]
      return { figure: { type: 'shape', shape, color }, ...inline([B(0), 'sides', B(1), 'vertices'], [num(n), num(n)]) }
    },
  },
  {
    id: 'g2-fractions',
    strand: 'Fractions',
    title: 'Halves, Thirds, Fourths',
    blurb: 'Name the equal parts of a shape.',
    glyph: '⅓',
    instructions: 'How much is shaded? Circle the answer.',
    levels: ['One part', 'More than one part'],
    cols: 2,
    perPage: 8,
    gen(rng, level) {
      const parts = rng.pick([2, 3, 4])
      const shaded = level === 1 ? 1 : rng.int(1, parts - 1)
      const shape = rng.pick(['circle', 'rect', 'bar'])
      const word = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['fourth', 'fourths'] }
      const nums = ['zero', 'one', 'two', 'three']
      const label = (s, p) => `${nums[s]} ${s === 1 ? word[p][0] : word[p][1]}`
      const opts = new Set([label(shaded, parts)])
      for (const p of rng.shuffle([2, 3, 4])) for (let s = 1; s < p; s++) if (opts.size < 3 && (level > 1 || s === 1)) opts.add(label(s, p))
      return { figure: { type: 'fraction', shape, parts, shaded }, ...mc('How much is shaded?', rng.shuffle([...opts]), label(shaded, parts)) }
    },
  },
]
