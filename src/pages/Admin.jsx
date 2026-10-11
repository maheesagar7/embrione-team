import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'admin@embrione.pes.edu'
const ADMIN_PASSWORD = 'EmbrioneAdmin@2026'
function CountUp({ to }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let f = 0
    const id = setInterval(() => {
      f++
      setN(Math.round(to * Math.min(f / 20, 1)))
      if (f >= 20) clearInterval(id)
    }, 25)
    return () => clearInterval(id)
  }, [to])
  return <>{n}</>
}
export default function Admin() {
  const [authed, setAuthed] = useState(sessionStorage.getItem('admin') === '1')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('members').select('*').order('created_at', { ascending: false })
    if (error) toast.error(error.message)
    setMembers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { if (authed) load() }, [authed, load])

  function login(e) {
    e.preventDefault()
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin', '1')
      setAuthed(true)
      toast.success('Welcome, admin')
    } else {
      toast.error('Invalid credentials')
    }
  }

  function logout() {
    sessionStorage.removeItem('admin')
    setAuthed(false)
  }

  async function setStatus(id, status) {
    const { error } = await supabase.from('members').update({ status }).eq('id', id)
    if (error) return toast.error(error.message)
    toast.success(status === 'approved' ? 'Approved' : 'Rejected')
    load()
  }

  async function remove(id) {
    if (!confirm('Delete this profile?')) return
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (error) return toast.error(error.message)
    toast.success('Deleted')
    load()
  }

  if (!authed) {
    return (
      <div className="page">
        <div className="wrap" style={{ maxWidth: 400 }}>
          <h1>Admin <span className="accent">Login</span></h1>
          <form className="form" onSubmit={login} style={{ marginTop: 24 }}>
            <label>Email
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>Password
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button className="btn" type="submit">Log in</button>
          </form>
        </div>
      </div>
    )
  }

  const pending = members.filter((m) => m.status === 'pending')
  const approved = members.filter((m) => m.status === 'approved')

  return (
    <div className="page">
      <div className="wrap">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1>Admin <span className="accent">Dashboard</span></h1>
          <button className="btn" style={{ padding: '8px 16px' }} onClick={logout}>Log out</button>
        </div>

        <div className="stats">
          <div className="card"><p className="muted">Total Submissions</p><h2>{members.length}</h2></div>
          <div className="card"><p className="muted">Pending</p><h2>{pending.length}</h2></div>
          <div className="card"><p className="muted">Approved</p><h2>{approved.length}</h2></div>
        </div>

        <h2 style={{ marginTop: 32 }}>Pending approvals</h2>
        {loading ? (
          <p className="muted" style={{ marginTop: 16 }}>Loading...</p>
        ) : pending.length === 0 ? (
          <p className="muted" style={{ marginTop: 16 }}>No pending profiles.</p>
        ) : (
          <div className="grid">
            {pending.map((m) => (
              <div key={m.id} className="card">
                <div className="row">
                  <img className="avatar" src={m.photo_url} alt={m.name} />
                  <div style={{ minWidth: 0 }}>
                    <h2 className="name">{m.name}</h2>
                    <p className="sub">{m.position} · {m.domain}</p>
                  </div>
                </div>
                <p className="bio">{m.bio}</p>
                <p className="meta">{m.srn} · {m.branch} · Sem {m.semester}</p>
                <div className="actions">
                  <button className="btn approve" onClick={() => setStatus(m.id, 'approved')}>Approve</button>
                  <button className="btn reject" onClick={() => setStatus(m.id, 'rejected')}>Reject</button>
                  <button className="btn del" onClick={() => remove(m.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}