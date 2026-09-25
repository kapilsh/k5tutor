import { useMemo } from 'react'

const COLORS = ['#ff6f91', '#ffc93c', '#4d96ff', '#6bcb77', '#9b72cf', '#ff924c']

// seeded by burst so a render is stable
function lcg(seed) {
  let s = seed * 9301 + 49297
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

// A short burst of CSS confetti; re-keyed by `burst` so each increment replays it.
export default function Confetti({ burst, big }) {
  const pieces = useMemo(() => {
    const n = big ? 90 : 36
    const r = lcg(burst)
    return Array.from({ length: n }, (_, i) => ({
      left: r() * 100,
      delay: r() * 0.25,
      dur: 0.9 + r() * 0.9,
      rot: r() * 720 - 360,
      drift: r() * 160 - 80,
      color: COLORS[i % COLORS.length],
      w: 6 + r() * 8,
      round: r() < 0.3,
    }))
  }, [burst, big])
  if (!burst) return null
  return (
    <div className="confetti" key={burst} aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: p.w,
            height: p.round ? p.w : p.w * 0.45,
            borderRadius: p.round ? '50%' : 2,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            '--rot': `${p.rot}deg`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
