import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generateSheet, nextTopic } from '../curriculum/index.js'
import { assemble, checkAnswer, fieldsOf } from '../lib/answers.js'
import { href, navigate } from '../lib/router.js'
import { newSeed } from '../lib/rng.js'
import { useProgress } from '../lib/progress.js'
import { playCorrect, playLevelUp, playWrong } from '../lib/sound.js'
import { Critter } from './art/Critters.jsx'
import { BUDDIES } from '../curriculum/vocab.js'
import Problem from './Problem.jsx'
import Confetti from './Confetti.jsx'

const ROUND = 10
const PASS = 8

const CHEERS = ['Great job!', 'You got it!', 'Awesome!', 'Super!', 'Nailed it!', 'Wow, nice!', 'Oink-tastic!', 'High five!']
const RETRY = ['Almost! Try again.', 'Not quite — look again.', 'Hmm, check your work.', 'So close! One more try.']

const touchDevice = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches

export default function Practice({ topic, query }) {
  const top = topic.levels.length
  const level = Math.min(Math.max(1, parseInt(query.level, 10) || 1), top)
  const [roundSeed, setRoundSeed] = useState(newSeed)
  const problems = useMemo(() => generateSheet(topic, level, ROUND, roundSeed), [topic, level, roundSeed])
  const [idx, setIdx] = useState(0)
  const [history, setHistory] = useState([]) // true | false per finished problem
  const [values, setValues] = useState([])
  const [results, setResults] = useState([])
  const [tries, setTries] = useState(0)
  const [status, setStatus] = useState('answering') // answering | correct | revealed | done
  const [say, setSay] = useState("Ready? Let's go!")
  const [burst, setBurst] = useState(0)
  const [pad, setPad] = useState(touchDevice)
  const lastField = useRef(null)
  const boxRef = useRef(null)

  const buddy = useProgress((s) => s.buddy)
  const setBuddy = useProgress((s) => s.setBuddy)
  const sound = useProgress((s) => s.sound)
  const toggleSound = useProgress((s) => s.toggleSound)
  const clearLevel = useProgress((s) => s.clearLevel)
  const cleared = useProgress((s) => s.cleared[topic.id] || 0)
  const addSolved = useProgress((s) => s.addSolved)

  const problem = problems[idx]
  const needsTyping = problem?.answers.some((a) => a.kind !== 'choice')

  // new round whenever level changes
  const startRound = useCallback(() => {
    setRoundSeed(newSeed())
    setIdx(0)
    setHistory([])
    setValues([])
    setResults([])
    setTries(0)
    setStatus('answering')
  }, [])

  const [prevLevel, setPrevLevel] = useState(level)
  if (prevLevel !== level) {
    setPrevLevel(level)
    startRound()
    setSay(`Level ${level}: ${topic.levels[level - 1]}`)
  }

  useEffect(() => {
    if (status !== 'answering') return
    const first = boxRef.current?.querySelector('input.blank-input')
    if (first && !touchDevice) first.focus()
    lastField.current = first?.dataset.field || null
  }, [idx, roundSeed, status])

  const check = useCallback(
    (vals = values) => {
      if (status !== 'answering' || !problem) return
      const res = problem.answers.map((spec, i) => checkAnswer(spec, assemble(spec, vals[i])))
      const empty = problem.answers.every((spec, i) => !assemble(spec, vals[i]))
      if (empty) {
        setSay('Type your answer first!')
        return
      }
      setResults(res)
      if (res.every(Boolean)) {
        if (sound) playCorrect()
        setStatus('correct')
        setSay(CHEERS[Math.floor(Math.random() * CHEERS.length)])
        setBurst((b) => b + 1)
        addSolved()
        return
      }
      if (sound) playWrong()
      if (tries === 0 && !(problem.answers.length === 1 && problem.answers[0].kind === 'choice' && problem.answers[0].options.length === 2)) {
        setTries(1)
        setSay(RETRY[Math.floor(Math.random() * RETRY.length)])
      } else {
        setStatus('revealed')
        setSay("That's okay! Here's the answer.")
      }
    },
    [values, status, problem, tries, sound, addSolved],
  )

  const next = useCallback(() => {
    const ok = status === 'correct' && tries === 0
    const hist = [...history, ok]
    setHistory(hist)
    setValues([])
    setResults([])
    setTries(0)
    if (idx + 1 >= ROUND) {
      const score = hist.filter(Boolean).length
      setStatus('done')
      if (score >= PASS) {
        clearLevel(topic.id, level)
        if (sound) playLevelUp()
        setBurst((b) => b + 1)
        setSay(level < top ? 'You leveled up!' : 'You finished every level!')
      } else setSay('Good practice! Want to try again?')
      return
    }
    setIdx(idx + 1)
    setStatus('answering')
    setSay(ok ? 'Next one!' : "Let's try another.")
  }, [status, tries, history, idx, level, top, topic.id, clearLevel, sound])

  // Enter moves to the next box, then checks; after checking it goes to the next problem.
  const onEnter = useCallback(
    (el) => {
      if (status === 'correct' || status === 'revealed') return next()
      const inputs = [...(boxRef.current?.querySelectorAll('input.blank-input') || [])]
      const i = inputs.indexOf(el)
      if (i >= 0 && i < inputs.length - 1 && !inputs[i + 1].value) inputs[i + 1].focus()
      else check()
    },
    [status, next, check],
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' && (status === 'correct' || status === 'revealed') && e.target.tagName !== 'INPUT') {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, next])

  const onField = (i, k, v, submit) => {
    if (status !== 'answering') return
    const nv = [...values]
    nv[i] = { ...(nv[i] || {}), [k]: v }
    setValues(nv)
    if (results[i] === false) {
      const nr = [...results]
      nr[i] = undefined
      setResults(nr)
    }
    if (submit && problem.answers.length === 1) check(nv)
  }

  const padPress = (key) => {
    if (status !== 'answering') {
      if (key === 'go') next()
      return
    }
    if (key === 'go') return check()
    const inputs = [...(boxRef.current?.querySelectorAll('input.blank-input') || [])]
    let target = inputs.find((el) => el.dataset.field === lastField.current) || inputs[0]
    if (!target) return
    const [i, k] = target.dataset.field.split('.')
    const cur = values[+i]?.[k] ?? ''
    if (key === 'back') onField(+i, k, cur.slice(0, -1))
    else if (key === 'next') {
      const n = inputs[(inputs.indexOf(target) + 1) % inputs.length]
      lastField.current = n.dataset.field
      if (!touchDevice) n.focus()
    } else onField(+i, k, cur + key)
  }

  const score = history.filter(Boolean).length
  const passed = status === 'done' && score >= PASS
  const nt = nextTopic(topic.id)
  const hasDecimal = problem?.answers.some((a) => a.kind === 'number' && !Number.isInteger(a.value))
  const multiField = problem?.answers.reduce((s, a) => s + (a.kind === 'choice' ? 0 : fieldsOf(a).length), 0) > 1

  return (
    <div className="practice" style={{ '--gc': `var(--g-${topic.grade})` }}>
      <div className="practice-head">
        <a className="back" href={href(`/grade/${topic.grade}`)}>
          ← {topic.gradeLabel}
        </a>
        <h1>{topic.title}</h1>
        <div className="level-chips" role="tablist" aria-label="Level">
          {topic.levels.map((name, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={level === i + 1}
              className={level === i + 1 ? 'on' : ''}
              title={name}
              onClick={() => navigate(`/practice/${topic.id}`, { level: i + 1 })}
            >
              <span className="lvl-n">
                Level {i + 1}
                {i < cleared && <span className="lvl-star"> ★</span>}
              </span>
              <span className="lvl-name">{name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="practice-body">
        <aside className="buddy-col">
          <div className={`buddy ${status === 'correct' || passed ? 'happy' : tries ? 'hmm' : ''}`}>
            <div className="speech">{say}</div>
            <Critter kind={buddy} size={110} />
          </div>
          <div className="buddy-pick" aria-label="Choose your buddy">
            {BUDDIES.map((b) => (
              <button key={b} type="button" className={b === buddy ? 'on' : ''} onClick={() => setBuddy(b)} title={`Buddy: ${b}`}>
                <Critter kind={b} size={28} />
              </button>
            ))}
          </div>
        </aside>
        <div className="practice-tools">
          <button type="button" className="btn-ghost sm" onClick={toggleSound}>
            {sound ? '🔊 Sound on' : '🔇 Sound off'}
          </button>
          <button type="button" className="btn-ghost sm" onClick={() => setPad(!pad)}>
            {pad ? '⌨️ Hide number pad' : '🔢 Number pad'}
          </button>
          <a className="btn-ghost sm" href={href(`/worksheet/${topic.id}`, { level })}>
            🖨️ Print a worksheet
          </a>
        </div>

        <section className="practice-main">
          <div className="round-dots" aria-label={`Question ${Math.min(idx + 1, ROUND)} of ${ROUND}`}>
            {Array.from({ length: ROUND }, (_, i) => (
              <span key={i} className={`dot ${i < history.length ? (history[i] ? 'ok' : 'bad') : i === idx && status !== 'done' ? 'cur' : ''}`} />
            ))}
            <span className="round-label">
              {status === 'done' ? `${score} / ${ROUND}` : `Question ${idx + 1} of ${ROUND}`} · need {PASS} to level up
            </span>
          </div>

          {status !== 'done' && problem && (
            <div className={`practice-card ${status} ${tries && status === 'answering' ? 'shake' : ''}`} ref={boxRef} key={`${roundSeed}-${idx}-${tries}`}>
              <Problem
                problem={problem}
                mode="online"
                size="lg"
                values={values}
                results={results}
                onField={onField}
                onEnter={onEnter}
                inputMode={pad ? 'none' : undefined}
                onFocusField={(f) => (lastField.current = f)}
              />
              {status === 'revealed' && (
                <div className="reveal">
                  <span>Answer:</span>
                  <Problem problem={{ ...problem, prompt: undefined, figure: undefined }} mode="key" size="md" />
                </div>
              )}
              <div className="practice-actions">
                {status === 'answering' ? (
                  <>
                    <button type="button" className="btn-ghost" onClick={() => { setStatus('revealed'); setSay("Let's look at the answer.") }}>
                      Show me
                    </button>
                    {(needsTyping || problem.answers.length > 1) && (
                      <button type="button" className="btn-primary" onClick={() => check()}>
                        Check ✓
                      </button>
                    )}
                  </>
                ) : (
                  <button type="button" className="btn-primary" onClick={next} autoFocus>
                    {idx + 1 >= ROUND ? 'See my score' : 'Next →'}
                  </button>
                )}
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className={`round-done ${passed ? 'passed' : ''}`}>
              <div className="stars-big">
                {Array.from({ length: 3 }, (_, i) => (
                  <span key={i} className={score >= [5, PASS, ROUND][i] ? 'on' : ''}>
                    ★
                  </span>
                ))}
              </div>
              <h2>{passed ? (level < top ? `Level ${level} complete!` : 'Topic complete!') : `${score} out of ${ROUND}`}</h2>
              <p>
                {passed
                  ? level < top
                    ? `Next up: ${topic.levels[level]}.`
                    : nt
                      ? `Ready for ${nt.title}?`
                      : 'You finished everything. Amazing!'
                  : `Get ${PASS} right to unlock the next level. You can do it!`}
              </p>
              <div className="practice-actions">
                <button type="button" className="btn-ghost" onClick={() => { startRound(); setSay("Let's go again!") }}>
                  {passed ? 'Play this level again' : 'Try again'}
                </button>
                {passed && level < top && (
                  <a className="btn-primary" href={href(`/practice/${topic.id}`, { level: level + 1 })}>
                    Next level →
                  </a>
                )}
                {passed && level >= top && nt && (
                  <a className="btn-primary" href={href(`/practice/${nt.id}`, { level: 1 })}>
                    {nt.title} →
                  </a>
                )}
              </div>
            </div>
          )}

          {pad && needsTyping && status !== 'done' && (
            <NumberPad onPress={padPress} decimal={hasDecimal} multi={multiField} />
          )}
        </section>
      </div>
      <Confetti burst={burst} big={status === 'done'} />
    </div>
  )
}

function NumberPad({ onPress, decimal, multi }) {
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', decimal ? '.' : multi ? 'next' : '', '0', 'back']
  return (
    <div className="numpad" onMouseDown={(e) => e.preventDefault()}>
      {keys.map((k, i) =>
        k ? (
          <button key={i} type="button" className={`np-key ${k.length > 1 ? 'np-fn' : ''}`} onClick={() => onPress(k)}>
            {k === 'back' ? '⌫' : k === 'next' ? '→ box' : k}
          </button>
        ) : (
          <span key={i} />
        ),
      )}
      <button type="button" className="np-key np-go" onClick={() => onPress('go')}>
        Check ✓
      </button>
    </div>
  )
}
