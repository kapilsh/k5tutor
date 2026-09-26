// Game pictures: dice, race-track boards with ladders and slides, grid / chess /
// checkers boards, tic-tac-toe and mini sudoku.
import { CritterG } from '../art/Critters.jsx'

const INK = '#3b2f2f'
const FONT = 'Fredoka, sans-serif'
// Chess glyphs: outlined for white, solid for black. U+FE0E asks for the plain text (not emoji) form.
const GLYPH = {
  w: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  b: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
}
const PIECE_FONT = '"DejaVu Sans", "Segoe UI Symbol", "Noto Sans Symbols 2", "Apple Symbols", serif'

const PIPS = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
}

function DieG({ v, x = 0, y = 0, s = 40 }) {
  const d = s * 0.26
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={s} height={s} rx={s * 0.18} fill="#fff" stroke={INK} strokeWidth="2.5" />
      {PIPS[v].map(([px, py], i) => (
        <circle key={i} cx={s / 2 + px * d} cy={s / 2 + py * d} r={s * 0.09} fill={INK} />
      ))}
    </g>
  )
}

export function Dice({ values, size = 40 }) {
  const gap = 10
  const w = values.length * (size + gap) - gap
  return (
    <svg viewBox={`-2 -2 ${w + 4} ${size + 4}`} width={w + 4} height={size + 4} className="fig">
      {values.map((v, i) => (
        <DieG key={i} v={v} x={i * (size + gap)} s={size} />
      ))}
    </svg>
  )
}

// A little game pawn centred at (x, y), bottom at y + h/2.
function Pawn({ x, y, s = 20, color = '#4dabf7' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s / 20})`} stroke={INK} strokeWidth="1.6" strokeLinejoin="round">
      <path d="M-7 9 L-4 -1 L4 -1 L7 9 Z" fill={color} />
      <circle cy="-5" r="5" fill={color} />
    </g>
  )
}

// Race track: squares 1..n in rows of 10, snaking up like a board game
// (row 1 left→right, row 2 right→left …). Ladders go up, slides go down.
export function Track({ n, at, cell = 34, ladders = [], slides = [] }) {
  const rows = Math.ceil(n / 10)
  const cols = Math.min(n, 10)
  const pos = (k) => {
    const r = Math.floor((k - 1) / 10)
    const i = (k - 1) % 10
    const c = r % 2 === 0 ? i : 9 - i
    return { x: c * cell + cell / 2, y: (rows - 1 - r) * cell + cell / 2 }
  }
  const W = cols * cell
  const H = rows * cell
  return (
    <svg viewBox={`-3 -3 ${W + 6} ${H + 6}`} width={W + 6} height={H + 6} className="fig">
      {Array.from({ length: n }, (_, i) => {
        const k = i + 1
        const { x, y } = pos(k)
        return (
          <g key={k}>
            <rect x={x - cell / 2} y={y - cell / 2} width={cell} height={cell} fill={k === n ? '#ffd43b' : k % 2 ? '#fff' : '#fff4e6'} stroke={INK} strokeWidth="1.5" />
            <text x={x - cell / 2 + 3} y={y - cell / 2 + 12} fontSize="11" fontWeight="700" fill={INK} fontFamily={FONT}>
              {k}
            </text>
          </g>
        )
      })}
      {ladders.map(({ from, to }, i) => {
        const a = pos(from)
        const b = pos(to)
        const len = Math.hypot(b.x - a.x, b.y - a.y)
        const ux = (b.x - a.x) / len
        const uy = (b.y - a.y) / len
        const px = -uy * 5
        const py = ux * 5
        const rungs = Math.max(2, Math.floor(len / 8))
        return (
          <g key={`l${i}`} stroke="#8d5524" strokeWidth="2.2" strokeLinecap="round">
            <line x1={a.x + px} y1={a.y + py} x2={b.x + px} y2={b.y + py} />
            <line x1={a.x - px} y1={a.y - py} x2={b.x - px} y2={b.y - py} />
            {Array.from({ length: rungs - 1 }, (_, j) => {
              const t = (j + 1) / rungs
              const cx = a.x + (b.x - a.x) * t
              const cy = a.y + (b.y - a.y) * t
              return <line key={j} x1={cx + px} y1={cy + py} x2={cx - px} y2={cy - py} strokeWidth="1.6" />
            })}
          </g>
        )
      })}
      {slides.map(({ from, to }, i) => {
        const a = pos(from)
        const b = pos(to)
        const mx = (a.x + b.x) / 2 + (a.y - b.y) * 0.35
        const my = (a.y + b.y) / 2
        return (
          <g key={`s${i}`} fill="none" strokeLinecap="round">
            <path d={`M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`} stroke={INK} strokeWidth="8" />
            <path d={`M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`} stroke="#63e6be" strokeWidth="5" />
            <circle cx={b.x} cy={b.y} r="3.5" fill="#63e6be" stroke={INK} strokeWidth="1.5" />
          </g>
        )
      })}
      {at != null && <Pawn x={pos(at).x + 3} y={pos(at).y + 2} s={cell * 0.62} color="#e03131" />}
    </svg>
  )
}

function ChessG({ piece, side = 'w', x, y, s }) {
  return (
    <text x={x} y={y + s * 0.4} textAnchor="middle" fontSize={s * 1.2} fill="#111" fontFamily={PIECE_FONT}>
      {GLYPH[side][piece] + '\uFE0E'}
    </text>
  )
}

function CheckerG({ color, king, glow, x, y, s }) {
  const fill = color === 'red' ? '#e03131' : '#343a40'
  const r = s * 0.38
  return (
    <g>
      {glow && <circle cx={x} cy={y} r={s * 0.48} fill="#ffe066" stroke="#f59f00" strokeWidth="1.5" />}
      <circle cx={x} cy={y + 1.5} r={r} fill={INK} />
      <circle cx={x} cy={y} r={r} fill={fill} stroke={INK} strokeWidth="1.5" />
      <circle cx={x} cy={y} r={r * 0.66} fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.2" />
      {king && <path d={`M${x - r * 0.5} ${y + r * 0.3} L${x - r * 0.55} ${y - r * 0.35} L${x - r * 0.2} ${y} L${x} ${y - r * 0.5} L${x + r * 0.2} ${y} L${x + r * 0.55} ${y - r * 0.35} L${x + r * 0.5} ${y + r * 0.3} Z`} fill="#ffd43b" stroke={INK} strokeWidth="1" />}
    </g>
  )
}

// A grid board. items: [{ r, c, ... }] with r = 0 at the top row and one of
//   chess: 'R' | 'B' | 'N' | 'K' | 'Q' | 'P', side: 'w' | 'b'
//   checker: 'red' | 'black', king?, glow?
//   critter: kind           (any critter, apple, star, balloon)
//   mark: 'A'               a lettered answer circle
// checkered colours the squares; labels adds A, B, C… under the columns and
// 1, 2, 3… beside the rows (1 at the bottom), like a chess board.
export function Board({ rows, cols, items = [], cell = 30, checkered = false, labels = false, wood = false }) {
  const L = labels ? 16 : 0
  const W = cols * cell
  const H = rows * cell
  const light = wood ? '#f3dfbf' : '#fff'
  const dark = wood ? '#b58863' : '#dee2e6'
  return (
    <svg viewBox={`${-L - 2} -2 ${W + L + 4} ${H + L + 4}`} width={W + L + 4} height={H + L + 4} className="fig">
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols)
        const c = i % cols
        const isDark = checkered && (r + c) % 2 === 1
        return <rect key={i} x={c * cell} y={r * cell} width={cell} height={cell} fill={isDark ? dark : light} stroke={checkered ? 'none' : INK} strokeWidth="1.2" />
      })}
      <rect x="0" y="0" width={W} height={H} fill="none" stroke={INK} strokeWidth="2.5" />
      {labels && (
        <g fontSize="11" fontWeight="700" fill={INK} fontFamily={FONT} textAnchor="middle">
          {Array.from({ length: cols }, (_, c) => (
            <text key={`c${c}`} x={c * cell + cell / 2} y={H + 13}>
              {String.fromCharCode(65 + c)}
            </text>
          ))}
          {Array.from({ length: rows }, (_, r) => (
            <text key={`r${r}`} x={-L / 2 - 1} y={r * cell + cell / 2 + 4}>
              {rows - r}
            </text>
          ))}
        </g>
      )}
      {items.map((it, i) => {
        const x = it.c * cell + cell / 2
        const y = it.r * cell + cell / 2
        if (it.chess) return <ChessG key={i} piece={it.chess} side={it.side} x={x} y={y} s={cell} />
        if (it.checker) return <CheckerG key={i} color={it.checker} king={it.king} glow={it.glow} x={x} y={y} s={cell} />
        if (it.critter) return <CritterG key={i} kind={it.critter} x={x - cell * 0.42} y={y - cell * 0.42} size={cell * 0.84} />
        if (it.mark)
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={cell * 0.34} fill="#fff" stroke="#1c7ed6" strokeWidth="2" />
              <text x={x} y={y + cell * 0.15} textAnchor="middle" fontSize={cell * 0.42} fontWeight="700" fill="#1c7ed6" fontFamily={FONT}>
                {it.mark}
              </text>
            </g>
          )
        return null
      })}
    </svg>
  )
}

// One big chess piece on a square, for "name the piece".
export function ChessPiece({ piece, side = 'w', size = 70 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} className="fig">
      <rect x="1.5" y="1.5" width="57" height="57" rx="8" fill="#f3dfbf" stroke={INK} strokeWidth="2.5" />
      <ChessG piece={piece} side={side} x={30} y={30} s={50} />
    </svg>
  )
}

// Tic-tac-toe. cells: 9 strings ('X', 'O' or ''). numbers puts 1–9 in the empty squares.
export function TicTacToe({ cells, numbers = false, cell = 34 }) {
  const W = cell * 3
  return (
    <svg viewBox={`-4 -4 ${W + 8} ${W + 8}`} width={W + 8} height={W + 8} className="fig">
      <g stroke={INK} strokeWidth="3" strokeLinecap="round">
        <line x1={cell} y1="0" x2={cell} y2={W} />
        <line x1={cell * 2} y1="0" x2={cell * 2} y2={W} />
        <line x1="0" y1={cell} x2={W} y2={cell} />
        <line x1="0" y1={cell * 2} x2={W} y2={cell * 2} />
      </g>
      {cells.map((v, i) => {
        const x = (i % 3) * cell + cell / 2
        const y = Math.floor(i / 3) * cell + cell / 2
        const q = cell * 0.26
        if (v === 'X')
          return <path key={i} d={`M${x - q} ${y - q} L${x + q} ${y + q} M${x + q} ${y - q} L${x - q} ${y + q}`} stroke="#e03131" strokeWidth="4" strokeLinecap="round" />
        if (v === 'O') return <circle key={i} cx={x} cy={y} r={q * 1.1} fill="none" stroke="#1c7ed6" strokeWidth="4" />
        if (numbers)
          return (
            <text key={i} x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="600" fill="#999" fontFamily={FONT}>
              {i + 1}
            </text>
          )
        return null
      })}
    </svg>
  )
}

// 4×4 mini sudoku. grid: 16 numbers (0 = empty); ask marks the "?" square.
export function Sudoku({ grid, ask, cell = 30 }) {
  const W = cell * 4
  return (
    <svg viewBox={`-2 -2 ${W + 4} ${W + 4}`} width={W + 4} height={W + 4} className="fig">
      {grid.map((v, i) => {
        const x = (i % 4) * cell
        const y = Math.floor(i / 4) * cell
        return (
          <g key={i}>
            <rect x={x} y={y} width={cell} height={cell} fill={i === ask ? '#fff3bf' : '#fff'} stroke={INK} strokeWidth="1" />
            {(v > 0 || i === ask) && (
              <text x={x + cell / 2} y={y + cell / 2 + 6} textAnchor="middle" fontSize="17" fontWeight="700" fill={i === ask ? '#e03131' : INK} fontFamily={FONT}>
                {i === ask ? '?' : v}
              </text>
            )}
          </g>
        )
      })}
      <g stroke={INK} strokeWidth="3" fill="none">
        <rect x="0" y="0" width={W} height={W} />
        <line x1={W / 2} y1="0" x2={W / 2} y2={W} />
        <line x1="0" y1={W / 2} x2={W} y2={W / 2} />
      </g>
    </svg>
  )
}
