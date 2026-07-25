import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import MegaMenu from './MegaMenu';
import Dropdown from './Dropdown';
import { NAV_ITEMS } from './NavigationData';
import './Navbar.css';
import './MegaMenu.css';

const TABLET_BREAKPOINT = 768;
const MEGA_MENU_BREAKPOINT = 1024;

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [mobileOpenMap, setMobileOpenMap] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const closeTimerRef = useRef(null);
  const desktopNavRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setOpenMenuKey(null);
    setMobileOpenMap({});
  }, [pathname]);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  }, []);

  const isDesktopOrLaptop = viewportWidth >= TABLET_BREAKPOINT;
  const isTablet = viewportWidth >= TABLET_BREAKPOINT && viewportWidth < MEGA_MENU_BREAKPOINT;
  const canUseMegaMenu = viewportWidth >= MEGA_MENU_BREAKPOINT;

  const servicesItem = useMemo(() => NAV_ITEMS.find((item) => item.key === 'services'), []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    setOpenMenuKey((current) => (current === null ? current : null));
  }, [clearCloseTimer]);

  const openMenuInstant = useCallback((key) => {
    clearCloseTimer();
    setOpenMenuKey((current) => (current === key ? current : key));
  }, [clearCloseTimer]);

  const startCloseTimer = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpenMenuKey((current) => (current === null ? current : null));
      closeTimerRef.current = null;
    }, 200);
  }, [clearCloseTimer]);

  const handleGlobalKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    },
    [closeMenu]
  );

  const handleDesktopNavKeyDown = useCallback(
    (event) => {
      if (!desktopNavRef.current) return;

      const focusables = Array.from(
        desktopNavRef.current.querySelectorAll('[data-nav-focusable="true"]')
      );
      if (focusables.length === 0) return;

      const currentIndex = focusables.indexOf(document.activeElement);
      if (currentIndex === -1) return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % focusables.length;
        focusables[nextIndex].focus();
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + focusables.length) % focusables.length;
        focusables[prevIndex].focus();
      }
    },
    []
  );

  const handleTriggerKeyDown = useCallback(
    (event, key) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpenMenuKey((current) => (current === key ? null : key));
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openMenuInstant(key);
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
      }
    },
    [closeMenu, openMenuInstant]
  );

  const toggleMobileGroup = useCallback((key) => {
    setMobileOpenMap((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  return (
    <header className={`ent-nav ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="ent-nav__container">
        <Link to="/" className="ent-nav__logo-link" aria-label="Anova Technologies home">
          <img src={isScrolled ? '/logoanova.png' : '/logoanova-white.png'} alt="Anova Technologies" className="ent-nav__logo" />
        </Link>

        {isDesktopOrLaptop ? (
          <div className="ent-nav__center">
            <nav
              className="ent-nav__links"
              aria-label="Primary"
              role="menubar"
              ref={desktopNavRef}
              onKeyDown={handleDesktopNavKeyDown}
            >
              {NAV_ITEMS.map((item) => {
                const isOpen = openMenuKey === item.key;
                const hasMenu = Boolean(item.menu);

                if (!hasMenu) {
                  return (
                    <NavLink
                      key={item.key}
                      to={item.path}
                      className="ent-nav__link"
                      data-nav-focusable="true"
                      role="menuitem"
                    >
                      {item.label}
                    </NavLink>
                  );
                }

                const shouldUseMega = item.menu.type === 'mega' && canUseMegaMenu;
                const isServicesMega = item.key === 'services' && shouldUseMega;

                return (
                  <div
                    key={item.key}
                    className="ent-nav__menu-item"
                    onMouseEnter={!isTablet ? () => openMenuInstant(item.key) : undefined}
                    onMouseLeave={isServicesMega ? startCloseTimer : undefined}
                  >
                    <button
                      type="button"
                      className="ent-nav__link ent-nav__trigger"
                      data-nav-focusable="true"
                      role="menuitem"
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                      aria-controls={`menu-${item.key}`}
                      onClick={() => setOpenMenuKey((current) => (current === item.key ? null : item.key))}
                      onKeyDown={(event) => handleTriggerKeyDown(event, item.key)}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`ent-nav__chevron ${isOpen ? 'is-open' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isOpen && !shouldUseMega ? (
                        <Dropdown
                          title={item.label}
                          items={item.menu.items}
                          onClose={closeMenu}
                          menuId={`menu-${item.key}`}
                        />
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>
          </div>
        ) : null}

        <div className="ent-nav__right">
          <Link to="/contact" className="ent-nav__cta">
            Get In Touch
          </Link>

          {!isDesktopOrLaptop ? (
            <button
              type="button"
              className="ent-nav__hamburger"
              onClick={() => setIsMobileOpen((value) => !value)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          ) : null}
        </div>

        {canUseMegaMenu && servicesItem ? (
          <div
            className={`ent-nav__mega-slot ${openMenuKey === 'services' ? 'is-visible' : ''}`}
            onMouseEnter={clearCloseTimer}
            onMouseLeave={startCloseTimer}
          >
            <MegaMenu
              item={servicesItem}
              isVisible={openMenuKey === 'services'}
              onClose={closeMenu}
              menuId="menu-services"
            />
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {!isDesktopOrLaptop && isMobileOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="ent-nav__mobile"
          >
            <nav className="ent-nav__mobile-list" aria-label="Mobile Navigation">
              {NAV_ITEMS.map((item) => {
                const hasMenu = Boolean(item.menu);

                if (!hasMenu) {
                  return (
                    <Link
                      key={item.key}
                      to={item.path}
                      className="ent-nav__mobile-link"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                }

                const mobileOpen = Boolean(mobileOpenMap[item.key]);

                return (
                  <div key={item.key} className="ent-nav__mobile-group">
                    <button
                      type="button"
                      className="ent-nav__mobile-trigger"
                      onClick={() => toggleMobileGroup(item.key)}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`ent-nav__mobile-chevron ${mobileOpen ? 'is-open' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {mobileOpen ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: 'easeOut' }}
                          className="ent-nav__mobile-submenu"
                        >
                          {item.menu.items.map((entry) => (
                            <Link
                              key={`${item.key}-${entry.label}`}
                              to={entry.path}
                              className="ent-nav__mobile-sublink"
                              onClick={() => setIsMobileOpen(false)}
                            >
                              {entry.label}
                            </Link>
                          ))}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
