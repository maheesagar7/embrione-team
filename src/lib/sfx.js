let ctx = null
let unlocked = false
let muted = localStorage.getItem('muted') === '1'

// Helper to initialize and unlock the audio context safely
async function getAudioContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
  return ctx
}

// Unlock audio on the very first user interaction
window.addEventListener('pointerdown', async () => {
  unlocked = true
  try {
    await getAudioContext()
  } catch (err) {
    console.error('Could not unlock audio:', err)
  }
}, { once: true }) // Can be once: true since it only needs to unlock once

async function tone(freq, dur = 0.12, type = 'sine', vol = 0.06, delay = 0, slideTo) {
  if (muted || !unlocked) return

  try {
    const audioCtx = await getAudioContext()
    if (audioCtx.state !== 'running') return // Prevent playing if context failed to resume

    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    const t = audioCtx.currentTime + delay
    
    o.type = type
    o.frequency.setValueAtTime(freq, t)
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
    
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    
    o.connect(g).connect(audioCtx.destination)
    o.start(t)
    o.stop(t + dur)
  } catch (err) {
    console.error('Error playing tone:', err)
  }
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