import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiArrowRight } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { submitEnquiry } from '../api'
import BrochureButton from '../components/BrochureButton'
import './Contact.css'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', program: 'General Inquiry', message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields')
      return
    }
    setSubmitting(true)
    try {
      await submitEnquiry({ ...formData, type: 'enquiry' })
      toast.success('Message sent! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', phone: '', program: 'General Inquiry', message: '' })
    } catch {
      toast.error('Failed to send. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  document.title = 'Contact Us | Aharada Education'

  return (
    <div className="contact-page">
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container page-hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="hero-badge-page"><FiMapPin size={14} /> Get in Touch</span>
            <h1 className="page-hero-title">Contact Us</h1>
            <p className="page-hero-subtitle">
              Have questions? We'd love to hear from you. Reach out to our team.
            </p>
            <div className="hero-cta-row">
              <Link to="/admissions" className="btn btn-gold btn-lg" id="contact-apply-btn">
                Apply Now <FiArrowRight />
              </Link>
              <BrochureButton page="contact" className="btn-lg" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <motion.div
              className="contact-info-side"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2>Let's Connect</h2>
              <p className="contact-intro">
                Whether you're looking for admission information, campus tours, or have any questions, 
                our team is here to help.
              </p>

              <div className="contact-cards">
                <div className="contact-card">
                  <div className="contact-card-icon"><FiMapPin /></div>
                  <div>
                    <h4>Visit Us</h4>
                    <p>Aharada Education Campus,<br />Atrara, Hapur, India 245206</p>
                  </div>
                </div>
                <div className="contact-card">
                  <div className="contact-card-icon"><FiPhone /></div>
                  <div>
                    <h4>Call Us</h4>
                    <p><a href="tel:+919259870433">+91 92598 70433</a><br /><a href="tel:+918979136222">+91 89791 36222</a></p>
                  </div>
                </div>
                <div className="contact-card">
                  <div className="contact-card-icon"><FiMail /></div>
                  <div>
                    <h4>Email Us</h4>
                    <p><a href="mailto:info@aharadaedu.in">info@aharadaedu.in</a><br /><a href="mailto:admission@aharadaedu.in">admission@aharadaedu.in</a></p>
                  </div>
                </div>
                <div className="contact-card">
                  <div className="contact-card-icon"><FiClock /></div>
                  <div>
                    <h4>Office Hours</h4>
                    <p>Mon - Sat: 9:00 AM - 6:00 PM<br />Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <form className="contact-form" onSubmit={handleSubmit} id="contact-form">
                <h3>Send a Message</h3>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="form-input" placeholder="Your name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-input" placeholder="your@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input type="tel" className="form-input" placeholder="Phone number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-textarea" placeholder="Your message..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? 'Sending...' : <><FiSend /> Send Message</>}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Map */}
          <div className="contact-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3494.5!2d77.8031!3d28.8061!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDQ4JzIyLjBcIk4gNzfCsDQ4JzExLjBcIkU!5e0!3m2!1sen!2sin!4v1746000000000!5m2!1sen!2sin"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: 'var(--radius-xl)' }}
              allowFullScreen=""
              loading="lazy"
              title="Aharada Education Location - Atrara, Hapur"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
