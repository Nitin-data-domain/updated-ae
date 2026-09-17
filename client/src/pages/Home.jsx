import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  FiArrowRight, FiCheckCircle, FiUsers, FiAward, FiBriefcase, FiGlobe,
  FiBookOpen, FiTarget, FiTrendingUp, FiLayers, FiCpu, FiNavigation,
  FiStar, FiMapPin, FiPhone, FiMail, FiChevronRight,
  FiShield, FiZap, FiHeart, FiClock
} from 'react-icons/fi'
import { HiDownload, HiAcademicCap, HiOutlineOfficeBuilding } from 'react-icons/hi'
import { getPrograms } from '../api'
import BrochureButton from '../components/BrochureButton'
import ApplyNowSection from '../components/ApplyNowSection'

import logoIndigo from '../assets/logos/logo-indigo.png'
import campusIsro from '../assets/campus-isro.jpg'
import logoAirIndia from '../assets/logos/logo-airindia.png'
import logoSpiceJet from '../assets/logos/logo-spicejet.png'
import logoVistara from '../assets/logos/logo-vistara.png'
import logoAkasa from '../assets/logos/logo-akasaair.png'
import logoGoFirst from '../assets/logos/logo-gofirst.png'
import logoAirAsia from '../assets/logos/logo-airasia.png'
import logoAlliance from '../assets/logos/logo-allianceair.png'
import campusClassroom from '../assets/campus-classroom.jpg'
import campusGroupStudy from '../assets/campus-group-study.jpg'
import iimtLogo from '../assets/iimt-logo.png'
import subhartiLogo from '../assets/subharti-logo.png'
import './Home.css'

const stats = [
  { icon: <FiUsers size={22} />, value: '1000+', label: 'Students Placed' },
  { icon: <FiAward size={22} />, value: '6+', label: 'Years of Excellence' },
  { icon: <FiBriefcase size={22} />, value: '25+', label: 'Industry Partners' },
  { icon: <FiGlobe size={22} />, value: '2', label: 'Partner Universities' },
]

const whyChoose = [
  { title: 'Industry-Integrated Curriculum', desc: 'Programs designed with direct input from aviation and aerospace industry leaders to ensure real-world relevance.', icon: <FiBookOpen size={28} /> },
  { title: '100% Placement Assistance', desc: 'Dedicated placement cell with 200+ industry connections ensuring career opportunities for every graduate.', icon: <FiTarget size={28} /> },
  { title: 'Expert Faculty', desc: 'Learn from retired airline captains, aerospace scientists, and seasoned business professionals.', icon: <HiAcademicCap size={28} /> },
  { title: 'Airport & Airline Exposure', desc: 'Regular visits to international airports, airlines, and MRO facilities for hands-on learning.', icon: <FiNavigation size={28} /> },
  { title: 'Modern Infrastructure', desc: 'State-of-the-art labs, flight simulators, and innovation centers for immersive education.', icon: <FiCpu size={28} /> },
  { title: 'Multi-University Network', desc: 'Programs offered through 2 prestigious partner universities for maximum flexibility and reach.', icon: <FiLayers size={28} /> },
]

const universities = [
  {
    name: 'IIMT University',
    shortName: 'IIMT',
    slug: 'iimt',
    partnerType: 'Flagship Academic Partner',
    tagline: "NAAC 'A' Accredited | UGC Approved State Private University",
    location: 'Meerut, NCR / Uttar Pradesh',
    established: '2002',
    campusSize: '100+ Acre Campus',
    accreditation: "NAAC Grade 'A'",
    recognition: 'UGC Approved Section 2(f) & 12(B)',
    logo: iimtLogo,
    defaultPrograms: 8,
    description: 'A distinguished higher education institution empowering students with UGC-recognized degrees in Aviation, Aerospace, and Business Studies coupled with Aharada’s advanced flight simulation and airport operations training.',
    highlights: [
      'UGC Section 2(f) & 12(B) Recognized Degree Framework',
      'Flight Simulator & Aeronautical Systems Lab Access',
      '100+ Acre Smart Campus with Advanced R&D Centers',
      'Direct On-Campus Airline & Aerospace Placement Drives',
    ],
    popularPrograms: [
      'BBA Aviation & Travel',
      'B.Tech Aerospace Engineering',
      'B.Sc Aeronautical Science',
      'MBA Aviation Management',
    ],
  },
  {
    name: 'Swami Vivekanand Subharti University',
    shortName: 'Subharti University',
    slug: 'subharti',
    partnerType: 'Premier Academic Partner',
    tagline: "NAAC 'A' Accredited | Multi-Disciplinary State University",
    location: 'Meerut, NCR / Uttar Pradesh',
    established: '2008',
    campusSize: '250+ Acre Campus',
    accreditation: "NAAC Grade 'A'",
    recognition: 'UGC Approved State University',
    logo: subhartiLogo,
    defaultPrograms: 2,
    description: 'A prominent multi-disciplinary university offering globally aligned degree curriculums, expansive campus infrastructure, specialized aviation operations coursework, and structured airline corporate internships.',
    highlights: [
      'NAAC Grade A Accredited State University Credentials',
      'Aircraft Mockup Cabin Operations & Ground Staff Modules',
      '250+ Acre Vibrant Multi-Disciplinary Campus Infrastructure',
      'Dedicated Corporate Relations & Placement Coordination',
    ],
    popularPrograms: [
      'BBA Aviation & Travel',
      'B.Tech Aerospace Engineering',
      'Aviation Management Modules',
      'Airport Ground Operations Tracks',
    ],
  },
]

// Airline/Company partners (static)
const companyPartners = [
  { name: 'IndiGo Airlines', logo: logoIndigo },
  { name: 'Air India', logo: logoAirIndia },
  { name: 'SpiceJet', logo: logoSpiceJet },
  { name: 'Vistara', logo: logoVistara },
  { name: 'Akasa Air', logo: logoAkasa },
  { name: 'Go First', logo: logoGoFirst },
  { name: 'Air Asia India', logo: logoAirAsia },
  { name: 'Alliance Air', logo: logoAlliance },
]

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Ground Staff, IndiGo Airlines',
    batch: 'Batch 2023',
    text: 'Aharada Education transformed my life completely. The practical training and industry exposure gave me the confidence to crack my IndiGo interview in the first attempt.',
    rating: 5,
    avatar: 'PS',
  },
  {
    name: 'Rahul Verma',
    role: 'Cabin Crew, Air India',
    batch: 'Batch 2022',
    text: 'The faculty at Aharada are exceptional — retired airline professionals who know the industry inside out. I was placed before my graduation even ended!',
    rating: 5,
    avatar: 'RV',
  },
  {
    name: 'Anjali Singh',
    role: 'Airport Operations, SpiceJet',
    batch: 'Batch 2023',
    text: 'Best decision of my life. The airport visits, simulator training, and grooming sessions made me industry-ready. The placement team worked tirelessly for us.',
    rating: 5,
    avatar: 'AS',
  },
  {
    name: 'Arjun Mehta',
    role: 'Flight Operations, Vistara',
    batch: 'Batch 2021',
    text: 'From a small town background, I always dreamed of working in aviation. Aharada made that dream a reality with their comprehensive program and dedicated support.',
    rating: 5,
    avatar: 'AM',
  },
]

const journeySteps = [
  { step: '01', title: 'Apply Online', desc: 'Fill out a simple enquiry form. Our counsellor will call you within 24 hours for a free consultation.', icon: <FiTarget size={28} /> },
  { step: '02', title: 'Counselling Session', desc: 'One-on-one session to understand your goals, interests, and help you choose the right program.', icon: <FiUsers size={28} /> },
  { step: '03', title: 'Enrolment & Induction', desc: 'Complete your admission, receive your kit, and join our vibrant orientation program.', icon: <HiAcademicCap size={28} /> },
  { step: '04', title: 'Industry Training', desc: 'Attend classroom sessions, airport visits, simulator training, and live industry projects.', icon: <FiNavigation size={28} /> },
  { step: '05', title: 'Placement Drive', desc: 'Get placed with our 200+ airline partners through our dedicated placement cell.', icon: <FiBriefcase size={28} /> },
]

const categoryIcons = {
  aviation: <FiNavigation size={24} />,
  engineering: <FiCpu size={24} />,
  science: <FiTrendingUp size={24} />,
  management: <FiBriefcase size={24} />,
  entrepreneurship: <FiTarget size={24} />,
  technology: <FiLayers size={24} />,
  arts: <FiBookOpen size={24} />,
}

function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const num = parseInt(target.replace(/\D/g, ''))
    const step = Math.ceil(num / (duration / 16))
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= num) { current = num; clearInterval(timer) }
      setCount(current)
    }, 16)
    return () => clearInterval(timer)
  }, [started, target, duration])

  return { count, ref }
}

function StatCard({ icon, value, label, index }) {
  const { count, ref } = useCounter(value)
  const suffix = value.replace(/[0-9]/g, '')
  return (
    <motion.div
      className="stat-card"
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  )
}

export default function Home() {
  const [programs, setPrograms] = useState([])
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    document.title = 'Aharada Education | Educate . Empower . Excel'
    getPrograms().then(res => setPrograms(res.data.data)).catch(() => { })
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="home-page">
      {/* =================== HERO SECTION =================== */}
      <section className="hero" id="hero-section">
        <div className="hero-bg">
          <div className="hero-circles">
            <div className="hero-circle c1" />
            <div className="hero-circle c2" />
            <div className="hero-circle c3" />
          </div>
          <div className="hero-grid-overlay" />
          <div className="hero-gradient" />
        </div>

        <div className="container hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <FiNavigation size={14} /> India's Premier Multi-Discipline Education Platform
            </motion.span>
            <h1 className="hero-title">
              Get Your Wings<br />
              <span className="hero-title-accent">to Fly</span>
            </h1>
            <p className="hero-subtitle">
              Empowering future aviators, aerospace engineers, and business leaders through
              industry-integrated programs across top partner universities.
            </p>
            <motion.p
              className="hero-tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Educate . Empower . Excel
            </motion.p>
            <div className="hero-buttons">
              <Link to="/admissions" className="btn btn-gold btn-lg" id="hero-apply-btn">
                Apply Now <FiArrowRight />
              </Link>
              <Link to="/programs" className="btn btn-secondary btn-lg" id="hero-explore-btn">
                Explore Programs
              </Link>
              <BrochureButton page="home" className="btn-lg" />
            </div>

            {/* Trust badges */}
            <div className="hero-trust-badges">
              <div className="trust-badge"><FiShield size={14} /> NAAC Accredited</div>
              <div className="trust-badge"><FiZap size={14} /> 100% Placement</div>
              <div className="trust-badge"><FiHeart size={14} /> 1000+ Alumni</div>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual hero-apply-form-panel"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <ApplyNowSection heroMode />
          </motion.div>        </div>

        <motion.div
          className="hero-scroll-indicator"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="scroll-mouse">
            <div className="scroll-wheel" />
          </div>
        </motion.div>
      </section>

      {/* =================== STATS SECTION =================== */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* =================== AIRLINE PARTNERS STRIP =================== */}
      <section className="partners-strip" id="partners-section">
        <div className="container">
          <p className="partners-strip-label">Our Students Are Placed At India's Leading Airlines & Airports</p>
          <div className="partners-marquee-wrapper">
            <div className="partners-marquee">
              {[...companyPartners, ...companyPartners].map((company, i) => (
                <div key={i} style={{
                  background: 'var(--white)',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '180px',
                  height: '80px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <img
                    src={company.logo}
                    alt={company.name}
                    style={{ height: '56px', width: 'auto', maxWidth: '160px', objectFit: 'contain' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =================== UNIVERSITY PARTNERS =================== */}
      <section className="section universities-section" id="universities-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header-center"
          >
            <div className="section-label"><FiAward className="label-icon" /> Partner Universities</div>
            <h2 className="section-title">Our University Network</h2>
            <p className="section-subtitle">
              Aharada Education partners with distinguished NAAC 'A' accredited and UGC-recognized universities
              to deliver industry-embedded degree programs with world-class aviation training.
            </p>
          </motion.div>

          {/* Institutional Trust Assurances (Pure SVG Icons, NO Emojis) */}
          <div className="uni-trust-strip">
            <div className="uni-trust-card">
              <div className="uni-trust-icon-box">
                <FiShield size={20} />
              </div>
              <div className="uni-trust-info">
                <h4>UGC & Govt. Recognized</h4>
                <p>Formal degrees valid globally across aviation & corporate sectors</p>
              </div>
            </div>
            <div className="uni-trust-card">
              <div className="uni-trust-icon-box">
                <FiAward size={20} />
              </div>
              <div className="uni-trust-info">
                <h4>NAAC 'A' Grade Quality</h4>
                <p>High academic standards, robust research & verified institutional excellence</p>
              </div>
            </div>
            <div className="uni-trust-card">
              <div className="uni-trust-icon-box">
                <FiNavigation size={20} />
              </div>
              <div className="uni-trust-info">
                <h4>Aviation Simulator Labs</h4>
                <p>Practical airport ground handling & flight operations simulation</p>
              </div>
            </div>
            <div className="uni-trust-card">
              <div className="uni-trust-icon-box">
                <FiBriefcase size={20} />
              </div>
              <div className="uni-trust-info">
                <h4>100% Placement Pathway</h4>
                <p>Direct recruitment drives with IndiGo, Air India, SpiceJet & Vistara</p>
              </div>
            </div>
          </div>

          {/* Balanced 2-Column Flagship University Cards */}
          <div className="uni-dual-grid">
            {universities.map((uni, i) => {
              const programCount = programs.length > 0
                ? programs.filter(p => {
                    if (!p.universities) return false;
                    return p.universities.some(u => {
                      const uName = typeof u === 'object' && u !== null ? (u.name || u.slug || '') : String(u || '');
                      return uName.toLowerCase().includes(uni.slug.toLowerCase()) ||
                             uName.toLowerCase().includes(uni.name.split(' ')[0].toLowerCase());
                    });
                  }).length || uni.defaultPrograms
                : uni.defaultPrograms;

              return (
                <motion.div
                  key={uni.slug}
                  className="uni-flagship-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, type: 'spring', stiffness: 90 }}
                  whileHover={{ y: -6 }}
                >
                  {/* Top Status Badges */}
                  <div className="uni-card-top-bar">
                    <span className="uni-badge-partner">
                      <HiAcademicCap className="uni-pill-icon" /> {uni.partnerType}
                    </span>
                    <span className="uni-badge-accredit">
                      <FiAward className="uni-pill-icon gold" /> {uni.accreditation}
                    </span>
                  </div>

                  {/* Brand Display */}
                  <div className="uni-card-brand">
                    <div className="uni-brand-logo-frame">
                      <img src={uni.logo} alt={uni.name} className="uni-brand-logo-img" />
                    </div>
                    <div className="uni-brand-headings">
                      <h3 className="uni-card-title">{uni.name}</h3>
                      <p className="uni-card-tagline">{uni.tagline}</p>
                      <div className="uni-card-meta-row">
                        <span className="uni-meta-chip">
                          <FiMapPin size={12} /> {uni.location}
                        </span>
                        <span className="uni-meta-chip">
                          <FiClock size={12} /> Est. {uni.established}
                        </span>
                        <span className="uni-meta-chip">
                          <HiOutlineOfficeBuilding size={12} /> {uni.campusSize}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Partnership Narrative */}
                  <p className="uni-card-desc">{uni.description}</p>

                  {/* Highlights Grid (Clean SVG checkmarks, NO emojis) */}
                  <div className="uni-card-features">
                    <h5 className="uni-features-heading">Institutional & Campus Highlights</h5>
                    <div className="uni-features-list">
                      {uni.highlights.map((item, idx) => (
                        <div key={idx} className="uni-feature-item">
                          <FiCheckCircle className="uni-feature-icon" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Featured Program Specialization Chips */}
                  <div className="uni-tracks-section">
                    <span className="uni-tracks-label">Featured Programs:</span>
                    <div className="uni-tracks-chips">
                      {uni.popularPrograms.map((prog, idx) => (
                        <span key={idx} className="uni-track-chip">{prog}</span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom: Metric & Action Buttons */}
                  <div className="uni-card-bottom">
                    <div className="uni-metric-badge">
                      <span className="uni-metric-num">{programCount}</span>
                      <div className="uni-metric-label">
                        <strong>Programs Available</strong>
                        <span>Degree & Diploma Tracks</span>
                      </div>
                    </div>

                    <div className="uni-card-ctas">
                      <Link to={`/programs?uni=${uni.slug}`} className="btn-uni-primary">
                        View Programs <FiArrowRight size={14} className="btn-arrow" />
                      </Link>
                      <Link to="/admissions" className="btn-uni-secondary">
                        Admission Enquiry
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Guidance & Selection Banner (NO emojis) */}
          <motion.div
            className="uni-counselling-banner"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="uni-counselling-left">
              <div className="uni-counselling-icon-wrap">
                <FiLayers size={24} />
              </div>
              <div>
                <h4 className="uni-counselling-title">Need Guidance Selecting the Right Partner University?</h4>
                <p className="uni-counselling-desc">
                  Our senior counsellors provide personalized 1-on-1 guidance to help you compare program options, eligibility criteria, and campus facilities.
                </p>
              </div>
            </div>
            <div className="uni-counselling-right">
              <Link to="/admissions" className="btn btn-gold btn-sm">
                Speak with a Counsellor <FiArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =================== CAMPUS LIFE GALLERY =================== */}
      <section className="section campus-section" id="campus-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header-center"
          >
            <div className="section-label"><FiUsers className="label-icon" /> Campus Life</div>
            <h2 className="section-title">Experience Aharada</h2>
            <p className="section-subtitle">
              Join a vibrant community of future leaders. State-of-the-art facilities,
              diverse student groups, and real-world industry exposure.
            </p>
          </motion.div>

          <div className="campus-gallery-grid">
            <motion.div
              className="campus-gallery-main"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.01 }}
            >
              <img src={campusIsro} alt="Students at U.R. Rao Satellite Centre" />
              <div className="campus-img-caption">
                <FiNavigation size={18} />
                <div>
                  <strong>Real Airport Exposure</strong>
                  <span>Live industry training at major airports</span>
                </div>
              </div>
            </motion.div>

            <div className="campus-gallery-side">
              <motion.div
                className="campus-gallery-item"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.02 }}
              >
                <img src={campusGroupStudy} alt="Students in Classroom" />
                <div className="campus-img-caption">
                   <FiBookOpen size={16} />
                   <div>
                     <strong>Interactive Classrooms</strong>
                     <span>Engaging sessions &amp; live presentations</span>
                   </div>
                 </div>
              </motion.div>

              <motion.div
                className="campus-gallery-item"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <img src={campusClassroom} alt="Students Group Study" />
                <div className="campus-img-caption">
                   <FiUsers size={16} />
                   <div>
                     <strong>Collaborative Learning</strong>
                     <span>Group projects &amp; industry mentorship</span>
                   </div>
                 </div>
              </motion.div>
            </div>
          </div>

          {/* Campus stats bar */}
          <div className="campus-stats-bar">
            {[
              { val: '12+', label: 'Labs & Simulators' },
              { val: '5', label: 'Campus Locations' },
              { val: '300+', label: 'Events Per Year' },
              { val: '98%', label: 'Student Satisfaction' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="campus-stat-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="campus-stat-val">{item.val}</span>
                <span className="campus-stat-label">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== PROGRAMS PREVIEW =================== */}
      <section className="section programs-section" id="programs-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header-center"
          >
            <div className="section-label"><FiBookOpen className="label-icon" /> Our Programs</div>
            <h2 className="section-title">Industry-Integrated Academic Programs</h2>
            <p className="section-subtitle">
              Chart your career path with our specialized programs in aviation, aerospace,
              management, technology, and creative arts.
            </p>
          </motion.div>

          <div className="programs-grid">
            {programs.slice(0, 6).map((program, i) => (
              <motion.div
                key={program._id}
                className="program-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 80 }}
                whileHover={{ y: -10 }}
              >
                <div className="program-icon">
                  {categoryIcons[program.category] || <FiBookOpen size={24} />}
                </div>
                <h3 className="program-title">{program.title}</h3>
                <p className="program-desc">{program.shortDescription}</p>
                <div className="program-meta">
                  <span className="program-duration"><FiTarget size={13} /> {program.duration}</span>
                </div>
                {program.universities && program.universities.length > 0 && (
                  <div className="program-unis">
                    {program.universities.map((u, j) => (
                      <span key={j} className="uni-tag">{u.name}</span>
                    ))}
                  </div>
                )}
                <div className="program-highlights">
                  {program.highlights?.slice(0, 3).map((h, j) => (
                    <span key={j} className="highlight-tag">
                      <FiCheckCircle size={11} /> {h}
                    </span>
                  ))}
                </div>
                <Link to={`/programs/${program.slug}`} className="btn btn-outline btn-sm program-link">
                  Learn More <FiArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>

          {programs.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <Link to="/programs" className="btn btn-primary btn-lg" id="view-all-programs-btn">
                View All {programs.length} Programs <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =================== ADMISSION JOURNEY =================== */}
      <section className="section journey-section" id="journey-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header-center"
          >
            <div className="section-label"><FiChevronRight className="label-icon" /> How It Works</div>
            <h2 className="section-title">Your Journey to Success</h2>
            <p className="section-subtitle">
              From enquiry to placement — we guide you every step of the way with
              dedicated counsellors and industry mentors.
            </p>
          </motion.div>

          <div className="journey-steps">
            {journeySteps.map((step, i) => (
              <motion.div
                key={i}
                className="journey-step"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <div className="journey-step-number">{step.step}</div>
                <div className="journey-step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < journeySteps.length - 1 && <div className="journey-connector" />}
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <Link to="/admissions" className="btn btn-gold btn-lg" id="journey-apply-btn">
              Start Your Journey <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* =================== WHY CHOOSE US =================== */}
      <section className="section why-section" id="why-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header-center"
          >
            <div className="section-label"><FiAward className="label-icon" /> Why Aharada</div>
            <h2 className="section-title">Why Choose Aharada Education?</h2>
            <p className="section-subtitle">
              We don't just teach — we prepare you for the real world with hands-on experience,
              industry mentorship, and career-focused outcomes.
            </p>
          </motion.div>

          <div className="why-grid">
            {whyChoose.map((item, i) => (
              <motion.div
                key={i}
                className="why-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 80 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="why-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== TESTIMONIALS =================== */}
      <section className="section testimonials-section" id="testimonials-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header-center"
          >
            <div className="section-label"><FiStar className="label-icon" /> Student Stories</div>
            <h2 className="section-title">What Our Students Say</h2>
            <p className="section-subtitle">
              Real stories from students who transformed their careers with Aharada Education.
            </p>
          </motion.div>

          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className={`testimonial-card ${activeTestimonial === i ? 'active' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setActiveTestimonial(i)}
              >
                <div className="testimonial-stars">
                  {[...Array(t.rating)].map((_, j) => (
                    <FiStar key={j} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.avatar}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                    <span className="testimonial-batch">{t.batch}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="testimonial-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`testimonial-dot ${activeTestimonial === i ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(i)}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =================== COMPANY PLACEMENT PARTNERS =================== */}
      <section className="section placement-section" id="placement-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header-center"
          >
            <div className="section-label"><FiBriefcase className="label-icon" /> Placement Partners</div>
            <h2 className="section-title">Our Hiring Partners</h2>
            <p className="section-subtitle">
              We have strong placement tie-ups with India's leading airlines, airports,
              and aviation service companies — ensuring 100% placement for our graduates.
            </p>
          </motion.div>

          <div className="company-logos-grid">
            {companyPartners.map((company, i) => (
              <motion.div
                key={i}
                className="company-logo-card"
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
              >
                <div className="company-logo-icon" style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', padding: '0', overflow: 'hidden' }}>
                  <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                </div>
                <span className="company-logo-name">{company.name}</span>
                <span className="company-logo-tag">Hiring Partner</span>
              </motion.div>
            ))}
          </div>

          <div className="placement-guarantee-banner">
            <FiShield size={28} />
            <div>
              <strong>100% Placement Guarantee</strong>
              <span>We work with 200+ companies to ensure every graduate gets placed</span>
            </div>
            <Link to="/admissions" className="btn btn-gold btn-sm" id="guarantee-apply-btn">
              Enrol Now <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* =================== CTA SECTION =================== */}
      <section className="cta-section" id="cta-section">
        <div className="container cta-content">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 60 }}
          >
            <div className="cta-badge"><FiNavigation size={16} /> Admissions Open 2026-2027</div>
            <h2 className="cta-title">Ready to Soar Higher?</h2>
            <p className="cta-text">
              Take the first step towards an extraordinary career in aviation,
              aerospace, or entrepreneurship. Limited seats available across all partner universities.
            </p>
            <div className="cta-contact-row">
              <a href="tel:+919259870433" className="cta-contact-link">
                <FiPhone size={16} /> +91 92598 70433
              </a>
              <a href="mailto:info@aharadaedu.in" className="cta-contact-link">
                <FiMail size={16} /> info@aharadaedu.in
              </a>
            </div>
            <div className="cta-buttons">
              <Link to="/admissions" className="btn btn-gold btn-lg" id="cta-apply-btn">
                Start Your Journey <FiArrowRight />
              </Link>
              <BrochureButton page="home" className="btn-lg" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
