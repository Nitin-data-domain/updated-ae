import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiX } from 'react-icons/fi'
import { getFaculty, createFaculty, updateFaculty, deleteFaculty, uploadFacultyImage, fetchFacultyImage } from '../../api'

const emptyFaculty = {
  name: '', designation: '', qualification: '', experience: '',
  specialization: '', bio: '', image: '', order: 0
}

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyFaculty)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [preview, setPreview] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    document.title = 'Manage Faculty | Aharada Admin'
    loadFaculty()
  }, [])

  const loadFaculty = async () => {
    try {
      const res = await getFaculty()
      setFaculty(res.data.data)
    } catch { toast.error('Failed to load faculty') }
  }

  const openAdd = () => {
    setEditing(null); setForm(emptyFaculty); setPreview(''); setUrlInput(''); setShowModal(true)
  }

  const openEdit = (f) => {
    setEditing(f._id); setForm({...f}); setPreview(f.image || ''); setUrlInput(f.image || ''); setShowModal(true)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    // Upload to server
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await uploadFacultyImage(formData)
      const serverUrl = res.data.url
      setForm(prev => ({ ...prev, image: serverUrl }))
      setPreview(serverUrl)
      toast.success('Photo uploaded!')
    } catch (err) {
      toast.error('Upload failed. Paste a URL manually.')
      setPreview('')
    } finally {
      setUploading(false)
    }
  }

  const clearImage = () => {
    setForm(prev => ({ ...prev, image: '' }))
    setPreview('')
    setUrlInput('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) { toast.error('Please paste a URL first'); return }
    setFetching(true)
    try {
      const res = await fetchFacultyImage(urlInput.trim())
      const serverUrl = res.data.url
      setForm(prev => ({ ...prev, image: serverUrl }))
      setPreview(serverUrl)
      setUrlInput(serverUrl)
      toast.success('Image fetched & saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not fetch image. Check the URL and sharing settings.')
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.designation || !form.qualification || !form.experience) {
      toast.error('Please fill all required fields'); return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateFaculty(editing, form)
        toast.success('Faculty updated')
      } else {
        await createFaculty(form)
        toast.success('Faculty added')
      }
      setShowModal(false)
      loadFaculty()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this faculty member?')) return
    try { await deleteFaculty(id); toast.success('Deleted'); loadFaculty() }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Faculty</h1>
          <p className="admin-page-subtitle">Manage faculty members</p>
        </div>
        <button className="admin-btn-add" onClick={openAdd}><FiPlus /> Add Faculty</button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Qualification</th>
              <th>Experience</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map(f => (
              <tr key={f._id}>
                <td>
                  {f.image
                    ? <img src={f.image} alt={f.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-100, #e0e7ff)' }} />
                    : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gray-200, #e5e7eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--gray-400, #9ca3af)' }}>{f.name[0]}</div>
                  }
                </td>
                <td><strong>{f.name}</strong></td>
                <td>{f.designation}</td>
                <td style={{ fontSize: '0.85rem' }}>{f.qualification}</td>
                <td style={{ fontSize: '0.85rem' }}>{f.experience}</td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-btn admin-btn-edit" onClick={() => openEdit(f)}><FiEdit2 /> Edit</button>
                    <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(f._id)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
            {faculty.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>No faculty yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit Faculty' : 'Add Faculty'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Dr. John Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Designation *</label>
                <input className="form-input" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} placeholder="Professor & Head" />
              </div>
              <div className="form-group">
                <label className="form-label">Qualification *</label>
                <input className="form-input" value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} placeholder="Ph.D., MBA" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Experience *</label>
                  <input className="form-input" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} placeholder="15 years" />
                </div>
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input className="form-input" type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input className="form-input" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
              </div>

              {/* ── Photo Upload ── */}
              <div className="form-group">
                <label className="form-label">Faculty Photo</label>

                {/* Preview */}
                {preview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <img src={preview} alt="preview" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-200, #c7d2fe)' }} />
                    <button type="button" onClick={clearImage} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      <FiX /> Remove
                    </button>
                  </div>
                )}

                {/* File picker button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: '1.5px dashed var(--gray-300, #d1d5db)', borderRadius: 8, background: 'var(--gray-50, #f9fafb)', cursor: 'pointer', fontSize: 13, color: 'var(--gray-600, #4b5563)', marginBottom: 8 }}
                >
                  <FiUpload />
                  {uploading ? 'Uploading...' : 'Upload PNG / JPG from your computer'}
                </button>

                {/* OR fetch from URL */}
                <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: '6px 0 4px' }}>— or fetch from a URL / Google Drive link —</p>
                <p style={{ fontSize: 11, color: '#6366f1', margin: '0 0 6px', lineHeight: 1.5 }}>
                  📌 For Google Drive: Right-click file → Share → "Anyone with the link" → Copy link → paste below → click Fetch
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="form-input"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... or any image URL"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleFetchUrl}
                    disabled={fetching || !urlInput.trim()}
                    style={{ padding: '8px 14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', opacity: fetching ? 0.7 : 1 }}
                  >
                    {fetching ? '⏳ Fetching...' : '⬇️ Fetch Image'}
                  </button>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving || uploading}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
