import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FiShield,
  FiSearch,
  FiArrowRight,
  FiCheckCircle,
  FiAward,
  FiBriefcase,
  FiCompass,
  FiStar,
  FiMaximize2,
  FiX,
  FiUsers,
  FiBookOpen,
  FiCpu,
  FiTarget,
} from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'
import { getFaculty } from '../api'
import BrochureButton from '../components/BrochureButton'
import './FacultyRoles.css'

export default function FacultyRoles() {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    document.title = 'Faculty Roles & Responsibilities | Aharada Education'
    loadFaculty()
  }, [])

  const loadFaculty = async () => {
    try {
      const res = await getFaculty()
      setFaculty(res.data?.data || [])
    } catch (error) {
      console.error('Error fetching faculty:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check if a faculty member is an HOD
  const isHOD = (member) => {
    const des = (member.designation || '').toLowerCase()
    return des.includes('hod') || des.includes('head of department') || des.includes('head -')
  }

  // Parse roles and responsibilities into array of points
  const parseRoles = (text, member) => {
    if (!text || !text.trim()) {
      // Intelligent fallback based on designation
      const des = (member.designation || '').toLowerCase()
      if (des.includes('hod') || des.includes('head')) {
        return [
          'Academic & Strategic Leadership of the Department',
          'Oversight of DGCA & university compliant curriculum development',
          'Supervision of departmental laboratories and simulator training',
          'Student mentorship, academic integrity, and final year projects',
          'Industry collaboration and faculty development programs'
        ]
      }
      return [
        'Curriculum delivery and continuous student assessment',
        'Laboratory practicals, simulation training, and workshop supervision',
        'Student academic counseling and career mentoring',
        'Participation in departmental research and industry immersion'
      ]
    }

    return text
      .split('\n')
      .map(line => line.replace(/^[•\-\*\s\d\.]+/, '').trim())
      .filter(Boolean)
  }

  // Filtered faculty list
  const filteredFaculty = useMemo(() => {
    return faculty.filter(member => {
      // Category filter
      let matchCat = true
      if (activeFilter === 'hod') {
        matchCat = isHOD(member)
      } else if (activeFilter === 'aerospace') {
        const text = `${member.designation} ${member.specialization} ${member.rolesAndResponsibilities || ''}`.toLowerCase()
        matchCat = text.includes('aerospace') || text.includes('aeronautical') || text.includes('avionics') || text.includes('propulsion')
      } else if (activeFilter === 'aviation') {
        const text = `${member.designation} ${member.specialization} ${member.rolesAndResponsibilities || ''}`.toLowerCase()
        matchCat = text.includes('aviation') || text.includes('flight') || text.includes('pilot') || text.includes('simulator')
      } else if (activeFilter === 'operations') {
        const text = `${member.designation} ${member.specialization} ${member.rolesAndResponsibilities || ''}`.toLowerCase()
        matchCat = text.includes('airport') || text.includes('management') || text.includes('cargo') || text.includes('ground')
      }

      // Search term
      const q = searchTerm.toLowerCase().trim()
      if (!q) return matchCat

      const inName = member.name?.toLowerCase().includes(q)
      const inDes = member.designation?.toLowerCase().includes(q)
      const inSpec = member.specialization?.toLowerCase().includes(q)
      const inRoles = (member.rolesAndResponsibilities || '').toLowerCase().includes(q)

      return matchCat && (inName || inDes || inSpec || inRoles)
    })
  }, [faculty, activeFilter, searchTerm])

  const pillars = [
    {
      icon: <HiAcademicCap size={24} />,
      title: 'Pedagogic Rigor',
      desc: 'DGCA, AICTE, and UGC-aligned instructional delivery with measurable learning outcomes and exams.',
    },
    {
      icon: <FiCpu size={24} />,
      title: 'Practical Immersion',
      desc: 'Full-flight simulators, wind tunnels, and aircraft maintenance protocols led by certified industry mentors.',
    },
    {
      icon: <FiUsers size={24} />,
      title: 'Personalized Mentorship',
      desc: '1:1 guidance across pilot ground training, career roadmap planning, and airline interview preparation.',
    },
    {
      icon: <FiBriefcase size={24} />,
      title: 'Industry Synchronization',
      desc: 'Regular curriculum modernization informed by airline executives, airport operators, and aerospace scientists.',
    },
  ]

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="faculty-roles-page">
      {/* ── Page Hero ── */}
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container page-hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="hero-badge-page">
              <FiShield size={14} /> Institutional Portfolio & Academic Duties
            </span>
            <h1 className="page-hero-title">Faculty Roles & Responsibilities</h1>
            <p className="page-hero-subtitle">
              Comprehensive institutional portfolios, academic domains, and operational leadership 
              entrusted to our distinguished faculty members, program heads, and flight instructors.
            </p>
            <div className="hero-cta-row">
              <Link to="/faculty" className="btn btn-gold btn-lg">
                <FiUsers /> View Faculty Directory
              </Link>
              <BrochureButton page="faculty-roles" className="btn-lg" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Institutional Pillars ── */}
      <section className="fr-pillars-section">
        <div className="container">
          <div className="fr-pillars-grid">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                className="fr-pillar-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="fr-pillar-icon">{pillar.icon}</div>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Controls: Search & Category Filters ── */}
      <section className="fr-controls-section">
        <div className="container">
          <div className="fr-controls-wrapper">
            {/* Search Box */}
            <div className="fr-search-box">
              <FiSearch className="fr-search-icon" />
              <input
                type="text"
                className="fr-search-input"
                placeholder="Search faculty by name, HOD, designation, or specific responsibility..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="fr-search-clear" onClick={() => setSearchTerm('')}>
                  &times;
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="fr-categories-pills">
              <button
                className={`fr-cat-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All Faculty Profiles ({faculty.length})
              </button>
              <button
                className={`fr-cat-btn hod-pill ${activeFilter === 'hod' ? 'active' : ''}`}
                onClick={() => setActiveFilter('hod')}
              >
                <FiStar size={13} /> Heads of Department (HOD)
              </button>
              <button
                className={`fr-cat-btn ${activeFilter === 'aerospace' ? 'active' : ''}`}
                onClick={() => setActiveFilter('aerospace')}
              >
                Aerospace & Aeronautical
              </button>
              <button
                className={`fr-cat-btn ${activeFilter === 'aviation' ? 'active' : ''}`}
                onClick={() => setActiveFilter('aviation')}
              >
                Flight Operations & Pilot Science
              </button>
              <button
                className={`fr-cat-btn ${activeFilter === 'operations' ? 'active' : ''}`}
                onClick={() => setActiveFilter('operations')}
              >
                Airport Management & Operations
              </button>
            </div>
          </div>

          <div className="fr-results-meta">
            <span>
              Showing <strong>{filteredFaculty.length}</strong> of {faculty.length} faculty profiles with assigned roles
            </span>
            {(activeFilter !== 'all' || searchTerm) && (
              <button
                className="btn-reset-filters"
                onClick={() => {
                  setActiveFilter('all')
                  setSearchTerm('')
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Main Faculty Roles Showcase (One Large Size Photo - Name - Designation - Roles & Responsibilities) ── */}
      <section className="fr-showcase-section">
        <div className="container">
          {filteredFaculty.length === 0 ? (
            <div className="fr-empty-state">
              <FiUsers size={48} className="empty-icon" />
              <h3>No matching faculty profiles found</h3>
              <p>Try clearing your search query or choosing another category filter.</p>
              <button
                className="btn btn-navy btn-sm"
                onClick={() => {
                  setSearchTerm('')
                  setActiveFilter('all')
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="fr-faculty-stack">
              {filteredFaculty.map((member, idx) => {
                const hod = isHOD(member)
                const duties = parseRoles(member.rolesAndResponsibilities, member)

                return (
                  <motion.div
                    key={member._id || member.id || idx}
                    className={`fr-faculty-profile-card ${hod ? 'is-hod' : ''}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    {/* HOD Ribbon */}
                    {hod && (
                      <div className="fr-hod-banner">
                        <FiStar size={14} /> Head of Department (HOD)
                      </div>
                    )}

                    {/* ══ LEFT COLUMN: ONE LARGE EXTENDED PHOTO ══ */}
                    <div className="fr-photo-column">
                      <div
                        className="fr-photo-frame"
                        onClick={() => member.image && setSelectedPhoto(member)}
                        title={member.image ? 'Click to view full photograph' : ''}
                      >
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="fr-large-photo"
                          />
                        ) : (
                          <div className="fr-large-photo-placeholder">
                            <span>{member.name.slice(0, 2)}</span>
                          </div>
                        )}

                        {member.image && (
                          <div className="fr-photo-hover-overlay">
                            <FiMaximize2 size={24} />
                            <span>View Full Photograph</span>
                          </div>
                        )}

                        <div className="fr-photo-bottom-bar">
                          <FiMaximize2 size={13} /> Click to expand photograph
                        </div>
                      </div>
                    </div>

                    {/* ══ RIGHT COLUMN: NAME, DESIGNATION, ROLES & RESPONSIBILITIES ══ */}
                    <div className="fr-content-column">
                      {/* Name & Designation Header */}
                      <div className="fr-header-box">
                        <div className="fr-name-row">
                          <h2 className="fr-faculty-name">{member.name}</h2>
                          {hod && <span className="fr-hod-pill">HOD</span>}
                        </div>
                        <p className="fr-faculty-designation">{member.designation}</p>

                        {member.specialization && (
                          <div className="fr-specialization-badge">
                            <FiCompass className="spec-icon" />
                            <span><strong>Specialization:</strong> {member.specialization}</span>
                          </div>
                        )}
                      </div>

                      {/* Roles and Responsibilities Section */}
                      <div className="fr-roles-box">
                        <div className="fr-roles-box-header">
                          <div className="header-icon-wrap">
                            <FiShield size={18} />
                          </div>
                          <div>
                            <h3 className="fr-roles-box-title">
                              Institutional Roles & Academic Responsibilities
                            </h3>
                            <p className="fr-roles-box-subtitle">
                              Key portfolios, curriculum oversight, and operational duties
                            </p>
                          </div>
                        </div>

                        <ul className="fr-duties-list">
                          {duties.map((duty, dIdx) => (
                            <li key={dIdx} className="fr-duty-item">
                              <span className="duty-bullet">
                                <FiCheckCircle size={15} />
                              </span>
                              <span className="duty-text">{duty}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Bio Quote (if present) */}
                      {member.bio && (
                        <div className="fr-bio-box">
                          <p className="fr-bio-text">"{member.bio}"</p>
                        </div>
                      )}

                      {/* Bottom Quick Links */}
                      <div className="fr-footer-actions">
                        <Link to="/faculty" className="btn btn-outline-navy btn-sm">
                          <FiUsers size={14} /> Full Faculty Profile
                        </Link>
                        <Link to="/admissions" className="btn btn-gold btn-sm">
                          Apply for Admission <FiArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Institutional Code of Conduct & Ethics ── */}
      <section className="section fr-ethics-section">
        <div className="container">
          <div className="fr-ethics-card">
            <div className="fr-ethics-header">
              <FiShield className="ethics-icon" size={32} />
              <div>
                <h2>Institutional Code of Conduct & Faculty Ethics</h2>
                <p>Upholding academic excellence, aviation safety, and student welfare</p>
              </div>
            </div>

            <div className="fr-ethics-grid">
              <div className="ethics-item">
                <FiTarget className="item-icon" />
                <div>
                  <h4>Zero-Tolerance Academic Integrity</h4>
                  <p>Adherence to unbiased, transparent grading, rigorous anti-plagiarism standards, and proctored examination protocols.</p>
                </div>
              </div>
              <div className="ethics-item">
                <FiShield className="item-icon" />
                <div>
                  <h4>Aviation Safety & DGCA Compliance</h4>
                  <p>Uncompromising fidelity to standard operating procedures (SOPs) in simulator labs, hangar floors, and dispatch rooms.</p>
                </div>
              </div>
              <div className="ethics-item">
                <FiUsers className="item-icon" />
                <div>
                  <h4>Student Mentorship & Inclusivity</h4>
                  <p>Fostering an open, supportive learning environment with regular office hours, academic counseling, and fair grievance addressal.</p>
                </div>
              </div>
              <div className="ethics-item">
                <FiBookOpen className="item-icon" />
                <div>
                  <h4>Continuous Professional Development</h4>
                  <p>Active participation in national conferences, faculty development programs (FDPs), industry sabbaticals, and research publications.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Photo Lightbox Modal ── */}
      <AnimatePresence>
        {selectedPhoto && (
          <div
            className="fr-modal-backdrop"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              className="fr-modal-content"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <button
                className="fr-modal-close"
                onClick={() => setSelectedPhoto(null)}
                aria-label="Close photo preview"
              >
                <FiX size={20} />
              </button>

              <div className="fr-modal-inner">
                <div className="fr-modal-img-wrap">
                  <img
                    src={selectedPhoto.image}
                    alt={selectedPhoto.name}
                    className="fr-modal-large-img"
                  />
                  {isHOD(selectedPhoto) && (
                    <div className="fr-modal-hod-tag">
                      <FiStar size={14} /> Head of Department (HOD)
                    </div>
                  )}
                </div>

                <div className="fr-modal-info">
                  <h3 className="modal-fac-name">{selectedPhoto.name}</h3>
                  <p className="modal-fac-desig">{selectedPhoto.designation}</p>
                  <p className="modal-fac-qual">{selectedPhoto.qualification} • {selectedPhoto.experience}</p>
                  {selectedPhoto.specialization && (
                    <p className="modal-fac-spec"><strong>Specialization:</strong> {selectedPhoto.specialization}</p>
                  )}

                  <div className="modal-actions">
                    <a
                      href={selectedPhoto.image}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      Open Full Size ↗
                    </a>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedPhoto(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
