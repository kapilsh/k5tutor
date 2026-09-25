import { create } from 'zustand'

// Per-device progress, kept in localStorage. No accounts, nothing leaves the browser.
// stars[topicId] = highest level cleared; best[topicId] = best streak.

const KEY = 'k5tutor-progress-v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ cleared: state.cleared, solved: state.solved, buddy: state.buddy, sound: state.sound }))
  } catch {
    /* private mode — progress just won't persist */
  }
}

const saved = load()

export const useProgress = create((set, get) => ({
  cleared: saved.cleared || {},
  solved: saved.solved || 0,
  buddy: saved.buddy || 'pig',
  sound: saved.sound ?? true,

  clearLevel: (topicId, level) => {
    const cleared = { ...get().cleared, [topicId]: Math.max(get().cleared[topicId] || 0, level) }
    set({ cleared })
    save(get())
  },
  addSolved: () => {
    set({ solved: get().solved + 1 })
    save(get())
  },
  setBuddy: (buddy) => {
    set({ buddy })
    save(get())
  },
  toggleSound: () => {
    set({ sound: !get().sound })
    save(get())
  },
  resetAll: () => {
    set({ cleared: {}, solved: 0 })
    save(get())
  },
}))
