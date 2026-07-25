import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function MegaMenu({ item, isVisible, onClose }) {
  if (!item?.menu?.columns?.length) {
    return null;
  }

  const columns = item.menu.columns;

  return (
    <div className={`ent-mega ${isVisible ? 'is-visible' : ''}`}>
      <div className="ent-mega__grid">
        {columns.map((column, index) => {
          const Icon = column.icon;
          const withDivider = index < columns.length - 1;

          return (
            <article key={column.title} className={`ent-mega__column ${withDivider ? 'is-divider' : ''}`}>
              <header className="ent-mega__head">
                <span className="ent-mega__icon-wrap">
                  <Icon size={18} />
                </span>
                <h3 className="ent-mega__title">{column.title}</h3>
              </header>

              <div className="ent-mega__links">
                {column.items.map((entry) => (
                  <Link
                    key={`${column.title}-${entry.label}`}
                    to={entry.path}
                    className="ent-mega__link"
                    onClick={onClose}
                  >
                    <span>{entry.label}</span>
                    <ChevronRight className="ent-mega__arrow" size={14} />
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
