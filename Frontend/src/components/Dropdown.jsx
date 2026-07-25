import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Dropdown({ title, items, onClose, menuId }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="ent-dropdown"
      id={menuId}
      role="menu"
      aria-label={title}
      onMouseLeave={onClose}
    >
      {items.map((item) => (
        <Link
          key={`${title}-${item.label}`}
          to={item.path}
          className="ent-dropdown__item"
          role="menuitem"
          onClick={onClose}
        >
          {item.label}
        </Link>
      ))}
    </motion.div>
  );
}

export default memo(Dropdown);
