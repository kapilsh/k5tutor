// Clocks, coins, rulers and angles.

const INK = '#3b2f2f'

export function Clock({ h, m, size = 130 }) {
  const r = 60
  const hourA = (((h % 12) + m / 60) * 30 * Math.PI) / 180
  const minA = (m * 6 * Math.PI) / 180
  const hand = (a, len) => [Math.sin(a) * len, -Math.cos(a) * len]
  const [hx, hy] = hand(hourA, 32)
  const [mx, my] = hand(minA, 48)
  return (
    <svg viewBox="-72 -72 144 144" width={size} height={size} className="fig">
      <circle r={r + 6} fill="#ffd43b" stroke={INK} strokeWidth="3" />
      <circle r={r} fill="#fff" stroke={INK} strokeWidth="2" />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * 6 * Math.PI) / 180
        const big = i % 5 === 0
        const [x1, y1] = hand(a, r - (big ? 7 : 3.5))
        const [x2, y2] = hand(a, r - 1)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={big ? 2 : 0.8} />
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1
        const [x, y] = hand((n * 30 * Math.PI) / 180, r - 17)
        return (
          <text key={n} x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={INK} fontFamily="Fredoka, sans-serif">
            {n}
          </text>
        )
      })}
      <line x1="0" y1="0" x2={mx} y2={my} stroke="#1c7ed6" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="0" y1="0" x2={hx} y2={hy} stroke="#e03131" strokeWidth="5.5" strokeLinecap="round" />
      <circle r="4" fill={INK} />
    </svg>
  )
}

// A digital clock readout, e.g. 7:30 (optionally with a.m./p.m.).
export function DigitalClock({ h, m, ampm, size = 120 }) {
  const t = `${h}:${String(m).padStart(2, '0')}`
  const W = 120
  const H = 56
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={size} height={(size * H) / W} className="fig">
      <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" fill="#ffd43b" stroke={INK} strokeWidth="3" />
      <rect x="10" y="10" width={W - 20} height={H - 20} rx="6" fill="#1b2b1b" />
      <text x={ampm ? 52 : W / 2} y="40" textAnchor="middle" fontSize="26" fontWeight="700" fill="#8ce99a" fontFamily="Fredoka, sans-serif" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {t}
      </text>
      {ampm && (
        <text x="97" y="39" textAnchor="middle" fontSize="12" fontWeight="700" fill="#8ce99a" fontFamily="Fredoka, sans-serif">
          {ampm}
        </text>
      )}
    </svg>
  )
}

// Little sky pictures for morning / afternoon / night, with a word underneath.
export function Sky({ when, label = when, size = 110 }) {
  const sky = { morning: '#ffe3c2', afternoon: '#a5d8ff', night: '#2f3a8f' }[when]
  return (
    <svg viewBox="0 0 110 92" width={size} height={(size * 92) / 110} className="fig">
      <rect x="2" y="2" width="106" height="68" rx="8" fill={sky} stroke={INK} strokeWidth="2.5" />
      {when === 'morning' && (
        <g>
          <circle cx="30" cy="58" r="16" fill="#ffa94d" stroke={INK} strokeWidth="2" />
          {[-60, -30, 0, 30, 60].map((a) => {
            const r = (a * Math.PI) / 180
            return <line key={a} x1={30 + Math.sin(r) * 21} y1={58 - Math.cos(r) * 21} x2={30 + Math.sin(r) * 28} y2={58 - Math.cos(r) * 28} stroke="#f76707" strokeWidth="2.5" strokeLinecap="round" />
          })}
        </g>
      )}
      {when === 'afternoon' && (
        <g>
          <circle cx="55" cy="26" r="13" fill="#ffd43b" stroke={INK} strokeWidth="2" />
          {Array.from({ length: 8 }, (_, i) => {
            const r = (i * 45 * Math.PI) / 180
            return <line key={i} x1={55 + Math.sin(r) * 17} y1={26 - Math.cos(r) * 17} x2={55 + Math.sin(r) * 23} y2={26 - Math.cos(r) * 23} stroke="#f59f00" strokeWidth="2.5" strokeLinecap="round" />
          })}
        </g>
      )}
      {when === 'night' && (
        <g>
          <path d="M70 14 A16 16 0 1 0 84 40 A13 13 0 1 1 70 14 Z" fill="#fff3bf" stroke={INK} strokeWidth="1.5" />
          {[[22, 18], [40, 34], [18, 44], [52, 14], [94, 20]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2" fill="#fff3bf" />
          ))}
        </g>
      )}
      <path d="M3 62 Q30 52 55 62 T107 60 L107 68 Q107 69 100 69 L10 69 Q3 69 3 62 Z" fill={when === 'night' ? '#2b8a3e' : '#8ce99a'} stroke={INK} strokeWidth="2" />
      <text x="55" y="87" textAnchor="middle" fontSize="15" fontWeight="700" fill={INK} fontFamily="Fredoka, sans-serif">
        {label}
      </text>
    </svg>
  )
}

const COINS = {
  p: { cents: 1, r: 19, fill: '#d9895b', edge: '#a4582f', label: '1¢', name: 'penny' },
  n: { cents: 5, r: 21.5, fill: '#ced4da', edge: '#868e96', label: '5¢', name: 'nickel' },
  d: { cents: 10, r: 17.5, fill: '#dee2e6', edge: '#868e96', label: '10¢', name: 'dime' },
  q: { cents: 25, r: 24, fill: '#e9ecef', edge: '#868e96', label: '25¢', name: 'quarter' },
}

export function Coins({ coins, bills = 0 }) {
  const items = []
  let x = 0
  const H = 52
  for (let i = 0; i < bills; i++) {
    items.push(
      <g key={`b${i}`} transform={`translate(${x} 2)`}>
        <rect width="86" height="46" rx="4" fill="#b2f2bb" stroke="#2b8a3e" strokeWidth="2" />
        <rect x="5" y="5" width="76" height="36" rx="3" fill="none" stroke="#2b8a3e" strokeWidth="1" />
        <circle cx="43" cy="23" r="12" fill="#d3f9d8" stroke="#2b8a3e" strokeWidth="1.2" />
        <text x="43" y="28" textAnchor="middle" fontSize="15" fontWeight="700" fill="#2b8a3e" fontFamily="Fredoka, sans-serif">
          $1
        </text>
      </g>,
    )
    x += 92
  }
  coins.forEach((c, i) => {
    const k = COINS[c]
    items.push(
      <g key={i} transform={`translate(${x + k.r} ${H / 2})`}>
        <circle r={k.r} fill={k.fill} stroke={k.edge} strokeWidth="2.5" />
        <circle r={k.r - 4} fill="none" stroke={k.edge} strokeWidth="0.8" strokeDasharray="1.5 2" />
        <text y="5" textAnchor="middle" fontSize={k.r > 20 ? 13 : 11} fontWeight="700" fill={INK} fontFamily="Fredoka, sans-serif">
          {k.label}
        </text>
      </g>,
    )
    x += k.r * 2 + 5
  })
  return (
    <svg viewBox={`-2 -1 ${x + 4} ${H + 2}`} width={x + 4} height={H + 2} className="fig">
      {items}
    </svg>
  )
}

const OBJECTS = {
  pencil: (len) => (
    <g>
      <rect x="0" y="-8" width={len - 18} height="16" fill="#ffd43b" stroke={INK} strokeWidth="2" />
      <rect x="0" y="-8" width="10" height="16" fill="#ff8fab" stroke={INK} strokeWidth="2" />
      <path d={`M${len - 18} -8 L${len} 0 L${len - 18} 8 Z`} fill="#f1d8b4" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d={`M${len - 5} -2.5 L${len} 0 L${len - 5} 2.5 Z`} fill={INK} />
    </g>
  ),
  worm: (len) => (
    <g>
      <path d={`M6 0 Q${len * 0.25} -12 ${len * 0.5} 0 T${len - 6} 0`} fill="none" stroke="#f783ac" strokeWidth="12" strokeLinecap="round" />
      <circle cx={len - 8} cy="-2" r="1.8" fill={INK} />
    </g>
  ),
  crayon: (len) => (
    <g>
      <rect x="0" y="-7" width={len - 14} height="14" rx="2" fill="#4dabf7" stroke={INK} strokeWidth="2" />
      <rect x={len * 0.3} y="-7" width={len * 0.25} height="14" fill="#1c7ed6" />
      <path d={`M${len - 14} -6 L${len} 0 L${len - 14} 6 Z`} fill="#4dabf7" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </g>
  ),
}

export function Ruler({ length, max, unit = 'in', object = 'pencil', start = 0 }) {
  const px = unit === 'in' ? 40 : 22
  const W = max * px
  return (
    <svg viewBox={`-10 -30 ${W + 20} 90`} width={W + 20} height={90} className="fig">
      <g transform={`translate(${start * px} -12)`}>{OBJECTS[object](length * px)}</g>
      <rect x="0" y="8" width={W} height="40" fill="#fff3bf" stroke={INK} strokeWidth="2" rx="2" />
      {Array.from({ length: max * (unit === 'in' ? 4 : 2) + 1 }, (_, i) => {
        const sub = unit === 'in' ? 4 : 2
        const x = (i / sub) * px
        const major = i % sub === 0
        const half = unit === 'in' && i % 2 === 0
        return <line key={i} x1={x} y1="8" x2={x} y2={8 + (major ? 16 : half ? 11 : 7)} stroke={INK} strokeWidth={major ? 1.8 : 1} />
      })}
      {Array.from({ length: max + 1 }, (_, i) => (
        <text key={i} x={i * px + (i === 0 ? 4 : i === max ? -4 : 0)} y="40" textAnchor={i === 0 ? 'start' : i === max ? 'end' : 'middle'} fontSize="12" fontWeight="700" fill={INK} fontFamily="Fredoka, sans-serif">
          {i}
        </text>
      ))}
      <text x={W - 4} y="45" textAnchor="end" fontSize="8" fill={INK} fontFamily="Nunito, sans-serif">
        {unit === 'in' ? 'inches' : 'cm'}
      </text>
    </svg>
  )
}

export function Angle({ deg, rot = 0, size = 120 }) {
  const L = 48
  const a = (-deg * Math.PI) / 180
  const r = 16
  const arc = deg === 90
    ? <path d={`M${r} 0 L${r} ${-r} L0 ${-r}`} fill="none" stroke="#e03131" strokeWidth="2" />
    : <path d={`M${r} 0 A${r} ${r} 0 ${deg > 180 ? 1 : 0} 0 ${Math.cos(a) * r} ${Math.sin(a) * r}`} fill="none" stroke="#e03131" strokeWidth="2" />
  return (
    <svg viewBox="-60 -60 120 120" width={size} height={size} className="fig">
      <g transform={`rotate(${-rot})`}>
        {arc}
        <line x1="0" y1="0" x2={L} y2="0" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="0" x2={Math.cos(a) * L} y2={Math.sin(a) * L} stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <circle r="3.5" fill={INK} />
      </g>
    </svg>
  )
}
