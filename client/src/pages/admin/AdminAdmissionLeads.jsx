import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  FiTrash2, FiPhone, FiUser, FiBookOpen, FiFilter,
  FiChevronLeft, FiChevronRight, FiSearch, FiBarChart2, FiX
} from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'
import { getAdmissionLeads, updateEnquiry, deleteEnquiry, getEnquiryStats, getProgramLeadStats } from '../../api'

// ── Deterministic color palette per program ──────────────────────────────────
const PALETTE = [
  { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' }, // blue
  { bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' }, // purple
  { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' }, // orange
  { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' }, // green
  { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' }, // red
  { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' }, // teal
  { bg: '#fefce8', color: '#a16207', border: '#fde68a' }, // yellow
  { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' }, // sky
  { bg: '#fdf2f8', color: '#9d174d', border: '#fbcfe8' }, // pink
  { bg: '#f5f3ff', color: '#5b21b6', border: '#ddd6fe' }, // violet
]

function getProgramColor(name, index) {
  if (index !== undefined) return PALETTE[index % PALETTE.length]
  // derive from string hash if no index
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

function ProgramBadge({ name, programColorMap }) {
  const style = programColorMap?.[name] || getProgramColor(name)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
      background: style.bg, color: style.color, border: `1px solid ${style.border}`,
      whiteSpace: 'nowrap', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis'
    }} title={name}>
      {name || '—'}
    </span>
  )
}

const STATUS_STYLES = {
  new:       { bg: '#eff6ff', color: '#1d4ed8' },
  contacted: { bg: '#fff7ed', color: '#c2410c' },
  enrolled:  { bg: '#f0fdf4', color: '#15803d' },
  closed:    { bg: '#f1f5f9', color: '#64748b' },
}

export default function AdminAdmissionLeads() {
  const [leads, setLeads]           = useState([])
  const [stats, setStats]           = useState({ total: 0, new: 0, contacted: 0, enrolled: 0 })
  const [programStats, setProgramStats] = useState([])
  const [filter, setFilter]         = useState('')         // status filter
  const [programFilter, setProgramFilter] = useState('')   // program filter
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showProgramStats, setShowProgramStats] = useState(false)
  const [loading, setLoading]       = useState(true)

  const loadStats = async () => {
    try {
      const res = await getEnquiryStats('admission_lead')
      setStats(res.data.data)
    } catch {
      // ignore
    }
  }

  const loadProgramStats = async () => {
    try {
      const res = await getProgramLeadStats()
      setProgramStats(res.data.data)
    } catch {
      // ignore
    }
  }

  const loadLeads = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (filter) params.status = filter
      if (programFilter) params.program = programFilter
      
      const res = await getAdmissionLeads(params)
      setLeads(res.data.data)
      setTotalPages(res.data.totalPages)
    } catch {
      toast.error('Failed to load admission leads')
    }
    setLoading(false)
  }

  useEffect(() => {
    document.title = 'Admission Leads | Aharada Admin'
    loadStats()
    loadProgramStats()
  }, [])

  useEffect(() => {
    // eslint-disable-next-line
    loadLeads()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, programFilter, page])

  // Build a stable color map: program name → color style
  const programColorMap = useMemo(() => {
    const map = {}
    programStats.forEach((ps, i) => {
      map[ps._id] = PALETTE[i % PALETTE.length]
    })
    return map
  }, [programStats])

  // Unique program names for the filter dropdown
  const uniquePrograms = useMemo(() => programStats.map(p => p._id).filter(Boolean), [programStats])

  // Client-side search filter
  const displayedLeads = useMemo(() => {
    if (!search.trim()) return leads
    const q = search.toLowerCase()
    return leads.filter(l =>
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.phone?.includes(q) ||
      l.program?.toLowerCase().includes(q)
    )
  }, [leads, search])

  const handleStatusChange = async (id, status) => {
    try {
      await updateEnquiry(id, { status })
      toast.success('Status updated')
      loadLeads(); loadStats(); loadProgramStats()
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admission lead?')) return
    try {
      await deleteEnquiry(id)
      toast.success('Deleted')
      loadLeads(); loadStats(); loadProgramStats()
    } catch { toast.error('Failed to delete') }
  }

  const clearFilters = () => {
    setFilter(''); setProgramFilter(''); setSearch(''); setPage(1)
  }
  const hasFilters = filter || programFilter || search

  return (
    <div>
      <h1 className="admin-page-title">Admission Leads</h1>
      <p className="admin-page-subtitle">Leads from the Apply Now / Admissions form</p>

      {/* ── Status Stats ── */}
      <div className="admin-stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Leads', value: stats.total, icon: <HiAcademicCap />, color: '#6C63FF', bg: 'rgba(108,99,255,0.1)' },
          { label: 'New',         value: stats.new,   icon: <FiUser />,        color: '#17A2B8', bg: 'rgba(23,162,184,0.1)' },
          { label: 'Contacted',   value: stats.contacted, icon: <FiPhone />,   color: '#E0A800', bg: 'rgba(255,193,7,0.1)' },
          { label: 'Enrolled',    value: stats.enrolled,  icon: <FiBookOpen />,color: '#28A745', bg: 'rgba(40,167,69,0.1)' },
        ].map((s, i) => (
          <div className="admin-stat-card" key={i}>
            <div className="admin-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="admin-stat-value">{s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Program-wise Stats Panel ── */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showProgramStats ? 16 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiBarChart2 style={{ color: '#6C63FF' }} />
            <strong style={{ fontSize: '0.95rem' }}>Leads by Program</strong>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: 20, padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700 }}>
              {programStats.length} programs
            </span>
          </div>
          <button
            onClick={() => setShowProgramStats(p => !p)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}
          >
            {showProgramStats ? '▲ Hide' : '▼ Show breakdown'}
          </button>
        </div>

        {showProgramStats && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {programStats.length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>No leads yet</p>
            )}
            {programStats.map((ps, i) => {
              const style = PALETTE[i % PALETTE.length]
              const pct = stats.total ? Math.round((ps.total / stats.total) * 100) : 0
              return (
                <div key={ps._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Color tag + name */}
                  <div style={{ minWidth: 220 }}>
                    <ProgramBadge name={ps._id} programColorMap={programColorMap} />
                  </div>
                  {/* Progress bar */}
                  <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: style.color, borderRadius: 6, transition: 'width 0.5s' }} />
                  </div>
                  {/* Counts */}
                  <div style={{ display: 'flex', gap: 10, fontSize: '0.8rem', minWidth: 220, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700 }}>{ps.total} total</span>
                    <span style={{ color: '#1d4ed8' }}>{ps.new} new</span>
                    <span style={{ color: '#c2410c' }}>{ps.contacted} contacted</span>
                    <span style={{ color: '#15803d' }}>{ps.enrolled} enrolled</span>
                  </div>
                  {/* Filter shortcut */}
                  <button
                    onClick={() => { setProgramFilter(ps._id); setPage(1) }}
                    style={{
                      padding: '3px 10px', borderRadius: 6, border: `1px solid ${style.border}`,
                      background: style.bg, color: style.color, fontSize: '0.75rem',
                      fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                    }}
                  >
                    View leads
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Filters Row ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 160 }}>
          <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            style={{
              width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.85rem',
              background: '#f8fafc', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Program filter */}
        <div style={{ position: 'relative' }}>
          <FiFilter style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <select
            value={programFilter}
            onChange={e => { setProgramFilter(e.target.value); setPage(1) }}
            style={{
              paddingLeft: 32, paddingRight: 28, paddingTop: 8, paddingBottom: 8,
              border: `1.5px solid ${programFilter ? '#6C63FF' : '#e2e8f0'}`,
              borderRadius: 8, fontSize: '0.85rem', background: programFilter ? '#f5f3ff' : '#f8fafc',
              color: programFilter ? '#5b21b6' : '#374151', fontWeight: programFilter ? 600 : 400,
              cursor: 'pointer', appearance: 'none', minWidth: 180
            }}
          >
            <option value="">All Programs</option>
            {uniquePrograms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Status filter buttons */}
        {['', 'new', 'contacted', 'enrolled', 'closed'].map(s => (
          <button
            key={s}
            className={`filter-btn ${filter === s && !programFilter ? 'active' : ''}`}
            onClick={() => { setFilter(s); setPage(1) }}
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
          >
            {s === '' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px',
              border: '1.5px solid #fecaca', borderRadius: 8, background: '#fef2f2',
              color: '#dc2626', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <FiX size={13} /> Clear
          </button>
        )}
      </div>

      {/* Active filter pill */}
      {programFilter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Showing leads for:</span>
          <ProgramBadge name={programFilter} programColorMap={programColorMap} />
          <button onClick={() => { setProgramFilter(''); setPage(1) }}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
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
            {loading && (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading…</td></tr>
            )}
            {!loading && displayedLeads.map((lead, idx) => (
              <tr key={lead._id}>
                <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                  {((page - 1) * 15) + idx + 1}
                </td>
                <td><strong>{lead.name}</strong></td>
                <td>
                  <div style={{ fontSize: '0.82rem' }}>{lead.email}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    <a href={`tel:${lead.phone}`} style={{ color: '#1d4ed8', textDecoration: 'none' }}>{lead.phone}</a>
                  </div>
                </td>
                <td>
                  <ProgramBadge name={lead.program} programColorMap={programColorMap} />
                </td>
                <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{lead.university || '—'}</td>
                <td style={{
                  fontSize: '0.82rem', maxWidth: 180,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  color: lead.message ? '#374151' : '#cbd5e1'
                }} title={lead.message}>
                  {lead.message || '—'}
                </td>
                <td>
                  <select
                    value={lead.status}
                    onChange={e => handleStatusChange(lead._id, e.target.value)}
                    className="form-select"
                    style={{
                      padding: '5px 10px', fontSize: '0.8rem', minWidth: 110, borderRadius: 8,
                      fontWeight: 600, border: '1.5px solid',
                      borderColor: STATUS_STYLES[lead.status]?.bg || '#e2e8f0',
                      background: STATUS_STYLES[lead.status]?.bg || '#f8fafc',
                      color: STATUS_STYLES[lead.status]?.color || '#374151',
                    }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', color: '#64748b' }}>
                  {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(lead.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td>
                  <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(lead._id)}><FiTrash2 /></button>
                </td>
              </tr>
            ))}
            {!loading && displayedLeads.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  {hasFilters ? 'No leads match your filters.' : 'No admission leads yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
          <button
            className="filter-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <FiChevronLeft size={15} /> Prev
          </button>
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
          <button
            className="filter-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            Next <FiChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
