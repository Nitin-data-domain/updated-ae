import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { FiGrid, FiBook, FiUsers, FiCalendar, FiMail, FiFile, FiLogOut, FiMenu, FiX, FiAward, FiMessageSquare } from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'
import Logo from '../Logo'
import './AdminLayout.css'

const sidebarLinks = [
  { path: '/admin', label: 'Dashboard', icon: <FiGrid />, exact: true },
  { path: '/admin/programs', label: 'Programs', icon: <FiBook /> },
  { path: '/admin/faculty', label: 'Faculty', icon: <FiUsers /> },
  { path: '/admin/placements', label: 'Placements', icon: <FiAward /> },
  { path: '/admin/events', label: 'Events', icon: <FiCalendar /> },
  { path: '/admin/admission-leads', label: 'Admission Leads', icon: <HiAcademicCap /> },
  { path: '/admin/enquiries', label: 'Enquiries (Contact)', icon: <FiMessageSquare /> },
  { path: '/admin/brochures', label: 'Brochures', icon: <FiFile /> },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('aharada_user') || '{}')

  useEffect(() => {
    const token = localStorage.getItem('aharada_token')
    if (!token) navigate('/admin/login')
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('aharada_token')
    localStorage.removeItem('aharada_user')
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-brand">
            <Logo size="small" variant="icon" />
            <div>
              <div className="admin-brand-name">AHARADA</div>
              <div className="admin-brand-sub">Admin Panel</div>
            </div>
          </Link>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="admin-nav">
          {sidebarLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`admin-nav-link ${
                link.exact
                  ? location.pathname === link.path ? 'active' : ''
                  : location.pathname.startsWith(link.path) ? 'active' : ''
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-user-avatar">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="admin-user-name">{user.name || 'Admin'}</div>
              <div className="admin-user-role">{user.role || 'admin'}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-header">
          <button className="admin-menu-toggle" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <div className="admin-header-right">
            <Link to="/" className="admin-view-site" target="_blank">View Site →</Link>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
