import { useState } from 'react'
import { href } from '../lib/router.js'
import { useProgress } from '../lib/progress.js'
import { Critter } from './art/Critters.jsx'

export default function GradePage({ grade }) {
  const cleared = useProgress((s) => s.cleared)
  const strands = [...new Set(grade.topics.map((t) => t.strand))]
  const [strand, setStrand] = useState('all')
  const shown = grade.topics.filter((t) => strand === 'all' || t.strand === strand)

  return (
    <div className="grade-page" style={{ '--gc': grade.color }}>
      <div className="grade-head">
        <Critter kind={grade.art} size={72} />
        <div>
          <h1>{grade.label}</h1>
          <p>{grade.blurb}</p>
        </div>
      </div>

      <div className="strand-filter" role="tablist">
        {['all', ...strands].map((s) => (
          <button key={s} type="button" role="tab" aria-selected={strand === s} className={strand === s ? 'on' : ''} onClick={() => setStrand(s)}>
            {s === 'all' ? 'All topics' : s}
          </button>
        ))}
      </div>

      <div className="topic-grid">
        {shown.map((t) => {
          const got = cleared[t.id] || 0
          const next = Math.min(got + 1, t.levels.length)
          return (
            <div key={t.id} className="topic-card">
              <div className="topic-top">
                <span className="topic-icon">{t.art ? <Critter kind={t.art} size={40} /> : <span className={`glyph ${t.glyph.length <= 2 ? 'big' : t.glyph.length >= 4 ? 'small' : ''}`}>{t.glyph}</span>}</span>
                <div className="topic-meta">
                  <span className="topic-strand">{t.strand}</span>
                  <h3>{t.title}</h3>
                </div>
              </div>
              <p className="topic-blurb">{t.blurb}</p>
              <div className="topic-stars" title={`${got} of ${t.levels.length} levels cleared`}>
                {t.levels.map((name, i) => (
                  <span key={i} className={i < got ? 'star on' : 'star'} title={`Level ${i + 1}: ${name}`}>
                    ★
                  </span>
                ))}
                <span className="topic-levels">{t.levels.length} levels</span>
              </div>
              <div className="topic-actions">
                <a className="btn-primary sm" href={href(`/practice/${t.id}`, { level: next })}>
                  {got ? 'Keep going' : 'Practice'}
                </a>
                <a className="btn-ghost sm" href={href(`/worksheet/${t.id}`, { level: next })}>
                  Worksheet
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
