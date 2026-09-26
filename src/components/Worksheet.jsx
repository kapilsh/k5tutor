import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { generateSheet, layoutFor } from '../curriculum/index.js'
import { assemble, checkAnswer } from '../lib/answers.js'
import { href, navigate } from '../lib/router.js'
import { newSeed } from '../lib/rng.js'
import { PAGE_W, PAGE_H, downloadPdf } from '../lib/pdf.js'
import { Critter } from './art/Critters.jsx'
import Problem from './Problem.jsx'

export default function Worksheet({ topic, query }) {
  const top = topic.levels.length
  const level = query.level === 'mix' ? 'mix' : Math.min(Math.max(1, parseInt(query.level, 10) || 1), top)
  const pages = Math.min(Math.max(1, parseInt(query.pages, 10) || 1), 5)
  const withKey = query.key !== '0'
  const view = query.view === 'online' ? 'online' : 'paper'
  const seed = parseInt(query.seed, 10)

  const set = (patch, replace = true) => navigate(`/worksheet/${topic.id}`, { level, pages, key: withKey ? undefined : '0', view: view === 'online' ? 'online' : undefined, seed, ...patch }, { replace })

  // Every sheet gets a seed in the URL so the exact sheet can be shared or reprinted.
  useEffect(() => {
    if (!seed) set({ seed: newSeed() })
  })

  const { cols, perPage } = layoutFor(topic, level)
  const problems = useMemo(() => (seed ? generateSheet(topic, level, perPage * pages, seed) : []), [topic, level, perPage, pages, seed])
  const chunks = useMemo(() => Array.from({ length: pages }, (_, i) => problems.slice(i * perPage, (i + 1) * perPage)), [problems, pages, perPage])
  const levelLabel = level === 'mix' ? 'Easy → hard' : `Level ${level}: ${topic.levels[level - 1]}`

  const printRef = useRef(null)
  const [busy, setBusy] = useState(null)

  const onPdf = async () => {
    const nodes = [...printRef.current.querySelectorAll('.paper')]
    setBusy('Preparing PDF…')
    try {
      await downloadPdf(nodes, `k5tutor-${topic.id}-${level === 'mix' ? 'mix' : `L${level}`}-${seed}.pdf`, (i, n) => setBusy(`Making page ${i + 1} of ${n}…`))
    } catch (e) {
      console.error(e)
      alert('Sorry — the PDF could not be made in this browser. Try Print → Save as PDF instead.')
    } finally {
      setBusy(null)
    }
  }

  const [copied, setCopied] = useState(false)
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked */
    }
  }

  if (!seed) return null

  return (
    <div className="worksheet" style={{ '--gc': `var(--g-${topic.grade})` }}>
      <div className="ws-controls no-print">
        <a className="back" href={href(`/grade/${topic.grade}`)}>
          ← {topic.gradeLabel}
        </a>
        <h1>{topic.title}</h1>
        <p className="ws-blurb">{topic.blurb}</p>

        <div className="ws-row">
          <label className="field">
            <span>Level</span>
            <select value={level} onChange={(e) => set({ level: e.target.value, seed: newSeed() })}>
              {topic.levels.map((name, i) => (
                <option key={i} value={i + 1}>
                  Level {i + 1}: {name}
                </option>
              ))}
              {top > 1 && <option value="mix">Easy → hard (all levels)</option>}
            </select>
          </label>
          <label className="field">
            <span>Pages</span>
            <select value={pages} onChange={(e) => set({ pages: e.target.value })}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'page' : 'pages'} · {n * perPage} problems
                </option>
              ))}
            </select>
          </label>
          <label className="check">
            <input type="checkbox" checked={withKey} onChange={(e) => set({ key: e.target.checked ? undefined : '0' })} />
            <span>Answer key</span>
          </label>
        </div>

        <div className="ws-row ws-buttons">
          <div className="seg" role="tablist" aria-label="View">
            <button type="button" role="tab" aria-selected={view === 'paper'} className={view === 'paper' ? 'on' : ''} onClick={() => set({ view: undefined })}>
              📄 Printable
            </button>
            <button type="button" role="tab" aria-selected={view === 'online'} className={view === 'online' ? 'on' : ''} onClick={() => set({ view: 'online' })}>
              ✏️ Do it online
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
          <button type="button" className="btn-ghost" onClick={copyLink} title="Copy a link to this exact worksheet">
            {copied ? '✓ Link copied' : '🔗 Copy link'}
          </button>
          <a className="btn-ghost" href={href(`/practice/${topic.id}`, { level: level === 'mix' ? 1 : level })}>
            🎮 Practice mode
          </a>
        </div>
        <p className="ws-seed">Worksheet #{seed} — this link always makes the same sheet.</p>
      </div>

      {view === 'paper' ? (
        <div className="paper-stack" ref={printRef}>
          {chunks.map((chunk, pi) => (
            <PaperSlot key={`p${pi}`}>
              <Paper topic={topic} levelLabel={levelLabel} problems={chunk} start={pi * perPage} cols={cols} page={pi + 1} pageCount={pages} seed={seed} total={problems.length} />
            </PaperSlot>
          ))}
          {withKey &&
            chunks.map((chunk, pi) => (
              <PaperSlot key={`k${pi}`}>
                <Paper topic={topic} levelLabel={levelLabel} problems={chunk} start={pi * perPage} cols={cols} page={pi + 1} pageCount={pages} seed={seed} total={problems.length} isKey />
              </PaperSlot>
            ))}
        </div>
      ) : (
        <OnlineSheet key={`${seed}-${level}-${pages}`} problems={problems} topic={topic} />
      )}
    </div>
  )
}

// Scales a letter-size page down to fit narrow screens without affecting print/PDF.
export function PaperSlot({ children }) {
  const ref = useRef(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = ref.current?.parentElement
    if (!el) return
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / PAGE_W)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div className="paper-slot" ref={ref} style={{ width: PAGE_W * scale, height: PAGE_H * scale }}>
      <div className="paper-scale" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}

function Paper({ topic, levelLabel, problems, start, cols, page, pageCount, seed, total, isKey }) {
  return (
    <div className={`paper ${isKey ? 'is-key' : ''}`}>
      <header className="paper-head">
        <div className="paper-title">
          <Critter kind={topic.art || 'pig'} size={46} />
          <div>
            <h2>
              {topic.title}
              {isKey && <span className="key-tag">Answer Key</span>}
            </h2>
            <div className="paper-sub">
              {topic.gradeLabel} · {levelLabel}
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
            <span>
              Score <i className="tiny" /> / {total}
            </span>
          </div>
        )}
      </header>
      <div className="paper-instr">{topic.instructions}</div>
      <div className="paper-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {problems.map((p, i) => (
          <div key={i} className="paper-cell">
            <Problem problem={p} index={start + i} mode={isKey ? 'key' : 'print'} />
          </div>
        ))}
      </div>
      <footer className="paper-foot">
        <span>Free worksheet from K5 Tutor · kapilsharma.dev/k5tutor</span>
        <span>
          #{seed} · page {page} of {pageCount}
          {isKey ? ' (key)' : ''}
        </span>
      </footer>
    </div>
  )
}

function OnlineSheet({ problems, topic }) {
  const [values, setValues] = useState(() => problems.map(() => []))
  const [results, setResults] = useState(null)

  const onField = (pi) => (i, k, v) => {
    setValues((all) => {
      const next = [...all]
      const row = [...next[pi]]
      row[i] = { ...(row[i] || {}), [k]: v }
      next[pi] = row
      return next
    })
    if (results) setResults(null)
  }

  const check = () => setResults(problems.map((p, pi) => p.answers.map((spec, i) => checkAnswer(spec, assemble(spec, values[pi][i])))))
  const score = results ? results.filter((r) => r.every(Boolean)).length : 0

  return (
    <div className="online-sheet">
      <p className="ws-instr">{topic.instructions}</p>
      <div className="online-grid">
        {problems.map((p, pi) => {
          const ok = results?.[pi]?.every(Boolean)
          return (
            <div key={pi} className={`online-cell ${results ? (ok ? 'ok' : 'bad') : ''}`}>
              <Problem problem={p} index={pi} mode="online" values={values[pi]} results={results?.[pi]} onField={onField(pi)} onEnter={() => {}} />
            </div>
          )
        })}
      </div>
      <div className="online-actions">
        {results && (
          <div className={`score-banner ${score === problems.length ? 'perfect' : ''}`}>
            {score === problems.length ? '🎉 ' : ''}
            {score} of {problems.length} correct
          </div>
        )}
        <button type="button" className="btn-primary" onClick={check}>
          Check my answers
        </button>
        <button type="button" className="btn-ghost" onClick={() => { setValues(problems.map(() => [])); setResults(null) }}>
          Clear
        </button>
      </div>
    </div>
  )
}
