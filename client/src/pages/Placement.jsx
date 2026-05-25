import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiBriefcase, FiAward, FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi'
import { getPlacements } from '../api'
import BrochureButton from '../components/BrochureButton'
import './Placement.css'

const LIMIT = 15

export default function Placement() {
  const [placements, setPlacements] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    document.title = 'Placements | Aharada Education'
    fetchPage(page)
  }, [page])

  const fetchPage = async (p) => {
    setLoading(true)
    try {
      const res = await getPlacements(p, LIMIT)
      setPlacements(res.data.data)
      setTotalPages(res.data.pagination.totalPages)
    } catch {
      setPlacements([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="placement-page">
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container page-hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="hero-badge-page"><FiAward size={14} /> Our Pride</span>
            <h1 className="page-hero-title">Top Placements</h1>
            <p className="page-hero-subtitle">
              Empowering students to achieve their dreams with leading global companies.
              Our placement cell ensures a brilliant start to your career.
            </p>
            <div className="hero-cta-row">
              <Link to="/admissions" className="btn btn-gold btn-lg" id="placement-apply-btn">
                Apply Now <FiArrowRight />
              </Link>
              <BrochureButton page="general" className="btn-lg" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <div className="section-head text-center">
            <h2 className="section-title">Our Recent Achievers</h2>
            <p className="section-subtitle">
              Meet the students who have made us proud by securing top-tier packages
              with India's leading airlines, airports, and aviation companies.
            </p>
          </div>

          {loading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : (
            <>
              <div className="placement-grid">
                {placements.map((placement, i) => (
                  <motion.div
                    key={placement._id}
                    className="placement-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="placement-avatar">
                      {placement.image && placement.image !== 'https://via.placeholder.com/150' ? (
                        <img src={placement.image} alt={placement.studentName} />
                      ) : (
                        <div className="placement-avatar-placeholder">
                          {placement.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="placement-info">
                      <h3 className="placement-student">{placement.studentName}</h3>
                      <p className="placement-company">{placement.companyName}</p>
                      <div className="placement-details">
                        <div className="placement-detail">
                          <FiBriefcase className="detail-icon" />
                          <span>{placement.role}</span>
                        </div>
                        <div className="placement-detail">
                          <FiAward className="detail-icon" />
                          <span>{placement.program}</span>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="placement-pagination">
                  <button
                    className="page-btn"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <FiChevronLeft /> Prev
                  </button>
                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              )}

              {placements.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>
                  No placement records yet.
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
