import { useState, useEffect, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FiBookOpen,
  FiDownload,
  FiSearch,
  FiFilter,
  FiRotateCcw,
  FiChevronDown,
  FiCheckCircle,
  FiLayers,
  FiCalendar,
  FiFileText,
  FiArrowRight,
  FiHash,
  FiUser,
  FiEye,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getBooks, getBookOptions, recordBookDownload } from '../api'
import './Library.css'

export default function Library() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)
  const [, startTransition] = useTransition()

  // 4 Core Filter States required by user
  const [academicYear, setAcademicYear] = useState('all')
  const [courseName, setCourseName] = useState('all')
  const [subjectCode, setSubjectCode] = useState('all')
  const [subjectName, setSubjectName] = useState('all')
  const [search, setSearch] = useState('')

  // Cascading options state
  const [options, setOptions] = useState({
    academicYears: [],
    courseNames: [],
    subjectCodes: [],
    subjectNames: [],
  })

  // Fetch filter options based on current selections
  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await getBookOptions({
          academicYear: academicYear !== 'all' ? academicYear : undefined,
          courseName: courseName !== 'all' ? courseName : undefined,
          subjectCode: subjectCode !== 'all' ? subjectCode : undefined,
        })
        if (res.data?.success) {
          setOptions(res.data.data)
        }
      } catch (err) {
        console.error('Failed to load book options:', err)
      }
    }
    fetchOptions()
  }, [academicYear, courseName, subjectCode])

  // Fetch books whenever filters change
  useEffect(() => {
    async function fetchBooks() {
      setLoading(true)
      try {
        const params = {}
        if (academicYear !== 'all') params.academicYear = academicYear
        if (courseName !== 'all') params.courseName = courseName
        if (subjectCode !== 'all') params.subjectCode = subjectCode
        if (subjectName !== 'all') params.subjectName = subjectName
        if (search.trim()) params.search = search.trim()

        const res = await getBooks(params)
        if (res.data?.success) {
          startTransition(() => {
            setBooks(res.data.data)
          })
        }
      } catch (err) {
        console.error('Failed to load books:', err)
        toast.error('Could not load library books. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchBooks, 200)
    return () => clearTimeout(timer)
  }, [academicYear, courseName, subjectCode, subjectName, search])

  // Handle book download
  const handleDownload = async (book) => {
    setDownloadingId(book.id)
    try {
      // Record download count on server
      await recordBookDownload(book.id)

      // Update local download count
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, downloadCount: (b.downloadCount || 0) + 1 } : b))
      )

      toast.success(`Starting download: ${book.title}`, {
        icon: '📚',
        duration: 3500,
      })

      // Initiate download or open link in new tab
      const link = document.createElement('a')
      link.href = book.fileUrl
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.download = book.fileName || `${book.subjectCode}_Book.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Download error:', err)
      // Fallback direct open
      window.open(book.fileUrl, '_blank', 'noopener,noreferrer')
    } finally {
      setDownloadingId(null)
    }
  }

  const resetFilters = () => {
    setAcademicYear('all')
    setCourseName('all')
    setSubjectCode('all')
    setSubjectName('all')
    setSearch('')
  }

  const hasActiveFilters =
    academicYear !== 'all' ||
    courseName !== 'all' ||
    subjectCode !== 'all' ||
    subjectName !== 'all' ||
    search.trim() !== ''

  return (
    <div className="library-page">
      {/* Hero Section */}
      <section className="library-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="library-hero-badge">
              <FiBookOpen /> Aharada Digital Repository & Academic Library
            </div>
            <h1 className="library-hero-title">
              Digital Library &amp; <span>Course Textbooks</span>
            </h1>
            <p className="library-hero-subtitle">
              Instant access to official university course textbooks, aviation manuals, lecture handbooks,
              and question banks for students across all academic years.
            </p>

            {/* Quick Stats */}
            <div className="library-stats-row">
              <div className="library-stat-pill">
                <FiBookOpen />
                <div>
                  <div className="library-stat-pill-num">Curated Material</div>
                  <div className="library-stat-pill-label">DGCA &amp; University Aligned</div>
                </div>
              </div>
              <div className="library-stat-pill">
                <FiLayers />
                <div>
                  <div className="library-stat-pill-num">All Disciplines</div>
                  <div className="library-stat-pill-label">Aviation, Aerospace &amp; Management</div>
                </div>
              </div>
              <div className="library-stat-pill">
                <FiCheckCircle />
                <div>
                  <div className="library-stat-pill-num">100% Free</div>
                  <div className="library-stat-pill-label">Direct Student Access</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Control Panel */}
      <section className="library-filter-panel">
        <div className="container">
          <div className="filter-card">
            <div className="filter-header-bar">
              <div className="filter-header-title">
                <FiFilter /> Filter Books by Syllabus Options
              </div>
              <div className="filter-search-box">
                <FiSearch className="filter-search-icon" />
                <input
                  type="text"
                  placeholder="Search by title, subject or author..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search books"
                />
              </div>
            </div>

            {/* 4 Cascading Dropdown Selectors */}
            <div className="filter-dropdowns-grid">
              {/* 1. Academic Year */}
              <div className="filter-select-group">
                <label htmlFor="select-academic-year">
                  <span className="filter-step">1</span> Academic Year
                </label>
                <div className="filter-select-wrap">
                  <select
                    id="select-academic-year"
                    className="filter-select"
                    value={academicYear}
                    onChange={(e) => {
                      setAcademicYear(e.target.value)
                      // Reset child cascading filters if desired
                      setSubjectCode('all')
                      setSubjectName('all')
                    }}
                  >
                    <option value="all">All Academic Years</option>
                    {options.academicYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="filter-select-arrow" />
                </div>
              </div>

              {/* 2. Course Name */}
              <div className="filter-select-group">
                <label htmlFor="select-course-name">
                  <span className="filter-step">2</span> Course Name
                </label>
                <div className="filter-select-wrap">
                  <select
                    id="select-course-name"
                    className="filter-select"
                    value={courseName}
                    onChange={(e) => {
                      setCourseName(e.target.value)
                      setSubjectCode('all')
                      setSubjectName('all')
                    }}
                  >
                    <option value="all">All Courses</option>
                    {options.courseNames.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="filter-select-arrow" />
                </div>
              </div>

              {/* 3. Subject Code */}
              <div className="filter-select-group">
                <label htmlFor="select-subject-code">
                  <span className="filter-step">3</span> Subject Code
                </label>
                <div className="filter-select-wrap">
                  <select
                    id="select-subject-code"
                    className="filter-select"
                    value={subjectCode}
                    onChange={(e) => {
                      setSubjectCode(e.target.value)
                      setSubjectName('all')
                    }}
                  >
                    <option value="all">All Subject Codes</option>
                    {options.subjectCodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="filter-select-arrow" />
                </div>
              </div>

              {/* 4. Subject Name */}
              <div className="filter-select-group">
                <label htmlFor="select-subject-name">
                  <span className="filter-step">4</span> Subject Name
                </label>
                <div className="filter-select-wrap">
                  <select
                    id="select-subject-name"
                    className="filter-select"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                  >
                    <option value="all">All Subject Names</option>
                    {options.subjectNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="filter-select-arrow" />
                </div>
              </div>
            </div>

            {/* Active Pills & Reset */}
            {hasActiveFilters && (
              <div className="filter-status-row">
                <div className="filter-active-pills">
                  <span style={{ fontSize: '0.82rem', color: 'var(--gray-500)', fontWeight: 600 }}>
                    Active filters:
                  </span>
                  {academicYear !== 'all' && (
                    <span className="filter-pill">
                      Year: {academicYear}
                      <button onClick={() => setAcademicYear('all')} title="Remove">✕</button>
                    </span>
                  )}
                  {courseName !== 'all' && (
                    <span className="filter-pill">
                      Course: {courseName}
                      <button onClick={() => setCourseName('all')} title="Remove">✕</button>
                    </span>
                  )}
                  {subjectCode !== 'all' && (
                    <span className="filter-pill">
                      Code: {subjectCode}
                      <button onClick={() => setSubjectCode('all')} title="Remove">✕</button>
                    </span>
                  )}
                  {subjectName !== 'all' && (
                    <span className="filter-pill">
                      Subject: {subjectName}
                      <button onClick={() => setSubjectName('all')} title="Remove">✕</button>
                    </span>
                  )}
                  {search.trim() && (
                    <span className="filter-pill">
                      Keyword: &quot;{search}&quot;
                      <button onClick={() => setSearch('')} title="Remove">✕</button>
                    </span>
                  )}
                </div>
                <button className="btn-reset-filters" onClick={resetFilters}>
                  <FiRotateCcw /> Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Book Results Grid */}
      <section className="library-results-section">
        <div className="container">
          <div className="results-meta-bar">
            <div className="results-count">
              Showing <span>{books.length}</span> {books.length === 1 ? 'Book' : 'Books'} Available
            </div>
            {hasActiveFilters && (
              <span style={{ fontSize: '0.88rem', color: 'var(--gray-500)' }}>
                Filtered by selected syllabus criteria
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
              <p style={{ color: 'var(--gray-500)' }}>Searching digital book repository...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="library-empty-state">
              <div className="library-empty-icon">
                <FiBookOpen />
              </div>
              <h3 className="library-empty-title">No Books Found</h3>
              <p className="library-empty-text">
                No course material or textbooks matched your chosen filter combination. Try selecting a different
                academic year or reset the filters.
              </p>
              <button className="btn-reset-filters" onClick={resetFilters} style={{ margin: '0 auto' }}>
                <FiRotateCcw /> Clear Filter Selections
              </button>
            </div>
          ) : (
            <div className="books-grid">
              {books.map((book, idx) => (
                <motion.article
                  key={book.id || book._id}
                  className="book-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <div className="book-card-header">
                    <span className="book-subject-badge">
                      <FiHash style={{ display: 'inline', marginRight: '2px' }} />
                      {book.subjectCode}
                    </span>
                    <span className="book-year-badge">
                      <FiCalendar style={{ display: 'inline', marginRight: '4px' }} />
                      {book.academicYear}
                    </span>
                  </div>

                  <div className="book-card-body">
                    <div className="book-course-tag">{book.courseName}</div>
                    <h2 className="book-card-title" title={book.title}>
                      {book.title}
                    </h2>

                    <div className="book-card-subject">
                      <FiBookOpen />
                      <span>{book.subjectName}</span>
                    </div>

                    {book.author && (
                      <div className="book-card-author">
                        <FiUser style={{ display: 'inline', marginRight: '4px' }} />
                        Author / Faculty: {book.author}
                      </div>
                    )}

                    {book.description && (
                      <p className="book-card-desc" title={book.description}>
                        {book.description}
                      </p>
                    )}

                    <div className="book-card-meta">
                      <div className="book-meta-item">
                        <FiFileText />
                        <span>{book.fileSize || 'PDF Document'}</span>
                      </div>
                      <div className="book-meta-item">
                        <FiDownload />
                        <span>{book.downloadCount || 0} downloads</span>
                      </div>
                    </div>

                    {/* Prominent Download Button */}
                    <button
                      className={`btn-download-book ${downloadingId === book.id ? 'downloading' : ''}`}
                      onClick={() => handleDownload(book)}
                      disabled={downloadingId === book.id}
                      aria-label={`Download ${book.title}`}
                    >
                      <FiDownload />
                      {downloadingId === book.id ? 'Starting Download...' : 'Download Book'}
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Student Request / Feedback Callout Banner */}
          <div className="library-notice-banner">
            <div className="notice-text">
              <h3>Need additional study materials or syllabus books?</h3>
              <p>
                Have a recommendation for new reference material or experiencing syllabus questions?
                Submit your suggestions directly via our Student Feedback desk.
              </p>
            </div>
            <div className="notice-actions">
              <Link to="/feedback" className="notice-btn-primary">
                Share Student Feedback <FiArrowRight style={{ display: 'inline', marginLeft: '4px' }} />
              </Link>
              <Link to="/contact" className="notice-btn-secondary">
                Contact Academic Cell
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
