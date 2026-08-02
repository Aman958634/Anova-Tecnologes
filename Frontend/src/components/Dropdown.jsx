import { memo } from 'react';
import { Link } from 'react-router-dom';

function Dropdown({ title, items, onClose, onEnter, onLeave, menuId }) {
  return (
    <div
      className="ent-dropdown"
      id={menuId}
      role="menu"
      aria-label={title}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {items.map((item) => (
        <Link
          key={`${title}-${item.label}`}
          to={item.path}
          className="ent-dropdown__item"
          tabIndex={0}
          role="menuitem"
          onClick={onClose}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export default memo(Dropdown);
