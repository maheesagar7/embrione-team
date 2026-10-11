export function confetti() {
  const c = document.createElement('canvas')
  Object.assign(c.style, { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 })
  c.width = innerWidth
  c.height = innerHeight
  document.body.appendChild(c)
  const x = c.getContext('2d')
  const colors = ['#a78bfa', '#38bdf8', '#f472b6', '#facc15', '#4ade80']
  const ps = Array.from({ length: 120 }, () => ({
    x: c.width / 2, y: c.height * 0.6,
    vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 16 - 4,
    s: Math.random() * 7 + 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
    col: colors[Math.floor(Math.random() * colors.length)],
  }))
  let f = 0
  ;(function tick() {
    x.clearRect(0, 0, c.width, c.height)
    ps.forEach((p) => {
      p.vy += 0.45; p.x += p.vx; p.y += p.vy; p.r += p.vr
      x.save(); x.translate(p.x, p.y); x.rotate(p.r)
      x.fillStyle = p.col; x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6)
      x.restore()
    })
    if (++f < 110) requestAnimationFrame(tick)
    else c.remove()
  })()
}