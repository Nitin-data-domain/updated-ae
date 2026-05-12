import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loginAdmin } from '../../api'
import Logo from '../../components/Logo'
import './AdminLogin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }
    setLoading(true)
    try {
      const res = await loginAdmin({ email, password })
      localStorage.setItem('aharada_token', res.data.token)
      localStorage.setItem('aharada_user', JSON.stringify(res.data.user))
      toast.success('Welcome back!')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg">
        <div className="login-particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="login-particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }} />
          ))}
        </div>
      </div>
      
      <div className="admin-login-card">
        <div className="login-brand">
          <Logo size="large" />
          <div className="login-brand-text">
            <span className="login-brand-name">AHARADA</span>
            <span className="login-brand-sub">ADMIN PANEL</span>
          </div>
        </div>
        
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to manage your platform</p>

        <form onSubmit={handleSubmit} id="admin-login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Email Address</label>
            <input
              type="email"
              id="admin-email"
              className="form-input"
              placeholder="admin@aharada.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <input
              type="password"
              id="admin-password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
            id="admin-login-btn"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="login-hint">
          Default: admin@aharada.edu / admin123
        </p>
      </div>
    </div>
  )
}
