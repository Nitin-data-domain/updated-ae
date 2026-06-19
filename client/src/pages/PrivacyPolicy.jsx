import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiShield, FiChevronRight, FiMail, FiPhone, FiMapPin, FiEye, FiEdit3, FiTrash2 } from 'react-icons/fi'
import './PrivacyPolicy.css'

const sections = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'aim', title: '2. Aim' },
  { id: 'purpose', title: '3. Purpose and Scope' },
  { id: 'information', title: '4. Information We Collect' },
  { id: 'usage', title: '5. How We Use Your Information' },
  { id: 'sharing', title: '6. Sharing and Disclosure of Data' },
  { id: 'security', title: '7. Data Security and Retention' },
  { id: 'rights', title: '8. Your Rights as a Data Subject' },
  { id: 'cookies', title: '9. Cookies and Tracking Technologies' },
  { id: 'updates', title: '10. Updates to this Policy' },
  { id: 'contact', title: '11. Contact and Grievance Officer' },
]

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.title = 'Privacy Policy | Aharada Education'
  }, [])

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = 100
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="pp-page">
      {/* ── Hero ── */}
      <section className="pp-hero">
        <div className="pp-hero-bg" aria-hidden="true">
          <div className="pp-hero-gradient" />
          <div className="pp-hero-particles">
            {[...Array(18)].map((_, i) => (
              <span key={i} className="pp-particle" style={{ '--d': i }} />
            ))}
          </div>
        </div>
        <div className="container pp-hero-content">
          <div className="pp-hero-badge">
            <FiShield />
            <span>Data Protection &amp; Privacy</span>
          </div>
          <h1 className="pp-hero-title">Privacy Policy</h1>
          <p className="pp-hero-sub">
            Last Updated: <strong>June 2025</strong>
          </p>
          <p className="pp-hero-desc">
            Aharada Education is committed to the absolute security, lawful processing, and responsible
            management of your personal data. This policy explains how we collect, use, and protect
            your information.
          </p>
          {/* Breadcrumb */}
          <nav className="pp-breadcrumb" aria-label="breadcrumb">
            <Link to="/">Home</Link>
            <FiChevronRight />
            <span>Privacy Policy</span>
          </nav>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="pp-body section">
        <div className="container pp-layout">

          {/* Sticky sidebar / TOC */}
          <aside className="pp-sidebar">
            <div className="pp-toc-card">
              <div className="pp-toc-card-header">
                <h3 className="pp-toc-title">
                  <FiShield />
                  Table of Contents
                </h3>
              </div>
              <div className="pp-toc-body">
                <ul className="pp-toc-list">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <button
                        className="pp-toc-btn"
                        onClick={() => scrollToSection(s.id)}
                        aria-label={`Go to ${s.title}`}
                      >
                        <FiChevronRight className="pp-toc-arrow" />
                        {s.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="pp-content">

            {/* 1 Introduction */}
            <article className="pp-section-block" id="introduction">
              <div className="pp-section-header">
                <span className="pp-section-num">01</span>
                <h2 className="pp-section-heading">Introduction</h2>
              </div>
              <p>
                Aharada Education (together with its subsidiaries, partnerships, and international
                affiliates, hereinafter <em>"Aharada Education," "us," "we," "our,"</em> or
                <em>"the Company"</em>) is committed to the absolute security, lawful processing,
                and management of personal data. To function effectively and deliver our
                multi-university aviation, engineering, and management programs, it is essential
                that the privacy of our stakeholders, prospective applicants, students, and
                community members is robustly protected. Therefore, we have implemented this
                comprehensive Privacy Policy (hereinafter referred to as the <em>"Policy"</em>).
              </p>
            </article>

            {/* 2 Aim */}
            <article className="pp-section-block" id="aim">
              <div className="pp-section-header">
                <span className="pp-section-num">02</span>
                <h2 className="pp-section-heading">Aim</h2>
              </div>
              <p>
                This Policy aims to protect the personal data of the various stakeholders connected
                to our organization. It is designed to provide individuals clear notice of the core
                principles by which the Company collects, processes, stores, and transfers the
                personal data of individuals (<em>"Personal Data"</em>) who visit, interact with,
                apply through, or transact via our online interfaces and physical registration
                setups.
              </p>
            </article>

            {/* 3 Purpose & Scope */}
            <article className="pp-section-block" id="purpose">
              <div className="pp-section-header">
                <span className="pp-section-num">03</span>
                <h2 className="pp-section-heading">Purpose and Scope</h2>
              </div>
              <p>
                The purpose of this Policy is to outline how Aharada Education collects, uses, and
                shares information about you through our online interfaces (including but not limited
                to{' '}
                <a
                  href="https://www.aharadaedu.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pp-link"
                >
                  https://www.aharadaedu.com/
                </a>{' '}
                and related subdomains, hereinafter referred to as the <em>"Website"</em>). This
                Policy also details how we safeguard your data, execute data transfers with our
                partner universities (such as IIMT University, Future University, Subharti
                University, and SAGE University), and handle processing requests from data subjects.
              </p>
              <p>
                This Policy applies to all systems, personnel, and processes that constitute the
                organization's information architecture, including board members, directors,
                employees, academic faculty, counselors, and third-party vendors who have authorized
                access to Personal Data managed by Aharada Education.
              </p>
            </article>

            {/* 4 Information We Collect */}
            <article className="pp-section-block" id="information">
              <div className="pp-section-header">
                <span className="pp-section-num">04</span>
                <h2 className="pp-section-heading">Information We Collect</h2>
              </div>
              <p>
                We collect information when you register for an account, apply for a course, request
                counseling, interact with our admissions team, or browse our Website. The types of
                data collected include:
              </p>
              <ul className="pp-data-list">
                <li>
                  <strong>Identifiable Personal Information:</strong> Full name, date of birth,
                  gender, photograph, and nationality.
                </li>
                <li>
                  <strong>Contact Information:</strong> Email address, mobile number, permanent
                  address, and current location.
                </li>
                <li>
                  <strong>Academic and Professional Background:</strong> Class 10th and 12th marks,
                  diploma or graduation transcripts, entrance exam scores (e.g., JEE Main or state
                  equivalents), and prior work experience.
                </li>
                <li>
                  <strong>Financial and Billing Data:</strong> Payment details, billing addresses,
                  transaction history, or banking information provided during application and fee
                  remittance.
                </li>
                <li>
                  <strong>Technical and Usage Data:</strong> IP address, browser type, device
                  information, operating system, and tracking data collected through cookies or
                  pixel tags.
                </li>
              </ul>
            </article>

            {/* 5 How We Use */}
            <article className="pp-section-block" id="usage">
              <div className="pp-section-header">
                <span className="pp-section-num">05</span>
                <h2 className="pp-section-heading">How We Use Your Information</h2>
              </div>
              <p>
                Aharada Education processes your Personal Data for specific, legally compliant, and
                legitimate institutional purposes, which include:
              </p>
              <ul className="pp-data-list">
                <li>
                  <strong>Admissions and Academic Processing:</strong> Reviewing application
                  criteria, verifying documentation, and processing enrollments with our accredited
                  university partners.
                </li>
                <li>
                  <strong>Educational Delivery:</strong> Facilitating offline and online learning
                  modules, flight simulation tracking, airport visits, and defense/aerospace
                  research collaborations.
                </li>
                <li>
                  <strong>Career Services &amp; Placements:</strong> Sharing academic profiles with
                  corporate partners, aviation companies, MRO organizations, and airlines for
                  placement assistance and internship drives.
                </li>
                <li>
                  <strong>Communications:</strong> Sending programmatic updates, fee reminders,
                  schedules, and promotional materials related to upcoming batches or scholarship
                  test timelines.
                </li>
                <li>
                  <strong>System Improvements:</strong> Monitoring web traffic metrics, debugging
                  infrastructure errors, and enhancing user interface experiences.
                </li>
              </ul>
            </article>

            {/* 6 Sharing */}
            <article className="pp-section-block" id="sharing">
              <div className="pp-section-header">
                <span className="pp-section-num">06</span>
                <h2 className="pp-section-heading">Sharing and Disclosure of Data</h2>
              </div>
              <p>
                We do not sell your personal information to third parties. However, your data may be
                shared under strict confidentiality agreements in the following scenarios:
              </p>
              <ul className="pp-data-list">
                <li>
                  <strong>University Partners:</strong> Since Aharada Education designs and powers
                  industry-integrated curriculums in partnership with state and central recognized
                  universities, student data is natively shared with the designated awarding
                  institution for formal registration, examinations, and degree processing.
                </li>
                <li>
                  <strong>Service Providers:</strong> We share necessary data with trusted IT
                  vendors, cloud storage infrastructure providers, payment gateways, and automated
                  admissions/CRM software providers.
                </li>
                <li>
                  <strong>Corporate Recruitment Partners:</strong> Student resumes and placement
                  profiles are shared with aviation, tech, and aerospace recruiters to assist with
                  100% placement assistance protocols.
                </li>
                <li>
                  <strong>Legal &amp; Regulatory Authorities:</strong> We will disclose data if
                  mandated by law, government regulations, court orders, or to protect the legal
                  rights, safety, and property of Prabhu Drone Research and Development LLP.
                </li>
              </ul>
            </article>

            {/* 7 Security */}
            <article className="pp-section-block" id="security">
              <div className="pp-section-header">
                <span className="pp-section-num">07</span>
                <h2 className="pp-section-heading">Data Security and Retention</h2>
              </div>
              <p>
                Aharada Education employs state-of-the-art administrative, technical, and physical
                security parameters to defend your Personal Data against unauthorized access, loss,
                or alteration. Financial transactions are processed via secure encryption standards.
              </p>
              <p>
                We retain your Personal Data only as long as necessary to fulfill the academic or
                operational purpose for which it was gathered, or as mandated by regulatory bodies
                governing educational data preservation in India.
              </p>
            </article>

            {/* 8 Rights */}
            <article className="pp-section-block" id="rights">
              <div className="pp-section-header">
                <span className="pp-section-num">08</span>
                <h2 className="pp-section-heading">Your Rights as a Data Subject</h2>
              </div>
              <p>
                Depending on your jurisdiction, you possess specific rights regarding your Personal
                Data, including:
              </p>
              <div className="pp-rights-grid">
                <div className="pp-right-card">
                  <div className="pp-right-icon"><FiEye /></div>
                  <h4>Right to Access</h4>
                  <p>
                    You can request a clear copy of the Personal Data we hold about you.
                  </p>
                </div>
                <div className="pp-right-card">
                  <div className="pp-right-icon"><FiEdit3 /></div>
                  <h4>Right to Correction</h4>
                  <p>
                    You may request updates or corrections to any inaccurate academic or personal
                    profile info.
                  </p>
                </div>
                <div className="pp-right-card">
                  <div className="pp-right-icon"><FiTrash2 /></div>
                  <h4>Right to Erasure / Opt-Out</h4>
                  <p>
                    You may request deletion of your online portal account or unsubscribe from
                    marketing communications at any time.{' '}
                    <em>
                      Note: Enrolled students' data required for legal academic registration cannot
                      be erased during the course of the academic program.
                    </em>
                  </p>
                </div>
              </div>
            </article>

            {/* 9 Cookies */}
            <article className="pp-section-block" id="cookies">
              <div className="pp-section-header">
                <span className="pp-section-num">09</span>
                <h2 className="pp-section-heading">Cookies and Tracking Technologies</h2>
              </div>
              <p>
                Our Website uses cookies and tracking technologies to understand site activity, save
                your program preferences, and tailor advertising. You can control cookie preferences
                directly through your individual web browser settings, though disabling them might
                affect certain functionalities of our online registration portals.
              </p>
            </article>

            {/* 10 Updates */}
            <article className="pp-section-block" id="updates">
              <div className="pp-section-header">
                <span className="pp-section-num">10</span>
                <h2 className="pp-section-heading">Updates to this Policy</h2>
              </div>
              <p>
                Aharada Education reserves the dynamic right to modify, adjust, or change this
                Privacy Policy at any time to align with changing technology, business practices, or
                statutory data compliance guidelines. The "Last Updated" timestamp at the top of
                this document will always indicate when the latest revisions took effect.
              </p>
            </article>

            {/* 11 Contact */}
            <article className="pp-section-block pp-contact-block" id="contact">
              <div className="pp-section-header">
                <span className="pp-section-num">11</span>
                <h2 className="pp-section-heading">Contact and Grievance Officer</h2>
              </div>
              <p>
                If you have any questions, clarifications, complaints, or wish to exercise your data
                subject rights regarding this Privacy Policy, please reach out directly to our
                Grievance Desk:
              </p>
              <div className="pp-contact-card">
                <div className="pp-contact-info">
                  <div className="pp-contact-row">
                    <span className="pp-contact-label">Entity Name</span>
                    <span className="pp-contact-value">
                      Aharada Education (Unit of Prabhu Drone Research and Development LLP)
                    </span>
                  </div>
                  <div className="pp-contact-row">
                    <FiMapPin className="pp-contact-icon" />
                    <span className="pp-contact-value">
                      Atrara, Hapur-Meerut Road, Uttar Pradesh, PIN: 245206, India
                    </span>
                  </div>
                  <div className="pp-contact-row">
                    <FiMail className="pp-contact-icon" />
                    <span className="pp-contact-value">
                      <a href="mailto:info@aharadaedu.in" className="pp-link">
                        info@aharadaedu.in
                      </a>
                    </span>
                  </div>
                  <div className="pp-contact-row">
                    <FiPhone className="pp-contact-icon" />
                    <span className="pp-contact-value">
                      <a href="tel:+919259870433" className="pp-link">
                        +91 92598 70433
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </article>

          </main>
        </div>
      </section>
    </div>
  )
}
