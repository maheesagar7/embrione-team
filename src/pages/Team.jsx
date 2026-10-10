import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const DOMAINS = ['All', 'Web Development', 'Design', 'Logistics', 'Operations', 'Sponsorship', 'Hospitality', 'Social Media', 'Event Management']
const POSITIONS = ['All', 'Head', 'Vice-Head', 'Core Member', 'Member']

export default function Team() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [domain, setDomain] = useState('All')
  const [position, setPosition] = useState('All')

  useEffect(() => {
    supabase
      .from('members')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error)
        setMembers(data || [])
        setLoading(false)
      })
  }, [])

  const shown = members.filter(
    (m) =>
      (domain === 'All' || m.domain === domain) &&
      (position === 'All' || m.position === position)
  )
  return (
    <div className="page">
      <div className="wrap">
        <h1>Meet The <span className="accent">Team</span></h1>
        <p className="muted">The people behind The Embrione.</p>

        <div className="filters">
          <select value={domain} onChange={(e) => setDomain(e.target.value)}>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>{d === 'All' ? 'All domains' : d}</option>
            ))}
          </select>
          <select value={position} onChange={(e) => setPosition(e.target.value)}>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{p === 'All' ? 'All positions' : p}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="muted" style={{ marginTop: 40 }}>Loading...</p>
        ) : shown.length === 0 ? (
          <p className="muted" style={{ marginTop: 40 }}>No members found.</p>
        ) : (
          <div className="grid">
            {shown.map((m, i) => (
                <div key={m.id} className="card" style={{ animationDelay: `${i * 90}ms` }}>
                <div className="row">
                  <img className="avatar" src={m.photo_url} alt={m.name} />
                  <div style={{ minWidth: 0 }}>
                    <h2 className="name">{m.name}</h2>
                    <p className="sub">{m.position} · {m.domain}</p>
                  </div>
                </div>
                <p className="bio">{m.bio}</p>
                <p className="meta">{m.branch} · Sem {m.semester}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
