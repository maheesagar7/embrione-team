import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Team from './pages/Team'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster theme="dark" richColors />
      <Routes>
        <Route path="/" element={<Navigate to="/team" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/team" element={<Team />} />
      </Routes>
    </BrowserRouter>
  )
}