import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Mail, Newspaper, Shapes, Star, FolderKanban, Users, BarChart3, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Services', path: '/admin/services', icon: Shapes },
  { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
  { label: 'Team', path: '/admin/team', icon: Users },
  { label: 'Stats', path: '/admin/stats', icon: BarChart3 },
  { label: 'Blogs', path: '/admin/blogs', icon: Newspaper },
  { label: 'Testimonials', path: '/admin/testimonials', icon: Star },
  { label: 'Contacts', path: '/admin/contacts', icon: Mail },
  { label: 'Chatbot Leads', path: '/admin/chatbot-leads', icon: Bot }
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const sidebarVariants = {
    hidden: { opacity: 0, x: -16 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.32,
        ease: 'easeOut',
        staggerChildren: 0.05,
        delayChildren: 0.06
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="admin-light min-h-screen bg-brand-50 lg:grid lg:grid-cols-[280px_1fr]">
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="show"
        className="border-r border-brand-200 bg-white p-6"
      >
        <Link to="/" className="mb-10 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 via-cyan-500 to-emerald-400 text-white font-bold">A</div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700">Admin</p>
            <p className="text-xs text-brand-600">{user?.name || 'Dashboard'}</p>
          </div>
        </Link>
        <nav className="space-y-2">
          {adminLinks.map((link) => (
            <motion.div key={link.path} variants={itemVariants}>
              <NavLink
                to={link.path}
                end={link.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#e9f1ff] text-[#1e4db8]'
                      : 'text-[#4a648f] hover:bg-[#f2f7ff] hover:text-[#1e4db8]'
                  }`
                }
              >
                <link.icon className="h-4 w-4" /> {link.label}
              </NavLink>
            </motion.div>
          ))}
        </nav>
        <motion.button
          variants={itemVariants}
          onClick={logout}
          className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d9e7ff] bg-[#f2f7ff] px-4 py-3 text-sm font-medium text-[#1e4db8] transition hover:bg-[#e6f0ff]"
        >
          <LogOut className="h-4 w-4" /> Logout
        </motion.button>
      </motion.aside>
      <motion.section
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="p-4 sm:p-6 lg:p-8"
      >
        {children}
      </motion.section>
    </div>
  );
}
