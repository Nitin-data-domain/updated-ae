import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiBook,
  FiUsers,
  FiCalendar,
  FiMail,
  FiFile,
  FiMessageSquare,
  FiHardDrive,
  FiCheckCircle,
  FiBookOpen,
  FiAward,
  FiShield,
  FiLock,
  FiClock,
  FiUserCheck,
} from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'
import {
  getPrograms,
  getFaculty,
  getEvents,
  getEnquiryStats,
  getStorageStatus,
  getAllBooksAdmin,
  getFeedbacks,
  getPlacements,
  getAdminUsers,
} from '../../api'

export default function AdminDashboard() {
  const currentUser = JSON.parse(localStorage.getItem('aharada_user') || '{}')
  const isSuperAdmin = currentUser.role === 'superadmin'
  const userPerms = Array.isArray(currentUser.permissions)
    ? currentUser.permissions
    : typeof currentUser.permissions === 'string'
      ? (() => {
        try {
          return JSON.parse(currentUser.permissions)
        } catch (_) {
          return [currentUser.permissions]
        }
      })()
      : []

  const hasPerm = (perm) => isSuperAdmin || userPerms.includes('*') || userPerms.includes(perm)

  const [stats, setStats] = useState({
    programs: 0,
    faculty: 0,
    events: 0,
    admissionLeads: { total: 0, new: 0, contacted: 0, enrolled: 0 },
    enquiries: { total: 0, new: 0, contacted: 0, enrolled: 0 },
    books: 0,
    pendingBooks: 0,
    feedback: 0,
    placements: 0,
    users: 0,
  })
  const [storageInfo, setStorageInfo] = useState(null)

  useEffect(() => {
    document.title = 'Dashboard | Aharada Admin'

    const promises = []
    const keys = []

    if (hasPerm('programs')) {
      promises.push(getPrograms())
      keys.push('programs')
    }
    if (hasPerm('faculty')) {
      promises.push(getFaculty())
      keys.push('faculty')
    }
    if (hasPerm('events')) {
      promises.push(getEvents())
      keys.push('events')
    }
    if (hasPerm('leads')) {
      promises.push(getEnquiryStats('admission_lead'))
      keys.push('leads')
    }
    if (hasPerm('enquiries')) {
      promises.push(getEnquiryStats('enquiry'))
      keys.push('enquiries')
    }
    if (hasPerm('books')) {
      promises.push(getAllBooksAdmin())
      keys.push('books')
    }
    if (hasPerm('feedback')) {
      promises.push(getFeedbacks())
      keys.push('feedback')
    }
    if (hasPerm('placements')) {
      promises.push(getPlacements())
      keys.push('placements')
    }
    if (isSuperAdmin) {
      promises.push(getAdminUsers())
      keys.push('users')
    }

    Promise.allSettled(promises).then((results) => {
      setStats((prev) => {
        const next = { ...prev }
        results.forEach((res, i) => {
          const key = keys[i]
          if (res.status === 'fulfilled') {
            const d = res.value.data
            if (key === 'programs') next.programs = d?.count ?? d?.data?.length ?? 0
            if (key === 'faculty') next.faculty = d?.count ?? d?.data?.length ?? 0
            if (key === 'events') next.events = d?.count ?? d?.data?.length ?? 0
            if (key === 'leads') next.admissionLeads = d?.data || { total: 0, new: 0 }
            if (key === 'enquiries') next.enquiries = d?.data || { total: 0, new: 0 }
            if (key === 'books') {
              const list = Array.isArray(d?.data) ? d.data : []
              next.books = list.length
              next.pendingBooks = list.filter((b) => b.isApproved === false).length
            }
            if (key === 'feedback') {
              next.feedback = d?.count ?? d?.data?.length ?? 0
            }
            if (key === 'placements') {
              next.placements = d?.count ?? d?.data?.length ?? 0
            }
            if (key === 'users') {
              next.users = d?.data?.length ?? 0
            }
          }
        })
        return next
      })
    })

    if (isSuperAdmin) {
      getStorageStatus()
        .then((res) => {
          if (res.data?.success) setStorageInfo(res.data)
        })
        .catch(() => {})
    }
  }, [])

  // Build stat cards dynamically based strictly on assigned permissions
  const cards = []

  if (hasPerm('books')) {
    cards.push({
      icon: <FiBookOpen />,
      label: isSuperAdmin ? 'Library Notes & Textbooks' : 'My Uploaded Notes',
      value: stats.books,
      color: '#2563EB',
      bg: 'rgba(37, 99, 235, 0.1)',
      link: '/admin/books',
    })
    if (stats.pendingBooks > 0) {
      cards.push({
        icon: <FiClock />,
        label: isSuperAdmin ? 'Notes Awaiting Approval' : 'My Notes Pending Approval',
        value: stats.pendingBooks,
        color: '#D97706',
        bg: 'rgba(217, 119, 6, 0.1)',
        link: '/admin/books',
      })
    }
  }

  if (hasPerm('feedback')) {
    cards.push({
      icon: <FiMessageSquare />,
      label: 'Student Feedback',
      value: stats.feedback,
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.1)',
      link: '/admin/feedback',
    })
  }

  if (hasPerm('programs')) {
    cards.push({
      icon: <FiBook />,
      label: 'Programs',
      value: stats.programs,
      color: '#4A9BD9',
      bg: 'rgba(74, 155, 217, 0.1)',
      link: '/admin/programs',
    })
  }

  if (hasPerm('faculty')) {
    cards.push({
      icon: <FiUsers />,
      label: 'Faculty Members',
      value: stats.faculty,
      color: '#28A745',
      bg: 'rgba(40, 167, 69, 0.1)',
      link: '/admin/faculty',
    })
  }

  if (hasPerm('events')) {
    cards.push({
      icon: <FiCalendar />,
      label: 'Campus Events',
      value: stats.events,
      color: '#F7B731',
      bg: 'rgba(247, 183, 49, 0.1)',
      link: '/admin/events',
    })
  }

  if (hasPerm('leads')) {
    cards.push({
      icon: <HiAcademicCap />,
      label: 'Admission Leads',
      value: stats.admissionLeads?.total || 0,
      color: '#6C63FF',
      bg: 'rgba(108, 99, 255, 0.1)',
      link: '/admin/admission-leads',
    })
    cards.push({
      icon: <HiAcademicCap />,
      label: 'New Leads',
      value: stats.admissionLeads?.new || 0,
      color: '#17A2B8',
      bg: 'rgba(23, 162, 184, 0.1)',
      link: '/admin/admission-leads',
    })
  }

  if (hasPerm('enquiries')) {
    cards.push({
      icon: <FiMail />,
      label: 'Contact Enquiries',
      value: stats.enquiries?.total || 0,
      color: '#E11D48',
      bg: 'rgba(225, 29, 72, 0.1)',
      link: '/admin/enquiries',
    })
  }

  if (hasPerm('placements')) {
    cards.push({
      icon: <FiAward />,
      label: 'Placement Records',
      value: stats.placements,
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.1)',
      link: '/admin/placements',
    })
  }

  if (isSuperAdmin) {
    cards.push({
      icon: <FiLock />,
      label: 'Staff Logins & Accounts',
      value: stats.users,
      color: '#0EA5E9',
      bg: 'rgba(14, 165, 233, 0.1)',
      link: '/admin/users',
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Welcome to Aharada Education Admin Panel</p>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: isSuperAdmin ? 'rgba(201, 150, 12, 0.12)' : 'rgba(37, 99, 235, 0.1)',
          border: `1px solid ${isSuperAdmin ? 'rgba(201, 150, 12, 0.3)' : 'rgba(37, 99, 235, 0.25)'}`,
          borderRadius: '50px',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: isSuperAdmin ? '#B45309' : '#1D4ED8',
        }}>
          {isSuperAdmin ? <FiShield size={14} /> : <FiUserCheck size={14} />}
          <span>{isSuperAdmin ? 'Super Admin Account (Full Access)' : `Staff Admin: ${currentUser.name || 'Staff User'}`}</span>
        </div>
      </div>

      {/* Staff Admin Notice Banner */}
      {!isSuperAdmin && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '10px',
          color: '#1E40AF',
          marginTop: '16px',
          marginBottom: '20px',
          fontSize: '0.88rem',
        }}>
          <FiCheckCircle size={20} style={{ flexShrink: 0, color: '#3B82F6' }} />
          <span>
            You are logged in with <strong>Staff Admin</strong> privileges. Your dashboard and sidebar show only your assigned modules.
          </span>
        </div>
      )}

      {/* Dynamic Stat Cards */}
      <div className="admin-stats-grid" style={{ marginTop: isSuperAdmin ? '20px' : '0' }}>
        {cards.map((card, i) => (
          <Link to={card.link} key={i} className="admin-stat-card" style={{ textDecoration: 'none' }}>
            <div className="admin-stat-icon" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <div className="admin-stat-value">{card.value}</div>
              <div className="admin-stat-label">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions - Strictly Filtered to User Permissions */}
      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.1rem', marginBottom: '16px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {hasPerm('books') && (
            <Link to="/admin/books" className="btn btn-navy btn-sm">
              <FiBookOpen /> {isSuperAdmin ? 'Manage Library & Notes' : '+ Upload / My Notes'}
            </Link>
          )}
          {hasPerm('feedback') && (
            <Link to="/admin/feedback" className="btn btn-navy btn-sm">
              <FiMessageSquare /> View Student Feedback
            </Link>
          )}
          {hasPerm('programs') && (
            <Link to="/admin/programs" className="btn btn-navy btn-sm">
              <FiBook /> Manage Programs
            </Link>
          )}
          {hasPerm('faculty') && (
            <Link to="/admin/faculty" className="btn btn-navy btn-sm">
              <FiUsers /> Manage Faculty
            </Link>
          )}
          {hasPerm('faculty-roles') && (
            <Link to="/admin/faculty-roles" className="btn btn-navy btn-sm">
              <FiShield /> Faculty Roles
            </Link>
          )}
          {hasPerm('events') && (
            <Link to="/admin/events" className="btn btn-navy btn-sm">
              <FiCalendar /> Manage Events
            </Link>
          )}
          {hasPerm('leads') && (
            <Link to="/admin/admission-leads" className="btn btn-navy btn-sm">
              <HiAcademicCap /> Admission Leads
            </Link>
          )}
          {hasPerm('enquiries') && (
            <Link to="/admin/enquiries" className="btn btn-navy btn-sm">
              <FiMail /> Enquiries
            </Link>
          )}
          {hasPerm('brochures') && (
            <Link to="/admin/brochures" className="btn btn-navy btn-sm">
              <FiFile /> Manage Brochures
            </Link>
          )}
          {hasPerm('placements') && (
            <Link to="/admin/placements" className="btn btn-navy btn-sm">
              <FiAward /> Manage Placements
            </Link>
          )}
          {isSuperAdmin && (
            <Link to="/admin/users" className="btn btn-gold btn-sm" style={{ fontWeight: 600 }}>
              <FiLock /> Admin Users &amp; Rights
            </Link>
          )}
        </div>
      </div>

      {/* GoDaddy Persistent Storage Verification Widget - Super Admin ONLY */}
      {isSuperAdmin && storageInfo && (
        <div className="admin-card" style={{ marginTop: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiHardDrive style={{ color: '#10b981', fontSize: '1.25rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>Storage Status: {storageInfo?.storageType || 'Persistent Storage Active'}</h3>
                <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px' }}>Durable</span>
              </div>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                Mount Location: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>{storageInfo?.persistentUploadsRoot || '/private/uploads'}</code> &bull; Retains all uploads across redeployments and container rebuilds.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                Notes: <strong>{storageInfo?.categories?.books?.count ?? '-'}</strong> &bull; Images: <strong>{storageInfo?.categories?.images?.count ?? '-'}</strong>
              </span>
              <a href="/api/storage/status" target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm" style={{ textDecoration: 'none' }}>
                Test / View Storage JSON
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
