import { useEffect, useMemo, useRef, useState } from 'react'
import { CRAYONS, PICTURES } from '../coloring/pictures.js'
import { MODE, MODES, PICTURE, buildPage, crayonsOf } from '../coloring/modes.js'
import { href, navigate } from '../lib/router.js'
import { newSeed } from '../lib/rng.js'
import { downloadPdf } from '../lib/pdf.js'
import { Critter } from './art/Critters.jsx'
import { PaperSlot } from './Worksheet.jsx'
import Confetti from './Confetti.jsx'

const modeOf = (query) => MODE[query.mode] || MODES[0]
const sizeLabel = (n) => `${n}×${n}`
const HEX = Object.fromEntries(Object.entries(CRAYONS).map(([ch, c]) => [ch, c.hex]))
// Numbers on a colored square: dark text on light crayons, white on dark ones.
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
// pick whichever of near-black / white has the higher WCAG contrast ratio
const INK_ON = Object.fromEntries(
  Object.entries(HEX).map(([ch, hex]) => {
    const L = luminance(hex)
    return [ch, (L + 0.05) / (luminance('#212529') + 0.05) >= 1.05 / (L + 0.05) ? 'rgba(33, 37, 41, 0.8)' : 'rgba(255, 255, 255, 0.9)']
  }),
)
const painted = (ch) => ({ background: HEX[ch], color: INK_ON[ch] })

// #/color — pick a mystery picture. The pictures stay hidden until they're colored.
export function ColoringGallery({ query }) {
  const mode = modeOf(query)
  const surprise = () => navigate(`/color/${PICTURES[Math.floor(Math.random() * PICTURES.length)].id}`, { mode: mode.id })
  return (
    <div className="coloring" style={{ '--gc': 'var(--g-2)' }}>
      <div className="ws-controls">
        <h1>Mystery Pictures</h1>
        <p className="ws-blurb">
          Every square hides a number or a math problem. Solve it, color the square with the matching crayon, and a picture appears! Print a page or color it right here.
        </p>
        <div className="ws-row">
          <label className="field">
            <span>What's in the squares?</span>
            <select value={mode.id} onChange={(e) => navigate('/color', { mode: e.target.value }, { replace: true })}>
              {MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} (grade {m.grades})
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn-primary" onClick={surprise}>
            🎲 Surprise me
          </button>
        </div>
      </div>
      <div className="mystery-grid">
        {PICTURES.map((p) => {
          const pic = PICTURE[p.id]
          return (
            <div key={p.id} className="topic-card mystery-card">
              <div className="mystery-tile" aria-hidden="true">
                <MysteryTile pic={pic} />
                <span>?</span>
              </div>
              <h3>Mystery #{pic.number}</h3>
              <p className="topic-blurb">Hint: {pic.hint}.</p>
              <div className="mystery-meta">
                {sizeLabel(pic.size)} squares · {crayonsOf(pic).length} crayons
              </div>
              <div className="topic-actions">
                <a className="btn-primary sm" href={href(`/color/${p.id}`, { mode: mode.id, view: 'online' })}>
                  Color online
                </a>
                <a className="btn-ghost sm" href={href(`/color/${p.id}`, { mode: mode.id })}>
                  Print
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// A blank grid the size of the picture, as the card art.
function MysteryTile({ pic }) {
  const n = pic.size
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="mystery-svg">
      {Array.from({ length: n + 1 }, (_, i) => (
        <g key={i} stroke="#d8cbb8" strokeWidth={0.06}>
          <line x1={i} y1="0" x2={i} y2={n} />
          <line x1="0" y1={i} x2={n} y2={i} />
        </g>
      ))}
    </svg>
  )
}

// #/color/<picture>?mode=…&seed=…&view=online&key=0
export function ColoringPage({ pic, query }) {
  const mode = modeOf(query)
  const seed = parseInt(query.seed, 10)
  const view = query.view === 'online' ? 'online' : 'paper'
  const withKey = query.key !== '0'
  const set = (patch, replace = true) => navigate(`/color/${pic.id}`, { mode: mode.id, seed, view: view === 'online' ? 'online' : undefined, key: withKey ? undefined : '0', ...patch }, { replace })

  useEffect(() => {
    if (!seed) set({ seed: newSeed() })
  })

  const page = useMemo(() => (seed ? buildPage(pic, mode, seed) : null), [pic, mode, seed])
  const i = PICTURES.findIndex((p) => p.id === pic.id)
  const next = PICTURES[(i + 1) % PICTURES.length]

  const printRef = useRef(null)
  const [busy, setBusy] = useState(null)
  const onPdf = async () => {
    setBusy('Preparing PDF…')
    try {
      await downloadPdf([...printRef.current.querySelectorAll('.paper')], `k5tutor-mystery-${pic.number}-${mode.id}-${seed}.pdf`)
    } catch (e) {
      console.error(e)
      alert('Sorry — the PDF could not be made in this browser. Try Print → Save as PDF instead.')
    } finally {
      setBusy(null)
    }
  }

  if (!page) return null

  return (
    <div className="coloring" style={{ '--gc': 'var(--g-2)' }}>
      <div className="ws-controls no-print">
        <a className="back" href={href('/color', { mode: mode.id })}>
          ← All mystery pictures
        </a>
        <h1>Mystery #{pic.number}</h1>
        <p className="ws-blurb">Hint: {pic.hint}.</p>
        <div className="ws-row">
          <label className="field">
            <span>What's in the squares?</span>
            <select value={mode.id} onChange={(e) => set({ mode: e.target.value, seed: newSeed() })}>
              {MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} (grade {m.grades})
                </option>
              ))}
            </select>
          </label>
          {view === 'paper' && (
            <label className="check">
              <input type="checkbox" checked={withKey} onChange={(e) => set({ key: e.target.checked ? undefined : '0' })} />
              <span>Answer key</span>
            </label>
          )}
        </div>
        <div className="ws-row ws-buttons">
          <div className="seg" role="tablist" aria-label="View">
            <button type="button" role="tab" aria-selected={view === 'paper'} className={view === 'paper' ? 'on' : ''} onClick={() => set({ view: undefined })}>
              📄 Printable
            </button>
            <button type="button" role="tab" aria-selected={view === 'online'} className={view === 'online' ? 'on' : ''} onClick={() => set({ view: 'online' })}>
              🖍️ Color online
            </button>
          </div>
          <button type="button" className="btn-ghost" onClick={() => set({ seed: newSeed() })}>
            🔀 New problems
          </button>
          {view === 'paper' && (
            <>
              <button type="button" className="btn-primary" onClick={() => window.print()}>
                🖨️ Print
              </button>
              <button type="button" className="btn-primary alt" onClick={onPdf} disabled={!!busy}>
                {busy || '⬇️ Download PDF'}
              </button>
            </>
          )}
          <a className="btn-ghost" href={href(`/color/${next.id}`, { mode: mode.id, view: view === 'online' ? 'online' : undefined })}>
            Next picture →
          </a>
        </div>
      </div>

      {view === 'paper' ? (
        <div className="paper-stack" ref={printRef}>
          <PaperSlot>
            <MysteryPaper pic={pic} mode={mode} page={page} seed={seed} />
          </PaperSlot>
          {withKey && (
            <PaperSlot>
              <MysteryPaper pic={pic} mode={mode} page={page} seed={seed} isKey />
            </PaperSlot>
          )}
        </div>
      ) : (
        <ColorOnline key={`${pic.id}-${mode.id}-${seed}`} pic={pic} page={page} long={mode.id !== 'numbers'} />
      )}
    </div>
  )
}

function KeyChips({ keyRows, onPick, picked }) {
  return (
    <div className="mkey">
      {keyRows.map((k) => {
        const inner = (
          <>
            <span className="mkey-swatch" style={{ background: k.hex }} />
            <b>{k.values.join(' or ')}</b>
            <span className="mkey-name">{k.ch === '.' ? 'leave white' : k.name}</span>
          </>
        )
        return onPick ? (
          <button key={k.ch} type="button" className={`mkey-chip ${picked === k.ch ? 'on' : ''}`} onClick={() => onPick(k.ch)}>
            {inner}
          </button>
        ) : (
          <span key={k.ch} className="mkey-chip">
            {inner}
          </span>
        )
      })}
    </div>
  )
}

function MysteryPaper({ pic, mode, page, seed, isKey }) {
  const n = pic.size
  // the grid fills the page width (leaving room for the key)
  const cell = Math.floor(660 / n)
  const long = mode.id !== 'numbers'
  return (
    <div className={`paper mystery-paper ${isKey ? 'is-key' : ''}`}>
      <header className="paper-head">
        <div className="paper-title">
          <Critter kind="bunny" size={46} />
          <div>
            <h2>
              Mystery Picture #{pic.number}
              {isKey && <span className="key-tag">Answer Key</span>}
            </h2>
            <div className="paper-sub">
              {mode.label} · {sizeLabel(n)} squares
            </div>
          </div>
        </div>
        {!isKey && (
          <div className="paper-name">
            <span>
              Name <i />
            </span>
            <span>
              Date <i className="short" />
            </span>
          </div>
        )}
      </header>
      <div className="paper-instr">
        {isKey ? `It's ${pic.title}!` : mode.id === 'numbers' ? 'Color each square with the crayon for its number. What picture appears?' : 'Solve the problem in each square. Color the square with the crayon for the answer. What picture appears?'}
      </div>
      <KeyChips keyRows={page.key} />
      <div className="mgrid-wrap">
        <div className={`mgrid ${long ? 'long' : ''}`} style={{ gridTemplateColumns: `repeat(${n}, ${cell}px)`, gridAutoRows: `${cell}px`, '--cell': `${cell}px` }}>
          {page.cells.flat().map((c, i) => (
            <span key={i} className="mcell" style={isKey ? painted(c.ch) : undefined}>
              {c.text}
            </span>
          ))}
        </div>
      </div>
      {!isKey && (
        <div className="mystery-answer">
          It's <i />!
        </div>
      )}
      <footer className="paper-foot">
        <span>Free coloring page from K5 Tutor · kapilsharma.dev/k5tutor</span>
        <span>
          #{seed}
          {isKey ? ' (key)' : ''}
        </span>
      </footer>
    </div>
  )
}

// Tap (or drag) squares to color them with the picked crayon.
function ColorOnline({ pic, page, long }) {
  const n = pic.size
  const flat = useMemo(() => page.cells.flat(), [page])
  const [paint, setPaint] = useState(() => flat.map(() => null))
  const [crayon, setCrayon] = useState(page.key[0].ch)
  const [checked, setChecked] = useState(false)
  const down = useRef(false)
  const touch = useRef(false)

  const done = paint.every((p, i) => p === flat[i].ch)
  const colored = paint.filter(Boolean).length
  const wrong = checked ? paint.reduce((s, p, i) => s + (p && p !== flat[i].ch ? 1 : 0), 0) : 0

  const fill = (i) => {
    if (i == null || done) return
    setPaint((all) => (all[i] === crayon ? all : all.map((p, j) => (j === i ? crayon : p))))
    setChecked(false)
  }
  const at = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY)
    const i = el?.dataset?.i
    return i == null ? null : Number(i)
  }

  return (
    <div className="color-online">
      <Confetti burst={done ? 1 : 0} big />
      <p className="ws-instr">
        {done ? `🎉 You made ${pic.title}!` : 'Pick a crayon, then tap every square whose answer matches it. With a mouse, you can drag to color lots of squares at once.'}
      </p>
      <KeyChips keyRows={page.key} onPick={setCrayon} picked={crayon} />
      <div className="mgrid-wrap">
        <div
          className={`mgrid online ${long ? 'long' : ''} ${done ? 'done' : ''}`}
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, '--n': n, '--minc': n > 10 || long ? '46px' : '32px' }}
          // mouse: press and drag to color; touch: tap to color (so a swipe still scrolls)
          onPointerDown={(e) => {
            touch.current = e.pointerType !== 'mouse'
            if (touch.current) return
            down.current = true
            e.currentTarget.setPointerCapture?.(e.pointerId)
            fill(at(e))
          }}
          onPointerMove={(e) => down.current && fill(at(e))}
          onPointerUp={() => (down.current = false)}
          onPointerCancel={() => (down.current = false)}
          onClick={(e) => touch.current && fill(at(e))}
        >
          {flat.map((c, i) => {
            const p = paint[i]
            const bad = checked && p && p !== c.ch
            return (
              <span key={i} data-i={i} className={`mcell ${p ? 'painted' : ''} ${bad ? 'bad' : ''}`} style={p ? painted(p) : undefined}>
                {c.text}
              </span>
            )
          })}
        </div>
      </div>
      <div className="online-actions">
        {!done && (
          <span className="mystery-progress">
            {colored} of {flat.length} squares colored
            {checked && (wrong ? ` · ${wrong} to fix (outlined in red)` : ' · all correct so far!')}
          </span>
        )}
        {!done && (
          <button type="button" className="btn-primary" onClick={() => setChecked(true)}>
            Check my coloring
          </button>
        )}
        <button type="button" className="btn-ghost" onClick={() => { setPaint(flat.map(() => null)); setChecked(false) }}>
          Start over
        </button>
      </div>
    </div>
  )
}
