import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectButton({ href, label = 'View Case Study' }) {
  return (
    <motion.a
      href={href || '#contact'}
      target={href ? '_blank' : undefined}
      rel="noreferrer"
      whileTap={{ scale: 0.985 }}
      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#c9dbff] bg-white/60 px-4 py-2 text-[13px] font-semibold text-[#1f58cc] shadow-[0_8px_24px_rgba(47,109,247,0.14)] transition-colors duration-300 hover:border-[#8eb4ff] hover:text-[#0d47bd]"
      style={{ willChange: 'transform' }}
    >
      {/* Hover glow layer for premium CTA emphasis. */}
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,158,255,0.35),rgba(96,158,255,0)_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <motion.span
        className="relative z-10"
        animate={{ x: 0 }}
        whileHover={{ x: 1.5 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {label}
      </motion.span>

      <motion.span
        className="relative z-10"
        animate={{ x: 0 }}
        whileHover={{ x: 5 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <ArrowRight className="h-3.5 w-3.5" />
      </motion.span>
    </motion.a>
  );
}
