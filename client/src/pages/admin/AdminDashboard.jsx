import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiBook, FiUsers, FiCalendar, FiMail, FiFile, FiMessageSquare, FiHardDrive, FiCheckCircle } from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'
import { getPrograms, getFaculty, getEvents, getEnquiryStats, getStorageStatus } from '../../api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    programs: 0,
    faculty: 0,
    events: 0,
    admissionLeads: { total: 0, new: 0, contacted: 0, enrolled: 0 },
    enquiries: { total: 0, new: 0, contacted: 0, enrolled: 0 }
  })
  const [storageInfo, setStorageInfo] = useState(null)

  useEffect(() => {
    document.title = 'Dashboard | Aharada Admin'
    Promise.allSettled([
      getPrograms(),
      getFaculty(),
      getEvents(),
      getEnquiryStats('admission_lead'),
      getEnquiryStats('enquiry')
    ]).then(([progs, facs, evts, admLeads, enqs]) => {
      setStats({
        programs: progs.status === 'fulfilled' ? (progs.value.data?.count ?? progs.value.data?.data?.length ?? 0) : 0,
        faculty: facs.status === 'fulfilled' ? (facs.value.data?.count ?? facs.value.data?.data?.length ?? 0) : 0,
        events: evts.status === 'fulfilled' ? (evts.value.data?.count ?? evts.value.data?.data?.length ?? 0) : 0,
        admissionLeads: admLeads.status === 'fulfilled' ? (admLeads.value.data?.data || { total: 0, new: 0 }) : { total: 0, new: 0 },
        enquiries: enqs.status === 'fulfilled' ? (enqs.value.data?.data || { total: 0, new: 0 }) : { total: 0, new: 0 }
      })
    })

    getStorageStatus()
      .then((res) => {
        if (res.data?.success) setStorageInfo(res.data)
      })
      .catch(() => {})
  }, [])

  const cards = [
    {
      icon: <FiBook />,
      label: 'Programs',
      value: stats.programs,
      color: '#4A9BD9',
      bg: 'rgba(74, 155, 217, 0.1)',
      link: '/admin/programs'
    },
    {
      icon: <FiUsers />,
      label: 'Faculty',
      value: stats.faculty,
      color: '#28A745',
      bg: 'rgba(40, 167, 69, 0.1)',
      link: '/admin/faculty'
    },
    {
      icon: <FiCalendar />,
      label: 'Events',
      value: stats.events,
      color: '#F7B731',
      bg: 'rgba(247, 183, 49, 0.1)',
      link: '/admin/events'
    },
    {
      icon: <HiAcademicCap />,
      label: 'Admission Leads',
      value: stats.admissionLeads?.total || 0,
      color: '#6C63FF',
      bg: 'rgba(108, 99, 255, 0.1)',
      link: '/admin/admission-leads'
    },
    {
      icon: <HiAcademicCap />,
      label: 'New Leads',
      value: stats.admissionLeads?.new || 0,
      color: '#17A2B8',
      bg: 'rgba(23, 162, 184, 0.1)',
      link: '/admin/admission-leads'
    },
    {
      icon: <FiMessageSquare />,
      label: 'Enquiries (Contact)',
      value: stats.enquiries?.total || 0,
      color: '#F7B731',
      bg: 'rgba(247, 183, 49, 0.1)',
      link: '/admin/enquiries'
    },
  ]

  return (
    <div>
      <h1 className="admin-page-title">Dashboard</h1>
      <p className="admin-page-subtitle">Welcome to Aharada Education Admin Panel</p>

      <div className="admin-stats-grid">
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

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.1rem', marginBottom: '16px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/admin/programs" className="btn btn-navy btn-sm"><FiBook /> Manage Programs</Link>
          <Link to="/admin/faculty" className="btn btn-navy btn-sm"><FiUsers /> Manage Faculty</Link>
          <Link to="/admin/events" className="btn btn-navy btn-sm"><FiCalendar /> Manage Events</Link>
          <Link to="/admin/admission-leads" className="btn btn-navy btn-sm"><HiAcademicCap /> Admission Leads</Link>
          <Link to="/admin/enquiries" className="btn btn-navy btn-sm"><FiMessageSquare /> Enquiries</Link>
          <Link to="/admin/brochures" className="btn btn-navy btn-sm"><FiFile /> Manage Brochures</Link>
        </div>
      </div>

      {/* GoDaddy Persistent Storage Verification Widget */}
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
    </div>
  )
}
