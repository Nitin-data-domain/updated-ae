import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCalendar, FiMapPin, FiTag, FiArrowRight } from 'react-icons/fi'
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

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

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
            <h1 className="page-hero-title">Events & Activities</h1>
            <p className="page-hero-subtitle">
              Stay updated with our seminars, workshops, placement drives, and cultural events.
            </p>
            <BrochureButton page="events" />
            <div className="hero-cta-row">
              <Link to="/admissions" className="btn btn-gold btn-lg" id="events-apply-btn">
                Apply Now <FiArrowRight />
              </Link>
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
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All Events' : f === 'upcoming' ? 'Upcoming' : categoryLabels[f] || f}
              </button>
            ))}
          </div>

          <div className="events-grid">
            {filtered.map((event, i) => (
              <motion.div
                key={event._id}
                className="event-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
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
        </div>
      </section>
    </div>
  )
}
