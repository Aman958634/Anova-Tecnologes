import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronRight,
  Cloud,
  Code2,
  FileText,
  Headset,
  Menu,
  Megaphone,
  Palette,
  Rocket,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Home', path: '/' },
  {
    label: 'Services',
    path: '/services',
    menu: {
      kind: 'mega',
      columns: [
        {
          title: 'Web Development Services',
          icon: Code2,
          items: [
            { label: 'Custom Website Development', path: '/services' },
            { label: 'E-Commerce', path: '/services' },
            { label: 'CMS Development', path: '/services' },
            { label: 'Web Application Development', path: '/services' },
            { label: 'Progressive Web Apps', path: '/services' },
          ],
        },
        {
          title: 'Mobile App Development',
          icon: Smartphone,
          items: [
            { label: 'Android App Development', path: '/services' },
            { label: 'iOS App Development', path: '/services' },
            { label: 'Flutter App Development', path: '/services' },
            { label: 'React Native Development', path: '/services' },
            { label: 'Cross Platform Apps', path: '/services' },
          ],
        },
        {
          title: 'UI/UX Design Services',
          icon: Palette,
          items: [
            { label: 'UI Design', path: '/services' },
            { label: 'UX Research', path: '/services' },
            { label: 'Wireframing', path: '/services' },
            { label: 'Prototyping', path: '/services' },
            { label: 'Design Systems', path: '/services' },
          ],
        },
        {
          title: 'AI & Digital Solutions',
          icon: Bot,
          items: [
            { label: 'AI Chatbots', path: '/services' },
            { label: 'OpenAI Integration', path: '/services' },
            { label: 'Workflow Automation', path: '/services' },
            { label: 'Machine Learning', path: '/services' },
            { label: 'Data Analytics', path: '/services' },
          ],
        },
        {
          title: 'Cloud & DevOps',
          icon: Cloud,
          items: [
            { label: 'AWS Services', path: '/services' },
            { label: 'Microsoft Azure', path: '/services' },
            { label: 'Google Cloud', path: '/services' },
            { label: 'Docker & Kubernetes', path: '/services' },
            { label: 'CI/CD Automation', path: '/services' },
          ],
        },
        {
          title: 'Digital Marketing',
          icon: Megaphone,
          items: [
            { label: 'Search Engine Optimization', path: '/services' },
            { label: 'Google Ads Management', path: '/services' },
            { label: 'Social Media Marketing', path: '/services' },
            { label: 'Content Marketing', path: '/services' },
            { label: 'Analytics & Reporting', path: '/services' },
          ],
        },
      ],
      promo: {
        title: 'Need a Custom IT Solution?',
        description: 'We build scalable, secure, future-ready solutions tailored for your business.',
        buttonLabel: 'Talk to Our Experts',
        buttonPath: '/contact',
        stats: [
          { value: '150+', label: 'Happy Clients' },
          { value: '250+', label: 'Projects' },
          { value: '24/7', label: 'Support' },
        ],
      },
    },
  },
  {
    label: 'Solutions',
    path: '/services',
    menu: {
      kind: 'list',
      columns: [
        {
          title: 'Smart Solutions',
          icon: Sparkles,
          items: [
            { label: 'AI Chatbot', path: '/services' },
            { label: 'OpenAI Integration', path: '/services' },
            { label: 'Automation', path: '/services' },
            { label: 'Machine Learning', path: '/services' },
            { label: 'Data Analytics', path: '/services' },
          ],
        },
      ],
    },
  },
  {
    label: 'Industries',
    path: '/projects',
    menu: {
      kind: 'list',
      columns: [
        {
          title: 'Industries Served',
          icon: BriefcaseBusiness,
          items: [
            { label: 'Healthcare', path: '/projects' },
            { label: 'E-Commerce', path: '/projects' },
            { label: 'Mobile Apps', path: '/projects' },
            { label: 'Web Applications', path: '/projects' },
          ],
        },
      ],
    },
  },
  {
    label: 'Projects',
    path: '/projects',
    menu: {
      kind: 'list',
      columns: [
        {
          title: 'Featured Work',
          icon: Rocket,
          items: [
            { label: 'Portfolio', path: '/projects' },
            { label: 'Case Studies', path: '/projects' },
            { label: 'Client Success Stories', path: '/projects' },
            { label: 'Healthcare Projects', path: '/projects' },
            { label: 'E-Commerce Projects', path: '/projects' },
          ],
        },
      ],
    },
  },
  {
    label: 'Resources',
    path: '/about',
    menu: {
      kind: 'list',
      columns: [
        {
          title: 'Insights & Media',
          icon: BookOpen,
          items: [
            { label: 'News & Blog', path: '/about' },
            { label: 'Certifications', path: '/about' },
            { label: 'Why Choose Us', path: '/about' },
          ],
        },
      ],
    },
  },
  {
    label: 'Company',
    path: '/about',
    menu: {
      kind: 'list',
      columns: [
        {
          title: 'Company Overview',
          icon: Building2,
          items: [
            { label: 'Company Profile', path: '/about' },
            { label: 'Our Team', path: '/about' },
            { label: 'Mission & Vision', path: '/about' },
            { label: 'Careers', path: '/about' },
          ],
        },
      ],
    },
  },
  {
    label: 'Contact',
    path: '/contact',
    menu: {
      kind: 'list',
      columns: [
        {
          title: 'Contact Options',
          icon: Headset,
          items: [
            { label: 'Contact Us', path: '/contact' },
            { label: 'Request a Quote', path: '/contact' },
            { label: 'Book Free Consultation', path: '/contact' },
            { label: 'Customer Support', path: '/contact' },
            { label: 'Office Location', path: '/contact' },
          ],
        },
      ],
    },
  },
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

  const renderMenuCard = (menuItem) => {
    const Icon = menuItem.icon || FileText;

    return (
      <div className="min-w-0 border-r border-white/10 px-4 py-4 last:border-r-0 last:pr-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white/8 text-[#5da3ff] ring-1 ring-inset ring-white/10">
            <Icon className="h-4 w-4" />
          </span>
          <h3 className="text-[0.96rem] font-semibold leading-tight tracking-tight text-white">{menuItem.title}</h3>
        </div>

        <div className="space-y-1">
          {menuItem.items.map((child) => (
            <Link
              key={`${menuItem.title}-${child.label}`}
              to={child.path}
              onClick={() => setOpen(false)}
              className="group flex items-start gap-2 rounded-xl px-1.5 py-1 text-[0.88rem] leading-5 text-slate-300 transition hover:text-white"
            >
              <ChevronRight className="mt-[0.15rem] h-3.5 w-3.5 shrink-0 text-[#5da3ff] transition group-hover:translate-x-0.5" />
              <span className="max-w-[210px]">{child.label}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed left-0 right-0 top-0 z-[70] w-full overflow-visible border-b backdrop-blur-sm transition-colors duration-300 ${
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
            className={`h-auto w-[132px] max-w-none object-contain transition duration-300 group-hover:scale-[1.01] sm:w-[118px] md:w-[122px] lg:w-[165px] xl:w-[182px] ${
              isDarkHeader ? 'brightness-110 contrast-[1.2] drop-shadow-[0_3px_8px_rgba(2,6,23,0.55)]' : 'contrast-[1.14] saturate-110'
            }`}
            loading="eager"
            decoding="async"
            draggable="false"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-2 xl:gap-3 2xl:gap-4 lg:flex">
          {navItems.map((item) => {
            const active = isItemActive(item);
            const hasMenu = Boolean(item.menu);
            const linkBaseClass = isDarkHeader ? 'text-white/85 hover:text-white' : 'text-slate-700 hover:text-[#2f80ff]';
            if (!hasMenu) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group rounded-full px-2.5 py-2 text-[0.92rem] xl:text-[0.94rem] 2xl:text-[0.98rem] font-medium transition ${isActive ? 'bg-white/10 text-[#5da3ff]' : linkBaseClass}`
                  }
                >
                  {item.label}
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
                  className={`group inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-[0.92rem] xl:text-[0.94rem] 2xl:text-[0.98rem] font-medium transition ${active ? 'bg-white/10 text-[#5da3ff]' : linkBaseClass}`}
                >
                  <span>{item.label}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {openDropdown === item.label ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className={`absolute top-full mt-3 overflow-hidden rounded-[28px] border backdrop-blur-xl ${item.menu.kind === 'mega' ? 'left-1/2 w-[min(1320px,calc(100vw-2rem))] -translate-x-1/2 border-white/10 bg-[#071225]/96 shadow-[0_28px_80px_rgba(2,8,23,0.56)]' : 'left-0 min-w-[320px] border-white/10 bg-[#071225]/96 shadow-[0_22px_55px_rgba(2,8,23,0.42)]'}`}
                    >
                      {item.menu.kind === 'mega' ? (
                        <div className="grid grid-cols-1 gap-0 xl:grid-cols-[repeat(6,minmax(0,1fr))_300px]">
                          <div className="col-span-1 grid grid-cols-1 gap-0 xl:col-span-6 xl:grid-cols-6">
                            {item.menu.columns.map((column) => renderMenuCard(column))}
                          </div>
                          <div className="border-t border-white/10 bg-[#0b1d3f] p-4 xl:border-l xl:border-t-0">
                            <div className="mb-3 flex h-24 items-center justify-center rounded-[24px] bg-[radial-gradient(circle_at_top,_rgba(58,130,246,0.38),_rgba(7,18,37,0.2)_55%),linear-gradient(135deg,rgba(37,99,235,0.35),rgba(14,22,40,0.92))] ring-1 ring-inset ring-white/10">
                              <div className="grid h-16 w-16 place-items-center rounded-[20px] border border-white/15 bg-white/8 text-[#5da3ff] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
                                <Sparkles className="h-8 w-8" />
                              </div>
                            </div>
                            <h3 className="text-[1.02rem] font-semibold leading-tight text-white">{item.menu.promo.title}</h3>
                            <p className="mt-2 text-[0.88rem] leading-5 text-slate-300">{item.menu.promo.description}</p>
                            <Link
                              to={item.menu.promo.buttonPath}
                              onClick={() => setOpenDropdown(null)}
                              className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-[#2f6df7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563eb]"
                            >
                              {item.menu.promo.buttonLabel}
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {item.menu.promo.stats.map((stat) => (
                                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-center">
                                  <div className="text-base font-semibold text-white">{stat.value}</div>
                                  <div className="mt-1 text-[0.65rem] uppercase tracking-[0.15em] text-slate-400">{stat.label}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                          {item.menu.columns.map((column) => renderMenuCard(column))}
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
            <Link to="/contact" className={`hidden whitespace-nowrap items-center rounded-full px-4 py-2.5 text-sm font-semibold transition xl:inline-flex ${isDarkHeader ? 'border border-white/15 bg-white text-[#16336F] hover:bg-white/95' : 'bg-[#2f6df7] text-white shadow-[0_10px_24px_rgba(47,109,247,0.24)] hover:bg-[#2563eb]'}`}>
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
                  {!item.menu ? (
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
                            <div className="space-y-2 px-2 pb-2">
                              {item.menu.columns.flatMap((column) => column.items).map((child) => (
                                <Link
                                  key={`${item.label}-${child.label}`}
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
