import { CritterG } from '../art/Critters.jsx'
import { makeRng } from '../../lib/rng.js'

const INK = '#3b2f2f'

// A group of critters. Rows of five (easy to count) or scattered (harder).
// `crossed` marks the last k critters with a red X for take-away pictures.
export function CritterGroup({ kind = 'pig', count, crossed = 0, perRow = 5, scatter = false, seed = 1, size = 34 }) {
  if (count === 0) {
    return (
      <svg viewBox="0 0 60 44" width={60} height={44} className="fig">
        <rect x="4" y="4" width="52" height="36" rx="8" fill="none" stroke={INK} strokeDasharray="4 4" strokeWidth="2" />
      </svg>
    )
  }
  const gap = size * 0.12
  const cell = size + gap
  let pos
  if (scatter) {
    const rng = makeRng(seed)
    const cols = Math.max(3, Math.ceil(Math.sqrt(count * 1.6)))
    const rows = Math.ceil((count + 2) / cols)
    const slots = rng.sample(
      Array.from({ length: cols * rows }, (_, i) => i),
      count,
    )
    pos = slots.map((s) => ({
      x: (s % cols) * cell * 1.15 + rng.next() * cell * 0.3,
      y: Math.floor(s / cols) * cell * 1.1 + rng.next() * cell * 0.25,
    }))
  } else {
    pos = Array.from({ length: count }, (_, i) => ({
      // a little extra space after every fifth critter in long rows
      x: (i % perRow) * cell + (perRow > 5 && i % perRow >= 5 ? cell * 0.35 : 0),
      y: Math.floor(i / perRow) * cell,
    }))
  }
  const w = Math.max(...pos.map((p) => p.x)) + size + 4
  const h = Math.max(...pos.map((p) => p.y)) + size + 4
  return (
    <svg viewBox={`-2 -2 ${w} ${h}`} width={w} height={h} className="fig">
      {pos.map((p, i) => (
        <CritterG key={i} kind={kind} x={p.x} y={p.y} size={size} crossed={i >= count - crossed} />
      ))}
    </svg>
  )
}

// One or two ten frames with counters (optionally critters) filled left to right.
export function TenFrame({ filled, frames = 1, kind, second = 0, cell = 30 }) {
  const w = cell * 5
  const h = cell * 2
  const gapY = 10
  const H = frames * h + (frames - 1) * gapY
  return (
    <svg viewBox={`-2 -2 ${w + 4} ${H + 4}`} width={w + 4} height={H + 4} className="fig">
      {Array.from({ length: frames }, (_, f) => (
        <g key={f} transform={`translate(0 ${f * (h + gapY)})`}>
          <rect x="0" y="0" width={w} height={h} fill="#fff" stroke={INK} strokeWidth="2.5" rx="3" />
          {[1, 2, 3, 4].map((i) => (
            <line key={i} x1={i * cell} y1="0" x2={i * cell} y2={h} stroke={INK} strokeWidth="1.5" />
          ))}
          <line x1="0" y1={cell} x2={w} y2={cell} stroke={INK} strokeWidth="1.5" />
          {Array.from({ length: 10 }, (_, i) => {
            const idx = f * 10 + i
            const on = idx < filled
            const on2 = !on && idx < filled + second
            if (!on && !on2) return null
            const cx = (i % 5) * cell + cell / 2
            const cy = Math.floor(i / 5) * cell + cell / 2
            if (kind) return <CritterG key={i} kind={kind} x={cx - cell * 0.4} y={cy - cell * 0.4} size={cell * 0.8} />
            return <circle key={i} cx={cx} cy={cy} r={cell * 0.34} fill={on ? '#ef4b4b' : '#4f8df5'} stroke={INK} strokeWidth="1.5" />
          })}
        </g>
      ))}
    </svg>
  )
}

// Base-ten blocks: hundreds flats, tens rods, ones cubes.
export function BaseTen({ hundreds = 0, tens = 0, ones = 0, u = 7 }) {
  const items = []
  let x = 0
  const flatW = u * 10
  for (let i = 0; i < hundreds; i++) {
    items.push(
      <g key={`h${i}`} transform={`translate(${x} 0)`}>
        <rect width={flatW} height={flatW} fill="#ffd8a8" stroke={INK} strokeWidth="1.6" />
        {Array.from({ length: 9 }, (_, k) => (
          <g key={k} stroke={INK} strokeWidth="0.5" opacity="0.6">
            <line x1={(k + 1) * u} y1="0" x2={(k + 1) * u} y2={flatW} />
            <line x1="0" y1={(k + 1) * u} x2={flatW} y2={(k + 1) * u} />
          </g>
        ))}
      </g>,
    )
    x += flatW + u
  }
  for (let i = 0; i < tens; i++) {
    items.push(
      <g key={`t${i}`} transform={`translate(${x} 0)`}>
        <rect width={u} height={flatW} fill="#a5d8ff" stroke={INK} strokeWidth="1.4" />
        {Array.from({ length: 9 }, (_, k) => (
          <line key={k} x1="0" y1={(k + 1) * u} x2={u} y2={(k + 1) * u} stroke={INK} strokeWidth="0.6" opacity="0.7" />
        ))}
      </g>,
    )
    x += u * 1.6
  }
  if (tens) x += u
  for (let i = 0; i < ones; i++) {
    const col = Math.floor(i / 5)
    const row = i % 5
    items.push(<rect key={`o${i}`} x={x + col * u * 1.6} y={flatW - (row + 1) * u * 1.6 + u * 0.6} width={u} height={u} fill="#b2f2bb" stroke={INK} strokeWidth="1.2" />)
  }
  if (ones) x += Math.ceil(ones / 5) * u * 1.6
  const w = Math.max(x, u)
  return (
    <svg viewBox={`-2 -2 ${w + 4} ${flatW + 4}`} width={w + 4} height={flatW + 4} className="fig">
      {items}
    </svg>
  )
}

// rows × cols array of dots or critters, for repeated addition / multiplication.
export function ArrayFig({ rows, cols, kind, cell = 26 }) {
  const w = cols * cell
  const h = rows * cell
  return (
    <svg viewBox={`-2 -2 ${w + 4} ${h + 4}`} width={w + 4} height={h + 4} className="fig">
      {Array.from({ length: rows * cols }, (_, i) => {
        const x = (i % cols) * cell
        const y = Math.floor(i / cols) * cell
        return kind ? (
          <CritterG key={i} kind={kind} x={x + cell * 0.08} y={y + cell * 0.08} size={cell * 0.84} />
        ) : (
          <circle key={i} cx={x + cell / 2} cy={y + cell / 2} r={cell * 0.32} fill="#9775fa" stroke={INK} strokeWidth="1.5" />
        )
      })}
    </svg>
  )
}

// Equal groups (circles with critters inside) for "3 groups of 4".
export function EqualGroups({ groups, each, kind = 'ladybug' }) {
  const cs = 20
  const perRow = Math.min(each, 3)
  const inner = perRow * cs
  const innerH = Math.ceil(each / perRow) * cs
  const D = Math.max(inner, innerH) + 22
  const w = groups * (D + 10)
  return (
    <svg viewBox={`-2 -2 ${w + 4} ${D + 4}`} width={w + 4} height={D + 4} className="fig">
      {Array.from({ length: groups }, (_, g) => (
        <g key={g} transform={`translate(${g * (D + 10)} 0)`}>
          <circle cx={D / 2} cy={D / 2} r={D / 2 - 1} fill="#fff9db" stroke={INK} strokeWidth="2" />
          {Array.from({ length: each }, (_, i) => (
            <CritterG key={i} kind={kind} x={(D - inner) / 2 + (i % perRow) * cs} y={(D - innerH) / 2 + Math.floor(i / perRow) * cs} size={cs - 2} />
          ))}
        </g>
      ))}
    </svg>
  )
}
