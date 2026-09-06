import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiMessageSquare,
  FiSend,
  FiCheckCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiHash,
  FiBook,
  FiCalendar,
  FiLayers,
  FiStar,
  FiHelpCircle,
  FiAward,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { submitFeedback } from '../api'
import './StudentFeedback.css'

const categories = [
  { id: 'academics', label: 'Academics & Syllabus', icon: <FiBook /> },
  { id: 'faculty', label: 'Faculty & Mentorship', icon: <FiUser /> },
  { id: 'infrastructure', label: 'Labs & Campus', icon: <FiLayers /> },
  { id: 'placements', label: 'Internships & Placements', icon: <FiAward /> },
  { id: 'library', label: 'Library & Books', icon: <FiBook /> },
  { id: 'general', label: 'General Experience', icon: <FiMessageSquare /> },
]

const ratingDescriptions = {
  1: 'Poor — Needs urgent improvements',
  2: 'Fair — Below expectations',
  3: 'Good — Met standard expectations',
  4: 'Very Good — Satisfactory & well supported',
  5: 'Excellent — Outstanding experience & training',
}

const defaultCourses = [
  'BBA Aviation & Travel',
  'B.Tech Aerospace Engineering',
  'B.Sc Aeronautical Science',
  'MBA Aviation Management',
  'BBA Entrepreneurship & Innovation',
  'BBA Data Analytics & AI',
  'Bachelor in Fashion Design',
  'Bachelor in Fine Arts',
  'Other Program / Certification',
]

const academicYears = [
  '2023-2024',
  '2024-2025',
  '2025-2026',
  '2026-2027',
  '2027-2028',
  '2028-2029',
]

export default function StudentFeedback() {
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    enrollmentNo: '',
    courseName: 'BBA Aviation & Travel',
    academicYear: '2025-2026',
    category: 'academics',
    rating: 5,
    message: '',
  })

  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRating = (rate) => {
    setFormData((prev) => ({ ...prev, rating: rate }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.studentName.trim()) {
      toast.error('Please enter your full name')
      return
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email address')
      return
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      toast.error('Please provide a detailed feedback message (at least 10 characters)')
      return
    }

    setSubmitting(true)
    try {
      const res = await submitFeedback(formData)
      if (res.data?.success) {
        setSubmitted(true)
        toast.success('Your feedback has been submitted successfully!', {
          duration: 4000,
          icon: '✅',
        })
      } else {
        toast.error(res.data?.message || 'Failed to submit feedback')
      }
    } catch (err) {
      console.error('Feedback error:', err)
      toast.error(err.response?.data?.message || 'Server error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setFormData({
      studentName: '',
      email: '',
      phone: '',
      enrollmentNo: '',
      courseName: 'BBA Aviation & Travel',
      academicYear: '2025-2026',
      category: 'academics',
      rating: 5,
      message: '',
    })
  }

  return (
    <div className="feedback-page">
      {/* Hero Section */}
      <section className="feedback-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="feedback-hero-badge">
              <FiMessageSquare /> Student Grievance &amp; Academic Feedback Desk
            </div>
            <h1 className="feedback-hero-title">
              Student <span>Voice &amp; Feedback</span>
            </h1>
            <p className="feedback-hero-subtitle">
              Your feedback is essential to maintaining high academic standards, modern flight simulation training,
              and premier university support. Submissions are reviewed directly by the academic dean and administrative leadership.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="feedback-content-section">
        <div className="container feedback-container">
          <motion.div
            className="feedback-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {submitted ? (
              <div className="feedback-success-card">
                <div className="feedback-success-icon">
                  <FiCheckCircle />
                </div>
                <h2 className="feedback-success-title">Feedback Submitted!</h2>
                <p className="feedback-success-desc">
                  Thank you, <strong>{formData.studentName}</strong>! Your response has been logged in our academic
                  administration system. We take student recommendations seriously to improve your curriculum, faculty
                  mentorship, and campus facilities.
                </p>
                <button className="btn-new-feedback" onClick={handleReset}>
                  Submit Another Feedback
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* 1. Student Identity */}
                <div className="feedback-form-section">
                  <h2 className="feedback-section-title">
                    <FiUser /> 1. Student Information
                  </h2>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="studentName">
                        Full Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="studentName"
                        name="studentName"
                        className="form-input"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.studentName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">
                        Email Address <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-input"
                        placeholder="e.g. rahul@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="phone">Phone / WhatsApp Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-input"
                        placeholder="e.g. +91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="enrollmentNo">Enrollment No. / Roll No. (Optional)</label>
                      <input
                        type="text"
                        id="enrollmentNo"
                        name="enrollmentNo"
                        className="form-input"
                        placeholder="e.g. AE2025001"
                        value={formData.enrollmentNo}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Academic Course & Year */}
                <div className="feedback-form-section">
                  <h2 className="feedback-section-title">
                    <FiBook /> 2. Academic Enrollment
                  </h2>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="courseName">
                        Enrolled Course / Program <span className="required">*</span>
                      </label>
                      <select
                        id="courseName"
                        name="courseName"
                        className="form-select"
                        value={formData.courseName}
                        onChange={handleChange}
                        required
                      >
                        {defaultCourses.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="academicYear">
                        Current Academic Year / Semester <span className="required">*</span>
                      </label>
                      <select
                        id="academicYear"
                        name="academicYear"
                        className="form-select"
                        value={formData.academicYear}
                        onChange={handleChange}
                        required
                      >
                        {academicYears.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Feedback Focus Category</label>
                    <div className="category-pills-grid">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className={`category-pill-btn ${formData.category === cat.id ? 'active' : ''}`}
                          onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                        >
                          {cat.icon}
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Rating */}
                <div className="feedback-form-section">
                  <h2 className="feedback-section-title">
                    <FiStar /> 3. Overall Experience Rating
                  </h2>
                  <div className="star-rating-box">
                    <span className="star-rating-label">How would you rate your experience?</span>
                    <div className="star-rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${(hoverRating || formData.rating) >= star ? 'active' : ''}`}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleRating(star)}
                          aria-label={`Rate ${star} stars`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <div className="star-rating-text">
                      {ratingDescriptions[hoverRating || formData.rating]}
                    </div>
                  </div>
                </div>

                {/* 4. Message */}
                <div className="feedback-form-section">
                  <h2 className="feedback-section-title">
                    <FiMessageSquare /> 4. Your Detailed Comments &amp; Suggestions
                  </h2>
                  <div className="form-group">
                    <label htmlFor="message">
                      Feedback / Recommendations / Grievance Description <span className="required">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="form-textarea"
                      placeholder="Please describe your experience, curriculum suggestions, laboratory needs, or any concerns you would like administrative leadership to review..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Submit Action */}
                <button type="submit" className="btn-submit-feedback" disabled={submitting}>
                  <FiSend />
                  {submitting ? 'Submitting Feedback...' : 'Submit Student Feedback'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
