// Tiny WebAudio chimes — no audio files to download.
let ctx

function tone(freq, start, dur, type = 'sine', gain = 0.12) {
  ctx ||= new (window.AudioContext || window.webkitAudioContext)()
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.value = freq
  const t = ctx.currentTime + start
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  o.connect(g).connect(ctx.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

export function playCorrect() {
  try {
    tone(660, 0, 0.15)
    tone(880, 0.1, 0.25)
  } catch {
    /* audio unavailable */
  }
}

export function playWrong() {
  try {
    tone(220, 0, 0.25, 'triangle', 0.08)
  } catch {
    /* audio unavailable */
  }
}

export function playLevelUp() {
  try {
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3))
  } catch {
    /* audio unavailable */
  }
}
