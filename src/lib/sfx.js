let ctx
let unlocked = false
let muted = localStorage.getItem('muted') === '1'

window.addEventListener('pointerdown', () => { unlocked = true }, { once: true })

function tone(freq, dur = 0.12, type = 'sine', vol = 0.06, delay = 0, slideTo) {
  if (muted || !unlocked) return
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  const t = ctx.currentTime + delay
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(ctx.destination)
  o.start(t)
  o.stop(t + dur)
}

export const sfx = {
  hover: () => tone(880, 0.05, 'sine', 0.025),
  click: () => tone(520, 0.08, 'triangle', 0.06, 0, 300),
  success: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'sine', 0.07, i * 0.09)),
  error: () => tone(200, 0.28, 'sawtooth', 0.05, 0, 90),
}

export const isMuted = () => muted
export const setMuted = (v) => {
  muted = v
  localStorage.setItem('muted', v ? '1' : '0')
}