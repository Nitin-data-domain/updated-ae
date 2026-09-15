import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FiShield,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheckCircle,
  FiUsers,
  FiBriefcase,
  FiAward,
  FiExternalLink,
  FiEye,
  FiStar,
  FiUpload,
  FiCheck,
} from 'react-icons/fi'
import {
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  uploadFacultyImage,
  fetchFacultyImage,
} from '../../api'
import './AdminFacultyRoles.css'

const emptyForm = {
  name: '',
  designation: '',
  qualification: '',
  experience: '',
  specialization: '',
  bio: '',
  rolesAndResponsibilities: '',
  image: '',
  order: 0,
  isActive: true,
}

export default function AdminFacultyRoles() {
  const [facultyList, setFacultyList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all' | 'hod' | 'withRoles'

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [preview, setPreview] = useState('')
  const [photoPreviewModal, setPhotoPreviewModal] = useState(null)
  const fileInputRef = useRef(null)

  // Delete confirm modal
  const [deletingMember, setDeletingMember] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    document.title = 'Faculty Roles & Responsibilities Management | Aharada Admin'
    loadFacultyData()
  }, [])

  const loadFacultyData = async () => {
    setLoading(true)
    try {
      const res = await getFaculty()
      setFacultyList(res.data?.data || [])
    } catch (error) {
      console.error('Error loading faculty roles:', error)
      toast.error('Failed to load faculty profiles')
    } finally {
      setLoading(false)
    }
  }

  // Check if a faculty member is an HOD
  const isHOD = (f) => {
    const des = (f.designation || '').toLowerCase()
    return des.includes('hod') || des.includes('head of department') || des.includes('head -')
  }

  // Count duties from text
  const parseDutyCount = (text) => {
    if (!text || !text.trim()) return 0
    return text
      .split('\n')
      .map(l => l.replace(/^[•\-\*\s\d\.]+/, '').trim())
      .filter(Boolean).length
  }

  // Filtered faculty list
  const filteredFaculty = useMemo(() => {
    return facultyList.filter(f => {
      // Type filter
      if (filterType === 'hod' && !isHOD(f)) return false
      if (filterType === 'withRoles' && parseDutyCount(f.rolesAndResponsibilities) === 0) return false

      // Search term
      const q = search.toLowerCase().trim()
      if (!q) return true

      const inName = f.name?.toLowerCase().includes(q)
      const inDes = f.designation?.toLowerCase().includes(q)
      const inSpec = f.specialization?.toLowerCase().includes(q)
      const inRoles = (f.rolesAndResponsibilities || '').toLowerCase().includes(q)

      return inName || inDes || inSpec || inRoles
    })
  }, [facultyList, filterType, search])

  // Open Create Modal
  const handleOpenAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setPreview('')
    setUrlInput('')
    setShowModal(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (f) => {
    setEditingId(f._id || f.id)
    setForm({
      name: f.name || '',
      designation: f.designation || '',
      qualification: f.qualification || '',
      experience: f.experience || '',
      specialization: f.specialization || '',
      bio: f.bio || '',
      rolesAndResponsibilities: f.rolesAndResponsibilities || '',
      image: f.image || '',
      order: f.order ?? 0,
      isActive: f.isActive !== false,
    })
    setPreview(f.image || '')
    setUrlInput(f.image || '')
    setShowModal(true)
  }

  // Photo file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
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
      toast.error(err.message || 'Upload failed. Enter an image URL manually.')
    } finally {
      setUploading(false)
    }
  }

  // Photo URL fetch
  const handleFetchUrl = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter an image URL first')
      return
    }
    setFetching(true)
    try {
      const res = await fetchFacultyImage(urlInput.trim())
      const serverUrl = res.data.url
      setForm(prev => ({ ...prev, image: serverUrl }))
      setPreview(serverUrl)
      toast.success('Photo fetched & linked!')
    } catch (err) {
      // Fallback: direct assignment if fetch endpoint rejects
      setForm(prev => ({ ...prev, image: urlInput.trim() }))
      setPreview(urlInput.trim())
      toast.success('Image URL applied!')
    } finally {
      setFetching(false)
    }
  }

  const clearImage = () => {
    setForm(prev => ({ ...prev, image: '' }))
    setPreview('')
    setUrlInput('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Quick Append Bullet Point
  const appendBullet = (duty) => {
    setForm(prev => {
      const current = prev.rolesAndResponsibilities ? prev.rolesAndResponsibilities.trim() + '\n' : ''
      return { ...prev, rolesAndResponsibilities: current + `• ${duty}` }
    })
  }

  // Save changes
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.designation.trim()) {
      toast.error('Name and Designation are required')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateFaculty(editingId, form)
        toast.success('Faculty roles & profile updated!')
      } else {
        await createFaculty(form)
        toast.success('New faculty member added with roles!')
      }
      setShowModal(false)
      loadFacultyData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save faculty roles')
    } finally {
      setSaving(false)
    }
  }

  // Toggle active
  const handleToggleActive = async (f) => {
    try {
      await updateFaculty(f._id || f.id, { isActive: !f.isActive })
      toast.success(`${f.name} ${!f.isActive ? 'activated' : 'deactivated'}`)
      loadFacultyData()
    } catch {
      toast.error('Failed to update status')
    }
  }

  // Delete
  const handleConfirmDelete = async () => {
    if (!deletingMember) return
    setDeleting(true)
    try {
      await deleteFaculty(deletingMember._id || deletingMember.id)
      toast.success('Faculty member deleted')
      setDeletingMember(null)
      loadFacultyData()
    } catch {
      toast.error('Failed to delete faculty member')
    } finally {
      setDeleting(false)
    }
  }

  // Metrics
  const totalProfiles = facultyList.length
  const totalHODs = facultyList.filter(f => isHOD(f)).length
  const totalWithRoles = facultyList.filter(f => parseDutyCount(f.rolesAndResponsibilities) > 0).length
  const totalActive = facultyList.filter(f => f.isActive !== false).length

  return (
    <div className="admin-faculty-roles-page">
      {/* ── Page Header ── */}
      <div className="admin-header-row">
        <div>
          <div className="header-title-with-badge">
            <h1 className="admin-page-title">Faculty Roles & Responsibilities</h1>
            <span className="badge-portfolio">Portfolio Management</span>
          </div>
          <p className="admin-page-subtitle">
            Manage faculty portraits, designations, and specific academic responsibilities displayed on the public website.
          </p>
        </div>
        <div className="header-actions">
          <Link
            to="/faculty-roles"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-sm btn-view-live"
          >
            <FiExternalLink /> View Live Page
          </Link>
          <button className="admin-btn-add" onClick={handleOpenAdd}>
            <FiPlus /> Add Faculty with Roles
          </button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="afr-metrics-grid">
        <div className="afr-metric-card">
          <div className="metric-icon navy"><FiUsers /></div>
          <div>
            <div className="metric-num">{totalProfiles}</div>
            <div className="metric-label">Total Faculty Profiles</div>
          </div>
        </div>
        <div className="afr-metric-card">
          <div className="metric-icon gold"><FiStar /></div>
          <div>
            <div className="metric-num">{totalHODs}</div>
            <div className="metric-label">Heads of Department (HOD)</div>
          </div>
        </div>
        <div className="afr-metric-card">
          <div className="metric-icon green"><FiCheckCircle /></div>
          <div>
            <div className="metric-num">{totalWithRoles}</div>
            <div className="metric-label">With Assigned Duties</div>
          </div>
        </div>
        <div className="afr-metric-card">
          <div className="metric-icon purple"><FiShield /></div>
          <div>
            <div className="metric-num">{totalActive}</div>
            <div className="metric-label">Active on Public Page</div>
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="afr-filter-card">
        <div className="afr-search-input-wrap">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search faculty by name, designation, HOD, or responsibility..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="afr-search-box"
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>
              &times;
            </button>
          )}
        </div>

        <div className="afr-filter-dropdowns">
          <button
            className={`afr-filter-pill ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Faculty ({facultyList.length})
          </button>
          <button
            className={`afr-filter-pill ${filterType === 'hod' ? 'active' : ''}`}
            onClick={() => setFilterType('hod')}
          >
            <FiStar size={13} /> HODs Only ({totalHODs})
          </button>
          <button
            className={`afr-filter-pill ${filterType === 'withRoles' ? 'active' : ''}`}
            onClick={() => setFilterType('withRoles')}
          >
            With Assigned Roles ({totalWithRoles})
          </button>
        </div>
      </div>

      {/* ── Faculty Roles Table ── */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner" />
            <p style={{ marginTop: 12, color: 'var(--gray-500)' }}>Loading faculty portfolios...</p>
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--gray-500)' }}>
            <FiShield size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
            <h3>No faculty members match your filter</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: 16 }}>Try searching with a different term or reset your filters.</p>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => { setSearch(''); setFilterType('all'); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Photo</th>
                <th>Faculty Name & Designation</th>
                <th>Specialization & Qualifications</th>
                <th>Assigned Roles & Responsibilities</th>
                <th style={{ width: 90, textAlign: 'center' }}>Status</th>
                <th style={{ width: 140, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.map(f => {
                const hod = isHOD(f)
                const dutyCount = parseDutyCount(f.rolesAndResponsibilities)

                return (
                  <tr key={f._id || f.id}>
                    {/* Photo Thumbnail */}
                    <td style={{ verticalAlign: 'middle' }}>
                      {f.image ? (
                        <div
                          className="afr-photo-thumb"
                          onClick={() => setPhotoPreviewModal(f)}
                          title="Click to preview large photo"
                        >
                          <img src={f.image} alt={f.name} />
                          <span className="photo-zoom-badge"><FiEye size={10} /></span>
                        </div>
                      ) : (
                        <div className="afr-photo-placeholder">
                          {f.name ? f.name[0] : '?'}
                        </div>
                      )}
                    </td>

                    {/* Name & Designation */}
                    <td>
                      <div className="afr-name-cell">
                        <div className="afr-name-row">
                          <strong className="afr-name">{f.name}</strong>
                          {hod && <span className="afr-hod-badge">⭐ HOD</span>}
                        </div>
                        <div className="afr-desig">{f.designation}</div>
                        <div className="afr-exp">{f.experience}</div>
                      </div>
                    </td>

                    {/* Specialization */}
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{f.qualification}</div>
                        {f.specialization && (
                          <div style={{ color: 'var(--gray-600)', marginTop: 3, fontSize: '0.8rem' }}>
                            {f.specialization}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Roles & Responsibilities */}
                    <td>
                      <div className="afr-roles-preview">
                        <div className="afr-duties-count-badge">
                          <FiCheckCircle size={12} /> {dutyCount} assigned {dutyCount === 1 ? 'duty' : 'duties'}
                        </div>
                        {f.rolesAndResponsibilities ? (
                          <div className="afr-duties-text-preview">
                            {f.rolesAndResponsibilities.split('\n').slice(0, 2).map((l, i) => (
                              <div key={i} className="preview-line">{l}</div>
                            ))}
                            {f.rolesAndResponsibilities.split('\n').length > 2 && (
                              <span className="more-duties-tag">+{f.rolesAndResponsibilities.split('\n').length - 2} more...</span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#dc2626', fontStyle: 'italic' }}>
                            No specific roles added yet (default roles applied)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Active Toggle */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className={`status-toggle-btn ${f.isActive !== false ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleActive(f)}
                        title={`Click to ${f.isActive !== false ? 'deactivate' : 'activate'}`}
                      >
                        {f.isActive !== false ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="admin-btn admin-btn-edit"
                          onClick={() => handleOpenEdit(f)}
                          title="Edit Roles & Responsibilities"
                        >
                          <FiEdit2 /> Edit Roles
                        </button>
                        <button
                          className="admin-btn admin-btn-delete"
                          onClick={() => setDeletingMember(f)}
                          title="Delete Profile"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add / Edit Faculty & Roles Modal ── */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal afr-modal-large" onClick={e => e.stopPropagation()}>
            <div className="afr-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>{editingId ? 'Edit Faculty Roles & Profile' : 'Add Faculty Member with Roles'}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                  This information will be featured directly on the public Faculty Roles & Responsibilities page.
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="afr-modal-form">
              <div className="afr-modal-body">
                {/* 2 Column Top Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      className="form-input"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Prof. (Dr.) Amitabh Sen"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label">Designation *</label>
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        onClick={() => {
                          if (!form.designation.includes('Head of Department (HOD)')) {
                            setForm(prev => ({ ...prev, designation: 'Head of Department (HOD) - ' + (prev.designation || '') }))
                          }
                        }}
                      >
                        + Set as HOD
                      </button>
                    </div>
                    <input
                      className="form-input"
                      value={form.designation}
                      onChange={e => setForm({ ...form, designation: e.target.value })}
                      placeholder="e.g. Head of Department (HOD) - Aerospace Engineering"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Qualification *</label>
                    <input
                      className="form-input"
                      value={form.qualification}
                      onChange={e => setForm({ ...form, qualification: e.target.value })}
                      placeholder="e.g. Ph.D. IIT Bombay, M.Tech"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience *</label>
                    <input
                      className="form-input"
                      value={form.experience}
                      onChange={e => setForm({ ...form, experience: e.target.value })}
                      placeholder="e.g. 22 years"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                      className="form-input"
                      type="number"
                      value={form.order}
                      onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Key Specialization</label>
                  <input
                    className="form-input"
                    value={form.specialization}
                    onChange={e => setForm({ ...form, specialization: e.target.value })}
                    placeholder="e.g. Hypersonic Aerodynamics, Aircraft Structural Dynamics & Space Propulsion"
                  />
                </div>

                {/* ══ ROLES AND RESPONSIBILITIES FIELD ══ */}
                <div className="form-group afr-roles-field-container">
                  <div className="roles-label-row">
                    <div>
                      <label className="form-label" style={{ marginBottom: 2 }}>
                        <FiShield style={{ marginRight: 6, color: '#4f46e5' }} />
                        Roles & Responsibilities *
                      </label>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>
                        Each line starting with • or - will render as a distinct duty with a green checkmark icon.
                      </p>
                    </div>

                    <div className="quick-duty-helpers">
                      <button
                        type="button"
                        className="btn-quick-tag"
                        onClick={() => appendBullet('Academic & Strategic Leadership of the Department')}
                      >
                        + Leadership
                      </button>
                      <button
                        type="button"
                        className="btn-quick-tag"
                        onClick={() => appendBullet('Oversight of DGCA & university compliant curriculum development')}
                      >
                        + Curriculum
                      </button>
                      <button
                        type="button"
                        className="btn-quick-tag"
                        onClick={() => appendBullet('Direct supervision of departmental flight simulator and testing labs')}
                      >
                        + Simulators
                      </button>
                      <button
                        type="button"
                        className="btn-quick-tag"
                        onClick={() => appendBullet('Industry collaboration, guest lectures, and student internships')}
                      >
                        + Industry
                      </button>
                    </div>
                  </div>

                  <textarea
                    className="form-textarea afr-roles-textarea"
                    rows="7"
                    value={form.rolesAndResponsibilities}
                    onChange={e => setForm({ ...form, rolesAndResponsibilities: e.target.value })}
                    placeholder={`• Academic & Strategic Leadership of the Department\n• Oversight of DGCA & AICTE compliant curriculum design\n• Direct supervision of Flight Simulator & Wind Tunnel research facilities\n• Industry collaboration with aerospace and airline defense cells\n• Guiding final year capstone research and student mentorship`}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brief Biography Quote</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    placeholder="Short bio or philosophical leadership statement..."
                  />
                </div>

                {/* ══ LARGE PHOTO UPLOAD / URL ══ */}
                <div className="form-group afr-photo-upload-group">
                  <label className="form-label">Faculty Photograph (Large Size Showcase)</label>

                  {preview && (
                    <div className="photo-preview-strip">
                      <img src={preview} alt="preview" className="strip-img" />
                      <div className="strip-info">
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Image Selected</span>
                        <button type="button" onClick={clearImage} className="btn-remove-photo">
                          <FiX /> Remove Photo
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />

                  <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      disabled={uploading}
                      className="btn-upload-file"
                    >
                      <FiUpload />
                      {uploading ? 'Uploading...' : 'Upload Photo from Computer'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="form-input"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      placeholder="Paste high-res image URL (e.g. Unsplash or Google Drive)"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleFetchUrl}
                      disabled={fetching || !urlInput.trim()}
                      className="btn-fetch-url"
                    >
                      {fetching ? 'Fetching...' : 'Apply URL'}
                    </button>
                  </div>
                </div>

                {/* Active Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <label htmlFor="isActiveCheck" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy)' }}>
                    Display this faculty profile on public website
                  </label>
                </div>
              </div>

              <div className="admin-modal-actions" style={{ padding: '16px 24px', borderTop: '1px solid var(--gray-200)' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving || uploading}>
                  {saving ? 'Saving...' : editingId ? 'Update Faculty Portfolio' : 'Publish Faculty Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Photo Preview Lightbox ── */}
      {photoPreviewModal && (
        <div className="admin-modal-overlay" onClick={() => setPhotoPreviewModal(null)} style={{ zIndex: 1200 }}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, textAlign: 'center', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Faculty Photograph</h3>
              <button
                onClick={() => setPhotoPreviewModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6b7280' }}
              >
                <FiX />
              </button>
            </div>

            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: 16, backgroundColor: '#f8fafc' }}>
              <img
                src={photoPreviewModal.image}
                alt={photoPreviewModal.name}
                style={{ width: '100%', maxHeight: 380, objectFit: 'cover', display: 'block' }}
              />
              {isHOD(photoPreviewModal) && (
                <span style={{ position: 'absolute', top: 12, left: 12, background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
                  ⭐ Head of Department (HOD)
                </span>
              )}
            </div>

            <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>{photoPreviewModal.name}</h4>
            <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#6366f1', fontWeight: 600 }}>{photoPreviewModal.designation}</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14 }}>
              <a
                href={photoPreviewModal.image}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
              >
                Open Full Size ↗
              </a>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setPhotoPreviewModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingMember && (
        <div className="admin-modal-overlay" onClick={() => setDeletingMember(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <h3>Confirm Deletion</h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--gray-600)', margin: '14px 0 24px' }}>
              Are you sure you want to delete <strong>{deletingMember.name}</strong> and all their assigned roles? This action cannot be undone.
            </p>
            <div className="admin-modal-actions">
              <button className="btn btn-outline btn-sm" onClick={() => setDeletingMember(null)}>
                Cancel
              </button>
              <button className="btn btn-sm" style={{ background: '#dc2626', color: '#fff', border: 'none' }} onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
