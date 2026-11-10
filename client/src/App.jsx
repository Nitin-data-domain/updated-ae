import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/admin/AdminLayout'
import Home from './pages/Home'
import Programs from './pages/Programs'
import ProgramDetail from './pages/ProgramDetail'
import Admissions from './pages/Admissions'
import Faculty from './pages/Faculty'
import Events from './pages/Events'
import Contact from './pages/Contact'
import AboutUs from './pages/AboutUs'
import Placement from './pages/Placement'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Library from './pages/Library'
import StudentFeedback from './pages/StudentFeedback'
import FacultyRoles from './pages/FacultyRoles'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPrograms from './pages/admin/AdminPrograms'
import AdminFaculty from './pages/admin/AdminFaculty'
import AdminFacultyRoles from './pages/admin/AdminFacultyRoles'
import AdminEvents from './pages/admin/AdminEvents'
import AdminEnquiries from './pages/admin/AdminEnquiries'
import AdminAdmissionLeads from './pages/admin/AdminAdmissionLeads'
import AdminBrochures from './pages/admin/AdminBrochures'
import AdminPlacements from './pages/admin/AdminPlacements'
import AdminBooks from './pages/admin/AdminBooks'
import AdminFeedback from './pages/admin/AdminFeedback'

// College Grievance Portal Imports
import { AuthProvider, useAuth } from './portal/context/AuthContext'
import PortalLogin from './portal/components/Login'
import PortalLayout from './portal/components/Layout'
import DeanDashboard from './portal/components/DeanDashboard'
import HODDashboard from './portal/components/HODDashboard'
import FacultyDashboard from './portal/components/FacultyDashboard'
import StudentDashboard from './portal/components/StudentDashboard'
import './portal/index.css'
import './App.css'

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
          <Route path="programs" element={<AdminPrograms />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="faculty" element={<AdminFaculty />} />
          <Route path="faculty-roles" element={<AdminFacultyRoles />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="admission-leads" element={<AdminAdmissionLeads />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="brochures" element={<AdminBrochures />} />
          <Route path="placements" element={<AdminPlacements />} />
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
    </AuthProvider>
  )
}

export default App

