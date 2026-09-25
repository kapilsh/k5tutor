import Figure from './figures/Figure.jsx'
import { answerText, fieldsOf, partsOf } from '../lib/answers.js'

// Renders one generated problem.
//   mode 'print'  — empty answer boxes, for paper
//   mode 'key'    — answers filled in red
//   mode 'online' — inputs / buttons; values[i] = { field: text }, results[i] = true | false | undefined
// See src/curriculum/helpers.js for the problem shape.

export default function Problem({ problem, index, mode = 'print', values, onField, results, onEnter, size, inputMode, onFocusField }) {
  const ctx = { problem, mode, values: values || [], onField, results: results || [], onEnter, inputMode, onFocusField }
  const { body } = problem
  const figs = problem.figure ? (Array.isArray(problem.figure) ? problem.figure : [problem.figure]) : []
  return (
    <div className={`problem ${size ? `sz-${size}` : ''} body-${body.type}`}>
      {index != null && <span className="p-num">{index + 1}.</span>}
      <div className="p-main">
        {problem.prompt && <div className="p-prompt">{problem.prompt}</div>}
        {figs.length > 0 && (
          <div className={`p-figs ${figs.length > 1 ? 'multi' : ''}`}>
            {figs.map((f, i) => (
              <div key={i} className="p-fig">
                {f.caption && <div className="fig-caption">{f.caption}</div>}
                <Figure fig={f} />
              </div>
            ))}
          </div>
        )}
        <Body body={body} ctx={ctx} />
      </div>
    </div>
  )
}

function Body({ body, ctx }) {
  switch (body.type) {
    case 'inline':
      return <Inline tokens={body.tokens} style={body.style} ctx={ctx} />
    case 'vertical':
      return <Vertical body={body} ctx={ctx} />
    case 'longdiv':
      return <LongDiv body={body} ctx={ctx} />
    case 'choices':
      return <Choices i={body.blank ?? 0} ctx={ctx} />
    case 'bond':
      return <Bond body={body} ctx={ctx} />
    default:
      return null
  }
}

function Inline({ tokens, style, ctx }) {
  return (
    <div className={`inline ${style ? `style-${style}` : ''}`}>
      {tokens.map((t, k) => (
        <Token key={k} t={t} ctx={ctx} boxed={style === 'train'} />
      ))}
    </div>
  )
}

function Token({ t, ctx, boxed }) {
  if (t == null) return null
  if (typeof t === 'string' || typeof t === 'number') {
    const s = String(t)
    const isOp = /^[+−×÷=<>≈()[\]]$/.test(s.trim())
    if (boxed && !isOp && s.trim() !== '' && s !== '…') return <span className="tok tok-box">{s}</span>
    return <span className={`tok ${isOp ? 'tok-op' : /^[-\d.,$/¢%]+$/.test(s) ? 'tok-num' : 'tok-text'}`}>{s}</span>
  }
  if (t.blank != null) {
    return (
      <span className={boxed ? 'tok tok-box tok-box-blank' : 'tok'}>
        <Blank i={t.blank} ctx={ctx} />
      </span>
    )
  }
  if (t.frac) return <Frac n={t.frac[0]} d={t.frac[1]} ctx={ctx} />
  if (t.mixed)
    return (
      <span className="tok mixed">
        <span className="tok-num">{t.mixed[0]}</span>
        <Frac n={t.mixed[1]} d={t.mixed[2]} ctx={ctx} />
      </span>
    )
  if (t.fig)
    return (
      <span className="tok tok-fig">
        <Figure fig={t.fig} />
      </span>
    )
  if (t.digits != null)
    return (
      <span className="tok tok-num digits">
        {t.digits.split('').map((c, i) => (
          <span key={i} className={i === t.mark ? 'mark' : ''}>
            {c}
          </span>
        ))}
      </span>
    )
  if (t.pow)
    return (
      <span className="tok tok-num pow">
        {t.pow[0]}
        <sup>{typeof t.pow[1] === 'object' ? <Blank i={t.pow[1].blank} ctx={ctx} /> : t.pow[1]}</sup>
      </span>
    )
  if (t.br) return <span className="tok-br" />
  if (t.small) return <span className="tok tok-small">{t.small}</span>
  return null
}

function Frac({ n, d, ctx }) {
  const part = (x) => (x != null && typeof x === 'object' && x.blank != null ? <Blank i={x.blank} ctx={ctx} /> : x)
  return (
    <span className="tok frac">
      <span className="frac-n">{part(n)}</span>
      <span className="frac-bar" />
      <span className="frac-d">{part(d)}</span>
    </span>
  )
}

function widthFor(spec) {
  // about one digit-width per character plus padding; never narrower than a 2-digit box
  return Math.max(2.4, answerText(spec).length * 0.62 + 1)
}

function Field({ i, k, ctx, width, digits }) {
  const spec = ctx.problem.answers[i]
  const style = { '--w': `${width}em` }
  if (ctx.mode === 'print') return <span className="blank" style={style} />
  if (ctx.mode === 'key') return <span className="blank key" style={style}>{partsOf(spec)[k] ?? ''}</span>
  const val = ctx.values[i]?.[k] ?? ''
  const res = ctx.results[i]
  return (
    <input
      className={`blank-input ${res === true ? 'ok' : res === false ? 'bad' : ''}`}
      style={style}
      value={val}
      inputMode={ctx.inputMode || (digits ? 'numeric' : spec.kind === 'number' && !Number.isInteger(spec.value) ? 'decimal' : spec.kind === 'number' || spec.kind === 'fraction' || spec.kind === 'time' || spec.kind === 'point' ? 'numeric' : 'text')}
      autoComplete="off"
      spellCheck={false}
      aria-label={`answer ${i + 1}${k !== 'v' ? ` ${k}` : ''}`}
      data-field={`${i}.${k}`}
      onChange={(e) => ctx.onField?.(i, k, e.target.value)}
      onFocus={() => ctx.onFocusField?.(`${i}.${k}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          ctx.onEnter?.(e.currentTarget)
        }
      }}
    />
  )
}

function Blank({ i, ctx }) {
  const spec = ctx.problem.answers[i]
  if (!spec) return <span className="blank" />
  if (spec.kind === 'choice') return <InlineChoice i={i} ctx={ctx} />
  const res = ctx.results[i]
  const mark = ctx.mode === 'online' && res != null ? <span className={`mark-icon ${res ? 'ok' : 'bad'}`}>{res ? '✓' : '✗'}</span> : null
  const f = fieldsOf(spec)
  if (spec.kind === 'fraction') {
    const dw = Math.max(1.8, String(spec.d).length * 0.8 + 1)
    const nw = Math.max(1.8, String(Math.abs(spec.n)).length * 0.8 + 1)
    return (
      <span className="blank-group">
        {f.includes('w') && <Field i={i} k="w" ctx={ctx} width={2} digits />}
        <span className="frac">
          <span className="frac-n">
            <Field i={i} k="n" ctx={ctx} width={nw} digits />
          </span>
          <span className="frac-bar" />
          <span className="frac-d">
            <Field i={i} k="d" ctx={ctx} width={dw} digits />
          </span>
        </span>
        {mark}
      </span>
    )
  }
  if (spec.kind === 'time')
    return (
      <span className="blank-group">
        <Field i={i} k="h" ctx={ctx} width={2} digits />
        <span className="tok-op colon">:</span>
        <Field i={i} k="m" ctx={ctx} width={2.4} digits />
        {mark}
      </span>
    )
  if (spec.kind === 'point')
    return (
      <span className="blank-group">
        <span className="tok-op">(</span>
        <Field i={i} k="x" ctx={ctx} width={2} digits />
        <span className="tok-op">,</span>
        <Field i={i} k="y" ctx={ctx} width={2} digits />
        <span className="tok-op">)</span>
        {mark}
      </span>
    )
  return (
    <span className="blank-group">
      <Field i={i} k="v" ctx={ctx} width={widthFor(spec)} />
      {mark}
    </span>
  )
}

// A choice that sits inside an equation, e.g. 7 ○ 4 for <, >, =.
function InlineChoice({ i, ctx }) {
  const spec = ctx.problem.answers[i]
  if (ctx.mode === 'print') return <span className="bubble" />
  if (ctx.mode === 'key') return <span className="bubble key">{spec.value}</span>
  const val = ctx.values[i]?.v
  const res = ctx.results[i]
  return (
    <span className={`inline-choice ${res === true ? 'ok' : res === false ? 'bad' : ''}`}>
      {spec.options.map((o) => (
        <button
          key={o}
          type="button"
          className={val === o ? 'on' : ''}
          onClick={() => ctx.onField?.(i, 'v', o, true)}
        >
          {o}
        </button>
      ))}
    </span>
  )
}

function Choices({ i, ctx }) {
  const spec = ctx.problem.answers[i]
  const figs = spec.optionFigs || {}
  const val = ctx.values[i]?.v
  const res = ctx.results[i]
  const hasFigs = Object.keys(figs).length > 0
  return (
    <div className={`choices ${hasFigs ? 'with-figs' : ''} ${spec.options.length > 3 && !hasFigs ? 'many' : ''}`}>
      {spec.options.map((o, k) => {
        const content = figs[o] ? <Figure fig={figs[o]} /> : <span>{o}</span>
        if (ctx.mode !== 'online') {
          const right = ctx.mode === 'key' && o === spec.value
          return (
            <span key={o} className={`choice-print ${right ? 'key' : ''}`}>
              <span className="choice-letter">{String.fromCharCode(65 + k)}</span>
              {content}
            </span>
          )
        }
        const on = val === o
        return (
          <button
            key={o}
            type="button"
            className={`choice-btn ${on ? 'on' : ''} ${on && res === true ? 'ok' : ''} ${on && res === false ? 'bad' : ''}`}
            onClick={() => ctx.onField?.(i, 'v', o, true)}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}

// Column arithmetic. Rows are right-aligned; decimals are padded so the points line up.
function Vertical({ body, ctx }) {
  const rows = body.rows.map(String)
  const dec = Math.max(...rows.map((r) => (r.includes('.') ? r.length - r.indexOf('.') - 1 : 0)))
  const pad = (r) => {
    if (!dec) return r
    const d = r.includes('.') ? r.length - r.indexOf('.') - 1 : -1
    // figure space (U+2007) is digit-width; punctuation space (U+2008) is point-width
    return d < 0 ? `${r}\u2008${'\u2007'.repeat(dec)}` : r + '\u2007'.repeat(dec - d)
  }
  return (
    <div className="vertical">
      {rows.map((r, k) => (
        <div key={k} className="v-row">
          <span className="v-op">{k === rows.length - 1 ? body.op : ''}</span>
          <span className="v-num">{pad(r)}</span>
        </div>
      ))}
      <div className="v-line" />
      <div className="v-ans">
        <Blank i={0} ctx={ctx} />
      </div>
    </div>
  )
}

function LongDiv({ body, ctx }) {
  const hasR = ctx.problem.answers.length > 1
  return (
    <div className="longdiv">
      <div className="ld-q">
        <Blank i={0} ctx={ctx} />
        {hasR && (
          <>
            <span className="tok-op ld-r">R</span>
            <Blank i={1} ctx={ctx} />
          </>
        )}
      </div>
      <div className="ld-row">
        <span className="ld-divisor">{body.divisor}</span>
        <span className="ld-dividend">{body.dividend}</span>
      </div>
      <div className="ld-work" />
    </div>
  )
}

// Number bond: whole on top, two parts below; one circle is the blank.
function Bond({ body, ctx }) {
  const cell = (key, v) => (
    <div className={`bond-c bond-${key}`}>
      {v === null ? <Blank i={0} ctx={ctx} /> : <span className="tok-num">{v}</span>}
    </div>
  )
  const { whole, parts, missing } = body
  return (
    <div className="bond">
      <svg className="bond-lines" viewBox="0 0 200 130" preserveAspectRatio="none">
        <line x1="100" y1="35" x2="42" y2="100" />
        <line x1="100" y1="35" x2="158" y2="100" />
      </svg>
      {cell('w', missing === 'whole' ? null : whole)}
      {cell('a', missing === 'a' ? null : parts[0])}
      {cell('b', missing === 'b' ? null : parts[1])}
    </div>
  )
}
