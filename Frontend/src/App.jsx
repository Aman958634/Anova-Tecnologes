import { Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { Suspense, lazy, useEffect } from 'react';
import WhatsAppButton from './components/WhatsAppButton';
import { initAnalytics, trackPageView } from './utils/analytics';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Projects = lazy(() => import('./pages/Projects'));
const Contact = lazy(() => import('./pages/Contact'));
const Blogs = lazy(() => import('./pages/Blogs'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminServices = lazy(() => import('./pages/AdminServices'));
const AdminProjects = lazy(() => import('./pages/AdminProjects'));
const AdminTeam = lazy(() => import('./pages/AdminTeam'));
const AdminStats = lazy(() => import('./pages/AdminStats'));
const AdminBlogs = lazy(() => import('./pages/AdminBlogs'));
const AdminTestimonials = lazy(() => import('./pages/AdminTestimonials'));
const AdminContacts = lazy(() => import('./pages/AdminContacts'));
const AdminChatbotLeads = lazy(() => import('./pages/AdminChatbotLeads'));

function PublicRoute({ element }) {
  return <MainLayout>{element}</MainLayout>;
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname, location.search);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const preload = () => {
      import('./pages/About');
      import('./pages/Services');
      import('./pages/Projects');
      import('./pages/Contact');
      import('./pages/Blogs');
    };

    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(preload, { timeout: 1200 });
      return () => window.cancelIdleCallback(handle);
    }

    const timeout = window.setTimeout(preload, 600);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center bg-[#071c46] text-white" role="status" aria-live="polite">Loading page...</div>}>
      <>
        <Routes>
          <Route path="/" element={<PublicRoute element={<Home />} />} />
          <Route path="/about" element={<PublicRoute element={<About />} />} />
          <Route path="/services" element={<PublicRoute element={<Services />} />} />
          <Route path="/projects" element={<PublicRoute element={<Projects />} />} />
          <Route path="/blogs" element={<PublicRoute element={<Blogs />} />} />
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
          <Route path="/admin/chatbot-leads" element={<ProtectedRoute><AdminChatbotLeads /></ProtectedRoute>} />
          <Route path="*" element={<PublicRoute element={<NotFound />} />} />
        </Routes>

        {/* Global floating CTA: appears on all routes with safe mobile offset. */}
        <WhatsAppButton />
      </>
    </Suspense>
  );
}

// test deploy
