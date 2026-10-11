import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'

const DOMAINS = ['Web Development', 'Design', 'Logistics', 'Operations', 'Sponsorship', 'Hospitality', 'Social Media', 'Event Management']
const POSITIONS = ['Head', 'Vice-Head', 'Core Member', 'Member']
const BRANCHES = ['CSE', 'AIML', 'ECE', 'EEE', 'ME', 'Biotech', 'Civil']
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]

const EMPTY = {
  name: '', domain: DOMAINS[0], position: POSITIONS[3], srn: '', email: '',
  linkedin_url: '', github_url: '', branch: BRANCHES[0], semester: 1, bio: '',
}

// Resize to max 800px wide and convert to WebP in the browser
function toWebP(file, maxW = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Conversion failed'))),
        'image/webp',
        quality
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')) }
    img.src = url
  })
}

export default function Register() {
  const [form, setForm] = useState(EMPTY)
  const [photoBlob, setPhotoBlob] = useState(null)
  const [preview, setPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Local preview from the converted blob (nothing is uploaded yet)
  useEffect(() => {
    if (!photoBlob) { setPreview(''); return }
    const url = URL.createObjectURL(photoBlob)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photoBlob])

  const set = (key) => (e) => {
    let value = e.target.value
    if (key === 'srn') value = value.toUpperCase()
    if (key === 'semester') value = Number(value)
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onFile(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      toast.error('Please choose a .png, .jpg or .jpeg image')
      e.target.value = ''
      return
    }
    try {
      const blob = await toWebP(file)
      setPhotoBlob(blob)
    } catch {
      toast.error('Could not process that image')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (form.bio.length < 150 || form.bio.length > 200)
      return toast.error('Bio must be 150 to 200 characters')

    setSubmitting(true)
    try {
      const srn = form.srn.trim().toUpperCase()

      // Duplicate SRN check
      const { data: existing, error: checkErr } = await supabase
        .from('members').select('id').eq('srn', srn).limit(1)
      if (checkErr) throw checkErr
      if (existing && existing.length > 0) {
        toast.error('This SRN has already been submitted')
        return
      }

      // Upload the WebP only now, on submit
      let photoUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(form.name.trim() || srn)}`

      if (photoBlob) {
  const path = `${crypto.randomUUID()}.webp`
  const { error: upErr } = await supabase.storage
    .from('member-photos')
    .upload(path, photoBlob, { contentType: 'image/webp' })
  if (upErr) throw upErr
  photoUrl = supabase.storage.from('member-photos').getPublicUrl(path).data.publicUrl
}

      const { error: insErr } = await supabase.from('members').insert({
        ...form, srn, name: form.name.trim(), photo_url: pub.publicUrl, status: 'pending',
      })
      if (insErr) throw insErr

      toast.success('Submitted! Your profile is awaiting admin approval.')
      setForm(EMPTY)
      setPhotoBlob(null)
      e.target.reset()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const bioLen = form.bio.length
  const bioOk = bioLen >= 150 && bioLen <= 200

  return (
    <div className="page">
      <div className="wrap">
        <h1>Join The <span className="accent">Team</span></h1>
        <p className="muted">Fill in your details and watch your card update live.</p>

        <div className="reg-layout">
          <form className="form" onSubmit={handleSubmit}>
            <label>Full Name
              <input required value={form.name} onChange={set('name')} placeholder="Your name" />
            </label>

            <div className="two">
              <label>Domain
                <select value={form.domain} onChange={set('domain')}>
                  {DOMAINS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </label>
              <label>Position
                <select value={form.position} onChange={set('position')}>
                  {POSITIONS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
            </div>

            <label>SRN
              <input required value={form.srn} onChange={set('srn')} placeholder="PES1UG23CS001"
                pattern="PES[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}" title="Format: PES1UG23CS001" />
            </label>

            <label>Email
              <input required type="email" value={form.email} onChange={set('email')} placeholder="you@pes.edu" />
            </label>

            <label>LinkedIn URL
              <input type="url" value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="https://linkedin.com/in/..." />
            </label>

            <label>GitHub URL
              <input type="url" value={form.github_url} onChange={set('github_url')} placeholder="https://github.com/..." />
            </label>

            <div className="two">
              <label>Branch
                <select value={form.branch} onChange={set('branch')}>
                  {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </label>
              <label>Semester
                <select value={form.semester} onChange={set('semester')}>
                  {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>

            <label>Short Bio
              <textarea required rows={4} maxLength={200} value={form.bio} onChange={set('bio')}
                placeholder="150 to 200 characters about you" />
              <span className={bioOk ? 'count ok' : 'count'}>{bioLen}/200 (min 150)</span>
            </label>

            <label>Profile Picture
              <input type="file" accept="image/png,image/jpeg" onChange={onFile} />
            </label>

            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit for approval'}
            </button>
          </form>

          <div className="preview">
            <p className="muted" style={{ marginBottom: 12 }}>Live preview</p>
            <div className="card">
              <div className="row">
                {preview ? (
                  <img className="avatar" src={preview} alt="preview" />
                ) : (
                  <div className="avatar placeholder">
                    {form.name.trim() ? (
                      <span className="initial">{form.name.trim()[0].toUpperCase()}</span>
                    ) : (
                      <svg viewBox="0 0 24 24" width="34" height="34" fill="rgba(255,255,255,.85)">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" />
                      </svg>
                )}
              </div>
            )}
                <div style={{ minWidth: 0 }}>
                  <h2 className="name">{form.name || 'Your Name'}</h2>
                  <p className="sub">{form.position} · {form.domain}</p>
                </div>
              </div>
              <p className="bio">{form.bio || 'Your short bio will appear here.'}</p>
              <p className="meta">{form.branch} · Sem {form.semester}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}