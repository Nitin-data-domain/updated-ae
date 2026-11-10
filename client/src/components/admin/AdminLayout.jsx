import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FiGrid,
  FiBook,
  FiUsers,
  FiCalendar,
  FiMail,
  FiFile,
  FiLogOut,
  FiMenu,
  FiX,
  FiAward,
  FiMessageSquare,
  FiBookOpen,
  FiShield,
  FiLock,
} from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'
import Logo from '../Logo'
import './AdminLayout.css'

const allSidebarLinks = [
  { path: '/admin', label: 'Dashboard', icon: <FiGrid />, exact: true, perm: 'dashboard' },
  { path: '/admin/programs', label: 'Programs', icon: <FiBook />, perm: 'programs' },
  { path: '/admin/books', label: 'Library Books & Notes', icon: <FiBookOpen />, perm: 'books' },
  { path: '/admin/feedback', label: 'Student Feedback', icon: <FiMessageSquare />, perm: 'feedback' },
  { path: '/admin/faculty', label: 'Faculty', icon: <FiUsers />, perm: 'faculty' },
  { path: '/admin/faculty-roles', label: 'Faculty Roles', icon: <FiShield />, perm: 'faculty-roles' },
  { path: '/admin/placements', label: 'Placements', icon: <FiAward />, perm: 'placements' },
  { path: '/admin/events', label: 'Events', icon: <FiCalendar />, perm: 'events' },
  { path: '/admin/admission-leads', label: 'Admission Leads', icon: <HiAcademicCap />, perm: 'leads' },
  { path: '/admin/enquiries', label: 'Enquiries (Contact)', icon: <FiMail />, perm: 'enquiries' },
  { path: '/admin/brochures', label: 'Brochures', icon: <FiFile />, perm: 'brochures' },
  { path: '/admin/users', label: 'Admin Users & Rights', icon: <FiLock />, perm: 'users', superAdminOnly: true },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('aharada_user') || '{}')

  const isSuper = user.role === 'superadmin'
  const userPerms = Array.isArray(user.permissions)
    ? user.permissions
    : typeof user.permissions === 'string'
      ? (function () {
        try {
          return JSON.parse(user.permissions)
        } catch (_) {
          return [user.permissions]
        }
      })()
      : []

  const visibleLinks = allSidebarLinks.filter((link) => {
    if (link.superAdminOnly) return isSuper
    if (link.perm === 'dashboard') return true
    if (isSuper || userPerms.includes('*')) return true
    return userPerms.includes(link.perm)
  })

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
          {visibleLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`admin-nav-link ${link.exact
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
            <div className={`admin-user-avatar ${isSuper ? 'avatar-super' : ''}`}>
              {user.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="admin-user-name">{user.name || 'Admin'}</div>
              <div className="admin-user-role">
                {isSuper ? 'Super Admin' : 'Staff Admin'}
              </div>
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
