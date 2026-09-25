import { useEffect } from 'react'
import { useRoute, href } from './lib/router.js'
import { GRADES, TOPICS } from './curriculum/index.js'
import { Critter } from './components/art/Critters.jsx'
import Home from './components/Home.jsx'
import GradePage from './components/GradePage.jsx'
import Practice from './components/Practice.jsx'
import Worksheet from './components/Worksheet.jsx'
import './App.css'

export default function App() {
  const route = useRoute()
  const [page, arg] = route.parts
  const topic = arg ? TOPICS[arg] : null
  const grade = page === 'grade' ? GRADES.find((g) => g.id === arg) : topic ? GRADES.find((g) => g.id === topic.grade) : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page, arg])

  useEffect(() => {
    const base = 'K5 Tutor — free math practice & printable worksheets'
    document.title = topic ? `${topic.title} · ${topic.gradeLabel} · K5 Tutor` : grade ? `${grade.label} math · K5 Tutor` : base
  }, [topic, grade])

  let body
  if (page === 'grade' && grade) body = <GradePage grade={grade} />
  else if (page === 'practice' && topic) body = <Practice key={topic.id} topic={topic} query={route.query} />
  else if (page === 'worksheet' && topic) body = <Worksheet key={topic.id} topic={topic} query={route.query} />
  else body = <Home />

  return (
    <div className="app">
      <header className="app-header no-print">
        <a className="brand" href="#/">
          <Critter kind="pig" size={38} />
          <span className="brand-name">
            K5<span className="brand-accent">Tutor</span>
          </span>
        </a>
        <nav className="grade-nav" aria-label="Grades">
          {GRADES.map((g) => (
            <a key={g.id} href={href(`/grade/${g.id}`)} className={`grade-chip ${grade?.id === g.id ? 'on' : ''}`} style={{ '--gc': g.color }} title={g.label}>
              {g.short}
            </a>
          ))}
        </nav>
      </header>
      <main className="app-main">{body}</main>
      <footer className="app-footer no-print">
        <div>
          Free for everyone — no sign-ups, no ads. Progress is saved only on this device.
        </div>
        <div className="footer-links">
          <a href="https://github.com/kapilsh/k5tutor" target="_blank" rel="noreferrer">
            Source on GitHub
          </a>
          <span>·</span>
          <a href="https://www.kapilsharma.dev" target="_blank" rel="noreferrer">
            kapilsharma.dev
          </a>
        </div>
      </footer>
    </div>
  )
}
