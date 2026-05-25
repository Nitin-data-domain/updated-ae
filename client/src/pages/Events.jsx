import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiCalendar, FiMapPin, FiTag, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { getEvents } from '../api'
import BrochureButton from '../components/BrochureButton'
import './Events.css'

const categoryLabels = {
  seminar: 'Seminar',
  workshop: 'Workshop',
  conference: 'Conference',
  cultural: 'Cultural',
  placement: 'Placement Drive',
  other: 'Event'
}

const categoryColors = {
  seminar: '#6C63FF',
  workshop: '#FF6B6B',
  conference: '#4A9BD9',
  cultural: '#F7B731',
  placement: '#28A745',
  other: '#6C757D'
}

const EVENTS_PER_PAGE = 20

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    document.title = 'Events | Aharada Education'
    getEvents()
      .then(res => setEvents(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all'
    ? events
    : filter === 'upcoming'
      ? events.filter(e => e.isUpcoming)
      : events.filter(e => e.category === filter)

  const totalPages = Math.ceil(filtered.length / EVENTS_PER_PAGE)
  const paginated = filtered.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  )

  const handleFilterChange = (f) => {
    setFilter(f)
    setCurrentPage(1)
  }

  const scrollToGrid = () => {
    document.querySelector('.events-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const goToPage = (page) => {
    setCurrentPage(page)
    scrollToGrid()
  }

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>
  }

  return (
    <div className="events-page">
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container page-hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="hero-badge-page"><FiCalendar size={14} /> Campus Life</span>
            <h1 className="page-hero-title">Events &amp; Activities</h1>
            <p className="page-hero-subtitle">
              Stay updated with our seminars, workshops, placement drives, and cultural events.
            </p>
            <div className="hero-cta-row">
              <Link to="/admissions" className="btn btn-gold btn-lg" id="events-apply-btn">
                Apply Now <FiArrowRight />
              </Link>
              <BrochureButton page="events" className="btn-lg" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="events-filter">
            {['all', 'upcoming', 'workshop', 'conference', 'seminar', 'placement'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => handleFilterChange(f)}
              >
                {f === 'all' ? 'All Events' : f === 'upcoming' ? 'Upcoming' : categoryLabels[f] || f}
              </button>
            ))}
          </div>

          {/* Results count */}
          {filtered.length > 0 && (
            <p className="events-count">
              Showing {(currentPage - 1) * EVENTS_PER_PAGE + 1}–{Math.min(currentPage * EVENTS_PER_PAGE, filtered.length)} of {filtered.length} events
            </p>
          )}

          <div className="events-grid">
            {paginated.map((event, i) => (
              <motion.div
                key={event._id}
                className="event-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                {/* Event Photos (up to 2) */}
                {event.images && event.images.length > 0 && (
                  <div className={`event-photos event-photos-${Math.min(event.images.length, 2)}`}>
                    {event.images.slice(0, 2).map((img, idx) => (
                      <div key={idx} className="event-photo-wrap">
                        <img src={img} alt={`${event.title} photo ${idx + 1}`} className="event-photo" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="event-card-body">
                  <div className="event-header">
                    <span
                      className="event-category"
                      style={{ background: categoryColors[event.category] || categoryColors.other }}
                    >
                      <FiTag size={12} /> {categoryLabels[event.category] || 'Event'}
                    </span>
                    {event.isUpcoming && <span className="event-upcoming">Upcoming</span>}
                  </div>

                  <div className="event-date-block">
                    <span className="event-day">{new Date(event.date).getDate()}</span>
                    <span className="event-month">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-desc">{event.description}</p>

                  {event.location && (
                    <div className="event-meta">
                      <FiMapPin size={14} /> {event.location}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>
              No events found for this filter.
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="events-pagination">
              <button
                className="epag-btn epag-arrow"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <FiChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`epag-btn ${page === currentPage ? 'epag-active' : ''}`}
                  onClick={() => goToPage(page)}
                  aria-label={`Page ${page}`}
                >
                  {page}
                </button>
              ))}

              <button
                className="epag-btn epag-arrow"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}


