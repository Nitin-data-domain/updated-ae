import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  FiMessageSquare,
  FiStar,
  FiSearch,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiBook,
  FiFilter,
  FiEye,
  FiX,
  FiCheck,
} from 'react-icons/fi'
import {
  getFeedbacks,
  getFeedbackStats,
  updateFeedbackStatus,
  deleteFeedback,
} from '../../api'

const categoryLabels = {
  academics: 'Academics & Syllabus',
  faculty: 'Faculty & Mentorship',
  infrastructure: 'Labs & Infrastructure',
  placements: 'Placements & Training',
  library: 'Library & Resources',
  general: 'General Experience',
}

const statusColors = {
  new: { bg: '#eef2ff', color: '#4338ca', label: 'New' },
  reviewed: { bg: '#fef3c7', color: '#92400e', label: 'Under Review' },
  resolved: { bg: '#dcfce7', color: '#15803d', label: 'Resolved / Addressed' },
}

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([])
  const [stats, setStats] = useState({ total: 0, new: 0, reviewed: 0, resolved: 0, avgRating: '5.0' })
  const [loading, setLoading] = useState(true)

  // Filters
  const [activeStatusTab, setActiveStatusTab] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')

  // View modal
  const [viewFeedback, setViewFeedback] = useState(null)

  useEffect(() => {
    document.title = 'Student Feedback Submissions | Aharada Admin'
    loadStats()
  }, [])

  useEffect(() => {
    loadFeedbacks()
  }, [activeStatusTab, selectedCategory, search])

  const loadStats = async () => {
    try {
      const res = await getFeedbackStats()
      if (res.data?.success) {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const loadFeedbacks = async () => {
    setLoading(true)
    try {
      const params = {}
      if (activeStatusTab !== 'all') params.status = activeStatusTab
      if (selectedCategory !== 'all') params.category = selectedCategory
      if (search.trim()) params.search = search.trim()

      const res = await getFeedbacks(params)
      if (res.data?.success) {
        setFeedbacks(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load student feedback')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateFeedbackStatus(id, newStatus)
      toast.success(`Marked as ${statusColors[newStatus].label}`)
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
      )
      if (viewFeedback && viewFeedback.id === id) {
        setViewFeedback((prev) => ({ ...prev, status: newStatus }))
      }
      loadStats()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id, studentName) => {
    if (!window.confirm(`Delete feedback from "${studentName}"?`)) return
    try {
      await deleteFeedback(id)
      toast.success('Feedback deleted')
      setFeedbacks((prev) => prev.filter((f) => f.id !== id))
      if (viewFeedback?.id === id) setViewFeedback(null)
      loadStats()
    } catch (err) {
      toast.error('Failed to delete feedback')
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Student Feedback Submissions</h1>
          <p className="admin-page-desc">
            Review feedback, recommendations, ratings, and grievances submitted by enrolled students.
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--primary-ultralight)', color: 'var(--primary)' }}>
            <FiMessageSquare />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value">{stats.total}</div>
            <div className="admin-stat-label">Total Submissions</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#eef2ff', color: '#4338ca' }}>
            <FiClock />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value" style={{ color: '#4338ca' }}>
              {stats.new}
            </div>
            <div className="admin-stat-label">New / Unread</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <FiCheckCircle />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value" style={{ color: '#15803d' }}>
              {stats.resolved}
            </div>
            <div className="admin-stat-label">Resolved / Actioned</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <FiStar />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value" style={{ color: '#b45309' }}>
              ★ {stats.avgRating}
            </div>
            <div className="admin-stat-label">Average Student Rating</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All (${stats.total})` },
              { id: 'new', label: `New (${stats.new})` },
              { id: 'reviewed', label: `Reviewed (${stats.reviewed})` },
              { id: 'resolved', label: `Resolved (${stats.resolved})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`admin-btn ${activeStatusTab === tab.id ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                onClick={() => setActiveStatusTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Category Filter */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <FiSearch
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--gray-400)',
                }}
              />
              <input
                type="text"
                placeholder="Search student, email, roll no..."
                className="admin-form-input"
                style={{ paddingLeft: '36px' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="admin-form-select"
              style={{ width: 'auto', minWidth: '180px' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Submissions Table */}
      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading feedback entries...</div>
        ) : feedbacks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
            No feedback entries found matching your filters.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Course &amp; Year</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Message Preview</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((f) => {
                  const sColor = statusColors[f.status] || statusColors.new
                  return (
                    <tr key={f.id || f._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{f.studentName}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{f.email}</div>
                        {f.phone && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{f.phone}</div>
                        )}
                        {f.enrollmentNo && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                            Roll: {f.enrollmentNo}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{f.courseName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{f.academicYear}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            background: 'var(--primary-ultralight)',
                            color: 'var(--primary)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}
                        >
                          {categoryLabels[f.category] || f.category}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            color: '#b45309',
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          ★ {f.rating || 5}/5
                        </span>
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div
                          style={{
                            fontSize: '0.86rem',
                            color: 'var(--gray-700)',
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={f.message}
                        >
                          {f.message}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '3px' }}>
                          {new Date(f.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <select
                          value={f.status}
                          onChange={(e) => handleStatusChange(f.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            background: sColor.bg,
                            color: sColor.color,
                            border: `1px solid ${sColor.color}30`,
                            cursor: 'pointer',
                          }}
                        >
                          <option value="new">New</option>
                          <option value="reviewed">Under Review</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            className="admin-btn-icon"
                            onClick={() => setViewFeedback(f)}
                            title="View Full Details"
                            style={{ color: 'var(--primary)' }}
                          >
                            <FiEye />
                          </button>
                          <button
                            className="admin-btn-icon danger"
                            onClick={() => handleDelete(f.id, f.studentName)}
                            title="Delete Submission"
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
          </div>
        )}
      </div>

      {/* View Feedback Modal */}
      {viewFeedback && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '580px' }}>
            <div className="admin-modal-header">
              <h2>Feedback Details</h2>
              <button className="admin-modal-close" onClick={() => setViewFeedback(null)}>
                <FiX />
              </button>
            </div>

            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: 'var(--gray-50)',
                  padding: '16px',
                  borderRadius: '10px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                    Student Name
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>
                    {viewFeedback.studentName}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                    Email
                  </div>
                  <div style={{ fontWeight: 600 }}>{viewFeedback.email}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                    Course &amp; Year
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {viewFeedback.courseName} ({viewFeedback.academicYear})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                    Rating &amp; Category
                  </div>
                  <div style={{ fontWeight: 700, color: '#b45309' }}>
                    ★ {viewFeedback.rating}/5 — {categoryLabels[viewFeedback.category]}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: '6px' }}>
                  Complete Student Message
                </label>
                <div
                  style={{
                    background: 'var(--white)',
                    border: '1px solid var(--gray-200)',
                    borderRadius: '10px',
                    padding: '16px',
                    fontSize: '0.95rem',
                    color: 'var(--navy)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {viewFeedback.message}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Update Status:</span>
                  <select
                    value={viewFeedback.status}
                    onChange={(e) => handleStatusChange(viewFeedback.id, e.target.value)}
                    className="admin-form-select"
                    style={{ width: 'auto' }}
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Under Review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <button
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setViewFeedback(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
