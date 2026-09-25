// Answer specs (problem.answers[i]) and how typed input is checked against them.
//   { kind: 'number', value }            integers or decimals; commas / $ ignored
//   { kind: 'fraction', n, d, simplest?, mixed? }  accepts "3/4", "1 1/2", whole numbers, and
//                                        equivalent fractions unless simplest is set
//   { kind: 'time', h, m }               "3:05"
//   { kind: 'choice', options, value }   options are strings; value is the correct one
//   { kind: 'text', value, accept? }     case-insensitive
//   { kind: 'point', x, y }              "(3, 5)"
// Online, a blank is split into fields (fraction → numerator/denominator boxes,
// time → hour/minute boxes) which assemble() joins back into one string.
import { gcd } from './math.js'

export function parseNumber(raw) {
  const s = String(raw).replace(/[,$\s]/g, '').replace(/¢$/, '')
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null
  return Number(s)
}

// Returns [n, d] or null. Handles "a/b", "w a/b", "w", decimals are rejected.
export function parseFraction(raw) {
  const s = String(raw).trim().replace(/\s+/g, ' ')
  let m = s.match(/^(-?\d+) (\d+)\/(\d+)$/)
  if (m) {
    const w = +m[1], n = +m[2], d = +m[3]
    if (!d) return null
    return [w * d + (w < 0 ? -n : n), d]
  }
  m = s.match(/^(-?\d+)\s*\/\s*(\d+)$/)
  if (m) return +m[2] ? [+m[1], +m[2]] : null
  m = s.match(/^-?\d+$/)
  if (m) return [+s, 1]
  return null
}

export function checkAnswer(spec, raw) {
  if (raw == null || String(raw).trim() === '') return !!spec.emptyOk
  switch (spec.kind) {
    case 'number': {
      const v = parseNumber(raw)
      return v != null && Math.abs(v - spec.value) < 1e-9
    }
    case 'fraction': {
      const f = parseFraction(raw)
      if (!f) return false
      const [n, d] = f
      if (n * spec.d !== spec.n * d) return false
      if (spec.simplest && gcd(n, d) !== 1) return false
      // "write as a mixed number": the fraction part must be proper
      if (spec.mixedOnly && !/^\d+( \d+\/\d+)?$/.test(String(raw).trim().replace(/\s+/g, ' '))) return false
      if (spec.mixedOnly && /\//.test(raw)) {
        const [, fr] = String(raw).trim().split(/\s+/)
        const [fn, fd] = fr.split('/').map(Number)
        if (fn >= fd) return false
      }
      return true
    }
    case 'time': {
      const m = String(raw).trim().match(/^(\d{1,2})\s*[:.]\s*(\d{1,2})$/)
      return !!m && +m[1] === spec.h && +m[2] === spec.m
    }
    case 'choice':
      return String(raw) === String(spec.value)
    case 'point': {
      const m = String(raw).trim().match(/^\(?\s*(-?\d+)\s*,\s*(-?\d+)\s*\)?$/)
      return !!m && +m[1] === spec.x && +m[2] === spec.y
    }
    case 'text': {
      const norm = (x) => String(x).trim().toLowerCase()
      return [spec.value, ...(spec.accept || [])].some((a) => norm(a) === norm(raw))
    }
    default:
      return false
  }
}

// How an answer is shown on the key / after a miss.
export function answerText(spec) {
  switch (spec.kind) {
    case 'number':
      return spec.display ?? spec.value.toLocaleString('en-US', { maximumFractionDigits: 6 })
    case 'fraction': {
      const { n, d } = spec
      if (d === 1) return String(n)
      if (spec.mixed && Math.abs(n) > d) {
        const w = Math.trunc(n / d)
        const r = Math.abs(n % d)
        return r ? `${w} ${r}/${d}` : String(w)
      }
      return `${n}/${d}`
    }
    case 'time':
      return `${spec.h}:${String(spec.m).padStart(2, '0')}`
    case 'point':
      return `(${spec.x}, ${spec.y})`
    case 'choice':
    case 'text':
      return String(spec.value)
    default:
      return ''
  }
}

// Hint for the input box: decides keyboard + width.
export function inputHint(spec) {
  switch (spec.kind) {
    case 'number':
      return { inputMode: Number.isInteger(spec.value) && spec.value >= 0 ? 'numeric' : 'decimal', width: Math.max(2, answerText(spec).length) }
    case 'fraction':
      return { inputMode: 'text', width: Math.max(3, answerText(spec).length), placeholder: 'a/b' }
    case 'time':
      return { inputMode: 'text', width: 5, placeholder: 'h:mm' }
    default:
      return { inputMode: 'text', width: Math.max(3, answerText(spec).length) }
  }
}

export function fieldsOf(spec) {
  switch (spec.kind) {
    case 'fraction':
      return spec.mixed ? ['w', 'n', 'd'] : ['n', 'd']
    case 'time':
      return ['h', 'm']
    case 'point':
      return ['x', 'y']
    default:
      return ['v']
  }
}

export function assemble(spec, parts = {}) {
  const g = (k) => String(parts[k] ?? '').trim()
  switch (spec.kind) {
    case 'fraction': {
      const w = g('w'), n = g('n'), d = g('d')
      if (!n && !d) return w
      if (!d) return w ? '' : n
      return w ? `${w} ${n}/${d}` : `${n}/${d}`
    }
    case 'time':
      return g('h') && g('m') ? `${g('h')}:${g('m')}` : ''
    case 'point':
      return g('x') && g('y') ? `(${g('x')}, ${g('y')})` : ''
    default:
      return g('v')
  }
}

// The correct answer split into the same fields, for the answer key.
export function partsOf(spec) {
  switch (spec.kind) {
    case 'fraction': {
      const { n, d } = spec
      if (d === 1) return spec.mixed ? { w: String(n) } : { n: String(n) }
      if (spec.mixed && Math.abs(n) > d) {
        const w = Math.trunc(n / d)
        const r = Math.abs(n % d)
        return r ? { w: String(w), n: String(r), d: String(d) } : { w: String(w) }
      }
      return { n: String(n), d: String(d) }
    }
    case 'time':
      return { h: String(spec.h), m: String(spec.m).padStart(2, '0') }
    case 'point':
      return { x: String(spec.x), y: String(spec.y) }
    default:
      return { v: answerText(spec) }
  }
}
