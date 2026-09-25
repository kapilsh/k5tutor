import { ANIMALS, PLURAL } from './vocab.js'
import { B, CMP, NAMES, choice, cmp, inline, lv, mc, num, time, vertical } from './helpers.js'

export default [
  {
    id: 'g1-add-20',
    strand: 'Addition',
    title: 'Addition to 20',
    blurb: 'Doubles, near doubles and sums up to 20.',
    glyph: '+',
    instructions: 'Add.',
    levels: ['Sums to 10', 'Doubles', 'Sums to 20', 'Sums to 20 (in columns)', 'Add three numbers'],
    cols: (l) => (l === 4 ? 5 : 3),
    perPage: (l) => (l === 4 ? 25 : 30),
    gen(rng, level) {
      if (level === 1) {
        const s = rng.int(2, 10)
        const a = rng.int(0, s)
        return inline([a, '+', s - a, '=', B(0)], [num(s)])
      }
      if (level === 2) {
        const a = rng.int(1, 10)
        const near = rng.bool(0.4)
        return inline([a, '+', a + (near ? 1 : 0), '=', B(0)], [num(2 * a + (near ? 1 : 0))])
      }
      if (level === 5) {
        const a = rng.int(1, 9)
        const b = rng.int(1, 9)
        const c = rng.int(1, Math.max(1, 20 - a - b))
        return inline([a, '+', b, '+', c, '=', B(0)], [num(a + b + c)])
      }
      const a = rng.int(2, 10)
      const b = rng.int(Math.max(1, 11 - a), Math.min(10, 20 - a))
      return level === 4 ? vertical([a, b], '+', num(a + b)) : inline([a, '+', b, '=', B(0)], [num(a + b)])
    },
  },
  {
    id: 'g1-sub-20',
    strand: 'Subtraction',
    title: 'Subtraction to 20',
    blurb: 'Take-away facts from 20 and under.',
    glyph: '−',
    instructions: 'Subtract.',
    levels: ['Within 10', 'From teen numbers (easy)', 'Within 20', 'Within 20 (in columns)'],
    cols: (l) => (l === 4 ? 5 : 3),
    perPage: (l) => (l === 4 ? 25 : 30),
    gen(rng, level) {
      if (level === 1) {
        const a = rng.int(2, 10)
        const b = rng.int(0, a)
        return inline([a, '−', b, '=', B(0)], [num(a - b)])
      }
      if (level === 2) {
        const a = rng.int(11, 19)
        const b = rng.bool() ? rng.int(1, a - 10) : 10
        return inline([a, '−', b, '=', B(0)], [num(a - b)])
      }
      const a = rng.int(11, 20)
      const b = rng.int(a - 10, 10)
      return level === 4 ? vertical([a, b], '−', num(a - b)) : inline([a, '−', b, '=', B(0)], [num(a - b)])
    },
  },
  {
    id: 'g1-missing',
    strand: 'Addition',
    title: 'Missing Numbers',
    blurb: 'What number makes the sentence true?',
    glyph: '?',
    instructions: 'Find the missing number.',
    levels: ['Add, to 10', 'Add and subtract, to 10', 'Add and subtract, to 20'],
    cols: 3,
    perPage: 30,
    gen(rng, level) {
      const hi = level === 3 ? 20 : 10
      const c = rng.int(2, hi)
      const a = rng.int(0, c)
      const b = c - a
      const kind = level === 1 ? rng.int(0, 1) : rng.int(0, 3)
      if (kind === 0) return inline([a, '+', B(0), '=', c], [num(b)])
      if (kind === 1) return inline([B(0), '+', b, '=', c], [num(a)])
      if (kind === 2) return inline([c, '−', B(0), '=', a], [num(b)])
      return inline([B(0), '−', b, '=', a], [num(c)])
    },
  },
  {
    id: 'g1-number-line',
    strand: 'Addition',
    title: 'Number Line Hops',
    blurb: 'Hop along the number line to add and subtract.',
    art: 'frog',
    instructions: 'Use the number line. Write the answer.',
    levels: ['Add to 10', 'Subtract to 10', 'Add and subtract to 20'],
    cols: 1,
    perPage: 6,
    gen(rng, level) {
      const hi = level === 3 ? 20 : 10
      const sub = level === 2 || (level === 3 && rng.bool())
      const a = rng.int(sub ? 3 : 0, sub ? hi : hi - 2)
      const b = sub ? rng.int(1, Math.min(a, 6)) : rng.int(1, Math.min(6, hi - a))
      const end = sub ? a - b : a + b
      const hops = Array.from({ length: b }, (_, i) => (sub ? { from: a - i, to: a - i - 1 } : { from: a + i, to: a + i + 1 }))
      return {
        figure: { type: 'numberLine', min: 0, max: hi, hops, width: hi > 10 ? 520 : 420 },
        ...inline([a, sub ? '−' : '+', b, '=', B(0)], [num(end)]),
      }
    },
  },
  {
    id: 'g1-place-value',
    strand: 'Place Value',
    title: 'Tens and Ones',
    blurb: 'Rods are tens, cubes are ones. Build numbers to 100.',
    glyph: '|||·',
    instructions: 'Count the tens and ones.',
    levels: ['Count the blocks', 'Tens and ones from blocks', 'Tens and ones from a number', 'Expanded form'],
    cols: (l) => (l <= 2 ? 2 : 2),
    perPage: (l) => (l <= 2 ? 8 : 16),
    gen(rng, level) {
      const t = rng.int(1, 9)
      const o = rng.int(0, 9)
      const n = t * 10 + o
      if (level === 1) return { figure: { type: 'baseTen', tens: t, ones: o, u: 6 }, ...inline(['The number is', B(0)], [num(n)]) }
      if (level === 2) return { figure: { type: 'baseTen', tens: t, ones: o, u: 6 }, ...inline([B(0), 'tens', B(1), 'ones', '=', B(2)], [num(t), num(o), num(n)]) }
      if (level === 3) return inline([n, '=', B(0), 'tens', B(1), 'ones'], [num(t), num(o)])
      return inline([n, '=', B(0), '+', B(1)], [num(t * 10), num(o)])
    },
  },
  {
    id: 'g1-compare-100',
    strand: 'Place Value',
    title: 'Compare to 100',
    blurb: 'Greater than, less than, or equal?',
    glyph: '<>',
    instructions: 'Write <, > or = in each circle.',
    levels: ['Numbers to 20', 'Numbers to 100', 'Tricky ones (same tens)'],
    cols: 3,
    perPage: 30,
    gen(rng, level) {
      let a, b
      if (level === 1) {
        a = rng.int(0, 20)
        b = rng.int(0, 20)
      } else if (level === 2) {
        a = rng.int(10, 99)
        b = rng.int(10, 99)
      } else {
        const t = rng.int(1, 9)
        a = t * 10 + rng.int(0, 9)
        b = rng.bool() ? t * 10 + rng.int(0, 9) : rng.int(1, 9) * 10 + (a % 10)
      }
      if (rng.bool(0.1)) b = a
      return inline([a, B(0), b], [choice(CMP, cmp(a, b))])
    },
  },
  {
    id: 'g1-add-tens',
    strand: 'Place Value',
    title: 'Adding Tens',
    blurb: '10 more, 10 less, and adding 2-digit numbers.',
    glyph: '+10',
    instructions: 'Add or subtract.',
    levels: ['10 more / 10 less', 'Add and subtract tens', '2-digit + 1-digit', '2-digit + 2-digit (no regrouping)'],
    cols: (l) => (l === 4 ? 5 : 3),
    perPage: (l) => (l === 4 ? 25 : 30),
    gen(rng, level) {
      if (level === 1) {
        const a = rng.int(10, 89)
        return rng.bool() ? inline([a, '+', 10, '=', B(0)], [num(a + 10)]) : inline([a, '−', 10, '=', B(0)], [num(a - 10)])
      }
      if (level === 2) {
        const a = rng.int(1, 9) * 10
        const b = rng.int(1, 9) * 10
        return rng.bool() && a + b <= 100 ? inline([a, '+', b, '=', B(0)], [num(a + b)]) : inline([Math.max(a, b), '−', Math.min(a, b), '=', B(0)], [num(Math.abs(a - b))])
      }
      if (level === 3) {
        const a = rng.int(11, 89)
        const b = rng.int(1, 9)
        return inline([a, '+', b, '=', B(0)], [num(a + b)])
      }
      const at = rng.int(1, 8), ao = rng.int(0, 8)
      const bt = rng.int(1, 9 - at), bo = rng.int(0, 9 - ao)
      return vertical([at * 10 + ao, bt * 10 + bo], '+', num((at + bt) * 10 + ao + bo))
    },
  },
  {
    id: 'g1-skip-count',
    strand: 'Counting',
    title: 'Skip Counting to 120',
    blurb: 'Count by 2s, 5s and 10s from any number.',
    art: 'bunny',
    instructions: 'Skip count. Fill in the missing numbers.',
    levels: ['By 10s from any number', 'By 5s', 'By 2s', 'Counting backward'],
    cols: 1,
    perPage: 12,
    gen(rng, level) {
      const step = level === 4 ? rng.pick([1, 2, 5, 10]) : lv(level, [10, 5, 2])
      const len = 6
      let start = level === 1 ? rng.int(1, 60) : step * rng.int(0, Math.floor(90 / step))
      let seq = Array.from({ length: len }, (_, i) => start + i * step)
      if (level === 4) seq = seq.reverse()
      const holes = rng.sample([1, 2, 3, 4, 5], 3).sort((a, b) => a - b)
      const answers = []
      const tokens = seq.map((v, i) => {
        if (!holes.includes(i)) return v
        answers.push(num(v))
        return B(answers.length - 1)
      })
      return { prompt: level === 4 ? `Count back by ${step}s.` : `Count by ${step}s.`, ...inline(tokens, answers, { style: 'train' }) }
    },
  },
  {
    id: 'g1-time',
    strand: 'Measurement',
    title: 'Telling Time',
    blurb: "What time is it? O'clock and half past.",
    glyph: '🕑',
    instructions: 'Write the time shown on each clock.',
    levels: ["O'clock", 'Half past', "O'clock and half past"],
    cols: 3,
    perPage: 12,
    gen(rng, level) {
      const h = rng.int(1, 12)
      const m = level === 1 ? 0 : level === 2 ? 30 : rng.pick([0, 30])
      return { figure: { type: 'clock', h, m, size: 120 }, ...inline([B(0)], [time(h, m)]) }
    },
  },
  {
    id: 'g1-coins',
    strand: 'Measurement',
    title: 'Counting Coins',
    blurb: 'Pennies, nickels and dimes. How much money?',
    glyph: '¢',
    instructions: 'Count the coins. Write how many cents.',
    levels: ['Pennies', 'Nickels and pennies', 'Dimes, nickels and pennies'],
    cols: 2,
    perPage: 10,
    gen(rng, level) {
      const d = level === 3 ? rng.int(1, 4) : 0
      const n = level >= 2 ? rng.int(1, level === 3 ? 2 : 4) : 0
      const p = level === 1 ? rng.int(2, 12) : rng.int(0, 4)
      const coins = [...Array(d).fill('d'), ...Array(n).fill('n'), ...Array(p).fill('p')]
      return { figure: { type: 'coins', coins }, ...inline([B(0), '¢'], [num(10 * d + 5 * n + p)]) }
    },
  },
  {
    id: 'g1-fractions',
    strand: 'Fractions',
    title: 'Halves and Fourths',
    blurb: 'Equal shares of circles and rectangles.',
    glyph: '½',
    instructions: 'Circle the words that tell how much is shaded.',
    levels: ['Halves or fourths?', 'One, two or three fourths'],
    cols: 2,
    perPage: 6,
    gen(rng, level) {
      const shape = rng.pick(['circle', 'rect'])
      if (level === 1) {
        const parts = rng.pick([2, 4])
        const name = parts === 2 ? 'one half' : 'one fourth'
        return { figure: { type: 'fraction', shape, parts, shaded: 1, cols: parts === 4 && shape === 'rect' ? rng.pick([2, 4]) : undefined }, ...mc('How much is shaded?', ['one half', 'one fourth', 'one third'], name) }
      }
      const shaded = rng.int(1, 3)
      const opts = ['one fourth', 'two fourths', 'three fourths']
      return { figure: { type: 'fraction', shape, parts: 4, shaded, cols: shape === 'rect' ? 2 : undefined }, ...mc('How much is shaded?', opts, opts[shaded - 1]) }
    },
  },
  {
    id: 'g1-word-problems',
    strand: 'Word Problems',
    title: 'Story Problems',
    blurb: 'Little stories about animals — add or subtract.',
    art: 'bear',
    instructions: 'Read each story. Write the answer.',
    levels: ['Adding to 10', 'Taking away to 10', 'Add or subtract to 20', 'How many more?'],
    cols: 1,
    perPage: 8,
    gen(rng, level) {
      const [who, who2] = rng.sample(NAMES, 2)
      const k = rng.pick(ANIMALS)
      const pl = PLURAL[k]
      const hi = level >= 3 ? 20 : 10
      const doSub = level === 2 || (level === 3 && rng.bool())
      if (level === 4) {
        const [a, b] = [rng.int(2, 10), rng.int(2, 10)].sort((x, y) => y - x)
        const b2 = a === b ? b - 1 : b
        return { prompt: `${who} has ${a} ${pl}. ${who2} has ${b2} ${pl}. How many more ${pl} does ${who} have than ${who2}?`, ...inline([B(0), 'more'], [num(a - b2)]) }
      }
      if (doSub) {
        const a = rng.int(3, hi)
        const b = rng.int(1, a - 1)
        const t = rng.pick([
          `There are ${a} ${pl} in the barn. ${b} go outside to play. How many ${pl} are still in the barn?`,
          `${who} sees ${a} ${pl} at the pond. ${b} hop away. How many ${pl} are left?`,
          `${who} had ${a} stickers. ${who} gave ${b} to a friend. How many stickers are left?`,
        ])
        return { prompt: t, ...inline([B(0)], [num(a - b)]) }
      }
      const s = rng.int(3, hi)
      const a = rng.int(1, s - 1)
      const b = s - a
      const t = rng.pick([
        `${who} sees ${a} ${pl}. Then ${b} more ${pl} come. How many ${pl} are there now?`,
        `There are ${a} ${pl} in the field and ${b} ${pl} in the barn. How many ${pl} in all?`,
        `${who} picked ${a} red apples and ${b} green apples. How many apples did ${who} pick?`,
      ])
      return { prompt: t, ...inline([B(0)], [num(s)]) }
    },
  },
  {
    id: 'g1-picture-graph',
    strand: 'Data',
    title: 'Picture Graphs',
    blurb: 'Read a picture graph about favorite farm animals.',
    glyph: '▤',
    instructions: 'Use the picture graph to answer the question.',
    levels: ['How many?', 'How many more?', 'How many in all?'],
    cols: 1,
    perPage: 3,
    gen(rng, level) {
      const kinds = rng.sample(ANIMALS.filter((a) => a !== 'fish'), 3)
      const rows = kinds.map((kind) => ({ kind, label: PLURAL[kind], value: rng.int(1, 8) }))
      const figure = { type: 'pictograph', rows, title: 'Our Favorite Animals' }
      const [x, y] = rng.sample(rows, 2)
      if (level === 1) return { figure, prompt: `How many children like ${x.label}?`, ...inline([B(0)], [num(x.value)]) }
      if (level === 2) {
        if (x.value === y.value) y.value = x.value === 8 ? 7 : x.value + 1
        const [big, small] = x.value > y.value ? [x, y] : [y, x]
        return { figure, prompt: `How many more children like ${big.label} than ${small.label}?`, ...inline([B(0)], [num(big.value - small.value)]) }
      }
      return { figure, prompt: 'How many children voted in all?', ...inline([B(0)], [num(rows.reduce((s, r) => s + r.value, 0))]) }
    },
  },
  {
    id: 'g1-shape-sides',
    strand: 'Geometry',
    title: 'Shape Sides and Corners',
    blurb: 'Count sides and corners (vertices) of shapes.',
    glyph: '⬡',
    instructions: 'Count and write.',
    levels: ['Sides', 'Corners', 'Which shape?'],
    cols: 2,
    perPage: 8,
    gen(rng, level) {
      const sides = { triangle: 3, square: 4, rectangle: 4, rhombus: 4, trapezoid: 4, pentagon: 5, hexagon: 6, octagon: 8 }
      const shape = rng.pick(Object.keys(sides))
      const color = rng.pick(['red', 'blue', 'yellow', 'green', 'purple', 'orange'])
      if (level === 3) {
        const n = rng.pick([3, 4, 5, 6])
        const names = { 3: 'triangle', 4: 'rectangle', 5: 'pentagon', 6: 'hexagon' }
        return mc(`Which shape has ${n} sides?`, ['triangle', 'rectangle', 'pentagon', 'hexagon'], names[n], {
          optionFigs: Object.fromEntries(Object.values(names).map((s) => [s, { type: 'shape', shape: s, color, size: 50 }])),
        })
      }
      return { figure: { type: 'shape', shape, color }, prompt: level === 1 ? 'How many sides?' : 'How many corners?', ...inline([B(0)], [num(sides[shape])]) }
    },
  },
  {
    id: 'g1-number-words',
    strand: 'Counting',
    title: 'Number Words',
    blurb: 'Match number words like "seven" to numbers.',
    glyph: 'abc',
    instructions: 'Circle the number that matches the word.',
    levels: ['Zero to ten', 'Eleven to twenty'],
    cols: 2,
    perPage: 12,
    gen(rng, level) {
      const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
      const n = level === 1 ? rng.int(0, 10) : rng.int(11, 20)
      const lo = level === 1 ? 0 : 11
      const hi = level === 1 ? 10 : 20
      const opts = [n, ...rng.sample(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter((x) => x !== n), 2)]
      return mc(`“${words[n]}”`, rng.shuffle(opts), n)
    },
  },
]
