import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FiBriefcase,
  FiAward,
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiMaximize2,
  FiX,
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
    document.title = 'Placements | Aharada Education'
    fetchPage(page)
  }, [page])

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
              <FiAward size={14} /> Campus Placements
            </span>
            <h1 className="page-hero-title">Our Achievers</h1>
            <p className="page-hero-subtitle">
              Meet our graduates who have embarked on rewarding career paths with premier
              airlines, airports, and aerospace organizations.
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

      {/* Main Placement Directory */}
      <section className="section bg-light placement-main-section">
        <div className="container">
          {/* Header & Search */}
          <div className="placement-header-wrapper">
            <div className="section-head text-left">
              <h2 className="section-title">Recent Placements</h2>
              <p className="section-subtitle">
                Explore the diverse roles and leading companies where Aharada Education students
                are making their mark.
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
                  <FiAward size={40} className="empty-icon" />
                  <h3>No Records Found</h3>
                  <p>
                    {searchQuery
                      ? `No placement records matching "${searchQuery}".`
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

                    return (
                      <motion.div
                        key={placement._id || placement.id || i}
                        className="placement-card"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: (i % 6) * 0.04 }}
                        onClick={() => setSelectedStudent(placement)}
                      >
                        {/* Portrait Photo Frame */}
                        <div className="placement-photo-frame">
                          <img
                            src={imgSrc}
                            alt={placement.studentName}
                            className="placement-photo-img"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = getFallbackAvatar(placement.studentName)
                            }}
                          />
                          <div className="placement-photo-zoom-icon" title="View Full Photo">
                            <FiMaximize2 />
                          </div>
                        </div>

                        {/* Card Information */}
                        <div className="placement-card-body">
                          <div className="placement-company-badge">
                            <FiBriefcase className="badge-company-icon" />
                            <span>{placement.companyName}</span>
                          </div>

                          <h3 className="placement-student-name">{placement.studentName}</h3>

                          <div className="placement-meta-details">
                            <div className="placement-meta-row">
                              <span className="meta-icon-dot" />
                              <span className="meta-role-text">{placement.role}</span>
                            </div>

                            <div className="placement-meta-row">
                              <HiAcademicCap className="meta-program-icon" />
                              <span className="meta-program-text">{placement.program}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
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

      {/* Clean Lightbox Modal */}
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
              className="placement-modal-dialog"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close-btn"
                onClick={() => setSelectedStudent(null)}
                title="Close"
                aria-label="Close"
              >
                <FiX />
              </button>

              <div className="modal-inner-layout">
                <div className="modal-image-pane">
                  <img
                    src={getStudentImage(selectedStudent)}
                    alt={selectedStudent.studentName}
                    className="modal-student-photo"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = getFallbackAvatar(selectedStudent.studentName)
                    }}
                  />
                </div>

                <div className="modal-content-pane">
                  <div className="modal-company-tag">
                    <FiBriefcase className="modal-company-icon" />
                    <span>{selectedStudent.companyName}</span>
                  </div>

                  <h2 className="modal-student-title">{selectedStudent.studentName}</h2>
                  <p className="modal-student-role">{selectedStudent.role}</p>

                  <div className="modal-program-box">
                    <HiAcademicCap className="modal-program-icon" />
                    <div>
                      <span className="modal-program-label">Academic Program</span>
                      <strong className="modal-program-value">{selectedStudent.program}</strong>
                    </div>
                  </div>

                  <div className="modal-actions-row">
                    <Link
                      to="/admissions"
                      className="btn btn-navy"
                      onClick={() => setSelectedStudent(null)}
                    >
                      Apply Now <FiArrowRight />
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


