import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';
import AdminServices from './pages/AdminServices';
import AdminProjects from './pages/AdminProjects';
import AdminTeam from './pages/AdminTeam';
import AdminStats from './pages/AdminStats';
import AdminBlogs from './pages/AdminBlogs';
import AdminTestimonials from './pages/AdminTestimonials';
import AdminContacts from './pages/AdminContacts';

function PublicRoute({ element }) {
  return <MainLayout>{element}</MainLayout>;
}

export default function App() {
  useEffect(() => {
    document.title = 'ANOVA TECHNOLOGIES';
  }, []);

  return (
    <Routes>
      <Route path="/" element={<PublicRoute element={<Home />} />} />
      <Route path="/about" element={<PublicRoute element={<About />} />} />
      <Route path="/services" element={<PublicRoute element={<Services />} />} />
      <Route path="/projects" element={<PublicRoute element={<Projects />} />} />
      <Route path="/contact" element={<PublicRoute element={<Contact />} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
      <Route path="/admin/projects" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
      <Route path="/admin/team" element={<ProtectedRoute><AdminTeam /></ProtectedRoute>} />
      <Route path="/admin/stats" element={<ProtectedRoute><AdminStats /></ProtectedRoute>} />
      <Route path="/admin/blogs" element={<ProtectedRoute><AdminBlogs /></ProtectedRoute>} />
      <Route path="/admin/testimonials" element={<ProtectedRoute><AdminTestimonials /></ProtectedRoute>} />
      <Route path="/admin/contacts" element={<ProtectedRoute><AdminContacts /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
