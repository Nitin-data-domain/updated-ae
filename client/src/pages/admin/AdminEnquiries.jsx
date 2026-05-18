import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiTrash2, FiMail, FiPhone, FiMessageSquare } from 'react-icons/fi'
import { getContactEnquiries, updateEnquiry, deleteEnquiry, getEnquiryStats } from '../../api'

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([])
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, enrolled: 0 })
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadEnquiries = async () => {
    try {
      const params = { page, limit: 15 }
      if (filter) params.status = filter
      const res = await getContactEnquiries(params)
      setEnquiries(res.data.data)
      setTotalPages(res.data.totalPages)
    } catch {
      toast.error('Failed to load enquiries')
    }
  }

  const loadStats = async () => {
    try {
      const res = await getEnquiryStats('enquiry')
      setStats(res.data.data)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    document.title = 'Enquiries | Aharada Admin'
    loadStats()
   
  }, [])

  useEffect(() => {
    loadEnquiries()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page])

  const handleStatusChange = async (id, status) => {
    try {
      await updateEnquiry(id, { status })
      toast.success('Status updated')
      loadEnquiries()
      loadStats()
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return
    try { await deleteEnquiry(id); toast.success('Deleted'); loadEnquiries(); loadStats() }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <h1 className="admin-page-title">Enquiries</h1>
      <p className="admin-page-subtitle">Messages from the Contact Us page</p>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(108,99,255,0.1)', color: '#6C63FF' }}><FiMessageSquare /></div>
          <div><div className="admin-stat-value">{stats.total}</div><div className="admin-stat-label">Total</div></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(23,162,184,0.1)', color: '#17A2B8' }}><FiMail /></div>
          <div><div className="admin-stat-value">{stats.new}</div><div className="admin-stat-label">New</div></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(255,193,7,0.1)', color: '#E0A800' }}><FiPhone /></div>
          <div><div className="admin-stat-value">{stats.contacted}</div><div className="admin-stat-label">Contacted</div></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(40,167,69,0.1)', color: '#28A745' }}><FiMail /></div>
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
              <th>Message</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map(enq => (
              <tr key={enq._id}>
                <td><strong>{enq.name}</strong></td>
                <td>
                  <div style={{ fontSize: '0.82rem' }}>{enq.email}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{enq.phone}</div>
                </td>
                <td style={{ fontSize: '0.85rem' }}>{enq.program}</td>
                <td style={{ fontSize: '0.82rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{enq.message || '-'}</td>
                <td>
                  <select
                    value={enq.status}
                    onChange={e => handleStatusChange(enq._id, e.target.value)}
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
                  {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
                <td>
                  <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(enq._id)}><FiTrash2 /></button>
                </td>
              </tr>
            ))}
            {enquiries.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>No enquiries</td></tr>
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
