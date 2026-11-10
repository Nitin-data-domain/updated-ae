import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/admin/AdminLayout'
import Home from './pages/Home'
import './App.css'

// Lazy-loaded Public Pages
const Programs = lazy(() => import('./pages/Programs'))
const ProgramDetail = lazy(() => import('./pages/ProgramDetail'))
const Admissions = lazy(() => import('./pages/Admissions'))
const Faculty = lazy(() => import('./pages/Faculty'))
const FacultyRoles = lazy(() => import('./pages/FacultyRoles'))
const Events = lazy(() => import('./pages/Events'))
const Contact = lazy(() => import('./pages/Contact'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const Placement = lazy(() => import('./pages/Placement'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Library = lazy(() => import('./pages/Library'))
const StudentFeedback = lazy(() => import('./pages/StudentFeedback'))

// Lazy-loaded Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminPrograms = lazy(() => import('./pages/admin/AdminPrograms'))
const AdminFaculty = lazy(() => import('./pages/admin/AdminFaculty'))
const AdminFacultyRoles = lazy(() => import('./pages/admin/AdminFacultyRoles'))
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'))
const AdminEnquiries = lazy(() => import('./pages/admin/AdminEnquiries'))
const AdminAdmissionLeads = lazy(() => import('./pages/admin/AdminAdmissionLeads'))
const AdminBrochures = lazy(() => import('./pages/admin/AdminBrochures'))
const AdminPlacements = lazy(() => import('./pages/admin/AdminPlacements'))
const AdminBooks = lazy(() => import('./pages/admin/AdminBooks'))
const AdminFeedback = lazy(() => import('./pages/admin/AdminFeedback'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))

// Lazy-loaded Grievance Portal Components
const PortalLogin = lazy(() => import('./portal/components/Login'))
const PortalLayout = lazy(() => import('./portal/components/Layout'))
const DeanDashboard = lazy(() => import('./portal/components/DeanDashboard'))
const HODDashboard = lazy(() => import('./portal/components/HODDashboard'))
const FacultyDashboard = lazy(() => import('./portal/components/FacultyDashboard'))
const StudentDashboard = lazy(() => import('./portal/components/StudentDashboard'))

import { AuthProvider, useAuth } from './portal/context/AuthContext'

function PageFallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: '#1C3557', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
}

function PortalProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ width: 44, height: 44, border: '4px solid #DBEAFE', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }
  if (!user) return <Navigate to="/grievance" replace />
  return children
}

function PortalDashboardRouter() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/grievance" replace />
  switch (user.role) {
    case 'Dean':    return <DeanDashboard />
    case 'HOD':     return <HODDashboard />
    case 'Faculty': return <FacultyDashboard />
    case 'Student': return <StudentDashboard />
    default:        return <Navigate to="/grievance" replace />
  }
}

function RequireAdminPerm({ perm, superAdminOnly = false, children }) {
  const user = JSON.parse(localStorage.getItem('aharada_user') || '{}')
  const isSuper = user.role === 'superadmin'
  if (superAdminOnly) {
    if (!isSuper) return <Navigate to="/admin" replace />
    return children
  }
  const userPerms = Array.isArray(user.permissions)
    ? user.permissions
    : typeof user.permissions === 'string'
      ? (() => { try { return JSON.parse(user.permissions) } catch (_) { return [user.permissions] } })()
      : []
  const hasAccess = isSuper || userPerms.includes('*') || userPerms.includes(perm)
  if (!hasAccess) {
    return <Navigate to="/admin" replace />
  }
  return children
}

function App() {
  const location = useLocation()

  // Track page views in Google Analytics on SPA route navigation
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-7WR2H3YYKW', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      })
    }
  }, [location])

  return (
    <AuthProvider>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="programs" element={<Programs />} />
            <Route path="programs/:slug" element={<ProgramDetail />} />
            <Route path="admissions" element={<Admissions />} />
            <Route path="faculty" element={<Faculty />} />
            <Route path="faculty-roles" element={<FacultyRoles />} />
            <Route path="events" element={<Events />} />
            <Route path="contact" element={<Contact />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="placement" element={<Placement />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="library" element={<Library />} />
            <Route path="feedback" element={<StudentFeedback />} />
          </Route>

          {/* College Grievance Portal Routes */}
          <Route path="/grievance" element={<PortalLogin />} />
          <Route path="/grievances" element={<Navigate to="/grievance" replace />} />
          <Route path="/student-grievance" element={<Navigate to="/grievance" replace />} />
          <Route path="/login" element={<Navigate to="/grievance" replace />} />
          <Route path="/dashboard" element={
            <PortalProtectedRoute>
              <PortalLayout><PortalDashboardRouter /></PortalLayout>
            </PortalProtectedRoute>
          } />
          <Route path="/grievance/dashboard" element={
            <PortalProtectedRoute>
              <PortalLayout><PortalDashboardRouter /></PortalLayout>
            </PortalProtectedRoute>
          } />

          {/* Website Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="programs" element={<RequireAdminPerm perm="programs"><AdminPrograms /></RequireAdminPerm>} />
            <Route path="books" element={<RequireAdminPerm perm="books"><AdminBooks /></RequireAdminPerm>} />
            <Route path="feedback" element={<RequireAdminPerm perm="feedback"><AdminFeedback /></RequireAdminPerm>} />
            <Route path="faculty" element={<RequireAdminPerm perm="faculty"><AdminFaculty /></RequireAdminPerm>} />
            <Route path="faculty-roles" element={<RequireAdminPerm perm="faculty-roles"><AdminFacultyRoles /></RequireAdminPerm>} />
            <Route path="events" element={<RequireAdminPerm perm="events"><AdminEvents /></RequireAdminPerm>} />
            <Route path="admission-leads" element={<RequireAdminPerm perm="leads"><AdminAdmissionLeads /></RequireAdminPerm>} />
            <Route path="enquiries" element={<RequireAdminPerm perm="enquiries"><AdminEnquiries /></RequireAdminPerm>} />
            <Route path="brochures" element={<RequireAdminPerm perm="brochures"><AdminBrochures /></RequireAdminPerm>} />
            <Route path="placements" element={<RequireAdminPerm perm="placements"><AdminPlacements /></RequireAdminPerm>} />
            <Route path="users" element={<RequireAdminPerm superAdminOnly><AdminUsers /></RequireAdminPerm>} />
          </Route>

          {/* Legacy redirects from old .in website URLs & alternate paths */}
          <Route path="/btech-aerospace-engineering" element={<Navigate to="/programs/btech-aerospace-engineering" replace />} />
          <Route path="/btech-aerospace" element={<Navigate to="/programs/btech-aerospace-engineering" replace />} />
          <Route path="/btech-aero" element={<Navigate to="/programs/btech-aerospace-engineering" replace />} />
          <Route path="/bba-aviation-travel" element={<Navigate to="/programs/bba-aviation-travel" replace />} />
          <Route path="/bba-aviation" element={<Navigate to="/programs/bba-aviation-travel" replace />} />
          <Route path="/bsc-aeronautical-science" element={<Navigate to="/programs/bsc-aeronautical-science" replace />} />
          <Route path="/bsc-aviation" element={<Navigate to="/programs/bsc-aeronautical-science" replace />} />
          <Route path="/mba-aviation-management" element={<Navigate to="/programs/mba-aviation-management" replace />} />
          <Route path="/mba-aviation" element={<Navigate to="/programs/mba-aviation-management" replace />} />
          <Route path="/bba-entrepreneurship-innovation" element={<Navigate to="/programs/bba-entrepreneurship-innovation" replace />} />
          <Route path="/bba-entrepreneurship" element={<Navigate to="/programs/bba-entrepreneurship-innovation" replace />} />
          <Route path="/bba-data-analytics-ai" element={<Navigate to="/programs/bba-data-analytics-ai" replace />} />
          <Route path="/bba-analytics" element={<Navigate to="/programs/bba-data-analytics-ai" replace />} />
          <Route path="/bachelor-fashion-design" element={<Navigate to="/programs/bachelor-fashion-design" replace />} />
          <Route path="/fashion-design" element={<Navigate to="/programs/bachelor-fashion-design" replace />} />
          <Route path="/bachelor-fine-arts" element={<Navigate to="/programs/bachelor-fine-arts" replace />} />
          <Route path="/fine-arts" element={<Navigate to="/programs/bachelor-fine-arts" replace />} />
          <Route path="/about-us" element={<Navigate to="/about" replace />} />
          <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
          <Route path="/placements" element={<Navigate to="/placement" replace />} />
          <Route path="/courses" element={<Navigate to="/programs" replace />} />
          <Route path="/courses/:slug" element={<Navigate to="/programs/:slug" replace />} />
          <Route path="/course/:slug" element={<Navigate to="/programs/:slug" replace />} />
          <Route path="/books" element={<Navigate to="/library" replace />} />
          <Route path="/digital-library" element={<Navigate to="/library" replace />} />

          {/* Global Fallback for unknown URLs */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

export default App
