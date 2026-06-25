import { motion } from 'framer-motion';

export default function SectionHeading({ eyebrow, title, description, center = false, tone = 'dark' }) {
  const eyebrowClass = tone === 'light' ? 'text-cyan-300' : 'text-[#2f6df7]';
  const titleClass = tone === 'light' ? 'text-white' : 'text-[#163c88]';
  const copyClass = tone === 'light' ? 'text-slate-300' : 'text-slate-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.5 }}
      className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}
    >
      {eyebrow ? <p className={`mb-3 text-sm font-semibold uppercase tracking-[0.28em] ${eyebrowClass}`}>{eyebrow}</p> : null}
      <h2 className={`section-title ${titleClass}`}>{title}</h2>
      {description ? <p className={`section-copy mt-4 ${copyClass} ${center ? 'mx-auto' : ''}`}>{description}</p> : null}
    </motion.div>
  );
}
