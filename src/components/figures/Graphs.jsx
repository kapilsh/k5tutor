import { useId } from 'react'
import { CritterG } from '../art/Critters.jsx'

const INK = '#3b2f2f'

// Picture graph: one row per category, `per` critters per icon.
export function Pictograph({ rows, per = 1, title }) {
  const uid = useId().replace(/:/g, '')
  const icon = 22
  const labelW = 70
  const maxIcons = Math.max(...rows.map((r) => Math.ceil(r.value / per)))
  const W = labelW + maxIcons * (icon + 4) + 10
  const H = rows.length * (icon + 8) + 28 + (per > 1 ? 24 : 0)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="fig">
      <text x={W / 2} y="14" textAnchor="middle" fontSize="13" fontWeight="700" fill={INK} fontFamily="Fredoka, sans-serif">
        {title}
      </text>
      {rows.map((r, i) => {
        const y = 24 + i * (icon + 8)
        const full = Math.floor(r.value / per)
        const half = r.value % per !== 0
        return (
          <g key={r.kind}>
            <rect x="0" y={y - 2} width={W} height={icon + 6} fill={i % 2 ? '#fff' : '#f8f9fa'} />
            <text x="6" y={y + icon * 0.7} fontSize="12" fontWeight="600" fill={INK} fontFamily="Nunito, sans-serif">
              {r.label}
            </text>
            {Array.from({ length: full }, (_, k) => (
              <CritterG key={k} kind={r.kind} x={labelW + k * (icon + 4)} y={y} size={icon} />
            ))}
            {half && (
              <g>
                <clipPath id={`${uid}-half-${i}`}>
                  <rect x={labelW + full * (icon + 4)} y={y - 2} width={icon / 2} height={icon + 4} />
                </clipPath>
                <g clipPath={`url(#${uid}-half-${i})`}>
                  <CritterG kind={r.kind} x={labelW + full * (icon + 4)} y={y} size={icon} />
                </g>
              </g>
            )}
          </g>
        )
      })}
      <line x1={labelW - 6} y1="20" x2={labelW - 6} y2={24 + rows.length * (icon + 8)} stroke={INK} strokeWidth="1.5" />
      {per > 1 && (
        <g transform={`translate(6 ${H - 20})`}>
          <CritterG kind={rows[0].kind} x={0} y={0} size={16} />
          <text x="22" y="12" fontSize="12" fill={INK} fontFamily="Nunito, sans-serif">
            = {per} {per === 1 ? 'vote' : 'votes'} (each picture)
          </text>
        </g>
      )}
    </svg>
  )
}

const BAR_COLORS = ['#ff8787', '#74c0fc', '#8ce99a', '#ffd43b', '#b197fc', '#ffa94d']

export function BarGraph({ bars, max, step = 1, title }) {
  const plotH = 150
  const barW = 34
  const gap = 18
  const left = 34
  const W = left + bars.length * (barW + gap) + 10
  const H = plotH + 50
  const Y = (v) => 24 + plotH - (v / max) * plotH
  const ticks = []
  for (let v = 0; v <= max; v += step) ticks.push(v)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="fig">
      <text x={W / 2} y="14" textAnchor="middle" fontSize="13" fontWeight="700" fill={INK} fontFamily="Fredoka, sans-serif">
        {title}
      </text>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={left} y1={Y(v)} x2={W - 6} y2={Y(v)} stroke="#dee2e6" strokeWidth="1" />
          <text x={left - 5} y={Y(v) + 4} textAnchor="end" fontSize="10" fill={INK} fontFamily="Fredoka, sans-serif">
            {v}
          </text>
        </g>
      ))}
      {bars.map((b, i) => {
        const x = left + gap / 2 + i * (barW + gap)
        return (
          <g key={b.label}>
            <rect x={x} y={Y(b.value)} width={barW} height={Y(0) - Y(b.value)} fill={BAR_COLORS[i % BAR_COLORS.length]} stroke={INK} strokeWidth="1.5" />
            <text x={x + barW / 2} y={Y(0) + 15} textAnchor="middle" fontSize="11" fontWeight="600" fill={INK} fontFamily="Nunito, sans-serif">
              {b.label}
            </text>
          </g>
        )
      })}
      <line x1={left} y1={Y(0)} x2={W - 6} y2={Y(0)} stroke={INK} strokeWidth="2" />
      <line x1={left} y1={Y(0)} x2={left} y2="20" stroke={INK} strokeWidth="2" />
    </svg>
  )
}
