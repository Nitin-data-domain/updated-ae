import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiAward, FiBook, FiBriefcase, FiUsers } from 'react-icons/fi'
import { getFaculty } from '../api'
import BrochureButton from '../components/BrochureButton'
import './Faculty.css'

export default function Faculty() {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Faculty | Aharada Education'
    getFaculty()
      .then(res => setFaculty(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>
  }

  return (
    <div className="faculty-page">
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container page-hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="hero-badge-page"><FiUsers size={14} /> Our Team</span>
            <h1 className="page-hero-title">Expert Faculty</h1>
            <p className="page-hero-subtitle">
              Learn from industry veterans, retired airline captains, aerospace scientists, 
              and seasoned business professionals.
            </p>
            <BrochureButton page="faculty" />
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="faculty-grid">
            {faculty.map((member, i) => (
              <motion.div
                key={member._id}
                className="faculty-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="faculty-avatar">
                  {member.image ? (
                    <img src={member.image} alt={member.name} />
                  ) : (
                    <div className="faculty-avatar-placeholder">
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="faculty-info">
                  <h3 className="faculty-name">{member.name}</h3>
                  <p className="faculty-designation">{member.designation}</p>
                  
                  <div className="faculty-details">
                    <div className="faculty-detail">
                      <FiAward className="detail-icon" />
                      <span>{member.qualification}</span>
                    </div>
                    <div className="faculty-detail">
                      <FiBriefcase className="detail-icon" />
                      <span>{member.experience}</span>
                    </div>
                    {member.specialization && (
                      <div className="faculty-detail">
                        <FiBook className="detail-icon" />
                        <span>{member.specialization}</span>
                      </div>
                    )}
                  </div>

                  {member.bio && (
                    <p className="faculty-bio">{member.bio}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
