import { useSyncExternalStore } from 'react'

// Hash routing keeps GitHub Pages happy (no server rewrites) and makes every
// worksheet a shareable link: #/worksheet/g2-add-2digit?level=3&seed=123456

function parse() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, qs = ''] = raw.split('?')
  const parts = path.split('/').filter(Boolean)
  const query = Object.fromEntries(new URLSearchParams(qs))
  return { parts, query, raw }
}

let current = parse()
const listeners = new Set()
window.addEventListener('hashchange', () => {
  current = parse()
  listeners.forEach((l) => l())
})

export function useRoute() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => current,
  )
}

export function href(path, query) {
  const qs = query ? new URLSearchParams(Object.entries(query).filter(([, v]) => v != null && v !== '')).toString() : ''
  return `#${path}${qs ? `?${qs}` : ''}`
}

export function navigate(path, query, { replace = false } = {}) {
  const h = href(path, query)
  if (replace) {
    history.replaceState(null, '', h)
    current = parse()
    listeners.forEach((l) => l())
  } else {
    window.location.hash = h.slice(1)
  }
}
