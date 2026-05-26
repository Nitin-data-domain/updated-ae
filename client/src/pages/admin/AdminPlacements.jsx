import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiX } from 'react-icons/fi'
import {
  getAllPlacementsAdmin, createPlacement, updatePlacement, deletePlacement,
  uploadPlacementImage, fetchPlacementImage
} from '../../api'

const currentYear = new Date().getFullYear()
const emptyPlacement = {
  studentName: '', companyName: '', role: '', program: '',
  year: currentYear, image: '', order: 0
}

export default function AdminPlacements() {
  const [placements, setPlacements] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyPlacement)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [preview, setPreview] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    document.title = 'Manage Placements | Aharada Admin'
    loadPlacements()
  }, [])

  const loadPlacements = async () => {
    try {
      const res = await getAllPlacementsAdmin()
      setPlacements(res.data.data)
    } catch { toast.error('Failed to load placements') }
  }

  const openAdd = () => {
    setEditing(null); setForm(emptyPlacement); setPreview(''); setUrlInput(''); setShowModal(true)
  }

  const openEdit = (p) => {
    setEditing(p._id)
    setForm({ ...p })
    setPreview(p.image && p.image !== 'https://via.placeholder.com/150' ? p.image : '')
    setUrlInput(p.image && p.image !== 'https://via.placeholder.com/150' ? p.image : '')
    setShowModal(true)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await uploadPlacementImage(fd)
      setForm(prev => ({ ...prev, image: res.data.url }))
      setPreview(res.data.url)
      setUrlInput(res.data.url)
      toast.success('Photo uploaded!')
    } catch {
      toast.error('Upload failed')
      setPreview('')
    } finally { setUploading(false) }
  }

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) { toast.error('Paste a URL first'); return }
    setFetching(true)
    try {
      const res = await fetchPlacementImage(urlInput.trim())
      setForm(prev => ({ ...prev, image: res.data.url }))
      setPreview(res.data.url)
      setUrlInput(res.data.url)
      toast.success('Image fetched!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not fetch image')
    } finally { setFetching(false) }
  }

  const clearImage = () => {
    setForm(prev => ({ ...prev, image: '' }))
    setPreview(''); setUrlInput('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.studentName || !form.companyName || !form.role || !form.program || !form.year) {
      toast.error('Please fill all required fields'); return
    }
    setSaving(true)
    try {
      if (editing) {
        await updatePlacement(editing, form)
        toast.success('Placement updated')
      } else {
        await createPlacement(form)
        toast.success('Placement added')
      }
      setShowModal(false)
      loadPlacements()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this placement record?')) return
    try { await deletePlacement(id); toast.success('Deleted'); loadPlacements() }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Placements</h1>
          <p className="admin-page-subtitle">Manage student placement records — {placements.length} total</p>
        </div>
        <button className="admin-btn-add" onClick={openAdd}><FiPlus /> Add Placement</button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Student</th>
              <th>Company</th>
              <th>Role</th>
              <th>Year</th>
              <th>Program</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {placements.map(p => (
              <tr key={p._id}>
                <td>
                  {p.image && p.image !== 'https://via.placeholder.com/150'
                    ? <img src={p.image} alt={p.studentName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-100, #e0e7ff)' }} />
                    : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--gray-500)', fontSize: 14 }}>{p.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                  }
                </td>
                <td><strong>{p.studentName}</strong></td>
                <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{p.companyName}</td>
                <td style={{ fontSize: '0.85rem' }}>{p.role}</td>
                <td style={{ fontSize: '0.85rem' }}>{p.year}</td>
                <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{p.program}</td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-btn admin-btn-edit" onClick={() => openEdit(p)}><FiEdit2 /> Edit</button>
                    <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
            {placements.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>No placements yet. Click "+ Add Placement" to start.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit Placement' : 'Add Placement'}</h3>
            <form onSubmit={handleSave}>

              {/* Student & Company */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Student Name *</label>
                  <input className="form-input" value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} placeholder="Rahul Sharma" />
                </div>
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <input className="form-input" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="IndiGo Airlines" />
                </div>
              </div>

              {/* Role & Program */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Role / Position *</label>
                  <input className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Ground Operations Officer" />
                </div>
                <div className="form-group">
                  <label className="form-label">Program *</label>
                  <input className="form-input" value={form.program} onChange={e => setForm({ ...form, program: e.target.value })} placeholder="BBA Aviation" />
                </div>
              </div>

              {/* Year & Order */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Year *</label>
                  <input className="form-input" type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) || currentYear })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input className="form-input" type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="form-group">
                <label className="form-label">Student Photo</label>

                {preview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <img src={preview} alt="preview" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-200, #c7d2fe)' }} />
                    <button type="button" onClick={clearImage} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      <FiX /> Remove
                    </button>
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />
                <button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: '1.5px dashed var(--gray-300)', borderRadius: 8, background: 'var(--gray-50)', cursor: 'pointer', fontSize: 13, color: 'var(--gray-600)', marginBottom: 8 }}>
                  <FiUpload /> {uploading ? 'Uploading...' : 'Upload photo from computer'}
                </button>

                <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: '6px 0 4px' }}>— or fetch from Google Drive / URL —</p>
                <p style={{ fontSize: 11, color: '#6366f1', margin: '0 0 6px' }}>📌 Drive: Open folder → right-click FILE → Share → "Anyone with link" → Copy link → Fetch</p>
                <p style={{ fontSize: 11, color: '#ef4444', margin: '0 0 6px' }}>⚠️ Must be a FILE link (/file/d/...), NOT a folder link (/drive/folders/...)</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..." style={{ flex: 1 }} />
                  <button type="button" onClick={handleFetchUrl} disabled={fetching || !urlInput.trim()}
                    style={{ padding: '8px 14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', opacity: fetching ? 0.7 : 1 }}>
                    {fetching ? '⏳ Fetching...' : '⬇️ Fetch'}
                  </button>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving || uploading || fetching}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Placement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
