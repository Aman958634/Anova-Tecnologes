import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Dropdown({ title, items, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="ent-dropdown"
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
