import { Link } from 'react-router-dom'
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi'
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa'
import aeLogoWhite from '../assets/ae-logo-white.png'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="var(--navy)"/>
        </svg>
      </div>

      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand-col">
              <Link to="/" className="footer-brand">
                <img
                  src={aeLogoWhite}
                  alt="Aharada Education"
                  style={{
                    height: '160px',
                    width: 'auto',
                    maxWidth: '320px',
                    objectFit: 'contain',
                    objectPosition: 'left center',
                    display: 'block',
                  }}
                />
              </Link>
              <p className="footer-desc">
                Empowering the next generation of aviation professionals, aerospace engineers, and innovative entrepreneurs through industry-integrated education across partner universities.
              </p>
              <p className="footer-tagline-text">Educate . Empower . Excel</p>
              <div className="footer-socials">
                <a href="#" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                <a href="https://www.instagram.com/aharadaeducation?igsh=dDRhNzd5dTAyY2tk" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                <a href="https://www.linkedin.com/company/aharadaeducation/" className="social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
              </div>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Our Programs</h4>
              <ul className="footer-links">
                <li><Link to="/programs">BBA Aviation & Airport Management</Link></li>
                <li><Link to="/programs">B.Tech Aerospace Engineering</Link></li>
                <li><Link to="/programs">MBA (HR & Aviation)</Link></li>
                <li><Link to="/programs">MBA Data Analytics & Artificial Intelligence</Link></li>
                <li><Link to="/programs">B.Sc Aeronautical Science</Link></li>
                <li><Link to="/programs">BBA Entrepreneurship & Innovation</Link></li>
                <li><Link to="/programs">Bachelor in Fashion Design</Link></li>
                <li><Link to="/programs">Bachelor in Fine Arts</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/admissions">Admission Enquiry</Link></li>
                <li><Link to="/faculty">Our Faculty</Link></li>
                <li><Link to="/events">Events</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
              <h4 className="footer-heading" style={{ marginTop: '24px' }}>Partner Universities</h4>
              <ul className="footer-links">
                <li><span>IIMT University</span></li>
                <li><span>Future University</span></li>
                <li><span>Subharti University</span></li>
                <li><span>Sage University</span></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Contact Info</h4>
              <ul className="footer-contact">
                <li>
                  <FiMapPin className="contact-icon" />
                  <span>Aharada Education Campus, Atrara, Hapur, India 245206</span>
                </li>
                <li>
                  <FiPhone className="contact-icon" />
                  <a href="tel:+919259870433">+91 92598 70433</a>
                </li>
                <li>
                  <FiMail className="contact-icon" />
                  <a href="mailto:info@aharadaedu.in">info@aharadaedu.in</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>&copy; {new Date().getFullYear()} Aharada Education. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
