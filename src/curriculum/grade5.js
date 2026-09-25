import { B, CMP, F, MX, choice, cmp, frac, inline, longdiv, lv, mc, num, point, vertical } from './helpers.js'
import { clean, gcd, simplify } from '../lib/math.js'

const dec = (n, places) => (n / 10 ** places).toFixed(places)

export default [
  {
    id: 'g5-multiply',
    strand: 'Multiplication',
    title: 'Multi-Digit Multiplication',
    blurb: 'The standard algorithm with 2- and 3-digit multipliers.',
    glyph: '×',
    instructions: 'Multiply. Show your work.',
    levels: ['3-digit × 2-digit', '4-digit × 2-digit', '3-digit × 3-digit'],
    cols: 3,
    perPage: 12,
    gen(rng, level) {
      const [da, db] = lv(level, [[3, 2], [4, 2], [3, 3]])
      const a = rng.int(10 ** (da - 1) + 1, 10 ** da - 1)
      const b = rng.int(10 ** (db - 1) + 1, 10 ** db - 1)
      return vertical([a, b], '×', num(a * b))
    },
  },
  {
    id: 'g5-long-division',
    strand: 'Division',
    title: 'Long Division by 2 Digits',
    blurb: 'Divide 3- and 4-digit numbers by 2-digit divisors.',
    glyph: '⟌',
    instructions: 'Divide. Write any remainder after R.',
    levels: ['Divide by multiples of 10', '3-digit ÷ 2-digit', '4-digit ÷ 2-digit'],
    cols: 3,
    perPage: 12,
    gen(rng, level) {
      if (level === 1) {
        const d = rng.int(1, 9) * 10
        const q = rng.int(2, 30)
        return longdiv(q * d + (rng.bool() ? rng.int(1, d - 1) : 0), d)
      }
      const d = rng.int(11, 99)
      const [lo, hi] = level === 2 ? [Math.max(100, d * 2), 999] : [1000, 9999]
      return longdiv(rng.int(lo, hi), d)
    },
  },
  {
    id: 'g5-decimal-add-sub',
    strand: 'Decimals',
    title: 'Add & Subtract Decimals',
    blurb: 'Line up the decimal points!',
    glyph: '.+',
    instructions: 'Add or subtract. Line up the decimal points.',
    levels: ['Tenths', 'Hundredths', 'Mixed places', 'Subtract from whole numbers'],
    cols: 3,
    perPage: 15,
    gen(rng, level) {
      if (level === 4) {
        const a = rng.int(2, 50)
        const b = rng.int(1, a * 100 - 1)
        return vertical([String(a), dec(b, 2)], '−', num(clean(a - b / 100)))
      }
      const pa = level === 1 ? 1 : level === 2 ? 2 : rng.int(1, 3)
      const pb = level === 1 ? 1 : level === 2 ? 2 : rng.int(1, 3)
      const a = rng.int(10 ** pa, 1000 * 10 ** pa)
      const b = rng.int(10 ** pb, 100 * 10 ** pb)
      const A = a / 10 ** pa
      const Bv = b / 10 ** pb
      if (rng.bool() || A < Bv) return vertical([dec(a, pa), dec(b, pb)], '+', num(clean(A + Bv)))
      return vertical([dec(a, pa), dec(b, pb)], '−', num(clean(A - Bv)))
    },
  },
  {
    id: 'g5-decimal-multiply',
    strand: 'Decimals',
    title: 'Multiply Decimals',
    blurb: 'Powers of ten, decimal × whole, decimal × decimal.',
    glyph: '.×',
    instructions: 'Multiply.',
    levels: ['× 10, 100, 1000', 'Decimal × whole number', 'Decimal × decimal'],
    cols: 3,
    perPage: 24,
    gen(rng, level) {
      if (level === 1) {
        const p = rng.int(1, 3)
        const places = rng.int(1, 3)
        const a = rng.int(1, 9999) / 10 ** places
        return inline([String(a), '×', (10 ** p).toLocaleString('en-US'), '=', B(0)], [num(clean(a * 10 ** p))])
      }
      if (level === 2) {
        const places = rng.int(1, 2)
        const a = rng.int(11, 999)
        const w = rng.int(2, 9)
        return inline([dec(a, places), '×', w, '=', B(0)], [num(clean((a * w) / 10 ** places))])
      }
      const a = rng.int(11, 99)
      const b = rng.int(2, 99)
      const pa = 1
      const pb = b < 10 ? 1 : rng.int(1, 2)
      return inline([dec(a, pa), '×', dec(b, pb), '=', B(0)], [num(clean((a * b) / 10 ** (pa + pb)))])
    },
  },
  {
    id: 'g5-decimal-divide',
    strand: 'Decimals',
    title: 'Divide Decimals',
    blurb: 'Divide by powers of ten, by whole numbers, and by decimals.',
    glyph: '.÷',
    instructions: 'Divide.',
    levels: ['÷ 10, 100, 1000', 'Decimal ÷ whole number', 'Divide by a decimal'],
    cols: 3,
    perPage: 24,
    gen(rng, level) {
      if (level === 1) {
        const p = rng.int(1, 3)
        const a = rng.int(1, 9999)
        return inline([a, '÷', (10 ** p).toLocaleString('en-US'), '=', B(0)], [num(clean(a / 10 ** p))])
      }
      if (level === 2) {
        const w = rng.int(2, 9)
        const q = rng.int(11, 999)
        const places = rng.int(1, 2)
        return inline([dec(q * w, places), '÷', w, '=', B(0)], [num(clean(q / 10 ** places))])
      }
      const dv = rng.pick([0.1, 0.2, 0.5, 0.25, 0.4])
      const q = rng.int(2, 40)
      return inline([String(clean(q * dv)), '÷', String(dv), '=', B(0)], [num(q)])
    },
  },
  {
    id: 'g5-add-fractions',
    strand: 'Fractions',
    title: 'Add & Subtract Unlike Fractions',
    blurb: 'Find a common denominator, then add or subtract.',
    glyph: '½+⅓',
    instructions: 'Add or subtract. Write the answer in simplest form.',
    levels: ['One denominator divides the other', 'Unlike denominators', 'Mixed numbers'],
    cols: 3,
    perPage: 18,
    gen(rng, level) {
      let d1, d2
      if (level === 1) {
        d1 = rng.pick([2, 3, 4, 5])
        d2 = d1 * rng.pick([2, 3])
      } else [d1, d2] = rng.sample([2, 3, 4, 5, 6, 8, 10, 12], 2)
      const a = rng.int(1, d1 - 1)
      const b = rng.int(1, d2 - 1)
      const D = d1 * d2
      const sub = rng.bool() && a * d2 !== b * d1
      if (level === 3) {
        const w1 = rng.int(2, 6)
        const w2 = rng.int(1, w1 - 1)
        const N1 = w1 * d1 + a
        const N2 = w2 * d2 + b
        const [n, d] = simplify(sub ? N1 * d2 - N2 * d1 : N1 * d2 + N2 * d1, D)
        return inline([MX(w1, a, d1), sub ? '−' : '+', MX(w2, b, d2), '=', B(0)], [frac(n, d, { mixed: true })])
      }
      let x = [a, d1]
      let y = [b, d2]
      if (sub && a * d2 < b * d1) [x, y] = [y, x]
      const [n, d] = simplify(sub ? x[0] * y[1] - y[0] * x[1] : x[0] * y[1] + y[0] * x[1], x[1] * y[1])
      return inline([F(x[0], x[1]), sub ? '−' : '+', F(y[0], y[1]), '=', B(0)], [frac(n, d, { mixed: true })])
    },
  },
  {
    id: 'g5-multiply-fractions',
    strand: 'Fractions',
    title: 'Multiply Fractions',
    blurb: 'Fraction × fraction and mixed numbers.',
    glyph: '⅔×',
    instructions: 'Multiply. Write the answer in simplest form.',
    levels: ['Fraction × fraction', 'Whole number × fraction', 'Mixed numbers'],
    cols: 3,
    perPage: 18,
    gen(rng, level) {
      const d1 = rng.int(2, 9)
      const d2 = rng.int(2, 9)
      const a = rng.int(1, d1 - 1)
      const b = rng.int(1, d2 - 1)
      if (level === 1) {
        const [n, d] = simplify(a * b, d1 * d2)
        return inline([F(a, d1), '×', F(b, d2), '=', B(0)], [frac(n, d)])
      }
      if (level === 2) {
        const w = rng.int(2, 12)
        const [n, d] = simplify(w * b, d2)
        return inline([w, '×', F(b, d2), '=', B(0)], [frac(n, d, { mixed: true })])
      }
      const w = rng.int(1, 4)
      const [n, d] = simplify((w * d1 + a) * b, d1 * d2)
      return inline([MX(w, a, d1), '×', F(b, d2), '=', B(0)], [frac(n, d, { mixed: true })])
    },
  },
  {
    id: 'g5-divide-fractions',
    strand: 'Fractions',
    title: 'Divide with Unit Fractions',
    blurb: 'How many halves fit in 3? What is ⅓ shared by 4?',
    glyph: '÷⅓',
    instructions: 'Divide.',
    levels: ['Whole ÷ unit fraction', 'Unit fraction ÷ whole', 'Mixed'],
    cols: 3,
    perPage: 24,
    gen(rng, level) {
      const d = rng.int(2, 10)
      const w = rng.int(2, 9)
      const L = level === 3 ? rng.int(1, 2) : level
      if (L === 1) return inline([w, '÷', F(1, d), '=', B(0)], [num(w * d)])
      return inline([F(1, d), '÷', w, '=', B(0)], [frac(1, d * w)])
    },
  },
  {
    id: 'g5-order-of-operations',
    strand: 'Expressions',
    title: 'Order of Operations',
    blurb: 'Parentheses first, then × and ÷, then + and −.',
    glyph: '( )',
    instructions: 'Evaluate each expression.',
    levels: ['No parentheses', 'With parentheses', 'Brackets and more steps'],
    cols: 2,
    perPage: 20,
    gen(rng, level) {
      const a = rng.int(2, 12)
      const b = rng.int(2, 9)
      const c = rng.int(2, 9)
      if (level === 1) {
        return rng.pick([
          inline([a, '+', b, '×', c, '=', B(0)], [num(a + b * c)]),
          inline([b * c, '÷', c, '+', a, '=', B(0)], [num(b + a)]),
          inline([a * b, '−', b, '×', Math.min(c, a), '=', B(0)], [num(a * b - b * Math.min(c, a))]),
        ])
      }
      if (level === 2) {
        return rng.pick([
          inline(['(', a, '+', b, ')', '×', c, '=', B(0)], [num((a + b) * c)]),
          inline([c, '×', '(', a + b, '−', b, ')', '=', B(0)], [num(c * a)]),
          inline(['(', b * c, '+', c, ')', '÷', c, '=', B(0)], [num(b + 1)]),
        ])
      }
      const d = rng.int(2, 5)
      return rng.pick([
        inline([d, '×', '[', a, '+', '(', b, '×', c, ')', ']', '=', B(0)], [num(d * (a + b * c))]),
        inline(['[', '(', a, '+', b, ')', '×', c, ']', '−', d, '=', B(0)], [num((a + b) * c - d)]),
        inline([a * d, '÷', d, '+', '(', b, '+', c, ')', '×', 2, '=', B(0)], [num(a + (b + c) * 2)]),
      ])
    },
  },
  {
    id: 'g5-powers-of-10',
    strand: 'Place Value',
    title: 'Powers of Ten',
    blurb: 'Exponents, and what happens when you × or ÷ by 10.',
    glyph: '10³',
    instructions: 'Write the value.',
    levels: ['10 to a power', 'Number × power of 10', 'Write as a power of 10'],
    cols: (l) => (l === 1 ? 2 : 3),
    perPage: (l) => (l === 2 ? 24 : 12),
    gen(rng, level) {
      const e = rng.int(1, 6)
      if (level === 1) {
        if (rng.bool()) return inline([{ pow: [10, e] }, '=', B(0)], [num(10 ** e)])
        return inline([Array(Math.min(e + 1, 5)).fill(10).join(' × '), '=', { pow: [10, B(0)] }], [num(Math.min(e + 1, 5))])
      }
      if (level === 2) {
        const n = rng.int(2, 99)
        const e2 = rng.int(1, 4)
        return inline([n, '×', { pow: [10, e2] }, '=', B(0)], [num(n * 10 ** e2)])
      }
      return inline([(10 ** e).toLocaleString('en-US'), '=', { pow: [10, B(0)] }], [num(e)])
    },
  },
  {
    id: 'g5-volume',
    strand: 'Measurement',
    title: 'Volume',
    blurb: 'Count cubes, then use length × width × height.',
    glyph: '▣',
    instructions: 'Find the volume.',
    levels: ['Count the cubes', 'l × w × h', 'Missing dimension'],
    cols: 2,
    perPage: 6,
    gen(rng, level) {
      if (level === 1) {
        const [l, w, h] = [rng.int(2, 4), rng.int(1, 3), rng.int(1, 3)]
        return { figure: { type: 'prism', l, w, h }, ...inline(['Volume =', B(0), 'cubic units'], [num(l * w * h)]) }
      }
      const [l, w, h] = [rng.int(2, 12), rng.int(2, 9), rng.int(2, 10)]
      const u = rng.pick(['cm', 'in', 'ft', 'm'])
      if (level === 2) return { figure: { type: 'prism', l, w, h, cubes: false, unit: u }, ...inline(['Volume =', B(0), `cubic ${u}`], [num(l * w * h)]) }
      return { prompt: `A box has a volume of ${l * w * h} cubic ${u}. It is ${l} ${u} long and ${w} ${u} wide. How tall is it?`, ...inline([B(0), u], [num(h)]) }
    },
  },
  {
    id: 'g5-coordinates',
    strand: 'Geometry',
    title: 'Coordinate Plane',
    blurb: 'Read (x, y) points on a grid.',
    glyph: '⌗',
    instructions: 'Use the coordinate grid.',
    levels: ['Coordinates of a point', 'Which point is at…?', 'Distance along a line'],
    cols: 2,
    perPage: 4,
    gen(rng, level) {
      const labels = ['A', 'B', 'C', 'D']
      const seen = new Set()
      const points = labels.map((label) => {
        let x, y
        do {
          x = rng.int(1, 9)
          y = rng.int(1, 9)
        } while (seen.has(`${x},${y}`))
        seen.add(`${x},${y}`)
        return { label, x, y }
      })
      const target = rng.pick(points)
      const figure = { type: 'coord', size: 10, points, cell: 20 }
      if (level === 1) return { figure, prompt: `What are the coordinates of point ${target.label}?`, ...inline([target.label, '=', B(0)], [point(target.x, target.y)]) }
      if (level === 2) return { figure, ...mc(`Which point is at (${target.x}, ${target.y})?`, labels, target.label) }
      const y = rng.int(1, 9)
      const x1 = rng.int(0, 4)
      const x2 = rng.int(6, 10)
      return {
        figure: { type: 'coord', size: 10, points: [{ label: 'P', x: x1, y }, { label: 'Q', x: x2, y }], cell: 20 },
        prompt: `How many units apart are P (${x1}, ${y}) and Q (${x2}, ${y})?`,
        ...inline([B(0), 'units'], [num(x2 - x1)]),
      }
    },
  },
  {
    id: 'g5-decimal-round',
    strand: 'Decimals',
    title: 'Round & Compare Decimals',
    blurb: 'Thousandths, rounding, and comparing decimals.',
    glyph: '≈.',
    instructions: 'Round or compare.',
    levels: ['Round to nearest whole', 'Round to nearest tenth', 'Round to nearest hundredth', 'Compare thousandths'],
    cols: (l) => (l === 4 ? 3 : 2),
    perPage: (l) => (l === 4 ? 30 : 20),
    gen(rng, level) {
      const n = rng.int(1001, 99999)
      if (level === 4) {
        const a = rng.int(1, 9999)
        let b = rng.bool() ? a + rng.pick([-10, -1, 1, 10, 100]) : rng.int(1, 9999)
        if (b <= 0) b = a + 1
        const fa = dec(a, 3)
        const fb = rng.bool() && b % 10 === 0 ? dec(b / 10, 2) : dec(b, 3)
        return inline([fa, B(0), fb], [choice(CMP, cmp(a, b))])
      }
      const x = n / 1000
      const places = level - 1
      const to = ['whole number', 'tenth', 'hundredth'][places]
      const r = Math.round(n / 10 ** (3 - places)) / 10 ** places
      return inline([x.toFixed(3), '→ nearest', to, ':', B(0)], [num(clean(r), { display: r.toFixed(places) })])
    },
  },
  {
    id: 'g5-fraction-forms',
    strand: 'Fractions',
    title: 'Simplify & Convert Fractions',
    blurb: 'Simplest form, improper fractions and mixed numbers.',
    glyph: '⁶⁄₈',
    instructions: 'Rewrite each fraction.',
    levels: ['Simplest form', 'Improper → mixed number', 'Mixed number → improper'],
    cols: 4,
    perPage: 24,
    gen(rng, level) {
      const d = rng.int(2, 12)
      if (level === 1) {
        let n = rng.int(1, d - 1)
        const k = rng.int(2, 5)
        while (gcd(n, d) !== 1) n = rng.int(1, d - 1)
        return inline([F(n * k, d * k), '=', B(0)], [frac(n, d, { simplest: true })])
      }
      const w = rng.int(1, 9)
      let n = rng.int(1, d - 1)
      if (level === 2) return inline([F(w * d + n, d), '=', B(0)], [{ ...frac(w * d + n, d, { mixed: true }), mixedOnly: true }])
      return inline([MX(w, n, d), '=', B(0)], [frac(w * d + n, d)])
    },
  },
]
