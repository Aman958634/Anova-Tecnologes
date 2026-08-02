import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Code2, Smartphone, Palette, Bot, Cloud, Megaphone } from 'lucide-react';

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

export default memo(MegaMenu);
