import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiTarget, FiEye, FiAward, FiBookOpen, FiArrowRight } from 'react-icons/fi'
import BrochureButton from '../components/BrochureButton'
import './AboutUs.css'

export default function AboutUs() {
  useEffect(() => {
    document.title = 'About Us | Aharada Education'
  }, [])

  return (
    <div className="about-page">
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container page-hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="hero-badge-page"><FiBookOpen size={14} /> Our Story</span>
            <h1 className="page-hero-title">About Aharada Education</h1>
            <p className="page-hero-subtitle">
              Pioneering excellence in education and shaping the leaders of tomorrow through innovation and integrity.
            </p>
            <div className="hero-cta-row">
              <Link to="/admissions" className="btn btn-gold btn-lg" id="about-apply-btn">
                Apply Now <FiArrowRight />
              </Link>
              <BrochureButton page="general" className="btn-lg" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <div className="about-grid">
            <motion.div 
              className="about-content"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">About Aharada Education</h2>
              <p className="about-text">
                Welcome to Aharada Education. Aharada Education is a pioneer in providing high-quality education in fields like Aviation, Entrepreneurship, and Artificial Intelligence. With live training on real aircraft and innovative learning methods, we bridge the gap between theoretical knowledge and practical application.
              </p>
              <p className="about-text">
                Our mission is to empower students with cutting-edge skills and knowledge through our unique programs. Whether you're aspiring for a career in aviation, data analytics, or business innovation, Aharada Education offers a learning experience tailored to your goals.
              </p>
              <ul className="about-list" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', listStyle: 'none', paddingLeft: 0 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><FiTarget style={{ marginTop: '4px', color: 'var(--primary)', flexShrink: 0 }} /> <span style={{ color: 'var(--gray-800)', fontWeight: '500' }}>Live training with Fokker F27-500 aircraft and helicopters</span></li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><FiTarget style={{ marginTop: '4px', color: 'var(--primary)', flexShrink: 0 }} /> <span style={{ color: 'var(--gray-800)', fontWeight: '500' }}>Programs in Aviation, AI, and Innovation</span></li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><FiTarget style={{ marginTop: '4px', color: 'var(--primary)', flexShrink: 0 }} /> <span style={{ color: 'var(--gray-800)', fontWeight: '500' }}>Personalized mentoring for career success</span></li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="about-stats"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="stat-card">
                <h3>6+</h3>
                <p>Years of Excellence</p>
              </div>
              <div className="stat-card">
                <h3>50+</h3>
                <p>Industry Partners</p>
              </div>
              <div className="stat-card">
                <h3>100%</h3>
                <p>Placement Assistance</p>
              </div>
              <div className="stat-card">
                <h3>2.5k+</h3>
                <p>Alumni Network</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section bg-light" style={{paddingTop: 0}}>
        <div className="container">
          <motion.div 
            className="leadership-section text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ 
              background: 'var(--white)', 
              padding: '3rem', 
              borderRadius: '16px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              marginTop: '2rem'
            }}
          >
            <h2 className="section-title" style={{ textAlign: 'center' }}>Our Leadership</h2>
            <div className="founder-card" style={{ marginTop: '2rem' }}>
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                background: 'var(--navy, #012060)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2.5rem',
                fontWeight: 'bold'
              }}>
                CD
              </div>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--navy, #012060)' }}>Capt. Deepak Dhalla</h3>
              <p style={{ color: 'var(--gold, #D4AF37)', fontWeight: '600', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Managing Director (MD)</p>
              <p style={{ color: 'var(--gray-600, #4b5563)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                With decades of experience in the aviation sector, Capt. Deepak Dhalla leads Aharada Education with an innovative and visionary approach. Focused on narrowing the gap between conventional academic learning and dynamic industry requirements, his profound expertise and steadfast commitment to excellence continuously empower our students to chase and materialize their professional aspirations.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
            {/* Vision */}
            <motion.div 
              className="vm-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div className="vm-icon"><FiEye /></div>
              <h3>Our Vision</h3>
              <p>To empower individuals and institutions globally by fostering innovation, building character, and nurturing leadership through cutting-edge educational technologies, driving societal progress and assisting in making India a beacon of excellence.</p>
            </motion.div>
            
            {/* Mission */}
            <motion.div 
              className="vm-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div className="vm-icon"><FiTarget /></div>
              <h3>Our Mission</h3>
              <ul style={{ textAlign: 'left', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--gray-600)', paddingLeft: '0', listStyle: 'none' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><FiAward style={{ marginTop: '4px', color: 'var(--primary)', flexShrink: 0 }} /><span>To cultivate a culture of research, resilience, and entrepreneurship, guiding startups toward meaningful success.</span></li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><FiAward style={{ marginTop: '4px', color: 'var(--primary)', flexShrink: 0 }} /><span>To instill human values, communication skills, and professionalism, shaping global leaders of tomorrow.</span></li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><FiAward style={{ marginTop: '4px', color: 'var(--primary)', flexShrink: 0 }} /><span>To uphold diplomacy and stability in all endeavours, inspiring students to achieve personal and national pride.</span></li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><FiAward style={{ marginTop: '4px', color: 'var(--primary)', flexShrink: 0 }} /><span>To foster holistic development through innovative solutions that bridge tradition with modernity, ensuring a sustainable and Sacred foundation for lifelong learning.</span></li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><FiAward style={{ marginTop: '4px', color: 'var(--primary)', flexShrink: 0 }} /><span>To integrate modern technologies like AI and advanced software to deliver transformative education tailored to diverse learners.</span></li>
              </ul>
            </motion.div>
          </div>

          {/* Core Values */}
          <div className="core-values-section">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-header-center"
              style={{ marginBottom: '3rem', textAlign: 'center' }}
            >
              <div className="section-label" style={{ justifyContent: 'center' }}><FiAward className="label-icon" /> Principles</div>
              <h2 className="section-title">Our Core Values</h2>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {[
                { title: 'SACRED', icon: <FiAward />, desc: 'To integrate modern technologies like AI and advanced software to deliver transformative education tailored to diverse learners.' },
                { title: 'Character Building', icon: <FiBookOpen />, desc: 'Embedding human values and ethics in every learner.' },
                { title: 'Communication Excellence', icon: <FiTarget />, desc: 'Equipping learners with skills to express, connect, and inspire.' },
                { title: 'Professionalism & Stability', icon: <FiAward />, desc: 'Ensuring consistent quality and growth in all initiatives.' },
                { title: 'Research & Innovation', icon: <FiEye />, desc: 'Pioneering solutions and strategies to address emerging educational challenges.' },
                { title: 'Leadership Development', icon: <FiBookOpen />, desc: 'Preparing students to lead with empathy, professionalism, and confidence.' },
                { title: 'Pride in India', icon: <FiTarget />, desc: 'Advancing education to make India a global leader in knowledge and innovation.' },
              ].map((val, i) => (
                <motion.div
                  key={i}
                  className="value-item"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  style={{ background: 'var(--white)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--primary)' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                    {val.icon}
                  </div>
                  <h4 style={{ fontSize: '1.25rem', color: 'var(--navy)' }}>{val.title}</h4>
                  <p style={{ color: 'var(--gray-600)', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{val.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
