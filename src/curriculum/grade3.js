import { ANIMALS, PLURAL } from './vocab.js'
import { addPair, subPair } from './arith.js'
import { B, CMP, F, NAMES, choice, cmp, frac, inline, lv, num, time, vertical } from './helpers.js'

const FACT_TABLES = [[1, 2, 5, 10], [3, 4], [6, 7, 8, 9], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [11, 12]]

export default [
  {
    id: 'g3-equal-groups',
    strand: 'Multiplication',
    title: 'Equal Groups',
    blurb: '3 groups of 4 ladybugs — how many in all?',
    art: 'ladybug',
    instructions: 'Count the equal groups. Write a multiplication sentence.',
    levels: ['Groups of objects', 'Arrays'],
    cols: 2,
    perPage: 6,
    gen(rng, level) {
      const g = rng.int(2, 5)
      const e = rng.int(2, 6)
      if (level === 1)
        return { figure: { type: 'groups', groups: g, each: e, kind: rng.pick(ANIMALS) }, ...inline([B(0), 'groups of', B(1), '=', B(2)], [num(g), num(e), num(g * e)]) }
      return { figure: { type: 'array', rows: g, cols: e }, ...inline([B(0), '×', B(1), '=', B(2)], [num(g), num(e), num(g * e)]) }
    },
  },
  {
    id: 'g3-mult-facts',
    strand: 'Multiplication',
    title: 'Multiplication Facts',
    blurb: 'Times tables from 0 to 12, one step at a time.',
    glyph: '×',
    instructions: 'Multiply.',
    levels: ['× 0, 1, 2, 5, 10', '× 3 and 4', '× 6, 7, 8, 9', 'Mixed 0–10', '× 11 and 12'],
    cols: 4,
    perPage: 40,
    gen(rng, level) {
      const a = rng.pick(FACT_TABLES[level - 1])
      // × 0 shows up now and then, not one problem in five
      const b = level === 5 ? rng.int(1, 12) : rng.bool(0.08) ? 0 : rng.int(1, 10)
      return rng.bool() ? inline([a, '×', b, '=', B(0)], [num(a * b)]) : inline([b, '×', a, '=', B(0)], [num(a * b)])
    },
  },
  {
    id: 'g3-div-facts',
    strand: 'Division',
    title: 'Division Facts',
    blurb: 'Share equally: division facts to 100.',
    glyph: '÷',
    instructions: 'Divide.',
    levels: ['÷ 1, 2, 5, 10', '÷ 3 and 4', '÷ 6, 7, 8, 9', 'Mixed to 100'],
    cols: 4,
    perPage: 40,
    gen(rng, level) {
      const d = rng.pick(lv(level, [[1, 2, 5, 10], [3, 4], [6, 7, 8, 9], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]))
      const q = rng.int(level === 4 ? 1 : 0, 10)
      return inline([d * q, '÷', d, '=', B(0)], [num(q)])
    },
  },
  {
    id: 'g3-missing-factor',
    strand: 'Multiplication',
    title: 'Missing Factors',
    blurb: '? × 6 = 42. Use multiplication to divide.',
    glyph: '?×',
    instructions: 'Find the missing number.',
    levels: ['Multiplication', 'Division', 'Mixed'],
    cols: 3,
    perPage: 30,
    gen(rng, level) {
      const a = rng.int(2, 10)
      const b = rng.int(2, 10)
      const L = level === 3 ? rng.int(1, 2) : level
      if (L === 1) return rng.bool() ? inline([a, '×', B(0), '=', a * b], [num(b)]) : inline([B(0), '×', b, '=', a * b], [num(a)])
      return rng.bool() ? inline([a * b, '÷', B(0), '=', b], [num(a)]) : inline([B(0), '÷', a, '=', b], [num(a * b)])
    },
  },
  {
    id: 'g3-mult-tens',
    strand: 'Multiplication',
    title: 'Multiply by Tens',
    blurb: '4 × 30 = 4 × 3 tens = 12 tens = 120.',
    glyph: '×10',
    instructions: 'Multiply.',
    levels: ['× 10', '× multiples of 10'],
    cols: 3,
    perPage: 30,
    gen(rng, level) {
      const a = rng.int(2, 9)
      const b = level === 1 ? 10 : rng.int(2, 9) * 10
      return rng.bool() ? inline([a, '×', b, '=', B(0)], [num(a * b)]) : inline([b, '×', a, '=', B(0)], [num(a * b)])
    },
  },
  {
    id: 'g3-round',
    strand: 'Place Value',
    title: 'Rounding',
    blurb: 'Round to the nearest 10 or 100.',
    glyph: '≈',
    instructions: 'Round each number.',
    levels: ['Nearest 10 (2-digit)', 'Nearest 10 (3-digit)', 'Nearest 100', 'Mixed'],
    cols: 2,
    perPage: 20,
    gen(rng, level) {
      const L = level === 4 ? rng.int(2, 3) : level
      const n = L === 1 ? rng.int(11, 99) : rng.int(101, 999)
      const to = L === 3 ? 100 : 10
      const r = Math.round(n / to) * to
      return inline([n, '→', 'nearest', to, ':', B(0)], [num(r)])
    },
  },
  {
    id: 'g3-add-sub-3digit',
    strand: 'Addition',
    title: 'Add & Subtract to 1,000',
    blurb: 'Regroup across columns with 3-digit numbers.',
    glyph: '±',
    instructions: 'Add or subtract.',
    levels: ['Addition', 'Subtraction', 'Mixed', 'Row form (show your work)'],
    cols: (l) => (l === 4 ? 2 : 4),
    perPage: (l) => (l === 4 ? 20 : 20),
    gen(rng, level) {
      const add = level === 1 || ((level === 3 || level === 4) && rng.bool())
      if (add) {
        let [a, b] = addPair(rng, 3, 3, 'yes')
        if (a + b > 1000) b = 1000 - a
        return level === 4 ? inline([a, '+', b, '=', B(0)], [num(a + b)]) : vertical([a, b], '+', num(a + b))
      }
      const [a, b] = subPair(rng, 3, 3, 'yes')
      return level === 4 ? inline([a, '−', b, '=', B(0)], [num(a - b)]) : vertical([a, b], '−', num(a - b))
    },
  },
  {
    id: 'g3-fractions',
    strand: 'Fractions',
    title: 'Fractions',
    blurb: 'Name the shaded part of shapes as a fraction.',
    glyph: '¾',
    instructions: 'Write the fraction that is shaded.',
    levels: ['Unit fractions', 'Any fraction', 'Fractions of a set'],
    cols: 3,
    perPage: 12,
    gen(rng, level) {
      const d = rng.pick([2, 3, 4, 6, 8])
      const n = level === 1 ? 1 : rng.int(1, d - 1)
      if (level === 3) {
        const total = rng.int(3, 8)
        const k = rng.int(1, total - 1)
        const kind = rng.pick(ANIMALS)
        return { prompt: `What fraction of the ${PLURAL[kind]} are crossed out?`, figure: { type: 'critters', kind, count: total, crossed: k, size: 28, perRow: 4 }, ...inline([B(0)], [frac(k, total)]) }
      }
      const shape = rng.pick(['circle', 'rect', 'bar'])
      const cols = shape === 'rect' && d >= 4 ? d / 2 : undefined
      return { figure: { type: 'fraction', shape, parts: d, shaded: n, cols }, ...inline([B(0)], [frac(n, d)]) }
    },
  },
  {
    id: 'g3-fraction-line',
    strand: 'Fractions',
    title: 'Fractions on a Number Line',
    blurb: 'Where does 3/4 live between 0 and 1?',
    glyph: '⅗',
    instructions: 'What fraction is at point A?',
    levels: ['Between 0 and 1', 'Between 0 and 2'],
    cols: 1,
    perPage: 5,
    gen(rng, level) {
      const d = rng.pick([2, 3, 4, 6, 8])
      const max = level === 1 ? 1 : 2
      const n = rng.int(1, d * max - 1)
      return {
        figure: { type: 'numberLine', min: 0, max, ticks: d * max, labels: 'ends', point: n / d, width: 380 },
        ...inline(['A =', B(0)], [frac(n, d)]),
      }
    },
  },
  {
    id: 'g3-equiv-fractions',
    strand: 'Fractions',
    title: 'Equivalent Fractions',
    blurb: '1/2 is the same as 2/4. Find the missing number.',
    glyph: '=',
    instructions: 'Fill in the missing number to make equal fractions.',
    levels: ['With pictures', 'Missing numerator', 'Missing numerator or denominator'],
    cols: (l) => (l === 1 ? 2 : 4),
    perPage: (l) => (l === 1 ? 8 : 24),
    gen(rng, level) {
      const d = rng.pick([2, 3, 4])
      const n = rng.int(1, d - 1)
      const k = rng.pick([2, 3, 4].filter((x) => d * x <= 12))
      if (level === 1)
        return {
          figure: [
            { type: 'fraction', shape: 'bar', parts: d, shaded: n, size: 70 },
            { type: 'fraction', shape: 'bar', parts: d * k, shaded: n * k, size: 70 },
          ],
          ...inline([F(n, d), '=', F(B(0), d * k)], [num(n * k)]),
        }
      if (level === 2 || rng.bool()) return inline([F(n, d), '=', F(B(0), d * k)], [num(n * k)])
      return inline([F(n, d), '=', F(n * k, B(0))], [num(d * k)])
    },
  },
  {
    id: 'g3-compare-fractions',
    strand: 'Fractions',
    title: 'Compare Fractions',
    blurb: 'Same bottom or same top? Which fraction is bigger?',
    glyph: '⅓<½',
    instructions: 'Write <, > or = in each circle.',
    levels: ['Same denominator', 'Same numerator', 'Mixed'],
    cols: 4,
    perPage: 24,
    gen(rng, level) {
      const L = level === 3 ? rng.int(1, 2) : level
      if (L === 1) {
        const d = rng.pick([3, 4, 5, 6, 8, 10])
        const a = rng.int(1, d - 1)
        const b = rng.int(1, d - 1)
        return inline([F(a, d), B(0), F(b, d)], [choice(CMP, cmp(a, b))])
      }
      const n = rng.int(1, 3)
      const [x, y] = rng.sample([2, 3, 4, 5, 6, 8].filter((v) => v > n), 2)
      const d1 = x
      const d2 = rng.bool(0.15) ? x : y
      return inline([F(n, d1), B(0), F(n, d2)], [choice(CMP, cmp(n / d1, n / d2))])
    },
  },
  {
    id: 'g3-area',
    strand: 'Measurement',
    title: 'Area',
    blurb: 'Count square units, then multiply length × width.',
    glyph: '▦',
    instructions: 'Find the area of each shape.',
    levels: ['Count the squares', 'Length × width', 'Find the missing side', 'L-shapes'],
    cols: 2,
    perPage: 6,
    gen(rng, level) {
      const w = rng.int(2, level === 1 ? 7 : 10)
      const h = rng.int(2, level === 1 ? 6 : 9)
      if (level === 1) return { figure: { type: 'rect', w, h, grid: true, labels: 'none' }, ...inline(['Area =', B(0), 'square units'], [num(w * h)]) }
      const unit = rng.pick(['cm', 'm', 'in', 'ft'])
      if (level === 2) return { figure: { type: 'rect', w, h, unit }, ...inline(['Area =', B(0), `sq ${unit}`], [num(w * h)]) }
      if (level === 3) return { prompt: `A rectangle has an area of ${w * h} sq ${unit}. One side is ${w} ${unit}. How long is the other side?`, ...inline([B(0), unit], [num(h)]) }
      const W = rng.int(5, 9)
      const H = rng.int(5, 8)
      const cut = { w: rng.int(2, W - 2), h: rng.int(2, H - 2) }
      return { figure: { type: 'rect', w: W, h: H, unit, cut, grid: rng.bool() }, ...inline(['Area =', B(0), `sq ${unit}`], [num(W * H - cut.w * cut.h)]) }
    },
  },
  {
    id: 'g3-perimeter',
    strand: 'Measurement',
    title: 'Perimeter',
    blurb: 'Walk all the way around the shape.',
    glyph: '▭',
    instructions: 'Find the perimeter.',
    levels: ['All sides labeled', 'Rectangles (two sides labeled)', 'Missing side', 'L-shapes'],
    cols: 2,
    perPage: 6,
    gen(rng, level) {
      const w = rng.int(2, 12)
      const h = rng.int(2, 10)
      const unit = rng.pick(['cm', 'm', 'in', 'ft'])
      if (level === 1) return { figure: { type: 'rect', w, h, unit, labels: 'all' }, ...inline(['Perimeter =', B(0), unit], [num(2 * (w + h))]) }
      if (level === 2) return { figure: { type: 'rect', w, h, unit }, ...inline(['Perimeter =', B(0), unit], [num(2 * (w + h))]) }
      if (level === 3) return { prompt: `A rectangle has a perimeter of ${2 * (w + h)} ${unit}. Its length is ${w} ${unit}. What is its width?`, ...inline([B(0), unit], [num(h)]) }
      const W = rng.int(5, 10)
      const H = rng.int(5, 9)
      const cut = { w: rng.int(2, W - 2), h: rng.int(2, H - 2) }
      return { figure: { type: 'rect', w: W, h: H, unit, cut }, ...inline(['Perimeter =', B(0), unit], [num(2 * (W + H))]) }
    },
  },
  {
    id: 'g3-time',
    strand: 'Measurement',
    title: 'Time to the Minute',
    blurb: 'Read clocks to the minute and find elapsed time.',
    glyph: '⏱',
    instructions: 'Answer each time question.',
    levels: ['Read the clock', 'Minutes later', 'Elapsed time', 'Find the start time', 'Hours and minutes'],
    cols: (l) => (l === 1 ? 3 : 2),
    perPage: (l) => (l === 1 ? 12 : 8),
    gen(rng, level) {
      const h = rng.int(1, 12)
      const m = rng.int(0, 59)
      if (level === 1) return { figure: { type: 'clock', h, m, size: 120 }, ...inline([B(0)], [time(h, m)]) }
      const add = 5 * rng.int(2, 12)
      const m0 = 5 * rng.int(0, 11)
      let h2 = h + Math.floor((m0 + add) / 60)
      const m2 = (m0 + add) % 60
      h2 = ((h2 - 1) % 12) + 1
      if (level === 2) return { figure: { type: 'clock', h, m: m0, size: 110 }, prompt: `What time will it be in ${add} minutes?`, ...inline([B(0)], [time(h2, m2)]) }
      const fmt = (a, b) => `${a}:${String(b).padStart(2, '0')}`
      const [who] = rng.sample(NAMES, 1)
      if (level === 4) {
        const what = rng.pick(['The movie', 'Recess', 'The soccer game', 'Art class', 'The bus ride'])
        return { prompt: `${what} ended at ${fmt(h2, m2)}. It lasted ${add} minutes. What time did it start?`, ...inline([B(0)], [time(h, m0)]) }
      }
      if (level === 5) {
        const hrs = rng.int(1, 3)
        const mins = 5 * rng.int(1, 11)
        const tot = m0 + mins
        const h3 = ((h + hrs + Math.floor(tot / 60) - 1) % 12) + 1
        return {
          prompt: `${who} went to the fair at ${fmt(h, m0)} and came home at ${fmt(h3, tot % 60)}. How long was ${who} gone?`,
          ...inline([B(0), 'hours', B(1), 'minutes'], [num(hrs), num(mins)]),
        }
      }
      return { prompt: `${who} started reading at ${fmt(h, m0)} and stopped at ${fmt(h2, m2)}. How many minutes did ${who} read?`, ...inline([B(0), 'minutes'], [num(add)]) }
    },
  },
  {
    id: 'g3-word-problems',
    strand: 'Word Problems',
    title: 'Multiply & Divide Stories',
    blurb: 'Equal groups, sharing, and two-step problems.',
    art: 'bear',
    instructions: 'Read each problem. Write the answer.',
    levels: ['Multiplication', 'Division', 'Two steps'],
    cols: 1,
    perPage: 8,
    gen(rng, level) {
      const [x] = rng.sample(NAMES, 1)
      const a = rng.int(2, 9)
      const b = rng.int(2, 9)
      if (level === 1) {
        return rng.pick([
          { prompt: `There are ${a} bags. Each bag has ${b} apples. How many apples are there in all?`, ...inline([B(0), 'apples'], [num(a * b)]) },
          { prompt: `${x} plants ${a} rows of carrots with ${b} carrots in each row. How many carrots are planted?`, ...inline([B(0), 'carrots'], [num(a * b)]) },
          { prompt: `A pig eats ${b} ears of corn each day. How many ears of corn does it eat in ${a} days?`, ...inline([B(0)], [num(a * b)]) },
        ])
      }
      if (level === 2) {
        return rng.pick([
          { prompt: `${x} shares ${a * b} stickers equally among ${a} friends. How many stickers does each friend get?`, ...inline([B(0), 'stickers'], [num(b)]) },
          { prompt: `There are ${a * b} chicks. They sit in ${a} equal rows. How many chicks are in each row?`, ...inline([B(0), 'chicks'], [num(b)]) },
          { prompt: `A farmer puts ${a * b} eggs into cartons of ${b}. How many cartons does the farmer fill?`, ...inline([B(0), 'cartons'], [num(a)]) },
        ])
      }
      const c = rng.int(2, 20)
      return rng.pick([
        { prompt: `${x} buys ${a} packs of pencils with ${b} pencils in each pack, then gives away ${Math.min(c, a * b)}. How many pencils are left?`, ...inline([B(0)], [num(a * b - Math.min(c, a * b))]) },
        { prompt: `A class has ${a * b} students. They split into teams of ${b}. Each team gets ${c} balls. How many balls are needed?`, ...inline([B(0)], [num(a * c)]) },
      ])
    },
  },
  {
    id: 'g3-picture-graph',
    strand: 'Data',
    title: 'Scaled Picture Graphs',
    blurb: 'Each picture stands for 2 votes. Read carefully!',
    glyph: '▤',
    instructions: 'Use the picture graph. Each picture = 2 votes.',
    levels: ['How many?', 'How many more?', 'How many in all?'],
    cols: 1,
    perPage: 3,
    gen(rng, level) {
      const kinds = rng.sample(ANIMALS.filter((a) => a !== 'fish'), 4)
      const rows = kinds.map((kind) => ({ kind, label: PLURAL[kind], value: rng.int(1, 8) * 2 - (rng.bool(0.3) ? 1 : 0) }))
      const figure = { type: 'pictograph', rows, per: 2, title: 'Favorite Farm Animals' }
      const [x, y] = rng.sample(rows, 2)
      if (level === 1) return { figure, prompt: `How many votes for ${x.label}?`, ...inline([B(0)], [num(x.value)]) }
      if (level === 2) {
        if (x.value === y.value) y.value += 2
        const [big, small] = x.value > y.value ? [x, y] : [y, x]
        return { figure, prompt: `How many more votes for ${big.label} than ${small.label}?`, ...inline([B(0)], [num(big.value - small.value)]) }
      }
      return { figure, prompt: 'How many votes in all?', ...inline([B(0)], [num(rows.reduce((s, r) => s + r.value, 0))]) }
    },
  },
]
