import { motion } from 'framer-motion';

export default function Spotlight({ active }) {
  return (
    <motion.span
      aria-hidden="true"
      // Cursor-follow light uses CSS variables updated by the card container.
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{
        background:
          'radial-gradient(520px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(134,194,255,0.26), rgba(134,194,255,0) 58%)',
        willChange: 'opacity, transform',
      }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    />
  );
}
