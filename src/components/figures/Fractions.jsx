// Fraction pictures and number lines.

const INK = '#3b2f2f'
const SHADE = '#74c0fc'

export function FractionShape({ shape = 'circle', parts, shaded, size = 90, cols }) {
  const S = 80
  if (shape === 'circle') {
    const r = S / 2
    const wedges = Array.from({ length: parts }, (_, i) => {
      if (parts === 1) return <circle key={i} cx={r} cy={r} r={r} fill={shaded ? SHADE : '#fff'} stroke={INK} strokeWidth="2" />
      const a0 = (i / parts) * 2 * Math.PI - Math.PI / 2
      const a1 = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2
      const large = a1 - a0 > Math.PI ? 1 : 0
      const d = `M${r} ${r} L${r + r * Math.cos(a0)} ${r + r * Math.sin(a0)} A${r} ${r} 0 ${large} 1 ${r + r * Math.cos(a1)} ${r + r * Math.sin(a1)} Z`
      return <path key={i} d={d} fill={i < shaded ? SHADE : '#fff'} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    })
    return (
      <svg viewBox="-3 -3 86 86" width={size} height={size} className="fig">
        {wedges}
      </svg>
    )
  }
  // rectangle split into a grid (cols × rows) or a single strip
  const c = cols || parts
  const rows = Math.ceil(parts / c)
  const W = shape === 'bar' ? S * 1.8 : S
  const H = shape === 'bar' ? S * 0.4 : S
  const cw = W / c
  const ch = H / rows
  return (
    <svg viewBox={`-3 -3 ${W + 6} ${H + 6}`} width={(size * (W + 6)) / 86} height={(size * (H + 6)) / 86} className="fig">
      {Array.from({ length: parts }, (_, i) => (
        <rect key={i} x={(i % c) * cw} y={Math.floor(i / c) * ch} width={cw} height={ch} fill={i < shaded ? SHADE : '#fff'} stroke={INK} strokeWidth="2" />
      ))}
    </svg>
  )
}

// Number line from min to max. `ticks` = number of intervals. Labels can be
// shown on every tick, only the ends, or as fractions (den set). `point` puts a
// lettered dot on a value; `hops` draws jump arcs [{from, to}].
export function NumberLine({ min, max, ticks, labels = 'all', den, point, pointLabel = 'A', hops = [], width = 420 }) {
  const pad = 22
  const W = width
  const X = (v) => pad + ((v - min) / (max - min)) * (W - 2 * pad)
  const n = ticks ?? max - min
  const step = (max - min) / n
  const lab = (v, i) => {
    if (labels === 'none') return null
    if (labels === 'ends' && i !== 0 && i !== n) return null
    if (den) {
      const num = Math.round(v * den)
      if (num % den === 0) return String(num / den)
      return `${num}/${den}`
    }
    return String(Math.round(v * 1000) / 1000)
  }
  const hopH = 26
  return (
    <svg viewBox={`0 ${-hopH - 6} ${W} ${70 + hopH}`} width={W} height={70 + hopH} className="fig">
      <defs>
        <marker id="nl-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill={INK} />
        </marker>
        <marker id="hop-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="#e8590c" />
        </marker>
      </defs>
      <line x1="4" y1="20" x2={W - 4} y2="20" stroke={INK} strokeWidth="2.5" markerStart="url(#nl-arrow)" markerEnd="url(#nl-arrow)" />
      {Array.from({ length: n + 1 }, (_, i) => {
        const v = min + i * step
        const x = X(v)
        const t = lab(v, i)
        const isFrac = t && t.includes('/')
        return (
          <g key={i}>
            <line x1={x} y1="12" x2={x} y2="28" stroke={INK} strokeWidth="2" />
            {t &&
              (isFrac ? (
                <g fontFamily="Fredoka, sans-serif" fontSize="11" fontWeight="600" fill={INK} textAnchor="middle">
                  <text x={x} y="41">{t.split('/')[0]}</text>
                  <line x1={x - 6} y1="44" x2={x + 6} y2="44" stroke={INK} strokeWidth="1.2" />
                  <text x={x} y="55">{t.split('/')[1]}</text>
                </g>
              ) : (
                <text x={x} y="46" textAnchor="middle" fontSize="13" fontWeight="600" fill={INK} fontFamily="Fredoka, sans-serif">
                  {t}
                </text>
              ))}
          </g>
        )
      })}
      {hops.map((hp, i) => {
        const x1 = X(hp.from)
        const x2 = X(hp.to)
        return (
          <path key={i} d={`M${x1} 16 Q${(x1 + x2) / 2} ${-hopH} ${x2} 16`} fill="none" stroke="#e8590c" strokeWidth="2.2" markerEnd="url(#hop-arrow)" />
        )
      })}
      {point != null && (
        <g>
          <circle cx={X(point)} cy="20" r="6.5" fill="#e03131" stroke={INK} strokeWidth="1.5" />
          <text x={X(point)} y="2" textAnchor="middle" fontSize="15" fontWeight="700" fill="#e03131" fontFamily="Fredoka, sans-serif">
            {pointLabel}
          </text>
        </g>
      )}
    </svg>
  )
}

// A decimal grid: 10 (tenths strip) or 100 (hundredths square) with `shaded` cells.
export function DecimalGrid({ cells = 100, shaded, size = 110 }) {
  const cols = 10
  const rows = cells / 10
  const c = size / 10
  return (
    <svg viewBox={`-2 -2 ${size + 4} ${rows * c + 4}`} width={size + 4} height={rows * c + 4} className="fig">
      {Array.from({ length: cells }, (_, i) => (
        <rect key={i} x={(i % cols) * c} y={Math.floor(i / cols) * c} width={c} height={c} fill={i < shaded ? SHADE : '#fff'} stroke={INK} strokeWidth="0.8" />
      ))}
      <rect x="0" y="0" width={size} height={rows * c} fill="none" stroke={INK} strokeWidth="2" />
    </svg>
  )
}
