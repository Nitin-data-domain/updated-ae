import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { FiSend, FiCheck, FiCheckCircle } from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'
import { submitEnquiry, getPrograms } from '../api'
import './Admissions.css'

export default function Admissions() {
  const [allPrograms, setAllPrograms] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    university: '',
    program: '',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    document.title = 'Admission Enquiry | Aharada Education'
    getPrograms().then(res => setAllPrograms(res.data.data)).catch(() => {})
  }, [])

  // Derive unique universities from all programs in the DB (excluding Sage University)
  const universities = useMemo(() => {
    const uniSet = new Map()
    allPrograms.forEach(p => {
      (p.universities || []).forEach(u => {
        if (u.name && !uniSet.has(u.name) && u.name.toLowerCase() !== 'sage university') {
          uniSet.set(u.name, u.name)
        }
      })
    })
    return Array.from(uniSet.values())
  }, [allPrograms])

  // Filter programs that are offered at the selected university
  const filteredPrograms = useMemo(() => {
    if (!formData.university) return []
    return allPrograms.filter(p =>
      (p.universities || []).some(u => u.name === formData.university)
    )
  }, [allPrograms, formData.university])

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    else if (formData.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Enter valid 10+ digit phone'
    if (!formData.university) newErrors.university = 'Please select a university'
    if (!formData.program) newErrors.program = 'Please select a program'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await submitEnquiry({ ...formData, type: 'admission_lead' })
      toast.success('Enquiry submitted successfully! We will contact you soon.')
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', university: '', program: '', message: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    // Reset program if university changes
    if (name === 'university') {
      setFormData(prev => ({ ...prev, university: value, program: '' }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  return (
    <div className="admissions-page">
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container page-hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="hero-badge-page"><HiAcademicCap size={14} /> Admissions Open</span>
            <h1 className="page-hero-title">Start Your Journey</h1>
            <p className="page-hero-subtitle">Fill the enquiry form below and our admissions team will get in touch with you within 24 hours.</p>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="admission-grid">
            <motion.div
              className="admission-info"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2>Why Apply to Aharada Education?</h2>
              <div className="admission-benefits">
                {[
                  'Industry-integrated curriculum designed with aviation leaders',
                  '100% placement assistance with 200+ partner companies',
                  'Expert faculty including retired airline captains',
                  'Hands-on training at airports and aerospace facilities',
                  'Modern infrastructure with flight simulators',
                  'International collaboration and study tour options',
                  'Scholarship programs for deserving students',
                  'Dedicated career counseling and mentorship'
                ].map((item, i) => (
                  <div key={i} className="benefit-item">
                    <FiCheck className="benefit-check" /> {item}
                  </div>
                ))}
              </div>

              <div className="admission-timeline">
                <h3>Admission Process</h3>
                <div className="timeline">
                  {['Fill Enquiry Form', 'Counselling Session', 'Document Verification', 'Fee Payment', 'Enrollment Confirmed'].map((step, i) => (
                    <div key={i} className="timeline-step">
                      <div className="timeline-dot">{i + 1}</div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="admission-form-wrapper"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {submitted ? (
                <div className="form-success">
                  <div className="success-icon"><FiCheckCircle size={60} color="var(--primary)" /></div>
                  <h3>Enquiry Submitted!</h3>
                  <p>Thank you for your interest. Our admissions team will contact you within 24 hours.</p>
                  <button className="btn btn-navy" onClick={() => setSubmitted(false)}>
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                <form className="admission-form" onSubmit={handleSubmit} id="admission-form">
                  <h3>Admission Enquiry Form</h3>

                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`form-input ${errors.name ? 'input-error' : ''}`}
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && <div className="form-error">{errors.name}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-input ${errors.email ? 'input-error' : ''}`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="form-error">{errors.email}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`form-input ${errors.phone ? 'input-error' : ''}`}
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <div className="form-error">{errors.phone}</div>}
                  </div>

                  {/* Step 1: Select University */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="university">Preferred University *</label>
                    <select
                      id="university"
                      name="university"
                      className={`form-select ${errors.university ? 'input-error' : ''}`}
                      value={formData.university}
                      onChange={handleChange}
                    >
                      <option value="">Choose a university</option>
                      {universities.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    {errors.university && <div className="form-error">{errors.university}</div>}
                  </div>

                  {/* Step 2: Select Program (filtered by university) */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="program">
                      Select Program *
                      {formData.university && filteredPrograms.length > 0 && (
                        <span style={{ fontWeight: 400, color: 'var(--gray-500)', fontSize: '0.8rem', marginLeft: 6 }}>
                          ({filteredPrograms.length} available at {formData.university})
                        </span>
                      )}
                    </label>
                    <select
                      id="program"
                      name="program"
                      className={`form-select ${errors.program ? 'input-error' : ''}`}
                      value={formData.program}
                      onChange={handleChange}
                      disabled={!formData.university}
                    >
                      <option value="">
                        {formData.university
                          ? filteredPrograms.length === 0
                            ? 'No programs available for this university'
                            : 'Choose a program'
                          : 'Select a university first'}
                      </option>
                      {filteredPrograms.map(p => (
                        <option key={p._id} value={p.title}>{p.title}</option>
                      ))}
                    </select>
                    {errors.program && <div className="form-error">{errors.program}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="message">Message (Optional)</label>
                    <textarea
                      id="message"
                      name="message"
                      className="form-textarea"
                      placeholder="Any specific questions or requirements?"
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={submitting}
                    id="submit-enquiry-btn"
                    style={{ width: '100%' }}
                  >
                    {submitting ? 'Submitting...' : <><FiSend /> Submit Enquiry</>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
