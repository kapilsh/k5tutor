// Board-game topics: counting on a race track, moving around a grid, tic-tac-toe,
// board squares, checkers and chess moves, and mini sudoku. They build the
// mental models kids need for real board games — counting spaces, directions,
// rows and columns, straight vs. slanted lines, and "what happens if I move here?".
import { B, inline, lv, mc, num } from './helpers.js'

const ITEMS = ['apple', 'star', 'balloon', 'pig', 'cow', 'chick', 'bunny', 'bear', 'cat', 'ladybug']
const LETTERS = ['A', 'B', 'C', 'D']
const key = (r, c) => `${r},${c}`
const on = (n) => (r, c) => r >= 0 && c >= 0 && r < n && c < n
const pictures = (kinds) => Object.fromEntries(kinds.map((k) => [k, { type: 'critter', kind: k, size: 44 }]))

// Put lettered circles on `right` and `wrong` squares; returns board items and the right letter.
function lettered(rng, right, wrong) {
  const squares = rng.shuffle([right, ...wrong])
  const items = squares.map(([r, c], i) => ({ r, c, mark: LETTERS[i] }))
  const answer = LETTERS[squares.indexOf(right)]
  return { items, options: LETTERS.slice(0, squares.length), answer }
}

// ---- Race track --------------------------------------------------------------

function raceTrack(rng, level) {
  if (level === 1) {
    const d = rng.int(1, 6)
    const at = rng.int(1, 10 - d)
    return {
      prompt: `You are on ${at}. Roll the die and move. Where do you land?`,
      figure: [{ type: 'track', n: 10, at }, { type: 'dice', values: [d] }],
      ...inline([B(0)], [num(at + d)]),
    }
  }
  if (level === 2 || level === 5) {
    const d = rng.int(1, 6)
    const back = level === 5
    const at = back ? rng.int(d + 1, 20) : rng.int(1, 20 - d)
    return {
      prompt: back ? `Oops! Go back. You are on ${at}. Move back the number on the die. Where do you land?` : `You are on ${at}. Roll the die and move. Where do you land?`,
      figure: [{ type: 'track', n: 20, at }, { type: 'dice', values: [d] }],
      ...inline([B(0)], [num(back ? at - d : at + d)]),
    }
  }
  if (level === 4) {
    const [a, b] = [rng.int(1, 6), rng.int(1, 6)]
    const at = rng.int(1, 30 - a - b)
    return {
      prompt: `You are on ${at}. Roll two dice and move. Where do you land?`,
      figure: [{ type: 'track', n: 30, at }, { type: 'dice', values: [a, b] }],
      ...inline([B(0)], [num(at + a + b)]),
    }
  }
  // level 3: one ladder and one slide
  // square k on the bottom row sits right under 21 − k, so ladders and slides
  // lean at most one square sideways
  const lFrom = rng.int(2, 9)
  const lTo = 21 - lFrom + rng.int(-1, 1)
  let sFrom, sTo
  do {
    sFrom = rng.int(12, 19)
    sTo = 21 - sFrom + rng.int(-1, 1)
  } while (Math.abs(sFrom - lTo) < 2 || Math.abs(sTo - lFrom) < 2 || sTo < 2)
  const d = rng.int(1, 6)
  const special = new Set([lFrom, lTo, sFrom, sTo])
  const target = rng.pick([lFrom, sFrom, null])
  let at
  if (target != null && target - d >= 1 && !special.has(target - d)) at = target - d
  else {
    const starts = Array.from({ length: 19 - d }, (_, i) => i + 1).filter((s) => !special.has(s))
    at = rng.pick(starts)
  }
  const land = at + d
  const end = land === lFrom ? lTo : land === sFrom ? sTo : land
  return {
    prompt: `You are on ${at}. Roll and move. Land on a ladder? Climb up! Land on a slide? Slide down! Where do you end up?`,
    figure: [{ type: 'track', n: 20, at, ladders: [{ from: lFrom, to: lTo }], slides: [{ from: sFrom, to: sTo }] }, { type: 'dice', values: [d] }],
    ...inline([B(0)], [num(end)]),
  }
}

// ---- Grid walk -------------------------------------------------------------

const DIRS = {
  right: [0, 1, '→'],
  left: [0, -1, '←'],
  up: [-1, 0, '↑'],
  down: [1, 0, '↓'],
}
const WORD = { right: 'to the RIGHT of', left: 'to the LEFT of', up: 'just ABOVE', down: 'just BELOW' }

function gridWalk(rng, level) {
  const N = 5
  const inside = on(N)
  const fr = rng.int(0, N - 1)
  const fc = rng.int(0, N - 1)
  const frog = { r: fr, c: fc, critter: 'frog' }
  const board = (items) => ({ type: 'board', rows: N, cols: N, cell: 34, items: [frog, ...items] })

  if (level === 1) {
    const dirs = Object.keys(DIRS).filter((d) => inside(fr + DIRS[d][0], fc + DIRS[d][1]))
    const [want, ...others] = rng.shuffle(dirs)
    const kinds = rng.sample(ITEMS, Math.min(3, dirs.length))
    const items = [want, ...others].slice(0, kinds.length).map((d, i) => ({ r: fr + DIRS[d][0], c: fc + DIRS[d][1], critter: kinds[i] }))
    const phrase = want === 'up' || want === 'down' ? `${WORD[want]} the frog` : `just ${WORD[want]} the frog`
    return { figure: board(items), ...mc(`What is ${phrase}?`, rng.shuffle(kinds), kinds[0], { optionFigs: pictures(kinds) }) }
  }

  if (level === 2) {
    for (;;) {
      const hops = Array.from({ length: rng.int(2, 3) }, () => rng.pick(Object.keys(DIRS)))
      let r = fr, c = fc
      let ok = true
      for (const h of hops) {
        r += DIRS[h][0]
        c += DIRS[h][1]
        if (!inside(r, c)) ok = false
      }
      if (!ok || (r === fr && c === fc)) continue
      // tempting wrong squares: stopping one hop early, and mixing up up/down or left/right
      const flip = { right: 'left', left: 'right', up: 'down', down: 'up' }
      let wr = fr, wc = fc
      for (const h of hops.map((h, i) => (i === hops.length - 1 ? flip[h] : h))) {
        wr += DIRS[h][0]
        wc += DIRS[h][1]
      }
      let er = fr, ec = fc
      for (const h of hops.slice(0, -1)) {
        er += DIRS[h][0]
        ec += DIRS[h][1]
      }
      const wrong = [[wr, wc], [er, ec]].filter(([a, b]) => inside(a, b) && !(a === fr && b === fc) && !(a === r && b === c))
      const seen = new Set()
      const spots = [[r, c], ...wrong].filter(([a, b]) => !seen.has(key(a, b)) && seen.add(key(a, b)))
      if (spots.length < 2) continue
      const kinds = rng.sample(ITEMS, spots.length)
      const items = spots.map(([a, b], i) => ({ r: a, c: b, critter: kinds[i] }))
      return {
        figure: board(items),
        ...mc(`The frog hops ${hops.map((h) => DIRS[h][2]).join(' ')}. Where does it land?`, rng.shuffle(kinds), kinds[0], { optionFigs: pictures(kinds) }),
      }
    }
  }

  // levels 3–4: count the hops to the apple (3: same row or column, 4: any)
  let ar, ac
  do {
    if (level === 3) {
      if (rng.bool()) {
        ar = fr
        ac = rng.int(0, N - 1)
      } else {
        ar = rng.int(0, N - 1)
        ac = fc
      }
    } else {
      ar = rng.int(0, N - 1)
      ac = rng.int(0, N - 1)
    }
  } while ((ar === fr && ac === fc) || (level === 4 && (ar === fr || ac === fc)))
  return {
    prompt: level === 3 ? 'How many hops to the apple?' : 'How many hops to the apple? The frog hops up, down, left or right — no slanted hops!',
    figure: board([{ r: ar, c: ac, critter: 'apple' }]),
    ...inline([B(0), 'hops'], [num(Math.abs(ar - fr) + Math.abs(ac - fc))]),
  }
}

// ---- Tic-tac-toe ---------------------------------------------------------------

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
const winner = (b) => {
  for (const [x, y, z] of LINES) if (b[x] && b[x] === b[y] && b[y] === b[z]) return b[x]
  return null
}
const winningSquares = (b, p) => [...Array(9).keys()].filter((i) => !b[i] && winner(b.map((v, j) => (j === i ? p : v))) === p)

function ticTacToe(rng, level) {
  for (let t = 0; t < 2000; t++) {
    const b = Array(9).fill('')
    const order = rng.shuffle([...Array(9).keys()])
    if (level === 1) {
      let w = null
      for (let k = 0; k < 9 && !w; k++) {
        b[order[k]] = k % 2 ? 'O' : 'X'
        w = winner(b)
      }
      const ans = w || 'nobody'
      return { figure: { type: 'ticTacToe', cells: b }, ...mc('Who won?', ['X', 'O', 'nobody'], ans) }
    }
    // play a few random moves, then look for a position with one winning (or blocking) square
    const moves = level === 2 ? rng.pick([4, 6]) : rng.pick([3, 5])
    for (let k = 0; k < moves; k++) b[order[k]] = k % 2 ? 'O' : 'X'
    if (winner(b)) continue
    const me = level === 2 ? 'X' : 'O'
    const them = level === 2 ? 'O' : 'X'
    const mine = winningSquares(b, me)
    const theirs = winningSquares(b, them)
    if (level === 2 && mine.length === 1) {
      return { prompt: "It's X's turn. Which square wins the game for X?", figure: { type: 'ticTacToe', cells: b, numbers: true }, ...inline(['Square', B(0)], [num(mine[0] + 1)]) }
    }
    if (level === 3 && mine.length === 0 && theirs.length === 1) {
      return { prompt: "You are O. X is about to win! Which square stops X?", figure: { type: 'ticTacToe', cells: b, numbers: true }, ...inline(['Square', B(0)], [num(theirs[0] + 1)]) }
    }
  }
  throw new Error('no tic-tac-toe position found')
}

// ---- Board squares (A1 … E5) ---------------------------------------------------

const sq = (N) => (r, c) => `${String.fromCharCode(65 + c)}${N - r}`

function boardSquares(rng, level) {
  const N = 5
  const name = sq(N)
  const inside = on(N)
  const board = (items) => ({ type: 'board', rows: N, cols: N, cell: 32, labels: true, checkered: true, items })
  const cells = rng.sample([...Array(N * N).keys()], 3).map((i) => [Math.floor(i / N), i % N])
  const kinds = rng.sample(ITEMS, 3)
  const items = cells.map(([r, c], i) => ({ r, c, critter: kinds[i] }))
  if (level === 1) {
    const [r, c] = cells[0]
    return { figure: board(items), ...mc(`What is on square ${name(r, c)}?`, rng.shuffle(kinds), kinds[0], { optionFigs: pictures(kinds) }) }
  }
  if (level === 2) {
    const [r, c] = cells[0]
    // tempting: the letter and number swapped, or one square off
    const swapped = inside(N - 1 - c, N - 1 - r) ? [[N - 1 - c, N - 1 - r]] : []
    const near = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => inside(a, b))
    const wrong = [...new Set([...swapped, ...rng.shuffle(near)].map(([a, b]) => name(a, b)))].filter((s) => s !== name(r, c)).slice(0, 2)
    return { figure: board(items), ...mc(`Which square is the ${kinds[0]} on?`, rng.shuffle([name(r, c), ...wrong]), name(r, c)) }
  }
  // levels 3–4: the frog moves; which square does it land on?
  for (let t = 0; t < 500; t++) {
    const fr = rng.int(0, N - 1)
    const fc = rng.int(0, N - 1)
    const steps = level === 3 ? [[rng.pick(['up', 'down', 'left', 'right']), rng.int(1, 3)]] : [[rng.pick(['left', 'right']), rng.int(1, 3)], [rng.pick(['up', 'down']), rng.int(1, 3)]]
    let r = fr, c = fc
    for (const [d, k] of steps) {
      r += DIRS[d][0] * k
      c += DIRS[d][1] * k
    }
    if (!inside(r, c)) continue
    const wrongs = new Set()
    // off by one, and the wrong direction
    for (const [a, b] of [[r + DIRS[steps.at(-1)[0]][0], c + DIRS[steps.at(-1)[0]][1]], [r - DIRS[steps.at(-1)[0]][0], c - DIRS[steps.at(-1)[0]][1]], [2 * fr - r, 2 * fc - c], [2 * fr - r, c], [r, 2 * fc - c]])
      if (inside(a, b) && !(a === r && b === c)) wrongs.add(name(a, b))
    if (wrongs.size < 2) continue
    const said = steps.map(([d, k]) => `${k} ${k === 1 ? 'square' : 'squares'} ${d}`).join(', then ')
    const opts = rng.shuffle([name(r, c), ...rng.sample([...wrongs], 2)])
    return {
      figure: board([{ r: fr, c: fc, critter: 'frog' }]),
      ...mc(`The frog is on ${name(fr, fc)}. It hops ${said}. Which square is it on now?`, opts, name(r, c)),
    }
  }
  throw new Error('no move found')
}

// ---- Checkers --------------------------------------------------------------------
// Red moves up the board (toward row 0). Checkers sit on the dark squares ((r + c) odd).

function checkerJumps(N, black, r, c, taken = new Set()) {
  const inside = on(N)
  let best = 0
  for (const dc of [-1, 1]) {
    const mr = r - 1, mc_ = c + dc, lr = r - 2, lc = c + 2 * dc
    if (!inside(lr, lc) || !black.has(key(mr, mc_)) || taken.has(key(mr, mc_)) || (black.has(key(lr, lc)) && !taken.has(key(lr, lc)))) continue
    const next = new Set(taken).add(key(mr, mc_))
    best = Math.max(best, 1 + checkerJumps(N, black, lr, lc, next))
  }
  return best
}

function checkers(rng, level) {
  const N = level === 5 ? 8 : 6
  const inside = on(N)
  const dark = (r, c) => (r + c) % 2 === 1
  const board = (items) => ({ type: 'board', rows: N, cols: N, cell: level === 5 ? 24 : 28, checkered: true, wood: true, items })
  const redAt = (rMin) => {
    const r = rng.int(rMin, N - 1)
    const cs = [...Array(N).keys()].filter((c) => dark(r, c))
    return [r, rng.pick(cs)]
  }

  if (level === 1) {
    for (;;) {
      const [r, c] = redAt(1)
      const fwd = [[r - 1, c - 1], [r - 1, c + 1]].filter(([a, b]) => inside(a, b))
      const wrong = [[r - 1, c], [r + 1, c - 1], [r + 1, c + 1], [r, c - 2], [r, c + 2]].filter(([a, b]) => inside(a, b))
      if (!fwd.length || wrong.length < 2) continue
      const { items, options, answer } = lettered(rng, rng.pick(fwd), rng.sample(wrong, 2))
      return {
        figure: board([{ r, c, checker: 'red' }, ...items]),
        ...mc('A checker moves one step forward on a slant. Red moves up. Which square can the red checker move to?', options, answer),
      }
    }
  }

  if (level === 2) {
    const [r, c] = redAt(1)
    const fwd = [[r - 1, c - 1], [r - 1, c + 1]].filter(([a, b]) => inside(a, b))
    const blocked = fwd.filter(() => rng.bool(0.4))
    const items = [{ r, c, checker: 'red', glow: true }, ...blocked.map(([a, b]) => ({ r: a, c: b, checker: 'red' }))]
    // a couple of far-away black checkers so the board looks like a game
    const far = []
    for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) if (dark(a, b) && Math.abs(a - r) > 2) far.push([a, b])
    items.push(...rng.sample(far, rng.int(1, 3)).map(([a, b]) => ({ r: a, c: b, checker: 'black' })))
    return {
      prompt: 'The glowing red checker can move forward (up) on a slant, but not onto another checker. How many squares can it move to?',
      figure: board(items),
      ...inline([B(0)], [num(fwd.length - blocked.length)]),
    }
  }

  if (level === 3 || level === 4) {
    for (;;) {
      const [r, c] = redAt(level === 4 ? 2 : 1)
      const dc = rng.pick([-1, 1])
      const canJump = level === 4 || rng.bool()
      let black, landing
      if (canJump) {
        black = [r - 1, c + dc]
        landing = [r - 2, c + 2 * dc]
        if (!inside(...landing)) continue
      } else {
        // looks close, but no jump: landing off the board, blocked, or the black checker is not on a forward slant
        const kind = rng.pick(['edge', 'blocked', 'behind', 'far'])
        if (kind === 'edge') {
          black = [r - 1, c + dc]
          if (!inside(...black) || inside(r - 2, c + 2 * dc)) continue
        } else if (kind === 'blocked') {
          black = [r - 1, c + dc]
          landing = [r - 2, c + 2 * dc]
          if (!inside(...black) || !inside(...landing)) continue
        } else if (kind === 'behind') black = [r + 1, c + dc]
        else black = [r - 2, c]
        if (!inside(...black)) continue
        const items = [{ r, c, checker: 'red' }, { r: black[0], c: black[1], checker: 'black' }]
        if (kind === 'blocked') items.push({ r: landing[0], c: landing[1], checker: 'black' })
        return {
          figure: board(items),
          ...mc('Red moves up. A checker can jump over the other color on a slant if the square just past it is empty. Can the red checker jump?', ['yes', 'no'], 'no'),
        }
      }
      if (!inside(...black)) continue
      const items = [{ r, c, checker: 'red' }, { r: black[0], c: black[1], checker: 'black' }]
      if (level === 3)
        return {
          figure: board(items),
          ...mc('Red moves up. A checker can jump over the other color on a slant if the square just past it is empty. Can the red checker jump?', ['yes', 'no'], 'yes'),
        }
      const wrong = [[r - 1, c - dc], [r - 3, c + 3 * dc], [r - 2, c], [r - 2, c + dc]].filter(([a, b]) => inside(a, b) && dark(a, b))
      if (wrong.length < 2) continue
      const lt = lettered(rng, landing, rng.sample(wrong, 2))
      return {
        figure: board([...items, ...lt.items]),
        ...mc('The red checker jumps over the black checker. Where does it land?', lt.options, lt.answer),
      }
    }
  }

  // level 5: chains of jumps on a big board
  for (;;) {
    const [r0, c0] = redAt(N - 2)
    const black = new Set()
    let r = r0, c = c0
    const want = rng.int(2, 3)
    for (let k = 0; k < want; k++) {
      const dc = rng.pick([-1, 1])
      if (!inside(r - 2, c + 2 * dc)) break
      black.add(key(r - 1, c + dc))
      r -= 2
      c += 2 * dc
    }
    // a few extra black checkers elsewhere
    for (let k = rng.int(1, 3); k > 0; k--) {
      const a = rng.int(0, N - 1), b = rng.int(0, N - 1)
      if (dark(a, b) && !(a === r0 && b === c0)) black.add(key(a, b))
    }
    const best = checkerJumps(N, black, r0, c0)
    // mostly real double (or triple) jumps, sometimes a single one to keep kids checking
    if (best === 0 || (best === 1 && rng.bool(0.8))) continue
    const items = [{ r: r0, c: c0, checker: 'red' }, ...[...black].map((s) => ({ r: +s.split(',')[0], c: +s.split(',')[1], checker: 'black' }))]
    return {
      prompt: 'Red moves up and can keep jumping in one turn! What is the most black checkers red can capture?',
      figure: board(items),
      ...inline([B(0)], [num(best)]),
    }
  }
}

// ---- Chess moves -------------------------------------------------------------------

const PIECES = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight', P: 'pawn' }
const STRAIGHT = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const SLANT = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
const JUMPS = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]
const RULE = {
  R: 'The rook moves in straight lines: up, down, left or right, as far as it likes.',
  B: 'The bishop moves on slants (diagonals), as far as it likes.',
  K: 'The king moves just one square, any way.',
  Q: 'The queen moves like a rook or a bishop: straight or slanted, as far as she likes.',
  N: 'The knight jumps in an L: two squares one way, then one square to the side.',
}

// Squares a piece can move to; `blocked` squares stop sliding pieces (the blocker itself is included, as a capture).
function reach(p, r, c, N, blocked = new Set()) {
  const inside = on(N)
  const out = []
  const slide = (dirs) => {
    for (const [dr, dc] of dirs)
      for (let a = r + dr, b = c + dc; inside(a, b); a += dr, b += dc) {
        out.push([a, b])
        if (blocked.has(key(a, b))) break
      }
  }
  if (p === 'R') slide(STRAIGHT)
  if (p === 'B') slide(SLANT)
  if (p === 'Q') slide([...STRAIGHT, ...SLANT])
  if (p === 'K') for (const [dr, dc] of [...STRAIGHT, ...SLANT]) inside(r + dr, c + dc) && out.push([r + dr, c + dc])
  if (p === 'N') for (const [dr, dc] of JUMPS) inside(r + dr, c + dc) && out.push([r + dr, c + dc])
  return out
}

function chess(rng, level) {
  const N = 5
  const inside = on(N)
  const board = (items) => ({ type: 'board', rows: N, cols: N, cell: 32, checkered: true, wood: true, items })
  if (level === 1) {
    const p = rng.pick(Object.keys(PIECES))
    const names = [PIECES[p], ...rng.sample(Object.values(PIECES).filter((n) => n !== PIECES[p]), 2)]
    return { figure: { type: 'chessPiece', piece: p, side: rng.pick(['w', 'b']) }, ...mc('What is this chess piece called?', rng.shuffle(names), PIECES[p]) }
  }
  if (level <= 5) {
    const p = level === 2 ? 'R' : level === 3 ? 'B' : level === 4 ? rng.pick(['K', 'Q']) : 'N'
    for (;;) {
      const r = rng.int(0, N - 1)
      const c = rng.int(0, N - 1)
      const ok = new Set(reach(p, r, c, N).map(([a, b]) => key(a, b)))
      // tempting wrong squares: the "other" kind of line for each piece
      const tempt = {
        R: SLANT.map(([a, b]) => [r + a, c + b]),
        B: STRAIGHT.map(([a, b]) => [r + a, c + b]),
        K: [...STRAIGHT, ...SLANT].map(([a, b]) => [r + 2 * a, c + 2 * b]),
        Q: JUMPS.map(([a, b]) => [r + a, c + b]),
        N: [...STRAIGHT, ...SLANT].flatMap(([a, b]) => [[r + a, c + b], [r + 2 * a, c + 2 * b]]),
      }[p].filter(([a, b]) => inside(a, b) && !ok.has(key(a, b)))
      if (!ok.size || tempt.length < 2) continue
      const right = rng.pick([...ok].map((s) => s.split(',').map(Number)))
      const { items, options, answer } = lettered(rng, right, rng.sample(tempt, 2))
      return {
        figure: board([{ r, c, chess: p, side: 'w' }, ...items]),
        ...mc(`${RULE[p]} Which square can the ${PIECES[p]} move to?`, options, answer),
      }
    }
  }
  // level 6: which white piece can capture the black pawn?
  for (;;) {
    const spots = rng.sample([...Array(N * N).keys()], 4).map((i) => [Math.floor(i / N), i % N])
    const [[tr, tc], ...rest] = spots
    const kinds = rng.shuffle(['R', 'B', 'N'])
    const blocked = new Set(spots.map(([a, b]) => key(a, b)))
    const hits = kinds.filter((p, i) => reach(p, rest[i][0], rest[i][1], N, blocked).some(([a, b]) => a === tr && b === tc))
    if (hits.length !== 1) continue
    const items = [{ r: tr, c: tc, chess: 'P', side: 'b' }, ...kinds.map((p, i) => ({ r: rest[i][0], c: rest[i][1], chess: p, side: 'w' }))]
    return {
      figure: board(items),
      ...mc('Which white piece can capture (land on) the black pawn? Pieces cannot jump over each other — except the knight!', ['rook', 'bishop', 'knight'], PIECES[hits[0]]),
    }
  }
}

// ---- Mini sudoku -------------------------------------------------------------------

function sudokuSolution(rng) {
  const base = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]]
  const digits = rng.shuffle([1, 2, 3, 4])
  const bands = rng.shuffle([0, 1])
  const rows = bands.flatMap((b) => rng.shuffle([2 * b, 2 * b + 1]))
  const stacks = rng.shuffle([0, 1])
  const cols = stacks.flatMap((s) => rng.shuffle([2 * s, 2 * s + 1]))
  return rows.flatMap((r) => cols.map((c) => digits[base[r][c] - 1]))
}

function candidates(g, i, { col = true, box = true } = {}) {
  const r = Math.floor(i / 4), c = i % 4
  const used = new Set()
  for (let k = 0; k < 4; k++) {
    used.add(g[r * 4 + k])
    if (col) used.add(g[k * 4 + c])
  }
  if (box) {
    const br = r - (r % 2), bc = c - (c % 2)
    for (const [a, b] of [[0, 0], [0, 1], [1, 0], [1, 1]]) used.add(g[(br + a) * 4 + bc + b])
  }
  return [1, 2, 3, 4].filter((d) => !used.has(d))
}

function miniSudoku(rng, level) {
  for (;;) {
    const sol = sudokuSolution(rng)
    const ask = rng.int(0, 15)
    const g = sol.map((v, i) => (i === ask || rng.bool(level === 1 ? 0.3 : 0.5) ? 0 : v))
    const r = Math.floor(ask / 4)
    if (level === 1) for (let k = 0; k < 4; k++) if (r * 4 + k !== ask) g[r * 4 + k] = sol[r * 4 + k]
    const rowOnly = candidates(g, ask, { col: false, box: false }).length
    const rowCol = candidates(g, ask, { box: false }).length
    const all = candidates(g, ask).length
    const good = level === 1 ? rowOnly === 1 : level === 2 ? rowOnly >= 2 && rowCol === 1 : rowCol >= 2 && all === 1
    if (!good) continue
    return {
      prompt: lv(level, [
        'Each row has 1, 2, 3 and 4. What number goes in the ? square?',
        'Each row and each column has 1, 2, 3 and 4. What goes in the ? square?',
        'Each row, column and thick-lined box has 1, 2, 3 and 4. What goes in the ? square?',
      ]),
      figure: { type: 'sudoku', grid: g, ask },
      ...inline([B(0)], [num(sol[ask])]),
    }
  }
}

// ---- Topics --------------------------------------------------------------------------

export const kGames = [
  {
    id: 'k-race-track',
    strand: 'Games',
    title: 'Board Game Race',
    blurb: 'Roll the die and hop along the track. Ladders up, slides down!',
    glyph: '⚀',
    instructions: 'Start on your square. Count the dots and move. Write where you land.',
    levels: ['Roll and move (to 10)', 'Roll and move (to 20)', 'Ladders and slides', 'Two dice (to 30)', 'Go back!'],
    cols: 2,
    perPage: (l) => lv(l, [8, 6, 6, 6, 6]),
    gen: raceTrack,
  },
  {
    id: 'k-grid-walk',
    strand: 'Games',
    title: 'Frog Hops',
    blurb: 'Left, right, up and down: follow the frog around the board.',
    art: 'frog',
    instructions: 'Look at the board. Answer each question.',
    levels: ['Next to the frog', 'Follow the arrows', 'Count the hops (in a line)', 'Count the hops (turn a corner)'],
    cols: 2,
    perPage: 6,
    gen: gridWalk,
  },
  {
    id: 'k-tic-tac-toe',
    strand: 'Games',
    title: 'Tic-Tac-Toe',
    blurb: 'Three in a row wins! Spot the winner, win the game, block a win.',
    glyph: '#',
    instructions: 'Look at each tic-tac-toe game. Answer the question.',
    levels: ['Who won?', 'Win in one move', 'Block the win'],
    cols: 3,
    perPage: 9,
    gen: ticTacToe,
  },
]

export const g1Games = [
  {
    id: 'g1-board-squares',
    strand: 'Games',
    title: 'Board Squares',
    blurb: 'Every square has a name, like B3 — just like a chess board.',
    glyph: 'B3',
    instructions: 'Letters go across the bottom, numbers go up the side. Answer each question.',
    levels: ["What's on the square?", 'Name the square', 'Hop one way', 'Hop two ways'],
    cols: 2,
    perPage: 6,
    gen: boardSquares,
  },
  {
    id: 'g1-checkers',
    strand: 'Games',
    title: 'Checkers Moves',
    blurb: 'Slanted steps, jumps and double jumps.',
    glyph: '⛀',
    instructions: 'Red always moves up the board. Answer each question.',
    levels: ['Which way can it move?', 'How many moves?', 'Can it jump?', 'Where does it land?', 'Double jumps'],
    cols: 2,
    perPage: (l) => (l === 5 ? 4 : 6),
    gen: checkers,
  },
  {
    id: 'g1-chess',
    strand: 'Games',
    title: 'Chess Moves',
    blurb: 'Meet the pieces and learn how each one moves.',
    glyph: '♞',
    instructions: 'Read how the piece moves. Answer each question.',
    levels: ['Meet the pieces', 'The rook', 'The bishop', 'The king and queen', 'The knight', 'Who can capture?'],
    cols: (l) => (l === 1 ? 3 : 2),
    perPage: (l) => (l === 1 ? 9 : 6),
    gen: chess,
  },
  {
    id: 'g1-mini-sudoku',
    strand: 'Games',
    title: 'Mini Sudoku',
    blurb: 'Puzzle it out: 1, 2, 3 and 4 in every row and column.',
    glyph: '4×4',
    instructions: 'Find the number that goes in the ? square.',
    levels: ['Finish the row', 'Rows and columns', 'Rows, columns and boxes'],
    cols: 3,
    perPage: 9,
    gen: miniSudoku,
  },
]
