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
  const [mobileDropdowns, setMobileDropdowns] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const closeTimerRef = useRef(null);
  const openTimerRef = useRef(null);
  const desktopNavRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setOpenMenuKey(null);
    setMobileDropdowns({});
  }, [pathname]);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isDesktopOrLaptop = viewportWidth >= TABLET_BREAKPOINT;
  const isTablet = viewportWidth >= TABLET_BREAKPOINT && viewportWidth < MEGA_MENU_BREAKPOINT;
  const canUseMegaMenu = viewportWidth >= MEGA_MENU_BREAKPOINT;

  const visibleNavItems = useMemo(() => NAV_ITEMS.filter((item) => item.key !== 'contact'), []);
  const servicesItem = useMemo(() => visibleNavItems.find((item) => item.key === 'services'), [visibleNavItems]);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    clearOpenTimer();
    clearCloseTimer();
    setOpenMenuKey((current) => (current === null ? current : null));
  }, [clearCloseTimer, clearOpenTimer]);

  const openMenuInstant = useCallback((key) => {
    clearOpenTimer();
    clearCloseTimer();
    setOpenMenuKey((current) => (current === key ? current : key));
  }, [clearCloseTimer, clearOpenTimer]);

  const startOpenTimer = useCallback((key) => {
    clearOpenTimer();
    clearCloseTimer();
    openTimerRef.current = setTimeout(() => {
      setOpenMenuKey((current) => (current === key ? current : key));
      openTimerRef.current = null;
    }, 200);
  }, [clearCloseTimer, clearOpenTimer]);

  const startCloseTimer = useCallback(() => {
    clearCloseTimer();
    clearOpenTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpenMenuKey((current) => (current === null ? current : null));
      closeTimerRef.current = null;
    }, 200);
  }, [clearCloseTimer, clearOpenTimer]);

  const startDropdownCloseTimer = useCallback(() => {
    clearCloseTimer();
    clearOpenTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpenMenuKey((current) => (current === null ? current : null));
      closeTimerRef.current = null;
    }, 150);
  }, [clearCloseTimer, clearOpenTimer]);

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

  const toggleMobileDropdown = useCallback((key) => {
    setMobileDropdowns((current) => ({
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
      <div className="ent-nav__container navbar-container">
        <Link to="/" className="ent-nav__logo-link" aria-label="Anova Technologies home">
          <img
            src={isScrolled ? '/logoanova.webp' : '/logoanova-white.webp'}
            alt="Anova Technologies logo"
            width={140}
            height={56}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="ent-nav__logo"
          />
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
              {visibleNavItems.map((item) => {
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
              const isSmallDropdown = !shouldUseMega;

              return (
                <div
                  key={item.key}
                  className={`ent-nav__menu-item ${isSmallDropdown ? 'ent-nav__menu-item--dropdown' : ''}`}
                  onMouseEnter={!isTablet ? () => (isSmallDropdown ? startOpenTimer(item.key) : openMenuInstant(item.key)) : undefined}
                  onMouseLeave={isServicesMega ? startCloseTimer : isSmallDropdown ? startDropdownCloseTimer : undefined}
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

                  {isOpen && !shouldUseMega ? (
                    <Dropdown
                      title={item.label}
                      items={item.menu.items}
                      onClose={closeMenu}
                      onEnter={() => {
                        clearOpenTimer();
                        clearCloseTimer();
                      }}
                      onLeave={startDropdownCloseTimer}
                      menuId={`menu-${item.key}`}
                    />
                  ) : null}
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
            /* The hamburger icon uses currentColor, so the navbar CSS can switch it from white to dark when the header becomes scrolled. */
            <button
              type="button"
              className="ent-nav__hamburger"
              onClick={() => setIsMobileOpen((value) => !value)}
              aria-label="Toggle menu"
              aria-expanded={isMobileOpen}
              aria-controls="mobile-navigation"
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

      {!isDesktopOrLaptop && isMobileOpen ? (
        <div className="ent-nav__mobile">
            <nav id="mobile-navigation" className="ent-nav__mobile-list" aria-label="Mobile Navigation">
              {visibleNavItems.map((item) => {
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

                const mobileOpen = Boolean(mobileDropdowns[item.key]);

                return (
                  <div key={item.key} className="ent-nav__mobile-group">
                    <button
                      type="button"
                      className="ent-nav__mobile-trigger"
                      onClick={() => toggleMobileDropdown(item.key)}
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

              <Link
                to="/contact"
                className="ent-nav__mobile-cta"
                onClick={() => setIsMobileOpen(false)}
              >
                Get In Touch
              </Link>
            </nav>
        </div>
      ) : null}
    </header>
  );
}
