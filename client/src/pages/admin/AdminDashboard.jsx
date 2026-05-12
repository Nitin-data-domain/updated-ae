import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiBook, FiUsers, FiCalendar, FiMail, FiFile, FiMessageSquare } from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'
import { getPrograms, getFaculty, getEvents, getEnquiryStats } from '../../api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    programs: 0,
    faculty: 0,
    events: 0,
    admissionLeads: { total: 0, new: 0, contacted: 0, enrolled: 0 },
    enquiries: { total: 0, new: 0, contacted: 0, enrolled: 0 }
  })

  useEffect(() => {
    document.title = 'Dashboard | Aharada Admin'
    Promise.all([
      getPrograms(),
      getFaculty(),
      getEvents(),
      getEnquiryStats('admission_lead'),
      getEnquiryStats('enquiry')
    ]).then(([progs, facs, evts, admLeads, enqs]) => {
      setStats({
        programs: progs.data.count,
        faculty: facs.data.count,
        events: evts.data.count,
        admissionLeads: admLeads.data.data,
        enquiries: enqs.data.data
      })
    }).catch(() => {})
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
    </div>
  )
}
