import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiX, FiImage } from 'react-icons/fi'
import { getEvents, createEvent, updateEvent, deleteEvent, uploadEventImage, fetchEventImage } from '../../api'

const emptyEvent = {
  title: '', description: '', date: '', location: '', category: 'other', isUpcoming: true, images: []
}

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyEvent)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    document.title = 'Manage Events | Aharada Admin'
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const res = await getEvents()
      setEvents(res.data.data)
    } catch { toast.error('Failed to load events') }
  }

  const openAdd = () => { setEditing(null); setForm(emptyEvent); setUrlInput(''); setShowModal(true) }

  const openEdit = (e) => {
    setEditing(e._id)
    setForm({ ...e, date: e.date ? new Date(e.date).toISOString().split('T')[0] : '', images: e.images || [] })
    setUrlInput('')
    setShowModal(true)
  }

  // Upload one photo at a time, add to images array (max 2)
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if ((form.images || []).length >= 2) { toast.error('Maximum 2 photos allowed'); return }
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('image', file)
      const res = await uploadEventImage(fd)
      setForm(prev => ({ ...prev, images: [...(prev.images || []), res.data.url] }))
      toast.success('Photo added!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) { toast.error('Paste a URL first'); return }
    if ((form.images || []).length >= 2) { toast.error('Maximum 2 photos allowed'); return }
    setFetching(true)
    try {
      const res = await fetchEventImage(urlInput.trim())
      setForm(prev => ({ ...prev, images: [...(prev.images || []), res.data.url] }))
      setUrlInput('')
      toast.success('Image fetched!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not fetch image')
    } finally { setFetching(false) }
  }

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.date) {
      toast.error('Please fill all required fields'); return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateEvent(editing, form); toast.success('Event updated')
      } else {
        await createEvent(form); toast.success('Event created')
      }
      setShowModal(false); loadEvents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return
    try { await deleteEvent(id); toast.success('Deleted'); loadEvents() }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Events</h1>
          <p className="admin-page-subtitle">Manage campus events</p>
        </div>
        <button className="admin-btn-add" onClick={openAdd}><FiPlus /> Add Event</button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Photos</th>
              <th>Title</th>
              <th>Date</th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev._id}>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {(ev.images || []).slice(0, 2).map((img, i) => (
                      <img key={i} src={img} alt="event" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--gray-200)' }} />
                    ))}
                    {(!ev.images || ev.images.length === 0) && <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>—</span>}
                  </div>
                </td>
                <td><strong>{ev.title}</strong></td>
                <td>{new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td><span className="status-badge" style={{ background: 'rgba(74,155,217,0.1)', color: '#4A9BD9' }}>{ev.category}</span></td>
                <td style={{ fontSize: '0.85rem' }}>{ev.location || '-'}</td>
                <td>{ev.isUpcoming ? <span className="status-badge status-new">Upcoming</span> : <span className="status-badge status-closed">Past</span>}</td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-btn admin-btn-edit" onClick={() => openEdit(ev)}><FiEdit2 /> Edit</button>
                    <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(ev._id)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>No events yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit Event' : 'Add Event'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="seminar">Seminar</option>
                    <option value="workshop">Workshop</option>
                    <option value="conference">Conference</option>
                    <option value="cultural">Cultural</option>
                    <option value="placement">Placement</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isUpcoming} onChange={e => setForm({ ...form, isUpcoming: e.target.checked })} />
                  Mark as Upcoming
                </label>
              </div>

              {/* Event Photos (max 2) */}
              <div className="form-group">
                <label className="form-label">Event Photos <span style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 400 }}>(max 2, shown on event card)</span></label>

                {/* Current images preview */}
                {(form.images || []).length > 0 && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    {form.images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img src={img} alt={`event ${idx + 1}`} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--gray-200)' }} />
                        <button type="button" onClick={() => removeImage(idx)}
                          style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, padding: 0 }}>
                          <FiX size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {(form.images || []).length < 2 && (
                  <>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />
                    <button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: '1.5px dashed var(--gray-300)', borderRadius: 8, background: 'var(--gray-50)', cursor: 'pointer', fontSize: 13, color: 'var(--gray-600)', marginBottom: 8 }}>
                      <FiUpload /> {uploading ? 'Uploading...' : 'Upload photo from computer'}
                    </button>

                    <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: '6px 0 4px' }}>— or fetch from Google Drive —</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="form-input" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                        placeholder="https://drive.google.com/file/d/..." style={{ flex: 1 }} />
                      <button type="button" onClick={handleFetchUrl} disabled={fetching || !urlInput.trim()}
                        style={{ padding: '8px 14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', opacity: fetching ? 0.7 : 1 }}>
                        {fetching ? '⏳' : '⬇️ Fetch'}
                      </button>
                    </div>
                  </>
                )}
                {(form.images || []).length >= 2 && (
                  <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 6 }}>⚠️ Maximum 2 photos reached. Remove one to add another.</p>
                )}
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving || uploading || fetching}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
