import { useState, useEffect, useRef } from 'react'
import {
  FiBriefcase, FiPlus, FiEdit2, FiTrash2, FiSave,
  FiX, FiUpload, FiLink, FiToggleLeft, FiToggleRight
} from 'react-icons/fi'
import {
  getCompanyPartnersAdmin, createCompanyPartner, updateCompanyPartner, deleteCompanyPartner,
  uploadSiteImage, fetchSiteImage,
} from '../../api'
import './AdminSiteContent.css'

// ─── Reusable Image Uploader ────────────────────────────────────────────────
function ImageUploader({ value, onChange, label = 'Image' }) {
  const fileRef = useRef()
  const [urlInput, setUrlInput] = useState('')
  const [mode, setMode] = useState('upload')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await uploadSiteImage(fd)
      onChange(res.data.url)
    } catch (err) {
      setError('Upload failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleUrl = async () => {
    if (!urlInput.trim()) return
    setError('')
    setLoading(true)
    try {
      const res = await fetchSiteImage(urlInput.trim())
      onChange(res.data.url)
      setUrlInput('')
    } catch (err) {
      setError('Fetch failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sc-image-uploader">
      <label className="sc-field-label">{label}</label>

      <div className="sc-upload-tabs">
        <button type="button"
          className={`sc-tab-btn ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => setMode('upload')}>
          <FiUpload size={13} /> Upload File
        </button>
        <button type="button"
          className={`sc-tab-btn ${mode === 'url' ? 'active' : ''}`}
          onClick={() => setMode('url')}>
          <FiLink size={13} /> URL / Drive Link
        </button>
      </div>

      {mode === 'upload' ? (
        <div className="sc-upload-drop" onClick={() => fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          {loading ? <span className="sc-uploading">Uploading…</span> : <span><FiUpload size={18} /> Click to select image</span>}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="sc-input"
            style={{ flex: 1 }}
            placeholder="Paste image URL or Google Drive share link"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
          />
          <button type="button" className="btn-sc-sm btn-sc-primary" onClick={handleUrl} disabled={loading}>
            {loading ? '…' : 'Fetch'}
          </button>
        </div>
      )}

      {error && <p className="sc-error">{error}</p>}

      {value && (
        <div className="sc-preview-wrap">
          <img src={value} alt="preview" className="sc-preview-img" />
          <button type="button" className="sc-remove-img" onClick={() => onChange('')} title="Remove">
            <FiX size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminSiteContent() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const emptyForm = { name: '', logoUrl: '', order: 0, isActive: true }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { document.title = 'Site Content | Aharada Admin'; load() }, [])

  const load = async () => {
    try {
      const res = await getCompanyPartnersAdmin()
      setPartners(res.data.data)
    } catch {
      // ignore
    }
    setLoading(false)
  }

  const openAdd = () => { setForm(emptyForm); setEditItem(null); setShowForm(true); setMsg('') }
  const openEdit = (p) => { setForm({ ...p }); setEditItem(p._id); setShowForm(true); setMsg('') }
  const closeForm = () => { setShowForm(false); setMsg('') }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setMsg('Company name is required.')
    if (!form.logoUrl) return setMsg('Please upload or provide a logo image.')
    setSaving(true); setMsg('')
    try {
      if (editItem) {
        await updateCompanyPartner(editItem, form)
      } else {
        await createCompanyPartner(form)
      }
      await load()
      closeForm()
      setMsg(editItem ? 'Partner updated!' : 'Partner added!')
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.message || err.message))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company partner?')) return
    try {
      await deleteCompanyPartner(id)
      setPartners(prev => prev.filter(p => p._id !== id))
    } catch {
      // ignore
    }
  }

  const toggleActive = async (p) => {
    try {
      const res = await updateCompanyPartner(p._id, { isActive: !p.isActive })
      setPartners(prev => prev.map(x => x._id === p._id ? res.data.data : x))
    } catch {
      // ignore
    }
  }

  return (
    <div className="sc-page">
      <h1 className="admin-page-title">Company / Placement Partners</h1>
      <p className="admin-page-subtitle">Manage company logos that appear on the Home page — partner marquee strip and hiring partners grid</p>

      <div className="sc-section-header" style={{ marginTop: 24 }}>
        <div>
          <p className="sc-section-desc">
            These logos appear in the <strong>airline partner marquee strip</strong> and the <strong>"Our Hiring Partners"</strong> grid on the Home page.
            <br />
            <span className="sc-size-tip">📐 Recommended logo size: <strong>400 × 200 px</strong> (2:1 ratio, transparent PNG preferred) · Max 5 MB</span>
          </p>
        </div>
        <button className="btn-sc btn-sc-primary" onClick={openAdd} id="add-company-btn">
          <FiPlus size={16} /> Add Company
        </button>
      </div>

      {msg && <div className={`sc-flash ${msg.startsWith('Error') ? 'error' : 'success'}`}>{msg}</div>}

      {/* Form */}
      {showForm && (
        <div className="sc-form-card">
          <div className="sc-form-header">
            <h3>{editItem ? 'Edit Company Partner' : 'Add Company Partner'}</h3>
            <button type="button" className="sc-close-btn" onClick={closeForm}><FiX size={18} /></button>
          </div>
          <form onSubmit={handleSave} className="sc-form">
            <div className="sc-field">
              <label className="sc-field-label">Company Name *</label>
              <input className="sc-input" placeholder="e.g. IndiGo Airlines"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <ImageUploader
              label="Company Logo *"
              value={form.logoUrl}
              onChange={url => setForm(f => ({ ...f, logoUrl: url }))}
            />
            <div className="sc-form-row">
              <div className="sc-field" style={{ maxWidth: 120 }}>
                <label className="sc-field-label">Display Order</label>
                <input type="number" className="sc-input" min={0}
                  value={form.order} onChange={e => setForm(f => ({ ...f, order: +e.target.value }))} />
              </div>
              <div className="sc-field sc-toggle-field">
                <label className="sc-field-label">Visible on site</label>
                <button type="button" className={`sc-toggle ${form.isActive ? 'on' : 'off'}`}
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                  {form.isActive ? <FiToggleRight size={26} /> : <FiToggleLeft size={26} />}
                  {form.isActive ? 'Active' : 'Hidden'}
                </button>
              </div>
            </div>
            {msg && <p className="sc-error">{msg}</p>}
            <div className="sc-form-actions">
              <button type="button" className="btn-sc btn-sc-ghost" onClick={closeForm}>Cancel</button>
              <button type="submit" className="btn-sc btn-sc-primary" disabled={saving}>
                <FiSave size={15} /> {saving ? 'Saving…' : (editItem ? 'Update Partner' : 'Add Partner')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      {loading ? <div className="sc-loading">Loading…</div> : (
        <div className="sc-partner-grid">
          {partners.length === 0 && (
            <div className="sc-empty">
              <FiBriefcase size={40} />
              <p>No company partners yet. Add your first one!</p>
            </div>
          )}
          {partners.map(p => (
            <div key={p._id} className={`sc-partner-card ${!p.isActive ? 'inactive' : ''}`}>
              <div className="sc-partner-logo-wrap">
                <img src={p.logoUrl} alt={p.name} />
                {!p.isActive && <div className="sc-hidden-badge">Hidden</div>}
              </div>
              <div className="sc-partner-info">
                <p className="sc-partner-name">{p.name}</p>
                <p className="sc-photo-order">Order: {p.order}</p>
              </div>
              <div className="sc-card-actions">
                <button className="sc-action-btn" title={p.isActive ? 'Hide' : 'Show'} onClick={() => toggleActive(p)}>
                  {p.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                </button>
                <button className="sc-action-btn" title="Edit" onClick={() => openEdit(p)}>
                  <FiEdit2 size={15} />
                </button>
                <button className="sc-action-btn danger" title="Delete" onClick={() => handleDelete(p._id)}>
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
