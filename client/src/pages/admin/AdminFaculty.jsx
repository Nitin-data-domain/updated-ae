import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiX, FiEye, FiStar } from 'react-icons/fi'
import { getFaculty, createFaculty, updateFaculty, deleteFaculty, uploadFacultyImage, fetchFacultyImage } from '../../api'

const emptyFaculty = {
  name: '', designation: '', qualification: '', experience: '',
  specialization: '', bio: '', rolesAndResponsibilities: '', image: '', order: 0
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
  const [photoModalMember, setPhotoModalMember] = useState(null)
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
      toast.error(err.message || 'Upload failed. Paste a URL manually.')
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

  const isHOD = (f) => {
    const des = (f.designation || '').toLowerCase()
    return des.includes('hod') || des.includes('head of department') || des.includes('head -')
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Faculty</h1>
          <p className="admin-page-subtitle">Manage faculty members, photos, and department heads</p>
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
                <td style={{ verticalAlign: 'middle' }}>
                  {f.image ? (
                    <div
                      onClick={() => setPhotoModalMember(f)}
                      style={{
                        position: 'relative',
                        width: 46,
                        height: 46,
                        cursor: 'pointer',
                        display: 'inline-block',
                        transition: 'transform 0.15s ease'
                      }}
                      title="Click to view photograph"
                    >
                      <img
                        src={f.image}
                        alt={f.name}
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #6366f1',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          background: '#4f46e5',
                          color: '#fff',
                          borderRadius: '50%',
                          width: 18,
                          height: 18,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }}
                      >
                        <FiEye size={10} />
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: '50%',
                        background: 'var(--gray-200, #e5e7eb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        color: 'var(--gray-400, #9ca3af)',
                        fontWeight: 600
                      }}
                    >
                      {f.name ? f.name[0] : '?'}
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <strong>{f.name}</strong>
                    {isHOD(f) && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                          color: '#92400e',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 12,
                          border: '1px solid #f59e0b',
                          letterSpacing: '0.03em'
                        }}
                      >
                        <FiStar size={10} /> HOD
                      </span>
                    )}
                  </div>
                </td>
                <td>{f.designation}</td>
                <td style={{ fontSize: '0.85rem' }}>{f.qualification}</td>
                <td style={{ fontSize: '0.85rem' }}>{f.experience}</td>
                <td>
                  <div className="admin-actions">
                    {f.image && (
                      <button
                        type="button"
                        className="admin-btn"
                        style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}
                        onClick={() => setPhotoModalMember(f)}
                        title="View Photograph"
                      >
                        <FiEye size={13} /> Photo
                      </button>
                    )}
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

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit Faculty' : 'Add Faculty'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Prof. (Dr.) John Doe" />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Designation *</label>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    onClick={() => {
                      if (!form.designation.includes('Head of Department (HOD)')) {
                        setForm(prev => ({ ...prev, designation: 'Head of Department (HOD) - ' + (prev.designation || '') }))
                      }
                    }}
                  >
                    + Set as HOD
                  </button>
                </div>
                <input className="form-input" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} placeholder="e.g. Head of Department (HOD) - Aerospace Engineering" />
              </div>
              <div className="form-group">
                <label className="form-label">Qualification *</label>
                <input className="form-input" value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} placeholder="Ph.D., MBA, B.Tech" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Experience *</label>
                  <input className="form-input" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} placeholder="15+ years" />
                </div>
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input className="form-input" type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input className="form-input" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} placeholder="e.g. Flight Dynamics, Avionics, Propulsion" />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" rows="3" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Brief academic and professional bio..." />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Roles & Responsibilities</label>
                  <span style={{ fontSize: '0.75rem', color: '#6366f1' }}>Each line with • or - becomes a bullet</span>
                </div>
                <textarea
                  className="form-textarea"
                  rows="5"
                  value={form.rolesAndResponsibilities || ''}
                  onChange={e => setForm({...form, rolesAndResponsibilities: e.target.value})}
                  placeholder="• Departmental academic & administrative leadership&#10;• Laboratory oversight & syllabus management&#10;• Industry collaboration & student placement mentoring"
                />
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
                  Note for Google Drive: Right-click file → Share → "Anyone with the link" → Copy link → paste below → click Fetch
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
                    {fetching ? 'Fetching...' : 'Fetch Image'}
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

      {/* ── Photo Preview Lightbox Modal in Admin ── */}
      {photoModalMember && (
        <div className="admin-modal-overlay" onClick={() => setPhotoModalMember(null)} style={{ zIndex: 1200 }}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, textAlign: 'center', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Faculty Photograph</h3>
              <button
                type="button"
                onClick={() => setPhotoModalMember(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6b7280', padding: 4 }}
                aria-label="Close photo preview"
              >
                <FiX />
              </button>
            </div>

            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: 16, backgroundColor: '#f8fafc' }}>
              <img
                src={photoModalMember.image}
                alt={photoModalMember.name}
                style={{ width: '100%', maxHeight: 380, objectFit: 'cover', display: 'block' }}
              />
              {isHOD(photoModalMember) && (
                <span style={{ position: 'absolute', top: 12, left: 12, background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                  Head of Department (HOD)
                </span>
              )}
            </div>

            <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#111827' }}>{photoModalMember.name}</h4>
            <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#6366f1', fontWeight: 600 }}>{photoModalMember.designation}</p>
            <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#6b7280' }}>{photoModalMember.qualification} • {photoModalMember.experience}</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <a
                href={photoModalMember.image}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
              >
                Open Full Size ↗
              </a>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setPhotoModalMember(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
