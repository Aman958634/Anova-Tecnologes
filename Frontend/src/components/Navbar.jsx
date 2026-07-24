import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Home', path: '/' },
  {
    label: 'Services',
    path: '/services',
    children: [
      { label: 'All Services', path: '/services' },
      { label: 'Projects Showcase', path: '/projects' },
      { label: 'Contact for Quote', path: '/contact' },
    ],
  },
  {
    label: 'About',
    path: '/about',
    children: [
      { label: 'About Company', path: '/about' },
      { label: 'Contact', path: '/contact' },
    ],
  },
  { label: 'Projects', path: '/projects' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileDropdowns, setMobileDropdowns] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHomePage = pathname === '/';
  const isDarkHeader = isHomePage && !isScrolled;

  useEffect(() => {
    setOpen(false);
    setOpenDropdown(null);
    setMobileDropdowns({});
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const isItemActive = (item) => {
    if (pathname === item.path) return true;
    if (Array.isArray(item.children)) {
      return item.children.some((child) => pathname === child.path);
    }
    return false;
  };

  const toggleMobileDropdown = (label) => {
    setMobileDropdowns((current) => ({
      ...current,
      [label]: !current[label],
    }));
  };

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 overflow-visible border-b backdrop-blur-sm transition-colors duration-300 ${
        isDarkHeader
          ? 'border-transparent bg-[#16336F]/98 shadow-[0_12px_30px_rgba(4,12,34,0.16)]'
          : 'border-slate-200 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04)]'
      }`}
    >
      <div className="section-shell flex h-[90px] items-center justify-between gap-4 lg:h-[96px] lg:gap-8">
        <Link to="/" className="group flex shrink-0 items-center">
          <img
            src={isDarkHeader ? '/logoanova-white.png' : '/logoanova.png'}
            alt="Anova Technologies"
            className={`h-auto w-[138px] max-w-none object-contain transition duration-300 group-hover:scale-[1.01] sm:w-[116px] md:w-[110px] lg:w-[190px] ${
              isDarkHeader ? 'brightness-110 contrast-[1.2] drop-shadow-[0_3px_8px_rgba(2,6,23,0.55)]' : 'contrast-[1.14] saturate-110'
            }`}
            loading="eager"
            decoding="async"
            draggable="false"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 xl:gap-8 lg:flex">
          {navItems.map((item) => {
            const active = isItemActive(item);
            const linkBaseClass = isDarkHeader ? 'text-white hover:text-[#d6e6ff]' : 'text-slate-700 hover:text-[#2f80ff]';
            if (!item.children) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative overflow-hidden text-[1.12rem] font-normal transition ${isActive ? 'text-[#7cb2ff]' : linkBaseClass}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10">{item.label}</span>
                      <span
                        className={`absolute left-0 -bottom-1 h-[2px] rounded-full transition-all duration-300 ${isActive ? 'w-full bg-[#7cb2ff]' : 'w-0 bg-[#7cb2ff] group-hover:w-full'}`}
                      />
                    </>
                  )}
                </NavLink>
              );
            }

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() => setOpenDropdown((current) => (current === item.label ? null : item.label))}
                  className={`group inline-flex items-center gap-1.5 text-[1.12rem] font-normal transition ${active ? 'text-[#7cb2ff]' : linkBaseClass}`}
                >
                  <span>{item.label}</span>
                  <ChevronDown className={`h-4 w-4 transition ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] rounded-full transition-all duration-300 ${active || openDropdown === item.label ? 'w-full bg-[#7cb2ff]' : 'w-0 bg-[#7cb2ff] group-hover:w-full'}`}
                  />
                </button>

                <AnimatePresence>
                  {openDropdown === item.label ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 top-full mt-3 min-w-[220px] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_38px_rgba(2,6,23,0.10)]"
                    >
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            `block rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-[#eef4ff] text-[#2f6df7]' : 'text-slate-700 hover:bg-slate-50 hover:text-[#2f6df7]'}`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
            <Link to="/contact" className={`hidden items-center rounded-full px-4 py-2.5 text-sm font-semibold transition sm:inline-flex sm:px-5 sm:py-3 ${isDarkHeader ? 'border border-white/15 bg-white text-[#16336F] hover:bg-white/95' : 'bg-[#2f6df7] text-white shadow-[0_10px_24px_rgba(47,109,247,0.24)] hover:bg-[#2563eb]'}`}>
              Get in Touch
            </Link>
          </motion.div>

          <motion.button
            onClick={() => setOpen((value) => !value)}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className={`flex h-11 w-11 items-center justify-center rounded-full lg:hidden ${isDarkHeader ? 'text-white' : 'text-slate-900'}`}
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
            className={`${isDarkHeader ? 'border-t border-white/10 bg-[#16336F]' : 'border-t border-slate-200 bg-white'} lg:hidden`}
          >
            <div className="section-shell flex flex-col gap-3 py-4">
              {navItems.map((item) => (
                <div key={item.label} className={`rounded-2xl border ${isDarkHeader ? 'border-white/10 bg-white/5' : 'border-slate-200/70 bg-white'}`}>
                  {!item.children ? (
                    <Link
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={`block rounded-2xl px-4 py-3 text-sm transition ${isDarkHeader ? 'text-white hover:bg-white/10 hover:text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-[#2f6df7]'}`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleMobileDropdown(item.label)}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${isDarkHeader ? 'text-white hover:bg-white/10 hover:text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-[#2f6df7]'}`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`h-4 w-4 transition ${mobileDropdowns[item.label] ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {mobileDropdowns[item.label] ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-2 pb-2">
                              {item.children.map((child) => (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  onClick={() => setOpen(false)}
                                  className={`block rounded-xl px-3 py-2 text-sm transition ${isDarkHeader ? 'text-slate-100 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2f6df7]'}`}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              ))}
              <Link to="/contact" onClick={() => setOpen(false)} className={`w-full justify-center ${isDarkHeader ? 'btn-secondary bg-white text-[#16336F]' : 'btn-primary'}`}>Get in Touch</Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
