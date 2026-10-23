import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FiBriefcase,
  FiAward,
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiCheckCircle,
  FiTrendingUp,
  FiMaximize2,
  FiX,
  FiCalendar,
  FiSearch
} from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'
import { getPlacements } from '../api'
import { getMediaUrl, getFallbackAvatar } from '../utils/mediaUrl'
import BrochureButton from '../components/BrochureButton'
import './Placement.css'

const LIMIT = 15

export default function Placement() {
  const [placements, setPlacements] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    document.title = 'Placements & Top Achievers | Aharada Education'
    fetchPage(page)
  }, [page])

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedStudent(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const fetchPage = async (p) => {
    setLoading(true)
    try {
      const res = await getPlacements(p, LIMIT)
      setPlacements(res.data.data || [])
      setTotalPages(res.data.pagination?.totalPages || 1)
    } catch {
      setPlacements([])
    } finally {
      setLoading(false)
    }
  }

  // Client-side search filtering over current records
  const filteredPlacements = useMemo(() => {
    if (!searchQuery.trim()) return placements
    const q = searchQuery.toLowerCase().trim()
    return placements.filter((p) =>
      (p.studentName && p.studentName.toLowerCase().includes(q)) ||
      (p.companyName && p.companyName.toLowerCase().includes(q)) ||
      (p.role && p.role.toLowerCase().includes(q)) ||
      (p.program && p.program.toLowerCase().includes(q))
    )
  }, [placements, searchQuery])

  const getStudentImage = (placement) => {
    if (placement.image && placement.image !== 'https://via.placeholder.com/150') {
      return getMediaUrl(placement.image)
    }
    return getFallbackAvatar(placement.studentName)
  }

  return (
    <div className="placement-page">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container page-hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="hero-badge-page">
              <FiAward size={14} /> Outstanding Achievers
            </span>
            <h1 className="page-hero-title">Campus Placements</h1>
            <p className="page-hero-subtitle">
              Empowering talented minds to take flight with global aviation, aerospace, and
              technology leaders. Explore the inspiring success journeys of our students.
            </p>
            <div className="hero-cta-row">
              <Link to="/admissions" className="btn btn-gold btn-lg" id="placement-apply-btn">
                Apply for Admission <FiArrowRight />
              </Link>
              <BrochureButton page="general" className="btn-lg" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Placement Section */}
      <section className="section bg-light placement-main-section">
        <div className="container">
          {/* Key Placement Stats Bar */}
          <div className="placement-stats-bar">
            <div className="stat-card">
              <div className="stat-num">100%</div>
              <div className="stat-label">Placement Assistance</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-card">
              <div className="stat-num">25+</div>
              <div className="stat-label">Aviation &amp; Tech Partners</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-card">
              <div className="stat-num">₹14 LPA</div>
              <div className="stat-label">Highest Package</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-card">
              <div className="stat-num">500+</div>
              <div className="stat-label">Graduates Placed</div>
            </div>
          </div>

          {/* Section Head & Search */}
          <div className="placement-header-wrapper">
            <div className="section-head text-left">
              <h2 className="section-title">Meet Our Achievers</h2>
              <p className="section-subtitle">
                Our graduates represent excellence at premier airlines, airports, and engineering
                enterprises worldwide.
              </p>
            </div>

            <div className="placement-search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by student, company, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search Placements"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
            </div>
          ) : (
            <>
              {filteredPlacements.length === 0 ? (
                <div className="placement-empty-state">
                  <FiAward size={48} className="empty-icon" />
                  <h3>No Achievers Found</h3>
                  <p>
                    {searchQuery
                      ? `No placement records matching "${searchQuery}". Try a different keyword.`
                      : 'No placement records available at the moment.'}
                  </p>
                  {searchQuery && (
                    <button className="btn btn-outline" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="placement-grid">
                  {filteredPlacements.map((placement, i) => {
                    const imgSrc = getStudentImage(placement)
                    const hasPackage =
                      placement.package &&
                      placement.package !== 'N/A' &&
                      placement.package.trim() !== ''

                    return (
                      <motion.div
                        key={placement._id || placement.id || i}
                        className="placement-card"
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: (i % 6) * 0.06 }}
                        onClick={() => setSelectedStudent(placement)}
                      >
                        {/* Portrait Photo Container */}
                        <div className="placement-avatar-container">
                          <img
                            src={imgSrc}
                            alt={placement.studentName}
                            className="placement-avatar-img"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = getFallbackAvatar(placement.studentName)
                            }}
                          />

                          {/* Gradient Vignette at base */}
                          <div className="placement-avatar-overlay" />

                          {/* Top Floating Badges */}
                          <div className="avatar-top-badges">
                            <span className="badge-placed">
                              <FiCheckCircle className="badge-icon" /> Placed
                            </span>
                            {hasPackage ? (
                              <span className="badge-package">
                                <FiTrendingUp className="badge-icon" /> {placement.package}
                              </span>
                            ) : (
                              <span className="badge-year">
                                <FiCalendar className="badge-icon" /> {placement.year || '2026'}
                              </span>
                            )}
                          </div>

                          {/* Hover Zoom Prompt */}
                          <div className="avatar-zoom-hint">
                            <span className="zoom-btn-inner">
                              <FiMaximize2 /> View Full Photo
                            </span>
                          </div>

                          {/* Floating Company Pill on Photo Base */}
                          <div className="placement-company-pill">
                            <FiBriefcase className="company-pill-icon" />
                            <span className="company-name-text">{placement.companyName}</span>
                          </div>
                        </div>

                        {/* Card Info Body */}
                        <div className="placement-info">
                          <h3 className="placement-student-name">{placement.studentName}</h3>

                          <div className="placement-meta-list">
                            <div className="placement-meta-item role-item">
                              <div className="meta-icon-wrapper">
                                <FiBriefcase />
                              </div>
                              <div className="meta-text-group">
                                <span className="meta-label">DESIGNATION</span>
                                <span className="meta-value role-value">{placement.role}</span>
                              </div>
                            </div>

                            <div className="placement-meta-item program-item">
                              <div className="meta-icon-wrapper">
                                <HiAcademicCap />
                              </div>
                              <div className="meta-text-group">
                                <span className="meta-label">PROGRAM</span>
                                <span className="meta-value program-value">{placement.program}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer Action */}
                          <div className="placement-card-footer">
                            <span className="footer-batch">
                              Class of {placement.year || '2026'}
                            </span>
                            <span className="footer-cta">
                              Full Story <FiArrowRight className="cta-arrow" />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Pagination (shown when not actively searching) */}
              {!searchQuery && totalPages > 1 && (
                <div className="placement-pagination">
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <FiChevronLeft /> Prev
                  </button>
                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`page-num ${page === p ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Lightbox Modal for Full Portrait View */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            className="placement-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              className="placement-modal-content"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="placement-modal-close"
                onClick={() => setSelectedStudent(null)}
                title="Close modal"
                aria-label="Close"
              >
                <FiX />
              </button>

              <div className="modal-grid">
                {/* Full Uncropped Photo Column */}
                <div className="modal-photo-col">
                  <img
                    src={getStudentImage(selectedStudent)}
                    alt={selectedStudent.studentName}
                    className="modal-full-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = getFallbackAvatar(selectedStudent.studentName)
                    }}
                  />
                  <div className="modal-photo-caption">
                    <FiCheckCircle className="caption-check" /> Verified Placement Record
                  </div>
                </div>

                {/* Profile Details Column */}
                <div className="modal-details-col">
                  <div className="modal-badge-row">
                    <span className="modal-badge-company">
                      <FiBriefcase /> {selectedStudent.companyName}
                    </span>
                    {selectedStudent.package && selectedStudent.package !== 'N/A' && (
                      <span className="modal-badge-package">
                        <FiTrendingUp /> {selectedStudent.package}
                      </span>
                    )}
                  </div>

                  <h2 className="modal-student-name">{selectedStudent.studentName}</h2>
                  <p className="modal-role-highlight">{selectedStudent.role}</p>

                  <div className="modal-info-card">
                    <div className="modal-info-field">
                      <span className="field-label">
                        <HiAcademicCap className="field-icon" /> ACADEMIC PROGRAM
                      </span>
                      <strong className="field-value">{selectedStudent.program}</strong>
                    </div>

                    <div className="modal-info-field">
                      <span className="field-label">
                        <FiBriefcase className="field-icon" /> PLACEMENT PARTNER
                      </span>
                      <strong className="field-value">{selectedStudent.companyName}</strong>
                    </div>

                    <div className="modal-info-field">
                      <span className="field-label">
                        <FiCalendar className="field-icon" /> GRADUATION BATCH
                      </span>
                      <strong className="field-value">
                        Class of {selectedStudent.year || '2026'}
                      </strong>
                    </div>
                  </div>

                  <div className="modal-congrats-box">
                    <div className="congrats-icon-wrap">
                      <FiAward />
                    </div>
                    <div>
                      <strong>Career Success Milestone</strong>
                      <p>
                        Congratulations to {selectedStudent.studentName} on securing an outstanding
                        role with {selectedStudent.companyName}.
                      </p>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <Link
                      to="/admissions"
                      className="btn btn-navy"
                      onClick={() => setSelectedStudent(null)}
                    >
                      Start Your Journey <FiArrowRight />
                    </Link>
                    <button
                      className="btn btn-outline"
                      onClick={() => setSelectedStudent(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

