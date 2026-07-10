import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navLinks } from '../utils/siteData';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname } = useLocation();
  const isContactPage = pathname === '/contact';

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isLightHeader = isContactPage || isScrolled;

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 overflow-visible backdrop-blur-sm transition-colors duration-300 ${isLightHeader ? 'border-b border-slate-200 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04)]' : 'bg-[#0a2a66]/95'}`}
    >
      <div className="section-shell flex h-[90px] items-center justify-between gap-4 lg:h-[96px] lg:gap-8">
        <Link to="/" className="group flex shrink-0 items-center">
          <img
            src={isLightHeader ? '/logoanova.png' : '/logoanova-white.png'}
            alt="Anova Technologies"
            className={`h-auto w-[138px] max-w-none object-contain transition duration-300 group-hover:scale-[1.01] sm:w-[116px] md:w-[110px] lg:w-[190px] ${
              isLightHeader
                ? 'contrast-[1.14] saturate-110'
                : 'brightness-110 contrast-[1.2] drop-shadow-[0_3px_8px_rgba(2,6,23,0.55)]'
            }`}
            loading="eager"
            decoding="async"
            draggable="false"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 xl:gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `group relative overflow-hidden text-[1.12rem] font-normal transition ${isActive ? 'text-[#2f80ff]' : isLightHeader ? 'text-slate-700 hover:text-[#2f80ff]' : 'text-white hover:text-[#9fc1ff]'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{link.label}</span>
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] rounded-full transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'} ${isLightHeader ? 'bg-[#2563eb]' : 'bg-[#9fc1ff]'}`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
            <Link to="/contact" className={`hidden items-center rounded-full px-4 py-2.5 text-sm font-semibold transition sm:inline-flex sm:px-5 sm:py-3 ${isLightHeader ? 'bg-[#2f6df7] text-white shadow-[0_10px_24px_rgba(47,109,247,0.24)] hover:bg-[#2563eb]' : 'border border-white/15 bg-white text-[#1d4ed8] hover:bg-white/90'}`}>
              Get in Touch
            </Link>
          </motion.div>

          <motion.button
            onClick={() => setOpen((value) => !value)}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className={`flex h-11 w-11 items-center justify-center rounded-full lg:hidden ${isLightHeader ? 'text-slate-900' : 'text-white'}`}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`${isLightHeader ? 'border-t border-slate-200 bg-white' : 'bg-[#0a2a66]'} lg:hidden`}
          >
            <div className="section-shell flex flex-col gap-3 py-4">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setOpen(false)} className={`rounded-2xl px-4 py-3 text-sm transition ${isLightHeader ? 'text-slate-700 hover:bg-slate-100 hover:text-[#2f6df7]' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                  {link.label}
                </Link>
              ))}
              <Link to="/contact" onClick={() => setOpen(false)} className="btn-primary w-full justify-center">Contact</Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
