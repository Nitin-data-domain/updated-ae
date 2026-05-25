import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiX } from 'react-icons/fi'
import { getPrograms, createProgram, updateProgram, deleteProgram, uploadProgramImage, fetchProgramImage } from '../../api'

const ALL_CATEGORIES = [
  { value: 'aviation', label: 'Aviation' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'science', label: 'Science' },
  { value: 'management', label: 'Management' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
  { value: 'technology', label: 'Technology' },
  { value: 'arts', label: 'Arts & Design' },
]

const emptyProgram = {
  title: '', slug: '', shortDescription: '', overview: '', eligibility: '',
  duration: '', category: ['aviation'], order: 0,
  careerOpportunities: '', industryExposure: '', highlights: '',
  universities: '', image: ''
}

export default function AdminPrograms() {
  const [programs, setPrograms] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProgram)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [preview, setPreview] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    document.title = 'Manage Programs | Aharada Admin'
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      const res = await getPrograms()
      setPrograms(res.data.data)
    } catch { toast.error('Failed to load programs') }
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyProgram)
    setPreview('')
    setUrlInput('')
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditing(p._id)
    // Normalise category: support both legacy string and new array
    const cats = Array.isArray(p.category)
      ? p.category
      : p.category ? [p.category] : ['aviation']
    setForm({
      ...p,
      category: cats,
      careerOpportunities: (p.careerOpportunities || []).join('\n'),
      industryExposure: (p.industryExposure || []).join('\n'),
      highlights: (p.highlights || []).join('\n'),
      universities: (p.universities || []).map(u => u.name).join('\n'),
      image: p.image || '',
    })
    setPreview(p.image || '')
    setUrlInput(p.image || '')
    setShowModal(true)
  }

  const toggleCategory = (val) => {
    setForm(prev => {
      const cats = Array.isArray(prev.category) ? prev.category : [prev.category]
      return {
        ...prev,
        category: cats.includes(val)
          ? cats.filter(c => c !== val)   // deselect
          : [...cats, val]                // select
      }
    })
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await uploadProgramImage(formData)
      const serverUrl = res.data.url
      setForm(prev => ({ ...prev, image: serverUrl }))
      setPreview(serverUrl)
      toast.success('Image uploaded!')
    } catch {
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
      const res = await fetchProgramImage(urlInput.trim())
      const serverUrl = res.data.url
      setForm(prev => ({ ...prev, image: serverUrl }))
      setPreview(serverUrl)
      setUrlInput(serverUrl)
      toast.success('Image fetched & saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not fetch image. Check the URL.')
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title || !form.overview) { toast.error('Title and overview are required'); return }
    const cats = Array.isArray(form.category) ? form.category : [form.category]
    if (cats.length === 0) { toast.error('Please select at least one category'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        category: cats,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        careerOpportunities: form.careerOpportunities.split('\n').filter(Boolean),
        industryExposure: form.industryExposure.split('\n').filter(Boolean),
        highlights: form.highlights.split('\n').filter(Boolean),
        universities: form.universities.split('\n').filter(Boolean).map(name => {
          let slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
          if (slug.endsWith('-university')) slug = slug.replace('-university', '');
          return { name: name.trim(), slug };
        }),
      }
      if (editing) {
        await updateProgram(editing, payload)
        toast.success('Program updated')
      } else {
        await createProgram(payload)
        toast.success('Program created')
      }
      setShowModal(false)
      loadPrograms()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this program?')) return
    try {
      await deleteProgram(id)
      toast.success('Deleted')
      loadPrograms()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Programs</h1>
          <p className="admin-page-subtitle">Manage academic programs</p>
        </div>
        <button className="admin-btn-add" onClick={openAdd}><FiPlus /> Add Program</button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Title</th>
              <th>Category</th>
              <th>Duration</th>
              <th>Universities</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(p => (
              <tr key={p._id}>
                <td>
                  {p.image
                    ? <img src={p.image} alt={p.title} style={{ width: 52, height: 40, borderRadius: 6, objectFit: 'cover', border: '1.5px solid var(--gray-200)' }} />
                    : <div style={{ width: 52, height: 40, borderRadius: 6, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🖼️</div>
                  }
                </td>
                <td><strong>{p.title}</strong></td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(Array.isArray(p.category) ? p.category : [p.category]).map(c => (
                      <span key={c} className="status-badge status-new" style={{ textTransform: 'capitalize' }}>{c}</span>
                    ))}
                  </div>
                </td>
                <td>{p.duration}</td>
                <td style={{ fontSize: '0.82rem' }}>{(p.universities || []).map(u => u.name).join(', ') || '-'}</td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-btn admin-btn-edit" onClick={() => openEdit(p)}><FiEdit2 /> Edit</button>
                    <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
            {programs.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>No programs yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit Program' : 'Add Program'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. BBA Aviation & Travel Management" />
              </div>
              <div className="form-group">
                <label className="form-label">Slug</label>
                <input className="form-input" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="Auto-generated from title" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">
                    Category
                    <span style={{ fontWeight: 400, fontSize: '0.78rem', color: 'var(--gray-500)', marginLeft: 6 }}>
                      (select one or more)
                    </span>
                  </label>
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '8px',
                    padding: '10px 12px', border: '1.5px solid var(--gray-200)',
                    borderRadius: '8px', background: 'var(--gray-50, #f9fafb)'
                  }}>
                    {ALL_CATEGORIES.map(cat => {
                      const selected = (Array.isArray(form.category) ? form.category : [form.category]).includes(cat.value)
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => toggleCategory(cat.value)}
                          style={{
                            padding: '5px 14px', borderRadius: '20px', fontSize: '0.82rem',
                            border: '1.5px solid ' + (selected ? 'var(--primary, #012060)' : 'var(--gray-300)'),
                            background: selected ? 'var(--primary, #012060)' : 'var(--white)',
                            color: selected ? '#fff' : 'var(--gray-600)',
                            cursor: 'pointer', fontWeight: selected ? 600 : 400,
                            transition: 'all 0.15s'
                          }}
                        >
                          {selected ? '✓ ' : ''}{cat.label}
                        </button>
                      )
                    })}
                  </div>
                  {(Array.isArray(form.category) ? form.category : [form.category]).length === 0 && (
                    <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 4 }}>Please select at least one category.</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Duration *</label>
                  <input className="form-input" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="3 Years" />
                </div>
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input className="form-input" type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Short Description *</label>
                <textarea className="form-textarea" style={{ minHeight: '80px' }} value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Overview *</label>
                <textarea className="form-textarea" value={form.overview} onChange={e => setForm({...form, overview: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Eligibility *</label>
                <input className="form-input" value={form.eligibility} onChange={e => setForm({...form, eligibility: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Career Opportunities (one per line)</label>
                <textarea className="form-textarea" value={form.careerOpportunities} onChange={e => setForm({...form, careerOpportunities: e.target.value})} placeholder="One career per line" />
              </div>
              <div className="form-group">
                <label className="form-label">Industry Exposure (one per line)</label>
                <textarea className="form-textarea" value={form.industryExposure} onChange={e => setForm({...form, industryExposure: e.target.value})} placeholder="One item per line" />
              </div>
              <div className="form-group">
                <label className="form-label">Highlights (one per line)</label>
                <textarea className="form-textarea" value={form.highlights} onChange={e => setForm({...form, highlights: e.target.value})} placeholder="One highlight per line" />
              </div>
              <div className="form-group">
                <label className="form-label">Universities (one per line)</label>
                <textarea className="form-textarea" style={{ minHeight: '80px' }} value={form.universities} onChange={e => setForm({...form, universities: e.target.value})} placeholder="IIMT University&#10;Future University" />
              </div>

              {/* ── Program Image Upload ── */}
              <div className="form-group">
                <label className="form-label">Program Photo</label>

                {/* Preview */}
                {preview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <img src={preview} alt="preview" style={{ width: 120, height: 72, borderRadius: 8, objectFit: 'cover', border: '1.5px solid var(--gray-200)' }} />
                    <button type="button" onClick={clearImage} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      <FiX /> Remove
                    </button>
                  </div>
                )}

                {/* File picker */}
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
