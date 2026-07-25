import { useEffect, useMemo, useState } from 'react';
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
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const { pathname } = useLocation();

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setOpenMenuKey(null);
    setMobileOpenMap({});
  }, [pathname]);

  const isDesktopOrLaptop = viewportWidth >= TABLET_BREAKPOINT;
  const isTablet = viewportWidth >= TABLET_BREAKPOINT && viewportWidth < MEGA_MENU_BREAKPOINT;
  const canUseMegaMenu = viewportWidth >= MEGA_MENU_BREAKPOINT;

  const servicesItem = useMemo(() => NAV_ITEMS.find((item) => item.key === 'services'), []);

  const isItemActive = (item) => {
    if (pathname === item.path) return true;
    if (!item.menu) return false;
    return item.menu.items.some((entry) => entry.path === pathname);
  };

  const closeMenu = () => setOpenMenuKey(null);

  const handleMegaMenuState = (shouldClose) => {
    if (shouldClose) {
      setOpenMenuKey(null);
    }
  };

  const toggleMobileGroup = (key) => {
    setMobileOpenMap((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <header className="ent-nav">
      <div
        className="ent-nav__container"
        onMouseLeave={isDesktopOrLaptop ? closeMenu : undefined}
      >
        <Link to="/" className="ent-nav__logo-link" aria-label="Anova Technologies home">
          <img src="/logoanova-white.png" alt="Anova Technologies" className="ent-nav__logo" />
        </Link>

        {isDesktopOrLaptop ? (
          <div className="ent-nav__center" onMouseLeave={isTablet ? undefined : closeMenu}>
            <nav className="ent-nav__links" aria-label="Primary">
              {NAV_ITEMS.map((item) => {
                const active = isItemActive(item);
                const isOpen = openMenuKey === item.key;
                const hasMenu = Boolean(item.menu);

                if (!hasMenu) {
                  return (
                    <NavLink
                      key={item.key}
                      to={item.path}
                      className={`ent-nav__link ${active ? 'is-active' : ''}`}
                    >
                      {item.label}
                    </NavLink>
                  );
                }

                const shouldUseMega = item.menu.type === 'mega' && canUseMegaMenu;

                return (
                  <div
                    key={item.key}
                    className="ent-nav__menu-item"
                    onMouseEnter={!isTablet ? () => setOpenMenuKey(item.key) : undefined}
                  >
                    <button
                      type="button"
                      className={`ent-nav__link ent-nav__trigger ${active || isOpen ? 'is-active' : ''}`}
                      onClick={() => setOpenMenuKey((current) => (current === item.key ? null : item.key))}
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

        <AnimatePresence>
          {openMenuKey === 'services' && canUseMegaMenu && servicesItem ? (
            <div className="ent-nav__mega-slot">
              <MegaMenu
                item={servicesItem}
                onClose={handleMegaMenuState}
              />
            </div>
          ) : null}
        </AnimatePresence>
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
