import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiBriefcase, FiTarget, FiAward, FiClock, FiBookOpen, FiChevronRight, FiArrowRight, FiCamera } from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'
import { getProgramBySlug } from '../api'
import BrochureButton from '../components/BrochureButton'
import './ProgramDetail.css'

import techImg1 from '../assets/technology/tech_img1.png'
import techImg2 from '../assets/technology/tech_img2.jpg'
import techImg3 from '../assets/technology/tech_img3.jpg'
import techImg4 from '../assets/technology/tech_img4.jpg'
import techImg5 from '../assets/technology/tech_img5.png'

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

  switch (category) {
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

/* ── Student Life gallery data per category ── */
const getStudentLifeByCategory = (category) => {
  const data = {
    aviation: {
      subtitle: 'Real moments from our campus — classrooms, airports, simulators, and celebrations.',
      large: {
        src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        alt: 'Aviation students at training academy',
        tag: 'Campus Life', caption: 'Aviation students at training facility',
      },
      grid: [
        { src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80', alt: 'Classroom learning', tag: 'Academics', caption: 'Collaborative learning sessions', alwaysShow: false },
        { src: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&q=80', alt: 'Airport industry visit', tag: 'Industry', caption: 'Industry Visits', alwaysShow: true, tagGold: true },
        { src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80', alt: 'Graduation ceremony', tag: 'Convocation', caption: 'Graduation Day 2024', alwaysShow: false },
        { src: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80', alt: 'Cockpit simulator', tag: 'Simulation', caption: 'Cockpit & flight simulator training', alwaysShow: false },
      ],
    },
    engineering: {
      subtitle: 'Hands-on labs, aerospace workshops, ISRO visits, and groundbreaking research moments.',
      large: {
        src: techImg1,
        alt: 'Aerospace engineering lab', tag: 'Engineering Lab', caption: 'Students building advanced prototypes',
      },
      grid: [
        { src: techImg5, alt: 'Circuit and avionics', tag: 'Avionics', caption: 'BTech Aerospace Engine Workshop', alwaysShow: false },
        { src: techImg3, alt: 'HAL ISRO visit', tag: 'Industry', caption: 'Aerospace industry facility visits', alwaysShow: true, tagGold: true },
        { src: techImg4, alt: 'CAD simulation', tag: 'Research', caption: 'Asteroid and Space Research', alwaysShow: false },
        { src: techImg2, alt: 'Graduation aerospace', tag: 'Guest Lecture', caption: 'Industry experts sharing knowledge', alwaysShow: false },
      ],
    },
    technology: {
      subtitle: 'Data labs, AI hackathons, tech company visits, and innovation-driven student projects.',
      large: {
        src: techImg1,
        alt: 'Tech students with drones', tag: 'Innovation Lab', caption: 'Students building advanced prototypes',
      },
      grid: [
        { src: techImg5, alt: 'Aerospace tech workshop', tag: 'Tech Lab', caption: 'Advanced technology practical training', alwaysShow: false },
        { src: techImg3, alt: 'Tech company visit', tag: 'Industry', caption: 'Aviation technology campus visits', alwaysShow: true, tagGold: true },
        { src: techImg4, alt: 'Asteroid research', tag: 'Research', caption: 'Space and technology research center', alwaysShow: false },
        { src: techImg2, alt: 'Tech presentation', tag: 'Guest Lecture', caption: 'Industry leaders sharing insights', alwaysShow: false },
      ],
    },
    management: {
      subtitle: 'Leadership summits, boardroom simulations, global case studies, and executive mentorships.',
      large: {
        src: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80',
        alt: 'MBA leadership session', tag: 'Leadership', caption: 'Executive leadership masterclass',
      },
      grid: [
        { src: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80', alt: 'Group case study', tag: 'Case Studies', caption: 'Global business case study sessions', alwaysShow: false },
        { src: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=600&q=80', alt: 'Airport operations visit', tag: 'Industry', caption: 'Airport operations management visit', alwaysShow: true, tagGold: true },
        { src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80', alt: 'Boardroom simulation', tag: 'Boardroom', caption: 'Boardroom & negotiation simulations', alwaysShow: false },
        { src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80', alt: 'MBA graduation', tag: 'Convocation', caption: 'MBA graduation ceremony 2024', alwaysShow: false },
      ],
    },
    entrepreneurship: {
      subtitle: 'Pitch days, startup incubators, investor meets, and innovation workshops that shape founders.',
      large: {
        src: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80',
        alt: 'Startup pitch day', tag: 'Startup Pitch', caption: 'Students pitching to investors',
      },
      grid: [
        { src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80', alt: 'Ideathon hackathon', tag: 'Hackathon', caption: 'Innovation ideathon & hackathon', alwaysShow: false },
        { src: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80', alt: 'Investor meet', tag: 'Investors', caption: 'Angel investor connect program', alwaysShow: true, tagGold: true },
        { src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80', alt: 'Startup team', tag: 'Incubation', caption: 'In-house startup incubation center', alwaysShow: false },
        { src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80', alt: 'Graduation', tag: 'Convocation', caption: 'Graduation ceremony 2024', alwaysShow: false },
      ],
    },
    science: {
      subtitle: 'ATC tower visits, meteorology labs, navigation systems training, and DGCA interactions.',
      large: {
        src: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800&q=80',
        alt: 'Aeronautical science field', tag: 'Field Training', caption: 'Students at aeronautical science labs',
      },
      grid: [
        { src: 'https://images.unsplash.com/photo-1613690399151-65ea69478674?w=600&q=80', alt: 'Meteorology lab', tag: 'Meteorology', caption: 'Meteorology & weather station lab', alwaysShow: false },
        { src: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&q=80', alt: 'ATC tower visit', tag: 'Industry', caption: 'ATC tower & DGCA interactions', alwaysShow: true, tagGold: true },
        { src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80', alt: 'Navigation systems', tag: 'Navigation', caption: 'Navigation systems practical training', alwaysShow: false },
        { src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80', alt: 'Science graduation', tag: 'Convocation', caption: 'Graduation ceremony 2024', alwaysShow: false },
      ],
    },
    arts: {
      subtitle: 'Design studios, fashion shows, brand collaborations, and creative industry immersions.',
      large: {
        src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        alt: 'Design studio session', tag: 'Design Studio', caption: 'Creative design & arts workshop',
      },
      grid: [
        { src: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80', alt: 'Fashion studio', tag: 'Fashion', caption: 'Fashion & styling masterclass', alwaysShow: false },
        { src: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=600&q=80', alt: 'Brand visit', tag: 'Industry', caption: 'Brand & retail industry visits', alwaysShow: true, tagGold: true },
        { src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80', alt: 'Creative workshop', tag: 'Workshop', caption: 'Creative thinking workshops', alwaysShow: false },
        { src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80', alt: 'Graduation arts', tag: 'Convocation', caption: 'Graduation ceremony 2024', alwaysShow: false },
      ],
    },
  }
  return data[category] || data.aviation
}

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
      .catch(() => { })
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
            <div className="hero-cta-row">
              <Link to="/admissions" className="btn btn-gold btn-lg" id="pd-hero-apply-btn">
                Apply Now <FiArrowRight />
              </Link>
              <BrochureButton programId={program._id} page="programs" className="btn-lg" />
            </div>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link to="/admissions" className="btn btn-accent btn-sm" style={{ width: '100%' }}>
                    Apply Now <FiArrowRight />
                  </Link>
                  <BrochureButton programId={program._id} page="programs" className="btn-sm" style={{ width: '100%' }} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ══ STUDENT LIFE GALLERY ══ */}
      {(() => {
        const sl = getStudentLifeByCategory(program.category)
        return (
          <section className="pd-student-life section">
            <div className="container">
              {/* Header */}
              <motion.div
                className="pd-sl-header"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="section-label">
                  <FiCamera className="label-icon" />
                  Student Life
                </div>
                <h2 className="section-title">Life at Aharada Education</h2>
                <p className="section-subtitle">{sl.subtitle}</p>
              </motion.div>

              {/* Bento grid */}
              <motion.div
                className="pd-sl-grid"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                {/* Large hero image */}
                <motion.div
                  className="pd-sl-item pd-sl-large"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <img src={sl.large.src} alt={sl.large.alt} />
                  <div className="pd-sl-overlay">
                    <span className="pd-sl-tag">{sl.large.tag}</span>
                    <p>{sl.large.caption}</p>
                  </div>
                </motion.div>

                {/* 2×2 right grid */}
                <div className="pd-sl-right">
                  <div className="pd-sl-top-row">
                    {sl.grid.slice(0, 2).map((item, i) => (
                      <motion.div
                        key={i}
                        className="pd-sl-item"
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.4 }}
                      >
                        <img src={item.src} alt={item.alt} />
                        <div className={`pd-sl-overlay${item.alwaysShow ? ' pd-sl-overlay-show' : ''}`}>
                          <span className={`pd-sl-tag${item.tagGold ? ' pd-sl-tag-gold' : ''}`}>{item.tag}</span>
                          <p>{item.caption}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="pd-sl-top-row">
                    {sl.grid.slice(2, 4).map((item, i) => (
                      <motion.div
                        key={i}
                        className="pd-sl-item"
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.4 }}
                      >
                        <img src={item.src} alt={item.alt} />
                        <div className={`pd-sl-overlay${item.alwaysShow ? ' pd-sl-overlay-show' : ''}`}>
                          <span className={`pd-sl-tag${item.tagGold ? ' pd-sl-tag-gold' : ''}`}>{item.tag}</span>
                          <p>{item.caption}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )
      })()}
    </div>
  )
}
