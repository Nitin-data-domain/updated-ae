import { Routes, Route } from 'react-router-dom'
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
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPrograms from './pages/admin/AdminPrograms'
import AdminFaculty from './pages/admin/AdminFaculty'
import AdminEvents from './pages/admin/AdminEvents'
import AdminEnquiries from './pages/admin/AdminEnquiries'
import AdminAdmissionLeads from './pages/admin/AdminAdmissionLeads'
import AdminBrochures from './pages/admin/AdminBrochures'
import AdminPlacements from './pages/admin/AdminPlacements'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="programs" element={<Programs />} />
        <Route path="programs/:slug" element={<ProgramDetail />} />
        <Route path="admissions" element={<Admissions />} />
        <Route path="faculty" element={<Faculty />} />
        <Route path="events" element={<Events />} />
        <Route path="contact" element={<Contact />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="placement" element={<Placement />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="programs" element={<AdminPrograms />} />
        <Route path="faculty" element={<AdminFaculty />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="admission-leads" element={<AdminAdmissionLeads />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
        <Route path="brochures" element={<AdminBrochures />} />
        <Route path="placements" element={<AdminPlacements />} />
      </Route>
    </Routes>
  )
}

export default App
