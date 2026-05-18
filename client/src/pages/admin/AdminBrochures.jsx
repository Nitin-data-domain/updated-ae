import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiUpload, FiTrash2, FiDownload, FiEdit2, FiFile } from 'react-icons/fi'
import { getAllBrochures, uploadBrochure, updateBrochure, deleteBrochure, getPrograms, downloadBrochure } from '../../api'

export default function AdminBrochures() {
  const [brochures, setBrochures] = useState([])
  const [programs, setPrograms] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', fileUrl: '', linkedPage: 'general', linkedProgram: '' })
  const [uploading, setUploading] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    document.title = 'Manage Brochures | Aharada Admin'
    loadBrochures()
    getPrograms().then(res => setPrograms(res.data.data)).catch(() => {})
  }, [])

  const loadBrochures = async () => {
    try {
      const res = await getAllBrochures()
      setBrochures(res.data.data)
    } catch { toast.error('Failed to load brochures') }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!form.fileUrl) { toast.error('Please provide a Google Drive Link'); return }
    if (!form.title) { toast.error('Title is required'); return }

    setUploading(true)
    try {
      await uploadBrochure(form)
      toast.success('Brochure added!')
      setShowModal(false)
      setForm({ title: '', fileUrl: '', linkedPage: 'general', linkedProgram: '' })
      loadBrochures()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally { setUploading(false) }
  }

  const handleUpdate = async (id) => {
    try {
      await updateBrochure(id, editForm)
      toast.success('Updated')
      setEditId(null)
      loadBrochures()
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brochure?')) return
    try { await deleteBrochure(id); toast.success('Deleted'); loadBrochures() }
    catch { toast.error('Failed to delete') }
  }

  const pageLabels = {
    home: 'Home Page',
    faculty: 'Faculty Page',
    events: 'Events Page',
    programs: 'Programs Page',
    contact: 'Contact Page',
    general: 'General'
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Brochures</h1>
          <p className="admin-page-subtitle">Upload and manage PDF brochures for download</p>
        </div>
        <button className="admin-btn-add" onClick={() => setShowModal(true)}><FiUpload /> Upload Brochure</button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>G-Drive Link</th>
              <th>Linked To</th>
              <th>Program</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brochures.map(b => (
              <tr key={b._id}>
                <td>
                  {editId === b._id ? (
                    <input className="form-input" style={{ padding: '6px 10px', fontSize: '0.85rem' }} value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                  ) : (
                    <strong>{b.title}</strong>
                  )}
                </td>
                <td style={{ fontSize: '0.82rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <a href={b.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiFile size={14} /> View Link</span>
                  </a>
                </td>
                <td>
                  {editId === b._id ? (
                    <select className="form-select" style={{ padding: '6px 10px', fontSize: '0.82rem' }} value={editForm.linkedPage} onChange={e => setEditForm({...editForm, linkedPage: e.target.value})}>
                      {Object.entries(pageLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  ) : (
                    <span className="status-badge status-new">{pageLabels[b.linkedPage] || b.linkedPage}</span>
                  )}
                </td>
                <td style={{ fontSize: '0.82rem' }}>
                  {b.linkedProgram?.title || '-'}
                </td>
                <td>
                  <div className="admin-actions">
                    <a href={b.fileUrl} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-edit" title="Open Link"><FiDownload /></a>
                    {editId === b._id ? (
                      <>
                        <button className="admin-btn admin-btn-edit" onClick={() => handleUpdate(b._id)}>Save</button>
                        <button className="admin-btn" style={{ background: 'var(--gray-100)' }} onClick={() => setEditId(null)}>Cancel</button>
                      </>
                    ) : (
                      <button className="admin-btn admin-btn-edit" onClick={() => { setEditId(b._id); setEditForm({ title: b.title, linkedPage: b.linkedPage }) }}><FiEdit2 /></button>
                    )}
                    <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(b._id)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
            {brochures.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>No brochures uploaded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>Upload Brochure</h3>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="form-label">Brochure Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. BBA Aviation Brochure 2026" />
              </div>
              <div className="form-group">
                <label className="form-label">Google Drive Link *</label>
                <input
                  className="form-input"
                  value={form.fileUrl}
                  onChange={e => setForm({...form, fileUrl: e.target.value})}
                  placeholder="https://drive.google.com/file/d/..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Link to Page</label>
                  <select className="form-select" value={form.linkedPage} onChange={e => setForm({...form, linkedPage: e.target.value})}>
                    {Object.entries(pageLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Link to Program (optional)</label>
                  <select className="form-select" value={form.linkedProgram} onChange={e => setForm({...form, linkedProgram: e.target.value})}>
                    <option value="">None</option>
                    {programs.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
