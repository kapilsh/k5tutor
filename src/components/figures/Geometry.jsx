// Shapes, patterns, area/perimeter rectangles, volume boxes and coordinate grids.

const INK = '#3b2f2f'

const SHAPE_COLORS = {
  red: '#ff6b6b',
  blue: '#4dabf7',
  yellow: '#ffd43b',
  green: '#69db7c',
  purple: '#b197fc',
  orange: '#ffa94d',
}

function polygon(n, r, rot = -Math.PI / 2) {
  return Array.from({ length: n }, (_, i) => {
    const a = rot + (i * 2 * Math.PI) / n
    return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`
  }).join(' ')
}

// Shape outlines centred at 0,0 inside roughly a 80×80 box.
const SHAPES = {
  circle: (p) => <circle r="36" {...p} />,
  square: (p) => <rect x="-32" y="-32" width="64" height="64" {...p} />,
  rectangle: (p) => <rect x="-40" y="-24" width="80" height="48" {...p} />,
  triangle: (p) => <polygon points={polygon(3, 40, -Math.PI / 2).replace(/,/g, ',')} transform="translate(0 6)" {...p} />,
  oval: (p) => <ellipse rx="40" ry="26" {...p} />,
  pentagon: (p) => <polygon points={polygon(5, 38)} transform="translate(0 3)" {...p} />,
  hexagon: (p) => <polygon points={polygon(6, 38, 0)} {...p} />,
  octagon: (p) => <polygon points={polygon(8, 38, Math.PI / 8)} {...p} />,
  rhombus: (p) => <polygon points="0,-40 28,0 0,40 -28,0" {...p} />,
  trapezoid: (p) => <polygon points="-22,-24 22,-24 40,24 -40,24" {...p} />,
  star: (p) => <polygon points="0,-40 10,-13 38,-12 16,6 24,34 0,18 -24,34 -16,6 -38,-12 -10,-13" {...p} />,
  heart: (p) => <path d="M0 34 C-40 8 -40 -28 -16 -30 C-6 -31 0 -22 0 -16 C0 -22 6 -31 16 -30 C40 -28 40 8 0 34 Z" {...p} />,
}

export function Shape({ shape, color = 'blue', size = 80 }) {
  const draw = SHAPES[shape]
  return (
    <svg viewBox="-46 -46 92 92" width={size} height={size} className="fig">
      {draw({ fill: SHAPE_COLORS[color] || color, stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' })}
    </svg>
  )
}

// A row of shapes with a "?" box at `blank` positions.
export function Pattern({ items, size = 44 }) {
  const gap = 8
  const w = items.length * (size + gap)
  return (
    <svg viewBox={`-2 -2 ${w + 2} ${size + 4}`} width={w + 2} height={size + 4} className="fig">
      {items.map((it, i) => (
        <g key={i} transform={`translate(${i * (size + gap) + size / 2} ${size / 2}) scale(${size / 92})`}>
          {it ? (
            SHAPES[it.shape]({ fill: SHAPE_COLORS[it.color], stroke: INK, strokeWidth: 3.5, strokeLinejoin: 'round' })
          ) : (
            <g>
              <rect x="-42" y="-42" width="84" height="84" rx="10" fill="#fff" stroke={INK} strokeWidth="3.5" strokeDasharray="8 6" />
              <text y="18" textAnchor="middle" fontSize="50" fontWeight="700" fill={INK} fontFamily="Fredoka, sans-serif">
                ?
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  )
}

// Rectangle (or rectilinear L-shape) with labelled sides and an optional unit grid.
export function RectArea({ w, h, unit = '', grid = false, cut, labels = 'two' }) {
  const maxSide = Math.max(w, h)
  const u = Math.min(26, 190 / maxSide)
  const W = w * u
  const H = h * u
  const txt = (x, y, s, anchor = 'middle') => (
    <text x={x} y={y} textAnchor={anchor} fontSize="13" fontWeight="700" fill="#1864ab" fontFamily="Fredoka, sans-serif">
      {s}
    </text>
  )
  const lbl = (n) => `${n}${unit ? ` ${unit}` : ''}`
  let outline
  if (cut) {
    // remove a cut.w × cut.h notch from the top-right corner
    const cw = cut.w * u
    const chh = cut.h * u
    outline = `M0 0 L${W - cw} 0 L${W - cw} ${chh} L${W} ${chh} L${W} ${H} L0 ${H} Z`
  } else {
    outline = `M0 0 L${W} 0 L${W} ${H} L0 ${H} Z`
  }
  return (
    <svg viewBox={`-40 -24 ${W + 84} ${H + 44}`} width={W + 84} height={H + 44} className="fig">
      <path d={outline} fill="#e7f5ff" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      {grid && (
        <g stroke={INK} strokeWidth="0.7" opacity="0.5">
          {Array.from({ length: w - 1 }, (_, i) => (
            <line key={`v${i}`} x1={(i + 1) * u} y1={cut && (i + 1) * u > W - cut.w * u ? cut.h * u : 0} x2={(i + 1) * u} y2={H} />
          ))}
          {Array.from({ length: h - 1 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={(i + 1) * u} x2={cut && (i + 1) * u < cut.h * u ? W - cut.w * u : W} y2={(i + 1) * u} />
          ))}
        </g>
      )}
      {labels !== 'none' && !cut && (
        <>
          {txt(W / 2, -8, lbl(w))}
          {txt(W + 6, H / 2 + 4, lbl(h), 'start')}
          {labels === 'all' && txt(W / 2, H + 18, lbl(w))}
          {labels === 'all' && txt(-6, H / 2 + 4, lbl(h), 'end')}
        </>
      )}
      {labels !== 'none' && cut && (
        <>
          {txt((W - cut.w * u) / 2, -8, lbl(w - cut.w))}
          {txt(W / 2, H + 18, lbl(w))}
          {txt(-6, H / 2 + 4, lbl(h), 'end')}
          {txt(W + 6, (H + cut.h * u) / 2 + 4, lbl(h - cut.h), 'start')}
        </>
      )}
    </svg>
  )
}

// Isometric box of unit cubes, l × w × h.
export function Prism({ l, w, h, cubes = true, unit = '' }) {
  const s = Math.min(22, 120 / Math.max(l + w * 0.6, h + w * 0.5))
  const dx = s * 0.6 // depth offset x
  const dy = s * 0.5 // depth offset y
  const faces = []
  const cube = (x, y, z, k) => {
    // front-bottom-left corner in screen coords
    const X = x * s + z * dx
    const Y = -y * s - z * dy
    const front = `M${X} ${Y} h${s} v${-s} h${-s} Z`
    const top = `M${X} ${Y - s} l${dx} ${-dy} h${s} l${-dx} ${dy} Z`
    const side = `M${X + s} ${Y} l${dx} ${-dy} v${-s} l${-dx} ${dy} Z`
    faces.push(
      <g key={k} stroke={INK} strokeWidth="1" strokeLinejoin="round">
        <path d={front} fill="#91a7ff" />
        <path d={top} fill="#bac8ff" />
        <path d={side} fill="#748ffc" />
      </g>,
    )
  }
  if (cubes) {
    // draw back-to-front so nearer cubes cover farther ones
    for (let z = w - 1; z >= 0; z--) for (let y = 0; y < h; y++) for (let x = 0; x < l; x++) cube(x, y, z, `${x}-${y}-${z}`)
  } else {
    const L = l * s, H = h * s, DX = w * dx, DY = w * dy
    faces.push(
      <g key="box" stroke={INK} strokeWidth="2" strokeLinejoin="round">
        <path d={`M0 0 h${L} v${-H} h${-L} Z`} fill="#91a7ff" />
        <path d={`M0 ${-H} l${DX} ${-DY} h${L} l${-DX} ${DY} Z`} fill="#bac8ff" />
        <path d={`M${L} 0 l${DX} ${-DY} v${-H} l${-DX} ${DY} Z`} fill="#748ffc" />
      </g>,
    )
  }
  const Wd = l * s + w * dx
  const Ht = h * s + w * dy
  const lbl = (x, y, t, a = 'middle') => (
    <text x={x} y={y} textAnchor={a} fontSize="12" fontWeight="700" fill="#1864ab" fontFamily="Fredoka, sans-serif">
      {t}
    </text>
  )
  const u = unit ? ` ${unit}` : ''
  return (
    <svg viewBox={`-34 ${-Ht - 8} ${Wd + 72} ${Ht + 26}`} width={Wd + 72} height={Ht + 26} className="fig">
      {faces}
      {!cubes && (
        <>
          {lbl((l * s) / 2, 15, `${l}${u}`)}
          {lbl(-5, (-h * s) / 2 + 4, `${h}${u}`, 'end')}
          {lbl(l * s + (w * dx) / 2 + 6, -(w * dy) / 2 + 8, `${w}${u}`, 'start')}
        </>
      )}
    </svg>
  )
}

export function CoordGrid({ size = 10, points = [], cell = 22 }) {
  const W = size * cell
  const X = (x) => x * cell
  const Y = (y) => W - y * cell
  return (
    <svg viewBox={`-26 -22 ${W + 44} ${W + 50}`} width={W + 44} height={W + 50} className="fig">
      {Array.from({ length: size + 1 }, (_, i) => (
        <g key={i}>
          <line x1={X(i)} y1={Y(0)} x2={X(i)} y2={Y(size)} stroke="#adb5bd" strokeWidth="0.8" />
          <line x1={X(0)} y1={Y(i)} x2={X(size)} y2={Y(i)} stroke="#adb5bd" strokeWidth="0.8" />
          <text x={X(i)} y={Y(0) + 15} textAnchor="middle" fontSize="11" fill={INK} fontFamily="Fredoka, sans-serif">
            {i}
          </text>
          {i > 0 && (
            <text x={X(0) - 7} y={Y(i) + 4} textAnchor="end" fontSize="11" fill={INK} fontFamily="Fredoka, sans-serif">
              {i}
            </text>
          )}
        </g>
      ))}
      <line x1={X(0)} y1={Y(0)} x2={X(size) + 8} y2={Y(0)} stroke={INK} strokeWidth="2" />
      <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(size) - 8} stroke={INK} strokeWidth="2" />
      <text x={X(size) + 12} y={Y(0) + 4} fontSize="12" fontStyle="italic" fill={INK}>x</text>
      <text x={X(0) - 3} y={Y(size) - 11} fontSize="12" fontStyle="italic" fill={INK}>y</text>
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={X(p.x)} cy={Y(p.y)} r="5" fill="#e03131" stroke={INK} strokeWidth="1.2" />
          <text x={X(p.x) + 7} y={Y(p.y) - 6} fontSize="13" fontWeight="700" fill="#c92a2a" fontFamily="Fredoka, sans-serif">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
