import { ANIMALS, COLORS, PLURAL } from './vocab.js'
import { B, CMP, cmp, fig, inline, lv, mc, num, choice } from './helpers.js'

const plural = (k) => PLURAL[k]

export default [
  {
    id: 'k-count',
    strand: 'Counting',
    title: 'Count the Critters',
    blurb: 'How many pigs, cows and chicks can you count?',
    art: 'pig',
    instructions: 'Count the animals. Write how many.',
    levels: ['1 to 5', '1 to 10', '1 to 10, mixed up', '11 to 20', '11 to 20, mixed up'],
    cols: 2,
    perPage: (l) => lv(l, [10, 8, 8, 6, 6]),
    gen(rng, level) {
      const kind = rng.pick(ANIMALS)
      const [lo, hi] = lv(level, [[1, 5], [1, 10], [3, 10], [11, 20], [11, 20]])
      const n = rng.int(lo, hi)
      const scatter = level === 3 || level === 5
      return {
        prompt: `How many ${plural(kind)}?`,
        figure: { type: 'critters', kind, count: n, scatter, seed: rng.int(1, 1e6), size: n > 10 ? 34 : scatter ? 36 : 42 },
        ...inline([B(0)], [num(n)]),
      }
    },
  },
  {
    id: 'k-ten-frame',
    strand: 'Counting',
    title: 'Ten Frames',
    blurb: 'Count the dots in a ten frame, and find how many more make 10.',
    glyph: '⁙',
    instructions: 'Look at the ten frame. Answer the question.',
    levels: ['How many? (to 10)', 'How many more to make 10?', 'Teen numbers (two frames)'],
    cols: 3,
    perPage: 9,
    gen(rng, level) {
      if (level === 1) {
        const n = rng.int(1, 10)
        return { prompt: 'How many dots?', figure: { type: 'tenFrame', filled: n }, ...inline([B(0)], [num(n)]) }
      }
      if (level === 2) {
        const n = rng.int(1, 9)
        return { prompt: 'How many more to make 10?', figure: { type: 'tenFrame', filled: n }, ...inline([n, '+', B(0), '=', 10], [num(10 - n)]) }
      }
      const n = rng.int(11, 20)
      return { prompt: 'How many dots?', figure: { type: 'tenFrame', filled: n, frames: 2, cell: 24 }, ...inline([B(0)], [num(n)]) }
    },
  },
  {
    id: 'k-count-on',
    strand: 'Counting',
    title: 'What Comes Next?',
    blurb: 'Number trains: fill in the numbers that are missing.',
    glyph: '1 2 _',
    instructions: 'Fill in the missing numbers.',
    levels: ['Next number to 10', 'Before and after to 20', 'Missing numbers to 50', 'Missing numbers to 100'],
    cols: 1,
    perPage: 12,
    gen(rng, level) {
      const hi = lv(level, [10, 20, 50, 100])
      const len = level === 1 ? 4 : 5
      const start = rng.int(level === 1 ? 1 : 0, hi - len + 1)
      const seq = Array.from({ length: len }, (_, i) => start + i)
      let holes
      if (level === 1) holes = [rng.int(1, len - 1)]
      else if (level === 2) holes = rng.bool() ? [0] : [len - 1]
      else holes = rng.sample([1, 2, 3, 4], 2).sort((a, b) => a - b)
      const answers = []
      const tokens = seq.map((v, i) => {
        if (!holes.includes(i)) return v
        answers.push(num(v))
        return B(answers.length - 1)
      })
      return inline(tokens, answers, { style: 'train' })
    },
  },
  {
    id: 'k-skip-count',
    strand: 'Counting',
    title: 'Skip Counting',
    blurb: 'Count by 10s, 5s and 2s. Hop, hop, hop!',
    art: 'frog',
    instructions: 'Skip count. Fill in the missing numbers.',
    levels: ['Count by 10s', 'Count by 5s', 'Count by 2s', 'Mixed: 2s, 5s, 10s'],
    cols: 1,
    perPage: 12,
    gen(rng, level) {
      const step = level === 4 ? rng.pick([2, 5, 10]) : lv(level, [10, 5, 2])
      const len = 6
      const maxStart = step === 2 ? 30 : step === 5 ? 60 : 50
      const start = step * rng.int(0, maxStart / step)
      const seq = Array.from({ length: len }, (_, i) => start + i * step)
      const holes = rng.sample([1, 2, 3, 4, 5], level === 1 ? 2 : 3).sort((a, b) => a - b)
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
    id: 'k-more-fewer',
    strand: 'Counting',
    title: 'More or Fewer?',
    blurb: 'Compare two groups of animals.',
    art: 'cow',
    instructions: 'Count each group. Circle the answer.',
    levels: ['Which has more? (to 5)', 'More or fewer? (to 10)', 'More, fewer or the same?'],
    cols: 2,
    perPage: 6,
    gen(rng, level) {
      const [a, b] = rng.sample(ANIMALS, 2)
      const hi = level === 1 ? 5 : 10
      let x = rng.int(1, hi)
      let y = rng.int(1, hi)
      if (level < 3) while (y === x) y = rng.int(1, hi)
      else if (rng.bool(0.25)) y = x
      const askFewer = level > 1 && rng.bool()
      const opts = [plural(a), plural(b)]
      let ans
      if (x === y) ans = 'the same'
      else ans = (askFewer ? x < y : x > y) ? plural(a) : plural(b)
      if (level === 3) opts.push('the same')
      return {
        figure: [
          { type: 'critters', kind: a, count: x, size: 30, perRow: 10 },
          { type: 'critters', kind: b, count: y, size: 30, perRow: 10 },
        ],
        ...mc(level === 3 ? `Are there ${askFewer ? 'fewer' : 'more'} ${plural(a)} or ${plural(b)}, or the same?` : `Which group has ${askFewer ? 'fewer' : 'more'}?`, opts, ans),
      }
    },
  },
  {
    id: 'k-compare',
    strand: 'Counting',
    title: 'Bigger Number',
    blurb: 'Which number is bigger? Meet the hungry < > signs.',
    glyph: '>',
    instructions: 'Compare the numbers.',
    levels: ['Bigger number to 10', 'Smaller number to 20', 'Use < > = to 10', 'Use < > = to 20'],
    cols: (l) => (l <= 2 ? 2 : 3),
    perPage: (l) => (l <= 2 ? 12 : 24),
    gen(rng, level) {
      const hi = level === 1 || level === 3 ? 10 : 20
      let a = rng.int(0, hi)
      let b = rng.int(0, hi)
      if (level <= 2) {
        while (a === b) b = rng.int(0, hi)
        const big = level === 1
        return mc(`Which number is ${big ? 'bigger' : 'smaller'}?`, [a, b], big ? Math.max(a, b) : Math.min(a, b))
      }
      if (rng.bool(0.15)) b = a
      return inline([a, B(0), b], [choice(CMP, cmp(a, b))])
    },
  },
  {
    id: 'k-add-pictures',
    strand: 'Addition',
    title: 'Adding with Pictures',
    blurb: 'Put two groups together. How many in all?',
    art: 'chick',
    instructions: 'Count the animals. Write how many in all.',
    levels: ['Sums to 5', 'Sums to 10'],
    cols: 2,
    perPage: 8,
    gen(rng, level) {
      const hi = level === 1 ? 5 : 10
      const s = rng.int(2, hi)
      const a = rng.int(1, s - 1)
      const b = s - a
      const k = rng.pick(ANIMALS)
      const g = (n) => fig('critters', { kind: k, count: n, size: 32, perRow: 5 })
      return inline([g(a), '+', g(b), '=', B(0)], [num(s)])
    },
  },
  {
    id: 'k-sub-pictures',
    strand: 'Subtraction',
    title: 'Taking Away',
    blurb: 'Some animals ran away! How many are left?',
    art: 'bunny',
    instructions: 'Cross out and count. How many are left?',
    levels: ['Within 5', 'Within 10'],
    cols: 2,
    perPage: 8,
    gen(rng, level) {
      const hi = level === 1 ? 5 : 10
      const a = rng.int(2, hi)
      const b = rng.int(1, a - 1)
      const k = rng.pick(ANIMALS)
      return {
        figure: { type: 'critters', kind: k, count: a, crossed: b, size: 38 },
        ...inline([a, '−', b, '=', B(0)], [num(a - b)]),
      }
    },
  },
  {
    id: 'k-add-10',
    strand: 'Addition',
    title: 'Addition to 10',
    blurb: 'Adding facts up to 10 — no pictures needed!',
    glyph: '+',
    instructions: 'Add.',
    levels: ['Add 0, 1 or 2', 'Sums to 5', 'Sums to 10', 'Missing number (to 10)'],
    cols: 3,
    perPage: 30,
    gen(rng, level) {
      if (level === 1) {
        const a = rng.int(0, 8)
        const b = rng.int(0, 2)
        return rng.bool() ? inline([a, '+', b, '=', B(0)], [num(a + b)]) : inline([b, '+', a, '=', B(0)], [num(a + b)])
      }
      const hi = level === 2 ? 5 : 10
      const s = rng.int(1, hi)
      const a = rng.int(0, s)
      if (level === 4) return rng.bool() ? inline([a, '+', B(0), '=', s], [num(s - a)]) : inline([B(0), '+', a, '=', s], [num(s - a)])
      return inline([a, '+', s - a, '=', B(0)], [num(s)])
    },
  },
  {
    id: 'k-sub-10',
    strand: 'Subtraction',
    title: 'Subtraction to 10',
    blurb: 'Take-away facts from 10 and under.',
    glyph: '−',
    instructions: 'Subtract.',
    levels: ['Take away 0, 1 or 2', 'Within 5', 'Within 10', 'Missing number (to 10)'],
    cols: 3,
    perPage: 30,
    gen(rng, level) {
      if (level === 1) {
        const a = rng.int(2, 10)
        const b = rng.int(0, 2)
        return inline([a, '−', b, '=', B(0)], [num(a - b)])
      }
      const hi = level === 2 ? 5 : 10
      const a = rng.int(1, hi)
      const b = rng.int(0, a)
      if (level === 4) return inline([a, '−', B(0), '=', a - b], [num(b)])
      return inline([a, '−', b, '=', B(0)], [num(a - b)])
    },
  },
  {
    id: 'k-bonds',
    strand: 'Addition',
    title: 'Number Bonds',
    blurb: 'Two parts make a whole. Find the missing part.',
    glyph: '⚬',
    instructions: 'Fill in the missing number in each number bond.',
    levels: ['Bonds to 5', 'Bonds to 10 (find a part)', 'Find the whole (to 10)', 'Mixed to 10'],
    cols: 3,
    perPage: 12,
    gen(rng, level) {
      const whole = level === 1 ? rng.int(2, 5) : rng.int(3, 10)
      const a = rng.int(1, whole - 1)
      const b = whole - a
      const missing = level === 3 ? 'whole' : level === 4 ? rng.pick(['whole', 'a', 'b']) : rng.pick(['a', 'b'])
      const ans = missing === 'whole' ? whole : missing === 'a' ? a : b
      return { body: { type: 'bond', whole, parts: [a, b], missing }, answers: [num(ans)] }
    },
  },
  {
    id: 'k-teens',
    strand: 'Place Value',
    title: 'Ten and Some More',
    blurb: 'Teen numbers are 10 and some ones.',
    glyph: '10+',
    instructions: 'Fill in the blanks.',
    levels: ['10 + ones = ?', '? = 10 + ?', 'Tens and ones with blocks'],
    cols: (l) => (l === 3 ? 2 : 3),
    perPage: (l) => (l === 3 ? 8 : 9),
    gen(rng, level) {
      const ones = rng.int(1, 9)
      const n = 10 + ones
      if (level === 1) return { figure: { type: 'tenFrame', filled: n, frames: 2, cell: 18 }, ...inline([10, '+', ones, '=', B(0)], [num(n)]) }
      if (level === 2) return inline([n, '=', 10, '+', B(0)], [num(ones)])
      return { figure: { type: 'baseTen', tens: 1, ones }, ...inline([B(0), 'ten', '+', B(1), 'ones', '=', B(2)], [num(1), num(ones), num(n)]) }
    },
  },
  {
    id: 'k-shapes',
    strand: 'Geometry',
    title: 'Name the Shape',
    blurb: 'Circles, squares, triangles and more.',
    glyph: '▲',
    instructions: 'Circle the name of each shape.',
    levels: ['Circle, square, triangle, rectangle', 'More shapes', 'How many sides?'],
    cols: 2,
    perPage: 8,
    gen(rng, level) {
      const basic = ['circle', 'square', 'triangle', 'rectangle']
      const more = [...basic, 'oval', 'hexagon', 'rhombus', 'star', 'heart', 'pentagon']
      const color = rng.pick(COLORS)
      if (level === 3) {
        const shape = rng.pick(['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'rhombus', 'circle'])
        const sides = { triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6, rhombus: 4, circle: 0 }[shape]
        return { prompt: 'How many sides?', figure: { type: 'shape', shape, color }, ...inline([B(0)], [num(sides)]) }
      }
      const pool = level === 1 ? basic : more
      const shape = rng.pick(pool)
      const opts = [shape, ...rng.sample(pool.filter((s) => s !== shape), 2)]
      return { figure: { type: 'shape', shape, color }, ...mc('What shape is this?', rng.shuffle(opts), shape) }
    },
  },
  {
    id: 'k-patterns',
    strand: 'Geometry',
    title: 'Patterns',
    blurb: 'Red, blue, red, blue… what comes next?',
    glyph: '●○●',
    instructions: 'What comes next? Circle the answer.',
    levels: ['AB color patterns', 'AB shape patterns', 'AAB and ABB patterns', 'ABC and AABB patterns'],
    cols: 1,
    perPage: 6,
    gen(rng, level) {
      const colors = COLORS
      const shapes = ['circle', 'square', 'triangle', 'star', 'heart', 'hexagon']
      const unit = lv(level, [['A', 'B'], ['A', 'B'], rng.pick([['A', 'A', 'B'], ['A', 'B', 'B']]), rng.pick([['A', 'B', 'C'], ['A', 'A', 'B', 'B']])])
      const letters = [...new Set(unit)]
      let items
      if (level === 1) {
        const shape = rng.pick(shapes)
        const cs = rng.sample(colors, letters.length)
        items = Object.fromEntries(letters.map((l, i) => [l, { shape, color: cs[i] }]))
      } else {
        const ss = rng.sample(shapes, letters.length)
        const cs = rng.sample(colors, letters.length)
        items = Object.fromEntries(letters.map((l, i) => [l, { shape: ss[i], color: cs[i] }]))
      }
      const len = unit.length * 2 + rng.int(1, unit.length)
      const seq = Array.from({ length: len }, (_, i) => items[unit[i % unit.length]])
      const next = items[unit[len % unit.length]]
      const key = (it) => `${it.color} ${it.shape}`
      const pool = Object.values(items)
      const extra = { shape: rng.pick(shapes.filter((s) => !pool.some((p) => p.shape === s))), color: rng.pick(colors) }
      const optsItems = rng.shuffle([...pool, ...(pool.length < 3 ? [extra] : [])])
      const optionFigs = Object.fromEntries(optsItems.map((it) => [key(it), { type: 'shape', ...it, size: 48 }]))
      return {
        figure: { type: 'pattern', items: [...seq, null] },
        ...mc('What comes next?', optsItems.map(key), key(next), { optionFigs }),
      }
    },
  },
]
