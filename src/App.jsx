import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { Toaster } from 'sonner'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Team from './pages/Team'
import { sfx, isMuted, setMuted } from './lib/sfx'
import { confetti } from './lib/confetti'

function Effects() {
  useEffect(() => {
    const seen = new WeakSet()

    const onDown = (e) => { if (e.target.closest('button, .nav a')) sfx.click() }

    const onOver = (e) => {
      const c = e.target.closest('.card')
      if (c && !c.contains(e.relatedTarget)) sfx.hover()
    }

    const onMove = (e) => {
      const root = document.documentElement
      root.style.setProperty('--mx', e.clientX + 'px')
      root.style.setProperty('--my', e.clientY + 'px')
      const c = e.target.closest('.card')
      if (c) {
        const r = c.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        c.style.setProperty('--ry', `${px * 10}deg`)
        c.style.setProperty('--rx', `${-py * 10}deg`)
      }
    }

    const onOut = (e) => {
      const c = e.target.closest('.card')
      if (c && !c.contains(e.relatedTarget)) {
        c.style.setProperty('--rx', '0deg')
        c.style.setProperty('--ry', '0deg')
      }
    }

    // Play a sound whenever any toast appears
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return
        const t = n.matches('[data-sonner-toast]') ? n : n.querySelector('[data-sonner-toast]')
        if (!t || seen.has(t)) return
        seen.add(t)
        if (t.getAttribute('data-type') === 'error') sfx.error()
        else {
          sfx.success()
          if (t.textContent.includes('Submitted')) confetti()
        }
      }))
    })
    observer.observe(document.body, { childList: true, subtree: true })

    document.addEventListener('pointerdown', onDown)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseout', onOut)
    return () => {
      observer.disconnect()
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])
  return null
}

function MuteButton() {
  const [m, setM] = useState(isMuted())
  return (
    <button className="mute" title="Toggle sound" onClick={() => { setMuted(!m); setM(!m) }}>
      {m ? '🔇' : '🔊'}
    </button>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster theme="dark" richColors />
      <Effects />
      <nav className="nav">
        <NavLink to="/team">Team</NavLink>
        <NavLink to="/register">Join</NavLink>
        <NavLink to="/admin">Admin</NavLink>
        <MuteButton />
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/team" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/team" element={<Team />} />
      </Routes>
    </BrowserRouter>
  )
}