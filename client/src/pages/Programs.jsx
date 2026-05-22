import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiArrowRight, FiTarget, FiCheckCircle, FiBookOpen, FiNavigation,
  FiCpu, FiTrendingUp, FiBriefcase, FiLayers, FiUsers, FiAward,
  FiClock, FiStar, FiShield, FiMapPin
} from 'react-icons/fi'
import { HiOutlineOfficeBuilding, HiAcademicCap } from 'react-icons/hi'
import { getPrograms } from '../api'
import BrochureButton from '../components/BrochureButton'
import aviationBg from '../assets/aviation-program.png'
import campusAircraft from '../assets/campus-aircraft.jpg'
import campusStpi from '../assets/campus-stpi.jpg'
import campusHeliport from '../assets/campus-heliport.jpg'
import logoIndigo from '../assets/logos/logo-indigo.png'
import logoAirIndia from '../assets/logos/logo-airindia.png'
import logoSpiceJet from '../assets/logos/logo-spicejet.png'
import logoVistara from '../assets/logos/logo-vistara.png'
import logoAkasa from '../assets/logos/logo-akasaair.png'
import logoGoFirst from '../assets/logos/logo-gofirst.png'
import logoAirAsia from '../assets/logos/logo-airasia.png'
import logoAlliance from '../assets/logos/logo-allianceair.png'
import './Programs.css'

const categoryIcons = {
  aviation: <FiNavigation size={26} />,
  engineering: <FiCpu size={26} />,
  science: <FiTrendingUp size={26} />,
  management: <FiBriefcase size={26} />,
  entrepreneurship: <FiTarget size={26} />,
  technology: <FiLayers size={26} />,
  arts: <FiBookOpen size={26} />,
}

const categoryLabels = {
  aviation: 'Aviation',
  engineering: 'Engineering',
  science: 'Science',
  management: 'Management',
  entrepreneurship: 'Entrepreneurship',
  technology: 'Technology',
  arts: 'Arts & Design',
}

// Programme dummy images (cycling through available)
const programImages = [campusAircraft, campusStpi, campusHeliport, aviationBg]

// Company hiring partners
const hiringCompanies = [
  { name: 'IndiGo Airlines', color: '#1A5276', tag: 'Airline', logo: logoIndigo },
  { name: 'Air India', color: '#941F27', tag: 'Airline', logo: logoAirIndia },
  { name: 'SpiceJet', color: '#CC2229', tag: 'Airline', logo: logoSpiceJet },
  { name: 'Vistara', color: '#4B0082', tag: 'Airline', logo: logoVistara },
  { name: 'Akasa Air', color: '#E88A2E', tag: 'Airline', logo: logoAkasa },
  { name: 'Go First', color: '#F47920', tag: 'Airline', logo: logoGoFirst },
  { name: 'Delhi Airport (DIAL)', color: '#1A5276', tag: 'Airport', logo: 'https://logo.clearbit.com/newdelhiairport.in' },
  { name: 'Mumbai Airport (CSIA)', color: '#2C3E50', tag: 'Airport', logo: 'https://logo.clearbit.com/csmia.adaniairports.com' },
  { name: 'GMR Group', color: '#27856A', tag: 'Airport Ops', logo: 'https://logo.clearbit.com/gmrgroup.in' },
  { name: 'IndiGo Ground', color: '#1A5276', tag: 'Ground Staff', logo: logoIndigo },
  { name: 'Air Asia India', color: '#D93025', tag: 'Airline', logo: logoAirAsia },
  { name: 'Alliance Air', color: '#154360', tag: 'Airline', logo: logoAlliance },
]

const programHighlights = [
  { icon: <FiUsers size={22} />, val: '2500+', label: 'Students Placed' },
  { icon: <FiAward size={22} />, val: '200+', label: 'Hiring Partners' },
  { icon: <HiAcademicCap size={22} />, val: '4', label: 'Partner Universities' },
  { icon: <FiShield size={22} />, val: '100%', label: 'Placement Assist.' },
]

export default function Programs() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState(new Set())
  const [activeUni, setActiveUni] = useState('all')

  useEffect(() => {
    document.title = 'Programs | Aharada Education'
    getPrograms()
      .then(res => setPrograms(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleCategory = (cat) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const filteredPrograms = programs.filter(p => {
    // Support both legacy string category and new array category
    const programCats = Array.isArray(p.category) ? p.category : (p.category ? [p.category] : [])
    const catMatch = activeFilters.size === 0 || programCats.some(c => activeFilters.has(c))
    const uniMatch = activeUni === 'all' || (p.universities || []).some(u => u.slug === activeUni)
    return catMatch && uniMatch
  })

  const categories = [...new Set(programs.flatMap(p =>
    Array.isArray(p.category) ? p.category : (p.category ? [p.category] : [])
  ))].filter(Boolean)
  const uniList = [
    { slug: 'iimt', name: 'IIMT University' },
    { slug: 'future', name: 'Future University' },
    { slug: 'subharti', name: 'Subharti University' },
    { slug: 'sage', name: 'Sage University' },
  ]

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>
  }

  return (
    <div className="programs-page">

      {/* -------- PAGE HERO -------- */}
      <section className="page-hero" id="programs-hero">
        <div className="page-hero-bg" />
        <div className="page-hero-img-overlay">
          <img src={aviationBg} alt="Aviation Training" />
        </div>
        <div className="container page-hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="hero-badge-page"><FiBookOpen size={14} /> Academic Programs</span>
            <h1 className="page-hero-title">Our Programs</h1>
            <p className="page-hero-subtitle">
              Explore industry-integrated programs across our partner universities in aviation, 
              aerospace, technology, management, and creative arts.
            </p>
            <div className="page-hero-stats">
              {programHighlights.map((item, i) => (
                <div key={i} className="page-hero-stat">
                  <span className="page-hero-stat-icon">{item.icon}</span>
                  <span className="page-hero-stat-val">{item.val}</span>
                  <span className="page-hero-stat-label">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="hero-cta-row" style={{ marginTop: '30px' }}>
              <Link to="/admissions" className="btn btn-gold btn-lg" id="programs-apply-btn">
                Apply Now <FiArrowRight />
              </Link>
              <BrochureButton page="programs" className="btn-lg" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* -------- PROGRAM LISTINGS -------- */}
      <section className="section" id="programs-listing">
        <div className="container">

          {/* University Filter */}
          <div className="filter-section">
            <h3 className="filter-label">Filter by University</h3>
            <div className="filter-bar">
              <button className={`filter-btn ${activeUni === 'all' ? 'active' : ''}`} onClick={() => setActiveUni('all')}>All Universities</button>
              {uniList.map(u => (
                <button key={u.slug} className={`filter-btn ${activeUni === u.slug ? 'active' : ''}`} onClick={() => setActiveUni(u.slug)}>{u.name}</button>
              ))}
            </div>
          </div>

          {/* Category Filter – multi-select */}
          <div className="filter-section">
            <h3 className="filter-label">
              Filter by Category
              {activeFilters.size > 0 && (
                <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--gray-500)', marginLeft: '8px' }}>
                  ({activeFilters.size} selected)
                </span>
              )}
            </h3>
            <div className="filter-bar">
              <button
                className={`filter-btn ${activeFilters.size === 0 ? 'active' : ''}`}
                onClick={() => setActiveFilters(new Set())}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${activeFilters.has(cat) ? 'active' : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {categoryLabels[cat] || cat}
                </button>
              ))}
            </div>
          </div>

          <p className="results-count">{filteredPrograms.length} program{filteredPrograms.length !== 1 ? 's' : ''} found</p>

          <div className="programs-listing-grid">
            {filteredPrograms.map((program, i) => (
              <motion.div
                key={program._id}
                className="program-list-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 80 }}
                whileHover={{ y: -6 }}
              >
                {/* Dummy program image */}
                <div className="plc-image">
                  <img src={programImages[i % programImages.length]} alt={program.title} />
                  <div className="plc-image-overlay" />
                  <span className="plc-category-badge">{categoryLabels[program.category] || 'General'}</span>
                </div>

                <div className="plc-body">
                  <div className="plc-icon">
                    {categoryIcons[program.category] || <FiBookOpen size={26} />}
                  </div>
                  <div className="plc-content">
                    <h3>{program.title}</h3>
                    <p className="plc-desc">{program.shortDescription}</p>
                    <div className="plc-meta">
                      <span className="plc-duration"><FiClock size={13} /> {program.duration}</span>
                      {program.universities && program.universities.length > 0 && (
                        <span className="plc-uni"><FiMapPin size={13} /> {program.universities[0].name}</span>
                      )}
                    </div>
                    {program.universities && program.universities.length > 0 && (
                      <div className="plc-unis">
                        {program.universities.map((u, j) => (
                          <span key={j} className="uni-tag">{u.name}</span>
                        ))}
                      </div>
                    )}
                    <div className="plc-highlights">
                      {program.highlights?.slice(0, 3).map((h, j) => (
                        <span key={j}><FiCheckCircle size={12} /> {h}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="plc-footer">
                  <div className="plc-rating">
                    {[...Array(5)].map((_, j) => <FiStar key={j} size={13} fill="currentColor" />)}
                    <span>4.9/5</span>
                  </div>
                  <Link to={`/programs/${program.slug}`} className="btn btn-outline btn-sm plc-link">
                    Learn More <FiArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPrograms.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
              No programs found matching your filters.
            </div>
          )}
        </div>
      </section>

      {/* -------- CAMPUS LIFE (IMAGES) -------- */}
      <section className="section programs-gallery-section" id="programs-gallery">
        <div className="container">
          <motion.div
            className="section-header-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-label"><FiUsers className="label-icon" /> Student Life</div>
            <h2 className="section-title">Life at Aharada</h2>
            <p className="section-subtitle">
              Get a glimpse of the vibrant learning environment, industry exposure, 
              and career-focused training our students experience every day.
            </p>
          </motion.div>

          <div className="programs-gallery">
            {[
              { img: campusAircraft, title: 'Rohini Heliport Visit', sub: 'Live aviation field training' },
              { img: campusStpi, title: 'STPI Industry Visit', sub: 'Real-world corporate exposure' },
              { img: campusHeliport, title: 'Aharada Kaushal Kumbh', sub: 'Machine Learning Hackathon' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="programs-gallery-item"
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -8 }}
              >
                <img src={item.img} alt={item.title} />
                <div className="programs-gallery-caption">
                  <strong>{item.title}</strong>
                  <span>{item.sub}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* -------- COMPANY HIRING PARTNERS -------- */}
      <section className="section programs-partners-section" id="programs-partners">
        <div className="container">
          <motion.div
            className="section-header-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-label"><FiBriefcase className="label-icon" /> Placement Partners</div>
            <h2 className="section-title">Where Our Graduates Work</h2>
            <p className="section-subtitle">
              Our graduates are placed with India's most prestigious airlines, airports, 
              and aviation service providers through our dedicated placement cell.
            </p>
          </motion.div>

          <div className="partners-companies-grid">
            {hiringCompanies.map((company, i) => (
              <motion.div
                key={i}
                className="partners-company-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
              >
                <div
                  className="partners-company-icon"
                  style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', padding: '0', overflow: 'hidden' }}
                >
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={company.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }}
                      onError={(e) => {
                        if (!e.target.dataset.retried) {
                          e.target.dataset.retried = true;
                          try {
                            const url = new URL(company.logo, window.location.origin);
                            e.target.src = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
                          } catch {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }
                        } else {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }
                      }}
                    />
                  ) : (
                    <HiOutlineOfficeBuilding size={30} style={{ color: company.color }} />
                  )}
                  <HiOutlineOfficeBuilding size={30} style={{ color: company.color, display: 'none', margin: 'auto' }} />
                </div>
                <span className="partners-company-name">{company.name}</span>
                <span className="partners-company-tag" style={{ background: company.color + '14', color: company.color }}>
                  {company.tag}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Banner */}
          <motion.div
            className="programs-cta-banner"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="programs-cta-banner-text">
              <FiShield size={24} style={{ color: '#f0c040', flexShrink: 0 }} />
              <div>
                <strong>200+ Industry Partners · 100% Placement Assistance</strong>
                <span>Start your aviation career journey today — seats are filling fast!</span>
              </div>
            </div>
            <Link to="/admissions" className="btn btn-gold btn-lg" id="programs-apply-btn">
              Apply Now <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
