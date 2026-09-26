import { GRADES } from '../curriculum/index.js'
import { href } from '../lib/router.js'
import { useProgress } from '../lib/progress.js'
import { Critter } from './art/Critters.jsx'

export default function Home() {
  const cleared = useProgress((s) => s.cleared)
  const solved = useProgress((s) => s.solved)
  const totalTopics = GRADES.reduce((s, g) => s + g.topics.length, 0)
  const totalLevels = GRADES.reduce((s, g) => s + g.topics.reduce((a, t) => a + t.levels.length, 0), 0)

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <h1>
            Math practice that grows <span className="hl">with your kid</span>
          </h1>
          <p>
            Kindergarten through 5th grade: counting pigs, skip counting, times tables, long division, fractions and more.
            Every topic starts easy and levels up. Practice right here, or print a fresh worksheet with an answer key.
          </p>
          <div className="hero-cta">
            <a className="btn-primary" href={href('/grade/k')}>
              Start with Kindergarten
            </a>
            <a className="btn-ghost" href="#grades">
              Pick a grade
            </a>
          </div>
          <ul className="hero-points">
            <li>
              <b>{totalTopics}</b> topics
            </li>
            <li>
              <b>{totalLevels}</b> levels
            </li>
            <li>
              <b>∞</b> new worksheets
            </li>
            {solved > 0 && (
              <li>
                <b>{solved}</b> solved here
              </li>
            )}
          </ul>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-bubble">3 + 4 = ?</div>
          <div className="hero-crowd">
            {['cow', 'pig', 'chick', 'frog', 'bunny'].map((k, i) => (
              <Critter key={k} kind={k} size={i === 1 ? 140 : 84} className={`bob bob-${i}`} />
            ))}
          </div>
        </div>
      </section>

      <section id="grades" className="grades">
        {GRADES.map((g) => {
          const done = g.topics.filter((t) => cleared[t.id]).length
          return (
            <a key={g.id} className="grade-card" href={href(`/grade/${g.id}`)} style={{ '--gc': g.color }}>
              <div className="grade-card-top">
                <span className="grade-badge">{g.short}</span>
                <Critter kind={g.art} size={56} />
              </div>
              <h2>{g.label}</h2>
              <p>{g.blurb}</p>
              <div className="grade-card-foot">
                <span>{g.topics.length} topics</span>
                {done > 0 && <span className="grade-done">★ {done} started</span>}
              </div>
            </a>
          )
        })}
      </section>

      <a className="mystery-banner" href={href('/color')}>
        <span className="mystery-banner-icon" aria-hidden="true">
          🖍️
        </span>
        <span>
          <b>Mystery Pictures</b>
          <span>Solve the problem in each square, color it in, and watch a picture appear. Print one or color online.</span>
        </span>
        <span className="mystery-banner-go">Start coloring →</span>
      </a>

      <section className="how">
        <div className="how-card">
          <span className="how-icon">✏️</span>
          <h3>Practice online</h3>
          <p>One question at a time with a friendly buddy. Get 8 of 10 right to level up — problems get harder as you go.</p>
        </div>
        <div className="how-card">
          <span className="how-icon">🖨️</span>
          <h3>Print or save a PDF</h3>
          <p>Every worksheet is freshly generated. Print it, or download a PDF to print later — the answer key comes with it.</p>
        </div>
        <div className="how-card">
          <span className="how-icon">🎁</span>
          <h3>Free, no sign-up</h3>
          <p>No accounts, no ads, no memberships. Progress is remembered only in this browser.</p>
        </div>
      </section>
    </div>
  )
}
