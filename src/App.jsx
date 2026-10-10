import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { Toaster } from 'sonner'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Team from './pages/Team'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster theme="dark" richColors />
      <nav className="nav">
        <NavLink to="/team">Team</NavLink>
        <NavLink to="/register">Join</NavLink>
        <NavLink to="/admin">Admin</NavLink>
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