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
        className="border-b border-brand-200 bg-slate-950 p-5 sm:p-6 lg:border-b-0 lg:border-r lg:p-6"
      >
        <div className="mb-8 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:flex sm:items-center sm:justify-between sm:gap-4">
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-cyan-500 via-sky-500 to-indigo-500 text-lg font-bold shadow-lg shadow-cyan-500/20">A</div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-100">Anova Admin</p>
              <p className="text-xs text-slate-400">{user?.name || 'Dashboard'}</p>
            </div>
          </Link>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-300 sm:mt-0">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Online
          </div>
        </div>
        <nav className="space-y-2">
          {adminLinks.map((link) => (
            <motion.div key={link.path} variants={itemVariants}>
              <NavLink
                to={link.path}
                end={link.path === '/admin'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-100 text-slate-950 shadow-[0_12px_40px_rgba(15,23,42,0.08)]'
                      : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                  }`
                }
              >
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-slate-300 transition group-hover:bg-slate-800 group-hover:text-white">
                  <link.icon className="h-4 w-4" />
                </span>
                <span>{link.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>
        <motion.button
          variants={itemVariants}
          onClick={logout}
          className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(15,23,42,0.18)] transition hover:from-slate-800 hover:to-slate-700"
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
