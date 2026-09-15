import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FiAward,
  FiBook,
  FiBriefcase,
  FiUsers,
  FiArrowRight,
  FiSearch,
  FiMaximize2,
  FiGrid,
  FiList,
  FiX,
  FiCheckCircle,
  FiMapPin,
  FiStar,
} from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'
import { getFaculty } from '../api'
import BrochureButton from '../components/BrochureButton'
import './Faculty.css'

export default function Faculty() {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [viewMode, setViewMode] = useState('cards') // 'cards' | 'gallery'
  const [selectedPhotoMember, setSelectedPhotoMember] = useState(null)

  useEffect(() => {
    document.title = 'Faculty & Academic Leadership | Aharada Education'
    getFaculty()
      .then(res => setFaculty(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Check if a faculty member is an HOD
  const isHOD = (member) => {
    const des = (member.designation || '').toLowerCase()
    return des.includes('hod') || des.includes('head of department') || des.includes('head -')
  }

  // Filtered faculty list
  const filteredFaculty = useMemo(() => {
    return faculty.filter(m => {
      // Filter category
      let matchCat = true
      if (activeFilter === 'hod') {
        matchCat = isHOD(m)
      } else if (activeFilter === 'engineering') {
        const text = `${m.designation} ${m.specialization}`.toLowerCase()
        matchCat = text.includes('aerospace') || text.includes('aeronautical') || text.includes('avionics') || text.includes('simulator')
      } else if (activeFilter === 'aviation') {
        const text = `${m.designation} ${m.specialization}`.toLowerCase()
        matchCat = text.includes('aviation') || text.includes('flight') || text.includes('pilot') || text.includes('airport')
      } else if (activeFilter === 'management') {
        const text = `${m.designation} ${m.specialization}`.toLowerCase()
        matchCat = text.includes('management') || text.includes('entrepreneurship') || text.includes('marketing')
      }

      // Search term
      const q = search.toLowerCase().trim()
      if (!q) return matchCat

      const inName = m.name?.toLowerCase().includes(q)
      const inDes = m.designation?.toLowerCase().includes(q)
      const inSpec = m.specialization?.toLowerCase().includes(q)
      const inQual = m.qualification?.toLowerCase().includes(q)

      return matchCat && (inName || inDes || inSpec || inQual)
    })
  }, [faculty, activeFilter, search])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="faculty-page">
      {/* ── Page Hero ── */}
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container page-hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="hero-badge-page">
              <FiUsers size={14} /> Academic Leadership & Faculty
            </span>
            <h1 className="page-hero-title">Distinguished Faculty</h1>
            <p className="page-hero-subtitle">
              Learn from acclaimed Heads of Department, former airline captains, DRDO research scientists, 
              and seasoned aviation business leaders.
            </p>
            <div className="hero-cta-row">
              <Link to="/faculty-roles" className="btn btn-gold btn-lg">
                Faculty Roles & Responsibilities <FiArrowRight />
              </Link>
              <BrochureButton page="faculty" className="btn-lg" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Controls & Filter Bar ── */}
      <section className="faculty-controls-section">
        <div className="container">
          <div className="faculty-controls-card">
            {/* Search Input */}
            <div className="faculty-search-box">
              <FiSearch className="faculty-search-icon" />
              <input
                type="text"
                placeholder="Search faculty by name, HOD, specialization..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="faculty-search-input"
              />
              {search && (
                <button className="faculty-search-clear" onClick={() => setSearch('')}>
                  &times;
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="faculty-filter-pills">
              <button
                className={`faculty-pill ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All Faculty ({faculty.length})
              </button>
              <button
                className={`faculty-pill hod-pill ${activeFilter === 'hod' ? 'active' : ''}`}
                onClick={() => setActiveFilter('hod')}
              >
                <FiStar size={13} /> Heads of Department (HOD)
              </button>
              <button
                className={`faculty-pill ${activeFilter === 'engineering' ? 'active' : ''}`}
                onClick={() => setActiveFilter('engineering')}
              >
                Aerospace & Engineering
              </button>
              <button
                className={`faculty-pill ${activeFilter === 'aviation' ? 'active' : ''}`}
                onClick={() => setActiveFilter('aviation')}
              >
                Flight & Aviation Science
              </button>
              <button
                className={`faculty-pill ${activeFilter === 'management' ? 'active' : ''}`}
                onClick={() => setActiveFilter('management')}
              >
                Management & Startups
              </button>
            </div>

            {/* View Mode Toggle (Option to show full photographs) */}
            <div className="faculty-view-toggle">
              <span className="view-toggle-lbl">View:</span>
              <button
                className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Detailed Cards View"
              >
                <FiList size={16} /> Cards
              </button>
              <button
                className={`view-btn ${viewMode === 'gallery' ? 'active' : ''}`}
                onClick={() => setViewMode('gallery')}
                title="Photo Showcase Gallery"
              >
                <FiGrid size={16} /> Photos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Faculty Listing Section ── */}
      <section className="section faculty-list-section">
        <div className="container">
          {filteredFaculty.length === 0 ? (
            <div className="faculty-empty-state">
              <FiUsers size={48} className="empty-icon" />
              <h3>No faculty members found</h3>
              <p>Try clearing your search query or choosing another category filter.</p>
              <button
                className="btn btn-navy btn-sm"
                onClick={() => {
                  setSearch('')
                  setActiveFilter('all')
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'cards' ? (
            /* ═══ VIEW 1: DETAILED CARDS VIEW ═══ */
            <div className="faculty-grid">
              {filteredFaculty.map((member, i) => {
                const hod = isHOD(member)
                return (
                  <motion.div
                    key={member._id || member.id || i}
                    className={`faculty-card ${hod ? 'is-hod' : ''}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    {/* HOD Banner Badge */}
                    {hod && (
                      <div className="faculty-hod-ribbon">
                        <FiStar size={13} /> Head of Department
                      </div>
                    )}

                    {/* Interactive Avatar with Photo Click */}
                    <div
                      className="faculty-avatar"
                      onClick={() => member.image && setSelectedPhotoMember(member)}
                      title={member.image ? 'Click to view full photograph' : ''}
                    >
                      {member.image ? (
                        <div className="faculty-avatar-wrap">
                          <img src={member.image} alt={member.name} />
                          <div className="avatar-zoom-overlay">
                            <FiMaximize2 size={18} />
                            <span>View Photo</span>
                          </div>
                        </div>
                      ) : (
                        <div className="faculty-avatar-placeholder">
                          {member.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                      )}
                    </div>

                    <div className="faculty-info">
                      <div className="faculty-title-row">
                        <h3 className="faculty-name">{member.name}</h3>
                        {hod && <span className="faculty-hod-pill">HOD</span>}
                      </div>

                      <p className="faculty-designation">{member.designation}</p>

                      <div className="faculty-details">
                        <div className="faculty-detail">
                          <FiAward className="detail-icon" />
                          <span>{member.qualification}</span>
                        </div>
                        <div className="faculty-detail">
                          <FiBriefcase className="detail-icon" />
                          <span>{member.experience}</span>
                        </div>
                        {member.specialization && (
                          <div className="faculty-detail">
                            <FiBook className="detail-icon" />
                            <span>{member.specialization}</span>
                          </div>
                        )}
                      </div>

                      {member.bio && <p className="faculty-bio">{member.bio}</p>}

                      {/* Photo View Trigger Button */}
                      {member.image && (
                        <button
                          type="button"
                          className="btn-view-photo"
                          onClick={() => setSelectedPhotoMember(member)}
                        >
                          <FiMaximize2 size={13} /> View Photograph
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            /* ═══ VIEW 2: PHOTO SHOWCASE GALLERY ═══ */
            <div className="faculty-gallery-grid">
              {filteredFaculty.map((member, i) => {
                const hod = isHOD(member)
                return (
                  <motion.div
                    key={member._id || member.id || i}
                    className={`faculty-gallery-card ${hod ? 'is-hod' : ''}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedPhotoMember(member)}
                  >
                    <div className="gallery-img-box">
                      {member.image ? (
                        <img src={member.image} alt={member.name} />
                      ) : (
                        <div className="gallery-placeholder">
                          {member.name.slice(0, 2)}
                        </div>
                      )}
                      <div className="gallery-overlay">
                        <span className="gallery-zoom-badge">
                          <FiMaximize2 size={16} /> View Photo & Bio
                        </span>
                      </div>
                      {hod && (
                        <span className="gallery-hod-tag">
                          <FiStar size={11} /> HOD
                        </span>
                      )}
                    </div>
                    <div className="gallery-meta">
                      <h4 className="gallery-name">{member.name}</h4>
                      <p className="gallery-desig">{member.designation}</p>
                      <span className="gallery-qual">{member.qualification}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Interactive Photo Lightbox Modal ── */}
      <AnimatePresence>
        {selectedPhotoMember && (
          <div
            className="faculty-modal-backdrop"
            onClick={() => setSelectedPhotoMember(null)}
          >
            <motion.div
              className="faculty-modal-content"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <button
                className="faculty-modal-close"
                onClick={() => setSelectedPhotoMember(null)}
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>

              <div className="faculty-modal-grid">
                {/* Large High-Res Photograph */}
                <div className="faculty-modal-photo-pane">
                  {selectedPhotoMember.image ? (
                    <img
                      src={selectedPhotoMember.image}
                      alt={selectedPhotoMember.name}
                      className="faculty-modal-img"
                    />
                  ) : (
                    <div className="faculty-modal-no-img">
                      {selectedPhotoMember.name[0]}
                    </div>
                  )}
                  {isHOD(selectedPhotoMember) && (
                    <div className="faculty-modal-hod-badge">
                      <FiStar size={14} /> Head of Department (HOD)
                    </div>
                  )}
                </div>

                {/* Faculty Credentials & Details */}
                <div className="faculty-modal-info-pane">
                  <div className="faculty-modal-badge-row">
                    <span className="badge-inst">Aharada Education Faculty</span>
                    {isHOD(selectedPhotoMember) && (
                      <span className="badge-hod-pill">Department Head</span>
                    )}
                  </div>

                  <h2 className="faculty-modal-name">{selectedPhotoMember.name}</h2>
                  <p className="faculty-modal-desig">
                    {selectedPhotoMember.designation}
                  </p>

                  <div className="faculty-modal-details-box">
                    <div className="modal-detail-row">
                      <FiAward className="modal-icon" />
                      <div>
                        <strong>Academic Qualification:</strong>
                        <p>{selectedPhotoMember.qualification}</p>
                      </div>
                    </div>

                    <div className="modal-detail-row">
                      <FiBriefcase className="modal-icon" />
                      <div>
                        <strong>Industry & Academic Experience:</strong>
                        <p>{selectedPhotoMember.experience}</p>
                      </div>
                    </div>

                    {selectedPhotoMember.specialization && (
                      <div className="modal-detail-row">
                        <FiBook className="modal-icon" />
                        <div>
                          <strong>Key Specialization:</strong>
                          <p>{selectedPhotoMember.specialization}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedPhotoMember.bio && (
                    <div className="faculty-modal-bio">
                      <h4>Faculty Biography</h4>
                      <p>{selectedPhotoMember.bio}</p>
                    </div>
                  )}

                  <div className="faculty-modal-footer">
                    <Link to="/admissions" className="btn btn-navy btn-sm">
                      Apply for Admission
                    </Link>
                    <Link to="/faculty-roles" className="btn btn-outline-navy btn-sm">
                      View Faculty Roles
                    </Link>
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
