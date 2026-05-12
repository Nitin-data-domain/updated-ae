import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiBriefcase, FiTarget, FiAward, FiClock, FiBookOpen, FiChevronRight, FiArrowRight } from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'
import { getProgramBySlug } from '../api'
import BrochureButton from '../components/BrochureButton'
import './ProgramDetail.css'

const getRecruitersByCategory = (category) => {
  const airlines = [
    { name: 'IndiGo', logo: 'https://logo.clearbit.com/goindigo.in' },
    { name: 'Air India', logo: 'https://logo.clearbit.com/airindia.com' },
    { name: 'SpiceJet', logo: 'https://logo.clearbit.com/spicejet.com' },
    { name: 'Emirates', logo: 'https://logo.clearbit.com/emirates.com' },
    { name: 'Vistara', logo: 'https://logo.clearbit.com/airvistara.com' },
    { name: 'Lufthansa', logo: 'https://logo.clearbit.com/lufthansa.com' },
  ];

  const engineering = [
    { name: 'HAL India', logo: 'https://logo.clearbit.com/hal-india.co.in' },
    { name: 'ISRO', logo: 'https://logo.clearbit.com/isro.gov.in' },
    { name: 'Boeing', logo: 'https://logo.clearbit.com/boeing.com' },
    { name: 'Airbus', logo: 'https://logo.clearbit.com/airbus.com' },
    { name: 'GE Aviation', logo: 'https://logo.clearbit.com/ge.com' },
    { name: 'L&T', logo: 'https://logo.clearbit.com/larsentoubro.com' },
  ];

  const tech = [
    { name: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com' },
    { name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com' },
    { name: 'IBM', logo: 'https://logo.clearbit.com/ibm.com' },
    { name: 'Meta', logo: 'https://logo.clearbit.com/meta.com' },
    { name: 'Oracle', logo: 'https://logo.clearbit.com/oracle.com' },
  ];

  const business = [
    { name: 'Deloitte', logo: 'https://logo.clearbit.com/deloitte.com' },
    { name: 'KPMG', logo: 'https://logo.clearbit.com/kpmg.com' },
    { name: 'EY', logo: 'https://logo.clearbit.com/ey.com' },
    { name: 'PwC', logo: 'https://logo.clearbit.com/pwc.com' },
    { name: 'HDFC Bank', logo: 'https://logo.clearbit.com/hdfcbank.com' },
    { name: 'ICICI Bank', logo: 'https://logo.clearbit.com/icicibank.com' },
  ];

  const arts = [
    { name: 'Aditya Birla', logo: 'https://logo.clearbit.com/adityabirla.com' },
    { name: 'Reliance', logo: 'https://logo.clearbit.com/ril.com' },
    { name: 'Myntra', logo: 'https://logo.clearbit.com/myntra.com' },
    { name: 'FabIndia', logo: 'https://logo.clearbit.com/fabindia.com' },
    { name: 'Shoppers Stop', logo: 'https://logo.clearbit.com/shoppersstop.com' },
    { name: 'Pantaloons', logo: 'https://logo.clearbit.com/pantaloons.com' },
  ];

  switch(category) {
    case 'engineering': return engineering;
    case 'technology': return tech;
    case 'management':
    case 'entrepreneurship': return business;
    case 'arts': return arts;
    case 'aviation':
    case 'science':
    default: return airlines;
  }
};

export default function ProgramDetail() {
  const { slug } = useParams()
  const [program, setProgram] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProgramBySlug(slug)
      .then(res => {
        setProgram(res.data.data)
        document.title = `${res.data.data.title} | Aharada Education`
        
        // Dynamic SEO injection
        let metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription && res.data.data.shortDescription) {
          metaDescription.setAttribute('content', res.data.data.shortDescription)
        }
        let metaKeywords = document.querySelector('meta[name="keywords"]')
        if (metaKeywords && res.data.data.title) {
          metaKeywords.setAttribute('content', `${res.data.data.title}, Aharada Education, Admission, College, ${res.data.data.category}`)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="loading-container"><div className="spinner" /></div>
  if (!program) return (
    <div style={{ textAlign: 'center', padding: '140px 20px' }}>
      <h2>Program Not Found</h2>
      <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>The program you're looking for doesn't exist.</p>
      <Link to="/programs" className="btn btn-primary">View All Programs</Link>
    </div>
  )

  return (
    <div className="program-detail-page">
      {/* Hero */}
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container page-hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="pd-breadcrumb">
              <Link to="/">Home</Link> <FiChevronRight size={14} /> 
              <Link to="/programs">Programs</Link> <FiChevronRight size={14} /> 
              <span>{program.title}</span>
            </div>
            <h1 className="page-hero-title">{program.title}</h1>
            <div className="pd-hero-meta">
              <span><FiClock size={14} /> {program.duration}</span>
              <span><HiAcademicCap size={14} /> {program.eligibility}</span>
            </div>
            {program.universities && program.universities.length > 0 && (
              <div className="pd-hero-unis">
                <span className="pd-unis-label">Available at:</span>
                {program.universities.map((u, i) => (
                  <span key={i} className="pd-uni-badge">{u.name}</span>
                ))}
              </div>
            )}
            <BrochureButton programId={program._id} />
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="pd-grid">
            {/* Main Content */}
            <div className="pd-main">
              {/* Overview */}
              <motion.div 
                className="pd-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2><FiBookOpen size={20} /> Program Overview</h2>
                <p>{program.overview}</p>
              </motion.div>

              {/* Career Opportunities */}
              {program.careerOpportunities?.length > 0 && (
                <motion.div 
                  className="pd-section"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2><FiBriefcase size={20} /> Career Opportunities</h2>
                  <div className="pd-tags-grid">
                    {program.careerOpportunities.map((item, i) => (
                      <motion.div 
                        key={i} 
                        className="pd-career-tag"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <FiBriefcase size={14} className="career-tag-icon" /> {item}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Industry Exposure */}
              {program.industryExposure?.length > 0 && (
                <motion.div 
                  className="pd-section"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2><FiTarget size={20} /> Industry Exposure</h2>
                  <div className="pd-exposure-list">
                    {program.industryExposure.map((item, i) => (
                      <motion.div 
                        key={i} 
                        className="pd-exposure-item"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <FiCheckCircle size={16} className="exposure-check" />
                        <span>{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Top Recruiters */}
              <motion.div 
                className="pd-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2><FiBriefcase size={20} /> Recruitment Partners</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px', marginTop: '20px' }}>
                  {getRecruitersByCategory(program.category).map((company, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      style={{ padding: '16px', background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-md)', textAlign: 'center', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', gap: '8px' }}
                    >
                      <img
                        src={company.logo}
                        alt={company.name}
                        style={{ maxWidth: '90%', height: '44px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <strong style={{ fontSize: '0.82rem', color: 'var(--navy)', display: 'none' }}>{company.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: '-4px' }}>{company.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <aside className="pd-sidebar">
              <div className="pd-sidebar-card">
                <h3><FiAward size={18} /> Key Highlights</h3>
                <ul className="pd-highlights">
                  {program.highlights?.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <FiCheckCircle size={14} className="highlight-check" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="pd-sidebar-card pd-requirements">
                <h3><HiAcademicCap size={18} /> Eligibility</h3>
                <p>{program.eligibility}</p>
                <h3 style={{ marginTop: '20px' }}><FiClock size={18} /> Duration</h3>
                <p>{program.duration}</p>
              </div>

              {program.universities && program.universities.length > 0 && (
                <div className="pd-sidebar-card">
                  <h3><FiBookOpen size={18} /> Available At</h3>
                  <div className="pd-sidebar-unis">
                    {program.universities.map((u, i) => (
                      <div key={i} className="pd-sidebar-uni">
                        <div className="pd-uni-dot" />
                        {u.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="pd-sidebar-cta">
                <h3>Ready to Apply?</h3>
                <p>Take the first step towards your dream career.</p>
                <Link to="/admissions" className="btn btn-accent btn-sm" style={{ width: '100%' }}>
                  Apply Now <FiArrowRight />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
