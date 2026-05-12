import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiTrash2, FiMail, FiPhone, FiUser, FiBookOpen } from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'
import { getAdmissionLeads, updateEnquiry, deleteEnquiry, getEnquiryStats } from '../../api'

export default function AdminAdmissionLeads() {
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, enrolled: 0 })
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    document.title = 'Admission Leads | Aharada Admin'
    loadStats()
  }, [])

  useEffect(() => {
    loadLeads()
  }, [filter, page])

  const loadLeads = async () => {
    try {
      const params = { page, limit: 15 }
      if (filter) params.status = filter
      const res = await getAdmissionLeads(params)
      setLeads(res.data.data)
      setTotalPages(res.data.totalPages)
    } catch { toast.error('Failed to load admission leads') }
  }

  const loadStats = async () => {
    try {
      const res = await getEnquiryStats('admission_lead')
      setStats(res.data.data)
    } catch {}
  }

  const handleStatusChange = async (id, status) => {
    try {
      await updateEnquiry(id, { status })
      toast.success('Status updated')
      loadLeads()
      loadStats()
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admission lead?')) return
    try { await deleteEnquiry(id); toast.success('Deleted'); loadLeads(); loadStats() }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <h1 className="admin-page-title">Admission Leads</h1>
      <p className="admin-page-subtitle">Leads from the Apply Now / Admissions form</p>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(108,99,255,0.1)', color: '#6C63FF' }}><HiAcademicCap /></div>
          <div><div className="admin-stat-value">{stats.total}</div><div className="admin-stat-label">Total Leads</div></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(23,162,184,0.1)', color: '#17A2B8' }}><FiUser /></div>
          <div><div className="admin-stat-value">{stats.new}</div><div className="admin-stat-label">New</div></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(255,193,7,0.1)', color: '#E0A800' }}><FiPhone /></div>
          <div><div className="admin-stat-value">{stats.contacted}</div><div className="admin-stat-label">Contacted</div></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(40,167,69,0.1)', color: '#28A745' }}><FiBookOpen /></div>
          <div><div className="admin-stat-value">{stats.enrolled}</div><div className="admin-stat-label">Enrolled</div></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['', 'new', 'contacted', 'enrolled', 'closed'].map(s => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => { setFilter(s); setPage(1) }}
            style={{ padding: '8px 18px', fontSize: '0.82rem' }}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Program</th>
              <th>University</th>
              <th>Message</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead._id}>
                <td><strong>{lead.name}</strong></td>
                <td>
                  <div style={{ fontSize: '0.82rem' }}>{lead.email}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{lead.phone}</div>
                </td>
                <td style={{ fontSize: '0.85rem' }}>{lead.program}</td>
                <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{lead.university || '-'}</td>
                <td style={{ fontSize: '0.82rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.message || '-'}</td>
                <td>
                  <select
                    value={lead.status}
                    onChange={e => handleStatusChange(lead._id, e.target.value)}
                    className="form-select"
                    style={{ padding: '6px 10px', fontSize: '0.8rem', minWidth: '110px' }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </td>
                <td>
                  <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(lead._id)}><FiTrash2 /></button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>No admission leads yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`filter-btn ${page === i + 1 ? 'active' : ''}`}
              onClick={() => setPage(i + 1)}
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
