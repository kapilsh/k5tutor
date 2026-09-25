import { addPair, subPair } from './arith.js'
import { B, CMP, F, MX, NAMES, choice, cmp, frac, inline, longdiv, lv, mc, num, vertical } from './helpers.js'
import { factors, isPrime, simplify } from '../lib/math.js'

const PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions']

export default [
  {
    id: 'g4-place-value',
    strand: 'Place Value',
    title: 'Place Value to Millions',
    blurb: 'Value of digits and expanded form with big numbers.',
    glyph: '1,000',
    instructions: 'Answer each place value question.',
    levels: ['Value of the underlined digit', 'Which place?', 'Expanded form'],
    cols: (l) => (l === 3 ? 1 : 2),
    perPage: (l) => (l === 3 ? 12 : l === 2 ? 12 : 20),
    gen(rng, level) {
      const digits = rng.int(4, 7)
      const n = rng.int(10 ** (digits - 1), 10 ** digits - 1)
      const s = String(n)
      if (level === 3) {
        const d = rng.int(4, 5)
        const m = rng.int(10 ** (d - 1), 10 ** d - 1)
        const parts = String(m).split('').map((c, i) => Number(c) * 10 ** (d - 1 - i)).filter(Boolean)
        const tokens = [m.toLocaleString('en-US'), '=']
        parts.forEach((_, i) => tokens.push(...(i ? ['+'] : []), B(i)))
        return inline(tokens, parts.map((p) => num(p)))
      }
      let pos = rng.int(0, s.length - 1)
      while (s[pos] === '0') pos = (pos + 1) % s.length
      const place = s.length - 1 - pos
      if (level === 1) return { prompt: 'Value of the underlined digit:', ...inline([{ digits: s, mark: pos }, '→', B(0)], [num(Number(s[pos]) * 10 ** place)]) }
      return mc(`In ${n.toLocaleString('en-US')}, the digit ${s[pos]} is in which place?`, pickPlaces(rng, place, s.length), PLACES[place])
    },
  },
  {
    id: 'g4-rounding',
    strand: 'Place Value',
    title: 'Rounding Big Numbers',
    blurb: 'Round to the nearest thousand, ten thousand, or hundred thousand.',
    glyph: '≈',
    instructions: 'Round each number.',
    levels: ['Nearest hundred', 'Nearest thousand', 'Nearest ten thousand', 'Mixed'],
    cols: 1,
    perPage: 16,
    gen(rng, level) {
      const L = level === 4 ? rng.int(1, 3) : level
      const to = 10 ** (L + 1)
      const n = rng.int(to, to * 100 - 1)
      return inline([n.toLocaleString('en-US'), '→ nearest', to.toLocaleString('en-US'), ':', B(0)], [num(Math.round(n / to) * to)])
    },
  },
  {
    id: 'g4-add-sub',
    strand: 'Addition',
    title: 'Multi-Digit Add & Subtract',
    blurb: 'Column addition and subtraction up to a million.',
    glyph: '±',
    instructions: 'Add or subtract.',
    levels: ['4-digit addition', '4-digit subtraction', '5- and 6-digit', 'Subtract across zeros'],
    cols: (l) => (l === 3 ? 3 : 4),
    perPage: (l) => (l === 3 ? 15 : 20),
    gen(rng, level) {
      if (level === 1) {
        const [a, b] = addPair(rng, 4, rng.pick([3, 4]), 'yes')
        return vertical([a, b], '+', num(a + b))
      }
      if (level === 2) {
        const [a, b] = subPair(rng, 4, rng.pick([3, 4]), 'yes')
        return vertical([a, b], '−', num(a - b))
      }
      if (level === 4) {
        const [a, b] = subPair(rng, 4, rng.pick([3, 4]), 'yes', { acrossZero: true })
        return vertical([a, b], '−', num(a - b))
      }
      const d = rng.int(5, 6)
      if (rng.bool()) {
        const [a, b] = addPair(rng, d, d, 'yes')
        return vertical([a, b], '+', num(a + b))
      }
      const [a, b] = subPair(rng, d, d, 'yes')
      return vertical([a, b], '−', num(a - b))
    },
  },
  {
    id: 'g4-multiply',
    strand: 'Multiplication',
    title: 'Multi-Digit Multiplication',
    blurb: 'Multiply by 1-digit and 2-digit numbers.',
    glyph: '×',
    instructions: 'Multiply. Show your work.',
    levels: ['2-digit × 1-digit', '3-digit × 1-digit', '4-digit × 1-digit', '2-digit × 2-digit'],
    cols: 4,
    perPage: 16,
    gen(rng, level) {
      const [da, db] = lv(level, [[2, 1], [3, 1], [4, 1], [2, 2]])
      const a = rng.int(10 ** (da - 1) + 1, 10 ** da - 1)
      const b = db === 1 ? rng.int(2, 9) : rng.int(11, 99)
      return vertical([a, b], '×', num(a * b))
    },
  },
  {
    id: 'g4-long-division',
    strand: 'Division',
    title: 'Long Division',
    blurb: 'Divide by 1-digit numbers, with and without remainders.',
    glyph: '⟌',
    instructions: 'Divide. Write any remainder after R.',
    levels: ['2-digit ÷ 1-digit, no remainder', '2-digit ÷ 1-digit with remainder', '3-digit ÷ 1-digit', '4-digit ÷ 1-digit'],
    cols: (l) => (l === 4 ? 2 : 3),
    perPage: (l) => (l === 4 ? 8 : 12),
    gen(rng, level) {
      const d = rng.int(2, 9)
      if (level === 1) {
        const q = rng.int(Math.ceil(10 / d), Math.floor(99 / d))
        return longdiv(q * d, d, false)
      }
      const [lo, hi] = lv(level, [[10, 99], [10, 99], [100, 999], [1000, 9999]])
      let n = rng.int(lo, hi)
      if (level === 2) while (n % d === 0) n = rng.int(lo, hi)
      return longdiv(n, d)
    },
  },
  {
    id: 'g4-factors',
    strand: 'Multiplication',
    title: 'Factors, Multiples, Primes',
    blurb: 'Factor pairs, multiples, and prime vs composite.',
    glyph: 'ƒ',
    instructions: 'Answer each question.',
    levels: ['Is it a factor?', 'Is it a multiple?', 'Prime or composite?', 'How many factors?'],
    cols: 2,
    perPage: 16,
    gen(rng, level) {
      if (level === 1) {
        const n = rng.int(12, 60)
        const f = rng.bool() ? rng.pick(factors(n).filter((x) => x > 1 && x < n)) || 2 : rng.int(2, 12)
        return mc(`Is ${f} a factor of ${n}?`, ['yes', 'no'], n % f === 0 ? 'yes' : 'no')
      }
      if (level === 2) {
        const f = rng.int(3, 12)
        const n = rng.bool() ? f * rng.int(2, 12) : rng.int(20, 100)
        return mc(`Is ${n} a multiple of ${f}?`, ['yes', 'no'], n % f === 0 ? 'yes' : 'no')
      }
      if (level === 3) {
        const n = rng.int(2, 60)
        return mc(`Is ${n} prime or composite?`, ['prime', 'composite'], isPrime(n) ? 'prime' : 'composite')
      }
      const n = rng.pick([6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24, 25, 28, 30, 32, 36, 40, 42, 45, 48])
      return { prompt: `How many factors does ${n} have?`, ...inline([B(0), 'factors'], [num(factors(n).length)]) }
    },
  },
  {
    id: 'g4-equiv-fractions',
    strand: 'Fractions',
    title: 'Equivalent Fractions',
    blurb: 'Multiply or divide top and bottom by the same number.',
    glyph: '=',
    instructions: 'Fill in the missing number.',
    levels: ['Scale up', 'Scale up or down', 'Simplest form'],
    cols: 4,
    perPage: 24,
    gen(rng, level) {
      const d = rng.pick([2, 3, 4, 5, 6, 8, 10, 12])
      const n = rng.int(1, d - 1)
      const k = rng.int(2, 5)
      if (level === 3) {
        const [sn, sd] = simplify(n * k, d * k)
        return inline([F(n * k, d * k), '=', B(0)], [frac(sn, sd, { simplest: true })])
      }
      if (level === 1 || rng.bool()) return rng.bool() ? inline([F(n, d), '=', F(B(0), d * k)], [num(n * k)]) : inline([F(n, d), '=', F(n * k, B(0))], [num(d * k)])
      return rng.bool() ? inline([F(n * k, d * k), '=', F(B(0), d)], [num(n)]) : inline([F(n * k, d * k), '=', F(n, B(0))], [num(d)])
    },
  },
  {
    id: 'g4-compare-fractions',
    strand: 'Fractions',
    title: 'Compare Fractions',
    blurb: 'Compare fractions with different denominators.',
    glyph: '<>',
    instructions: 'Write <, > or = in each circle.',
    levels: ['Related denominators', 'Any denominators', 'Compare to ½'],
    cols: 4,
    perPage: 24,
    gen(rng, level) {
      if (level === 1) {
        const d = rng.pick([2, 3, 4, 5])
        const k = rng.pick([2, 3])
        const a = rng.int(1, d - 1)
        const b = rng.int(1, d * k - 1)
        return rng.bool() ? inline([F(a, d), B(0), F(b, d * k)], [choice(CMP, cmp(a * k, b))]) : inline([F(b, d * k), B(0), F(a, d)], [choice(CMP, cmp(b, a * k))])
      }
      if (level === 3) {
        const d = rng.pick([3, 4, 5, 6, 8, 10, 12])
        const n = rng.int(1, d - 1)
        return inline([F(n, d), B(0), F(1, 2)], [choice(CMP, cmp(2 * n, d))])
      }
      const [d1, d2] = rng.sample([2, 3, 4, 5, 6, 8, 10, 12], 2)
      const a = rng.int(1, d1 - 1)
      const b = rng.int(1, d2 - 1)
      return inline([F(a, d1), B(0), F(b, d2)], [choice(CMP, cmp(a * d2, b * d1))])
    },
  },
  {
    id: 'g4-add-fractions',
    strand: 'Fractions',
    title: 'Add & Subtract Fractions',
    blurb: 'Like denominators, including mixed numbers.',
    glyph: '⅔+',
    instructions: 'Add or subtract. You can write improper fractions or mixed numbers.',
    levels: ['Add (sum less than 1)', 'Subtract', 'Sums greater than 1', 'Mixed numbers'],
    cols: 3,
    perPage: 18,
    gen(rng, level) {
      const d = rng.pick([3, 4, 5, 6, 8, 10, 12])
      if (level === 1) {
        const a = rng.int(1, d - 2)
        const b = rng.int(1, d - 1 - a)
        return inline([F(a, d), '+', F(b, d), '=', B(0)], [frac(a + b, d)])
      }
      if (level === 2) {
        const a = rng.int(2, d - 1)
        const b = rng.int(1, a - 1)
        return inline([F(a, d), '−', F(b, d), '=', B(0)], [frac(a - b, d)])
      }
      if (level === 3) {
        const a = rng.int(2, d - 1)
        const b = rng.int(d - a + 1, d - 1)
        return inline([F(a, d), '+', F(b, d), '=', B(0)], [frac(a + b, d, { mixed: true })])
      }
      const w1 = rng.int(1, 5)
      const w2 = rng.int(1, 4)
      const a = rng.int(1, d - 1)
      const b = rng.int(1, d - 1)
      if (rng.bool()) return inline([MX(w1, a, d), '+', MX(w2, b, d), '=', B(0)], [frac((w1 + w2) * d + a + b, d, { mixed: true })])
      const big = (w1 + w2) * d + a
      const small = w2 * d + b
      return inline([MX(w1 + w2, a, d), '−', MX(w2, b, d), '=', B(0)], [frac(big - small, d, { mixed: true })])
    },
  },
  {
    id: 'g4-mult-fractions',
    strand: 'Fractions',
    title: 'Fraction × Whole Number',
    blurb: '3 × 2/5 = 6/5. Groups of fractions.',
    glyph: '×⅖',
    instructions: 'Multiply. Write your answer as a fraction or mixed number.',
    levels: ['Unit fractions', 'Any fraction'],
    cols: 3,
    perPage: 24,
    gen(rng, level) {
      const d = rng.pick([2, 3, 4, 5, 6, 8, 10, 12])
      const n = level === 1 ? 1 : rng.int(2, d - 1)
      const w = rng.int(2, 9)
      return inline([w, '×', F(n, d), '=', B(0)], [frac(w * n, d, { mixed: true })])
    },
  },
  {
    id: 'g4-decimals',
    strand: 'Decimals',
    title: 'Tenths and Hundredths',
    blurb: 'Decimals, fractions and decimal grids.',
    glyph: '0.1',
    instructions: 'Write each as a decimal.',
    levels: ['Decimal grids', 'Fraction to decimal', 'Decimal to fraction', 'Compare decimals'],
    cols: (l) => (l === 1 ? 3 : 4),
    perPage: (l) => (l === 1 ? 12 : 24),
    gen(rng, level) {
      if (level === 1) {
        const tenth = rng.bool(0.35)
        const cells = tenth ? 10 : 100
        const sh = rng.int(1, cells - 1)
        return { figure: { type: 'decimalGrid', cells, shaded: sh, size: 100 }, ...inline([B(0)], [num(sh / cells)]) }
      }
      if (level === 2) {
        const d = rng.pick([10, 100])
        const n = rng.int(1, d * 2)
        if (n % d === 0) return inline([F(n + 1, d), '=', B(0)], [num((n + 1) / d)])
        return inline([F(n, d), '=', B(0)], [num(n / d)])
      }
      if (level === 3) {
        const d = rng.pick([10, 100])
        const n = rng.int(1, d - 1)
        return inline([(n / d).toFixed(d === 10 ? 1 : 2), '=', F(B(0), d)], [num(n)])
      }
      const a = rng.int(1, 99) / 100
      let b = rng.bool() ? rng.int(1, 9) / 10 : rng.int(1, 99) / 100
      if (rng.bool(0.1)) b = a
      const show = (x) => (Math.round(x * 100) % 10 === 0 && rng.bool(0.5) ? x.toFixed(1) : x.toFixed(2))
      return inline([show(a), B(0), show(b)], [choice(CMP, cmp(a, b))])
    },
  },
  {
    id: 'g4-angles',
    strand: 'Geometry',
    title: 'Angles',
    blurb: 'Acute, right, obtuse and straight angles.',
    glyph: '∠',
    instructions: 'Answer each angle question.',
    levels: ['Name the angle', 'Missing angle (right angle)', 'Missing angle (straight line)'],
    cols: (l) => (l === 1 ? 3 : 2),
    perPage: (l) => (l === 1 ? 9 : 16),
    gen(rng, level) {
      if (level === 1) {
        const kind = rng.pick(['acute', 'right', 'obtuse', 'straight'])
        const deg = kind === 'acute' ? rng.int(2, 8) * 10 : kind === 'right' ? 90 : kind === 'obtuse' ? rng.int(10, 17) * 10 : 180
        return { figure: { type: 'angle', deg, rot: rng.int(0, 3) * 20, size: 110 }, ...mc('What kind of angle?', ['acute', 'right', 'obtuse', 'straight'], kind) }
      }
      const total = level === 2 ? 90 : 180
      const a = rng.int(10, total - 10)
      return { prompt: `Two angles together make ${total}°. One angle is ${a}°. What is the other angle?`, ...inline([B(0), '°'], [num(total - a)]) }
    },
  },
  {
    id: 'g4-conversions',
    strand: 'Measurement',
    title: 'Unit Conversions',
    blurb: 'Feet to inches, kilograms to grams, hours to minutes.',
    glyph: '⇄',
    instructions: 'Convert each measurement.',
    levels: ['Length', 'Weight and capacity', 'Time', 'Mixed'],
    cols: 2,
    perPage: 20,
    gen(rng, level) {
      const sets = [
        [['ft', 'in', 12], ['yd', 'ft', 3], ['m', 'cm', 100], ['km', 'm', 1000], ['cm', 'mm', 10]],
        [['lb', 'oz', 16], ['kg', 'g', 1000], ['L', 'mL', 1000], ['gal', 'qt', 4], ['qt', 'pt', 2], ['pt', 'c', 2]],
        [['hr', 'min', 60], ['min', 'sec', 60], ['day', 'hr', 24], ['wk', 'days', 7]],
      ]
      const pool = level === 4 ? sets.flat() : sets[level - 1]
      const [big, small, f] = rng.pick(pool)
      const n = rng.int(2, f >= 100 ? 9 : 12)
      return inline([n, big, '=', B(0), small], [num(n * f)])
    },
  },
  {
    id: 'g4-word-problems',
    strand: 'Word Problems',
    title: 'Multi-Step Word Problems',
    blurb: 'Bigger stories with more than one step.',
    art: 'cow',
    instructions: 'Read each problem carefully. Write the answer.',
    levels: ['Multiplication', 'Division with remainders', 'Multi-step'],
    cols: 1,
    perPage: 8,
    gen(rng, level) {
      const [x, y] = rng.sample(NAMES, 2)
      if (level === 1) {
        const a = rng.int(12, 99)
        const b = rng.int(3, 9)
        return rng.pick([
          { prompt: `A farm sells ${a} cartons of eggs each day. How many cartons does it sell in ${b} days?`, ...inline([B(0), 'cartons'], [num(a * b)]) },
          { prompt: `${x} reads ${a} pages each week. How many pages does ${x} read in ${b} weeks?`, ...inline([B(0), 'pages'], [num(a * b)]) },
        ])
      }
      if (level === 2) {
        const d = rng.int(3, 9)
        let n = rng.int(20, 99)
        while (n % d === 0) n++
        return rng.pick([
          { prompt: `${n} students ride in vans. Each van holds ${d} students. How many vans are needed so everyone can ride?`, ...inline([B(0), 'vans'], [num(Math.ceil(n / d))]) },
          { prompt: `${x} packs ${n} cookies into boxes of ${d}. How many cookies are left over?`, ...inline([B(0), 'cookies'], [num(n % d)]) },
          { prompt: `${n} chicks are split into ${d} equal pens. How many full chicks can go in each pen?`, ...inline([B(0)], [num(Math.floor(n / d))]) },
        ])
      }
      const a = rng.int(3, 9)
      const p = rng.int(4, 15)
      const c = rng.int(20, 50)
      return rng.pick([
        { prompt: `${x} buys ${a} books for $${p} each and pays with $${a * p + c}. How much change does ${x} get?`, ...inline(['$', B(0)], [num(c)]) },
        { prompt: `${x} has ${a * p + c} marbles. ${x} gives ${c} to ${y}, then puts the rest into ${a} equal bags. How many marbles are in each bag?`, ...inline([B(0), 'marbles'], [num(p)]) },
      ])
    },
  },
]

function pickPlaces(rng, place, len) {
  const pool = PLACES.slice(0, len).filter((_, i) => i !== place)
  return rng.shuffle([PLACES[place], ...rng.sample(pool, Math.min(3, pool.length))])
}
