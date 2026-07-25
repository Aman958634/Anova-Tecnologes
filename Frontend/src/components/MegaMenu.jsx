import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function MegaMenu({ item, onClose }) {
  const menu = item?.menu;
  const isOpen = Boolean(item && menu);

  if (!isOpen) {
    return null;
  }

  const columns = menu.columns ?? [];

  return (
    <AnimatePresence>
      <motion.div
        key={item.label}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="enterprise-mega"
        onMouseEnter={() => onClose(false)}
        onMouseLeave={() => onClose(true)}
      >
        <div className="enterprise-mega-columns">
          {columns.map((column, index) => {
            const showDivider = index < columns.length - 1;

            return (
              <article key={column.title} className={`enterprise-mega-column ${showDivider ? 'enterprise-mega-column-divider' : ''}`}>
                <h3 className="enterprise-mega-title">{column.title}</h3>

                <div className="enterprise-mega-links">
                  {column.items.map((child) => (
                    <Link
                      key={`${column.title}-${child.label}`}
                      to={child.path}
                      className="enterprise-mega-link"
                      onClick={() => onClose(true)}
                    >
                      <span className="enterprise-mega-link-text">{child.label}</span>
                      <ChevronRight className="enterprise-mega-link-caret" />
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
