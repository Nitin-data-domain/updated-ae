import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  FiBookOpen,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiUploadCloud,
  FiLink,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiFileText,
  FiFilter,
} from 'react-icons/fi'
import { getAllBooksAdmin, createBook, updateBook, deleteBook } from '../../api'

const courseOptions = [
  'BBA Aviation & Travel',
  'B.Tech Aerospace Engineering',
  'B.Sc Aeronautical Science',
  'MBA Aviation Management',
  'BBA Entrepreneurship & Innovation',
  'BBA Data Analytics & AI',
  'Bachelor in Fashion Design',
  'Bachelor in Fine Arts',
]

const yearOptions = [
  '2023-2024',
  '2024-2025',
  '2025-2026',
  '2026-2027',
  '2027-2028',
  '2028-2029',
]

export default function AdminBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')

  // Modals state
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingBook, setEditingBook] = useState(null)

  // Upload type: 'file' or 'url'
  const [uploadType, setUploadType] = useState('url')
  const [fileToUpload, setFileToUpload] = useState(null)

  // Form state
  const [form, setForm] = useState({
    title: '',
    academicYear: '2025-2026',
    courseName: 'BBA Aviation & Travel',
    subjectCode: '',
    subjectName: '',
    author: '',
    description: '',
    fileUrl: '',
    fileName: '',
    fileSize: '',
    isActive: true,
    order: 0,
  })

  useEffect(() => {
    document.title = 'Manage Library Books | Aharada Admin'
    loadBooks()
  }, [])

  const loadBooks = async () => {
    setLoading(true)
    try {
      const res = await getAllBooksAdmin()
      if (res.data?.success) {
        setBooks(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingBook(null)
    setFileToUpload(null)
    setUploadType('url')
    setForm({
      title: '',
      academicYear: '2025-2026',
      courseName: 'BBA Aviation & Travel',
      subjectCode: '',
      subjectName: '',
      author: '',
      description: '',
      fileUrl: '',
      fileName: '',
      fileSize: '',
      isActive: true,
      order: 0,
    })
    setShowModal(true)
  }

  const openEditModal = (book) => {
    setEditingBook(book)
    setFileToUpload(null)
    setUploadType('url')
    setForm({
      title: book.title || '',
      academicYear: book.academicYear || '2025-2026',
      courseName: book.courseName || 'BBA Aviation & Travel',
      subjectCode: book.subjectCode || '',
      subjectName: book.subjectName || '',
      author: book.author || '',
      description: book.description || '',
      fileUrl: book.fileUrl || '',
      fileName: book.fileName || '',
      fileSize: book.fileSize || '',
      isActive: book.isActive !== undefined ? book.isActive : true,
      order: book.order || 0,
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) {
      toast.error('Book title is required')
      return
    }
    if (!form.subjectCode.trim()) {
      toast.error('Subject code is required (e.g. AV-101)')
      return
    }
    if (!form.subjectName.trim()) {
      toast.error('Subject name is required')
      return
    }

    if (uploadType === 'url' && !form.fileUrl.trim()) {
      toast.error('Please provide a valid download URL or Google Drive link')
      return
    }

    if (uploadType === 'file' && !fileToUpload && !editingBook) {
      toast.error('Please select a PDF file to upload')
      return
    }

    setSaving(true)
    try {
      if (uploadType === 'file' && fileToUpload) {
        const formData = new FormData()
        formData.append('file', fileToUpload)
        formData.append('title', form.title)
        formData.append('academicYear', form.academicYear)
        formData.append('courseName', form.courseName)
        formData.append('subjectCode', form.subjectCode)
        formData.append('subjectName', form.subjectName)
        formData.append('author', form.author)
        formData.append('description', form.description)
        formData.append('isActive', form.isActive)
        formData.append('order', form.order)

        if (editingBook) {
          await updateBook(editingBook.id, formData)
          toast.success('Book updated with new file!')
        } else {
          await createBook(formData)
          toast.success('Book uploaded successfully!')
        }
      } else {
        // Direct link / URL
        if (editingBook) {
          await updateBook(editingBook.id, form)
          toast.success('Book updated!')
        } else {
          await createBook(form)
          toast.success('Book added successfully!')
        }
      }

      setShowModal(false)
      loadBooks()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to save book')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return
    try {
      await deleteBook(id)
      toast.success('Book deleted')
      loadBooks()
    } catch (err) {
      toast.error('Failed to delete book')
    }
  }

  // Filter books list
  const filteredBooks = books.filter((b) => {
    if (selectedCourse !== 'all' && b.courseName !== selectedCourse) return false
    if (selectedYear !== 'all' && b.academicYear !== selectedYear) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const match =
        b.title?.toLowerCase().includes(q) ||
        b.subjectCode?.toLowerCase().includes(q) ||
        b.subjectName?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  const totalDownloads = books.reduce((acc, b) => acc + (b.downloadCount || 0), 0)

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Digital Library &amp; Books</h1>
          <p className="admin-page-desc">
            Upload and manage official course books, syllabus notes, and subject materials for student downloads.
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
          <FiPlus /> Upload New Book
        </button>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--primary-ultralight)', color: 'var(--primary)' }}>
            <FiBookOpen />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value">{books.length}</div>
            <div className="admin-stat-label">Total Books in Library</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#fef3c7', color: 'var(--accent)' }}>
            <FiDownload />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value" style={{ color: 'var(--accent)' }}>
              {totalDownloads}
            </div>
            <div className="admin-stat-label">Total Student Downloads</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#e6f7ed', color: 'var(--success)' }}>
            <FiCheckCircle />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value" style={{ color: 'var(--success)' }}>
              {books.filter((b) => b.isActive).length}
            </div>
            <div className="admin-stat-label">Active &amp; Published</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <FiSearch
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)',
              }}
            />
            <input
              type="text"
              placeholder="Search by title, subject code, author..."
              className="admin-form-input"
              style={{ paddingLeft: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="admin-form-select"
            style={{ width: 'auto', minWidth: '180px' }}
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courseOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="admin-form-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">All Years</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading books...</div>
        ) : filteredBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
            No books found matching the filter criteria.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Title &amp; Subject</th>
                  <th>Course &amp; Year</th>
                  <th>Author</th>
                  <th>Downloads</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id || book._id}>
                    <td>
                      <span
                        style={{
                          background: 'var(--primary-ultralight)',
                          color: 'var(--primary)',
                          fontWeight: 700,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                        }}
                      >
                        {book.subjectCode}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{book.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                        {book.subjectName}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{book.courseName}</div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          background: 'var(--gray-100)',
                          color: 'var(--gray-700)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        {book.academicYear}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                      {book.author || '—'}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
                        {book.downloadCount || 0}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          background: book.isActive ? '#e6f7ed' : '#fbebee',
                          color: book.isActive ? 'var(--success)' : 'var(--danger)',
                        }}
                      >
                        {book.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <a
                          href={book.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn-icon"
                          title="Open / Download"
                          style={{ color: 'var(--info)' }}
                        >
                          <FiDownload />
                        </a>
                        <button
                          className="admin-btn-icon"
                          onClick={() => openEditModal(book)}
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="admin-btn-icon danger"
                          onClick={() => handleDelete(book.id, book.title)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Book Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '640px' }}>
            <div className="admin-modal-header">
              <h2>{editingBook ? 'Edit Library Book' : 'Upload New Course Book'}</h2>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Book / Document Title *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Introduction to Aviation Management & Airline Business"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="admin-form-group">
                  <label>Academic Year *</label>
                  <select
                    className="admin-form-select"
                    value={form.academicYear}
                    onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                    required
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Course Name *</label>
                  <select
                    className="admin-form-select"
                    value={form.courseName}
                    onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                    required
                  >
                    {courseOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                <div className="admin-form-group">
                  <label>Subject Code *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. AV-101"
                    value={form.subjectCode}
                    onChange={(e) => setForm({ ...form, subjectCode: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Subject Name *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Aviation Meteorology & Navigation"
                    value={form.subjectName}
                    onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Author / Faculty / Publisher</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Capt. Vikram Malhotra / DGCA Publication"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Brief Description / Syllabus Overview</label>
                <textarea
                  className="admin-form-textarea"
                  rows={2}
                  placeholder="Brief synopsis of what this book covers..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Upload Source Toggle */}
              <div className="admin-form-group">
                <label>Book Source / Upload Method</label>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                  <button
                    type="button"
                    className={`admin-btn ${uploadType === 'url' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setUploadType('url')}
                  >
                    <FiLink /> Download Link / Drive URL
                  </button>
                  <button
                    type="button"
                    className={`admin-btn ${uploadType === 'file' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setUploadType('file')}
                  >
                    <FiUploadCloud /> Upload PDF File
                  </button>
                </div>

                {uploadType === 'url' ? (
                  <div>
                    <input
                      type="url"
                      className="admin-form-input"
                      placeholder="https://drive.google.com/... or direct PDF link"
                      value={form.fileUrl}
                      onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                    />
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                      Tip: Google Drive view links or any direct HTTPS file link work directly.
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept=".pdf,.epub,.docx,.zip"
                      className="admin-form-input"
                      onChange={(e) => setFileToUpload(e.target.files[0])}
                    />
                    {fileToUpload && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--success)', marginTop: '4px' }}>
                        Selected: {fileToUpload.name} ({(fileToUpload.size / (1024 * 1024)).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', padding: '12px 16px', background: 'var(--gray-50)', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                <input
                  type="checkbox"
                  id="isActiveBook"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="isActiveBook" style={{ margin: 0, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy)' }}>
                  Publish &amp; make visible in Digital Library
                </label>
              </div>

              <div className="admin-modal-actions" style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingBook ? 'Save Changes' : 'Upload Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
