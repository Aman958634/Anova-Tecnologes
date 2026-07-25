import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, FileText, Sparkles } from 'lucide-react';

const defaultPromo = {
  title: 'Need a Custom IT Solution?',
  description: 'We build scalable, secure, future-ready solutions tailored for your business.',
  buttonLabel: 'Talk to Our Experts',
  buttonPath: '/contact',
  stats: [
    { value: '150+', label: 'Happy Clients' },
    { value: '250+', label: 'Projects' },
    { value: '24/7', label: 'Support' },
  ],
};

export default function MegaMenu({ item, onClose }) {
  const menu = item?.menu;
  const isOpen = Boolean(item && menu);

  if (!isOpen) {
    return null;
  }

  const promo = menu.promo ?? defaultPromo;
  const columns = menu.columns ?? [];
  const columnCount = Math.max(1, Math.min(6, columns.length));

  return (
    <AnimatePresence>
      <motion.div
        key={item.label}
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="enterprise-mega"
        style={{ '--enterprise-cols': columnCount }}
        onMouseEnter={() => onClose(false)}
        onMouseLeave={() => onClose(true)}
      >
        <div className="enterprise-mega-decor enterprise-mega-decor-top" aria-hidden="true" />
        <div className="enterprise-mega-decor enterprise-mega-decor-bottom" aria-hidden="true" />
        <div className="enterprise-mega-grid-overlay" aria-hidden="true" />
        <div className="enterprise-mega-noise" aria-hidden="true" />
        <div className="enterprise-mega-float enterprise-mega-float-a" aria-hidden="true" />
        <div className="enterprise-mega-float enterprise-mega-float-b" aria-hidden="true" />

        <div className="enterprise-mega-layout">
          <div className="enterprise-mega-columns">
            {columns.map((column, index) => {
              const Icon = column.icon || FileText;
              const showDivider = index < columns.length - 1;

              return (
                <article key={column.title} className={`enterprise-mega-card ${showDivider ? 'enterprise-mega-card-divider' : ''}`}>
                  <header className="enterprise-mega-head">
                    <span className="enterprise-mega-icon-wrap">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="enterprise-mega-title">{column.title}</h3>
                  </header>

                  <div className="enterprise-mega-links">
                    {column.items.map((child) => (
                      <Link
                        key={`${column.title}-${child.label}`}
                        to={child.path}
                        className="enterprise-mega-link"
                        onClick={() => onClose(true)}
                      >
                        <ChevronRight className="enterprise-mega-link-caret" />
                        <span className="enterprise-mega-link-text">{child.label}</span>
                      </Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="enterprise-mega-cta">
            <div className="enterprise-mega-cta-visual" aria-hidden="true">
              <div className="enterprise-mega-cta-chip enterprise-mega-cta-chip-a" />
              <div className="enterprise-mega-cta-chip enterprise-mega-cta-chip-b" />
              <div className="enterprise-mega-cta-chip enterprise-mega-cta-chip-c" />
              <div className="enterprise-mega-cta-glow">
                <Sparkles className="h-7 w-7" />
              </div>
            </div>

            <h3 className="enterprise-mega-cta-title">{promo.title}</h3>
            <p className="enterprise-mega-cta-copy">{promo.description}</p>

            <Link to={promo.buttonPath} className="enterprise-mega-cta-button" onClick={() => onClose(true)}>
              {promo.buttonLabel}
              <ChevronRight className="h-4 w-4" />
            </Link>

            <div className="enterprise-mega-cta-stats">
              {promo.stats.map((stat) => (
                <div key={stat.label} className="enterprise-mega-cta-stat">
                  <div className="enterprise-mega-cta-stat-value">{stat.value}</div>
                  <div className="enterprise-mega-cta-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
