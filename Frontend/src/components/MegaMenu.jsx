import { memo, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
const ChevronRight = lazy(() => import('lucide-react').then((mod) => ({ default: mod.ChevronRight })));
const Code2 = lazy(() => import('lucide-react').then((mod) => ({ default: mod.Code2 })));
const Smartphone = lazy(() => import('lucide-react').then((mod) => ({ default: mod.Smartphone })));
const Palette = lazy(() => import('lucide-react').then((mod) => ({ default: mod.Palette })));
const Bot = lazy(() => import('lucide-react').then((mod) => ({ default: mod.Bot })));
const Cloud = lazy(() => import('lucide-react').then((mod) => ({ default: mod.Cloud })));
const Megaphone = lazy(() => import('lucide-react').then((mod) => ({ default: mod.Megaphone })));

const ICON_MAP = {
  Code2,
  Smartphone,
  Palette,
  Bot,
  Cloud,
  Megaphone,
};

function MegaMenu({ item, isVisible, onClose, menuId }) {
  if (!item?.menu?.columns?.length) {
    return null;
  }

  const columns = item.menu.columns;

  return (
    <div className={`ent-mega ${isVisible ? 'is-visible' : ''}`} id={menuId} role="menu" aria-label={item.label}>
      <div className="ent-mega__grid">
        {columns.map((column, index) => {
          const IconComponent = ICON_MAP[column.icon] ?? Code2;
          const withDivider = index < columns.length - 1;

          return (
            <article key={column.title} className={`ent-mega__column ${withDivider ? 'is-divider' : ''}`}>
              <header className="ent-mega__head">
                <span className="ent-mega__icon-wrap">
                  <IconComponent size={18} />
                </span>
                <h3 className="ent-mega__title">{column.title}</h3>
              </header>

              <div className="ent-mega__links">
                {column.items.map((entry) => (
                  <Link
                    key={`${column.title}-${entry.label}`}
                    to={entry.path}
                    className="ent-mega__link"
                    role="menuitem"
                    onClick={onClose}
                  >
                    <span>{entry.label}</span>
                    <Suspense fallback={null}>
                      <ChevronRight className="ent-mega__arrow" size={14} />
                    </Suspense>
                  </Link>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default memo(MegaMenu);
