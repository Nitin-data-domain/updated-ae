import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  FiUsers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiShield,
  FiCheck,
  FiX,
  FiLock,
  FiMail,
  FiKey,
  FiBookOpen,
  FiMessageSquare,
  FiCalendar,
  FiAward,
  FiFileText,
  FiBook,
  FiActivity,
  FiAlertCircle,
} from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  toggleAdminUserStatus,
  deleteAdminUser,
} from '../../api'
import './AdminUsers.css'

export const AVAILABLE_PERMISSIONS = [
  {
    id: 'books',
    label: 'Library & Notes Uploading',
    desc: 'Can upload and manage study materials and notes (requires Super Admin approval to go live).',
    icon: <FiBookOpen />,
    badgeColor: '#2563EB',
  },
  {
    id: 'feedback',
    label: 'Student Feedback',
    desc: 'Can view, filter, and review student ratings and feedback submissions.',
    icon: <FiMessageSquare />,
    badgeColor: '#059669',
  },
  {
    id: 'enquiries',
    label: 'Contact Enquiries',
    desc: 'Can view contact inquiries and follow up with prospective students.',
    icon: <FiMail />,
    badgeColor: '#D97706',
  },
  {
    id: 'leads',
    label: 'Admission Leads',
    desc: 'Can access and track student admission application leads.',
    icon: <HiAcademicCap />,
    badgeColor: '#7C3AED',
  },
  {
    id: 'programs',
    label: 'Academic Programs',
    desc: 'Can create and edit academic degrees, eligibility, and curriculum details.',
    icon: <FiBook />,
    badgeColor: '#0891B2',
  },
  {
    id: 'faculty',
    label: 'Faculty Directory',
    desc: 'Can add and update faculty member profiles and photos.',
    icon: <FiUsers />,
    badgeColor: '#4F46E5',
  },
  {
    id: 'faculty-roles',
    label: 'Faculty Roles',
    desc: 'Can manage departmental leadership roles and academic responsibilities.',
    icon: <FiShield />,
    badgeColor: '#475569',
  },
  {
    id: 'placements',
    label: 'Student Placements',
    desc: 'Can manage placement records, hiring airlines, and salary packages.',
    icon: <FiAward />,
    badgeColor: '#EA580C',
  },
  {
    id: 'events',
    label: 'Events & News',
    desc: 'Can create and publish campus events, celebrations, and workshops.',
    icon: <FiCalendar />,
    badgeColor: '#BE185D',
  },
  {
    id: 'brochures',
    label: 'Brochure Downloads',
    desc: 'Can upload program brochures and review download analytics.',
    icon: <FiFileText />,
    badgeColor: '#0D9488',
  },
]

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem('aharada_user') || '{}')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: ['books'],
    isActive: true,
  })

  useEffect(() => {
    document.title = 'Admin Users & Rights | Aharada Admin'
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await getAdminUsers()
      setUsers(res.data.data || [])
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to load admin users')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingUser(null)
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      permissions: ['books'],
      isActive: true,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (user) => {
    setEditingUser(user)
    const perms = Array.isArray(user.permissions)
      ? user.permissions
      : typeof user.permissions === 'string'
      ? (function () {
          try {
            return JSON.parse(user.permissions)
          } catch (_) {
            return [user.permissions]
          }
        })()
      : []

    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '', // blank unless resetting
      role: user.role || 'admin',
      permissions: perms.length > 0 ? perms : ['books'],
      isActive: user.isActive !== false && user.is_active !== false,
    })
    setShowModal(true)
  }

  const togglePermission = (permId) => {
    setForm((prev) => {
      const current = prev.permissions || []
      if (current.includes(permId)) {
        return { ...prev, permissions: current.filter((p) => p !== permId) }
      } else {
        return { ...prev, permissions: [...current, permId] }
      }
    })
  }

  const handleSelectAllPerms = () => {
    setForm((prev) => ({
      ...prev,
      permissions: AVAILABLE_PERMISSIONS.map((p) => p.id),
    }))
  }

  const handleDeselectAllPerms = () => {
    setForm((prev) => ({
      ...prev,
      permissions: [],
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Please enter name and email')
      return
    }

    if (!editingUser && (!form.password || form.password.length < 6)) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        permissions: form.role === 'superadmin' ? ['*'] : form.permissions,
        isActive: form.isActive,
      }
      if (form.password && form.password.trim()) {
        payload.password = form.password.trim()
      }

      if (editingUser) {
        await updateAdminUser(editingUser.id, payload)
        toast.success(`User ${payload.name} updated successfully!`)
      } else {
        await createAdminUser(payload)
        toast.success(`Admin user ${payload.name} created successfully!`)
      }

      setShowModal(false)
      loadUsers()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to save admin user')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser.id) {
      toast.error('You cannot toggle the status of your own account.')
      return
    }
    try {
      await toggleAdminUserStatus(user.id)
      toast.success(
        `Account for ${user.name} has been ${
          user.isActive === false ? 'activated' : 'deactivated'
        }`
      )
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status')
    }
  }

  const handleDelete = async (user) => {
    if (user.id === currentUser.id) {
      toast.error('You cannot delete your own account.')
      return
    }
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.name}"?`)) {
      return
    }
    try {
      await deleteAdminUser(user.id)
      toast.success(`User ${user.name} deleted`)
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    }
  }

  return (
    <div className="admin-users-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <FiShield className="page-header-icon" /> Admin Users & Permissions
          </h1>
          <p className="admin-page-subtitle">
            Create staff accounts, grant module-specific rights, and manage approval privileges.
          </p>
        </div>
        <button className="btn btn-gold" onClick={handleOpenCreate}>
          <FiPlus /> Create Admin User
        </button>
      </div>

      {/* Info Callout */}
      <div className="approval-info-banner">
        <FiAlertCircle size={22} className="info-banner-icon" />
        <div className="info-banner-content">
          <strong>Approval Workflow & Rights Management:</strong>
          <span>
            Staff users assigned the <strong>Library & Notes Uploading</strong> permission can submit notes
            and study materials. All staff uploads remain in a <strong>Pending Approval</strong> state
            until confirmed and published by a Super Admin.
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-loading">
            <div className="spinner" />
            <p>Loading admin users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <FiUsers size={48} />
            <p>No admin users found.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Assigned Permissions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id
                  const isSuper = u.role === 'superadmin'
                  const rawPerms = Array.isArray(u.permissions)
                    ? u.permissions
                    : typeof u.permissions === 'string'
                    ? (function () {
                        try {
                          return JSON.parse(u.permissions)
                        } catch (_) {
                          return [u.permissions]
                        }
                      })()
                    : []

                  const activeState = u.isActive !== false && u.is_active !== false

                  return (
                    <tr key={u.id} className={!activeState ? 'row-inactive' : ''}>
                      <td>
                        <div className="user-info-cell">
                          <div className={`user-avatar ${isSuper ? 'avatar-super' : ''}`}>
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="user-name-row">
                              <span className="user-full-name">{u.name}</span>
                              {isCurrent && <span className="current-user-tag">You</span>}
                            </div>
                            <span className="user-email-text">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${isSuper ? 'role-super' : 'role-admin'}`}>
                          {isSuper ? (
                            <>
                              <FiShield size={12} /> Super Admin
                            </>
                          ) : (
                            <>
                              <FiKey size={12} /> Staff Admin
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="permissions-pills-wrap">
                          {isSuper ? (
                            <span className="perm-pill perm-all">
                              <FiCheck size={12} /> Full Unrestricted Access (All Modules)
                            </span>
                          ) : rawPerms.length === 0 ? (
                            <span className="perm-pill perm-none">No Permissions Assigned</span>
                          ) : (
                            rawPerms.map((pId) => {
                              const meta = AVAILABLE_PERMISSIONS.find((p) => p.id === pId)
                              return (
                                <span key={pId} className="perm-pill">
                                  {meta ? meta.icon : <FiCheck size={11} />}
                                  {meta ? meta.label : pId}
                                </span>
                              )
                            })
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`status-toggle-btn ${activeState ? 'active' : 'inactive'}`}
                          onClick={() => handleToggleStatus(u)}
                          disabled={isCurrent}
                          title={isCurrent ? 'Cannot toggle own status' : 'Click to toggle status'}
                        >
                          <span className="status-dot" />
                          {activeState ? 'Active' : 'Deactivated'}
                        </button>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-icon btn-edit"
                            onClick={() => handleOpenEdit(u)}
                            title="Edit User & Permissions"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(u)}
                            disabled={isCurrent}
                            title={isCurrent ? 'Cannot delete self' : 'Delete user'}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2>{editingUser ? `Edit Admin: ${editingUser.name}` : 'Create New Admin User'}</h2>
                <p className="modal-subhead">
                  Configure login credentials and select the specific modules this user can access.
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Sharma"
                  />
                </div>

                <div className="form-group">
                  <label>Login Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. faculty@aharadaedu.com"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>
                    Password {editingUser ? '(Leave blank to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingUser ? '••••••••' : 'Min 6 characters'}
                  />
                </div>

                <div className="form-group">
                  <label>Account Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="admin">Staff Admin (Restricted by Selected Rights)</option>
                    <option value="superadmin">Super Admin (Full Rights + Approvals + User Mgmt)</option>
                  </select>
                </div>
              </div>

              {/* Permissions Section */}
              {form.role === 'admin' ? (
                <div className="permissions-selection-box">
                  <div className="perm-box-header">
                    <div>
                      <h4 className="perm-box-title">Module Access & Feature Rights</h4>
                      <p className="perm-box-sub">
                        Select the features this user can view and manage.
                      </p>
                    </div>
                    <div className="perm-toggle-links">
                      <button type="button" onClick={handleSelectAllPerms} className="btn-link">
                        Select All
                      </button>
                      <button type="button" onClick={handleDeselectAllPerms} className="btn-link">
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div className="permissions-cards-grid">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const isChecked = (form.permissions || []).includes(perm.id)
                      return (
                        <div
                          key={perm.id}
                          className={`perm-card ${isChecked ? 'selected' : ''}`}
                          onClick={() => togglePermission(perm.id)}
                        >
                          <div className="perm-checkbox-row">
                            <div className="perm-icon-bubble">{perm.icon}</div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // Handled by card click
                            />
                          </div>
                          <span className="perm-card-title">{perm.label}</span>
                          <span className="perm-card-desc">{perm.desc}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="superadmin-notice-card">
                  <FiShield size={24} className="super-shield-icon" />
                  <div>
                    <strong>Super Admin Privileges:</strong>
                    <p>
                      Super Admins possess unrestricted access across all portal modules, can create
                      and manage other admins, and have exclusive approval rights over submitted study
                      materials.
                    </p>
                  </div>
                </div>
              )}

              <div className="form-checkbox-row" style={{ marginTop: '16px' }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <span>Account is Active (Uncheck to temporarily prevent user login)</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" disabled={saving}>
                  {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
