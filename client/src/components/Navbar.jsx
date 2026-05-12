import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HiMenu, HiX } from 'react-icons/hi'
import { FiPhone, FiMail } from 'react-icons/fi'
import Logo from './Logo'
import './Navbar.css'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About Us' },
  { path: '/programs', label: 'Programs' },
  { path: '/placement', label: 'Placement' },
  { path: '/faculty', label: 'Faculty' },
  { path: '/events', label: 'Events' },
  { path: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location])

  return (
    <>
      {/* Top Bar */}
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">
            <a href="tel:+919259870433" className="topbar-link">
              <FiPhone size={13} /> +91 92598 70433
            </a>
            <a href="mailto:info@aharadaedu.in" className="topbar-link">
              <FiMail size={13} /> info@aharadaedu.in
            </a>
          </div>
          <div className="topbar-right">
            <span className="topbar-tagline">Educate . Empower . Excel</span>
            <Link to="/admissions" className="topbar-cta">Apply Now</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`} id="main-navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-brand" id="navbar-brand">
            <Logo size="default" />
          </Link>

          <div className={`navbar-links ${isMobileOpen ? 'active' : ''}`}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                id={`nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/contact" className="btn btn-primary btn-sm nav-cta" id="nav-enquire-btn">
              Contact Us
            </Link>
          </div>

          <button
            className="navbar-toggle"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle navigation"
            id="navbar-toggle"
          >
            {isMobileOpen ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>
        </div>
      </nav>
    </>
  )
}
