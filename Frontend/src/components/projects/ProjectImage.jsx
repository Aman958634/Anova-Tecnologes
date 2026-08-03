import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { buildImageUrl } from '../../utils/helpers';
import { resolveProjectImage } from './animationUtils';

export default function ProjectImage({ project, mobileReduced }) {
  const imageWrapRef = useRef(null);
  const source = resolveProjectImage(project);
  const { scrollYProgress } = useScroll({ target: imageWrapRef, offset: ['start end', 'end start'] });

  // Subtle scroll parallax: image shifts more slowly than card content.
  const parallaxY = useTransform(scrollYProgress, [0, 1], mobileReduced ? [0, 0] : [10, -10]);

  return (
    <div ref={imageWrapRef} className="relative h-[210px] overflow-hidden sm:h-[250px] md:h-[260px] lg:h-[220px]">
      {/* Slow aurora gradient for premium animated backdrop. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 120% at 10% 10%, rgba(61,142,255,0.5) 0%, rgba(61,142,255,0) 42%), radial-gradient(120% 120% at 88% 18%, rgba(130,88,255,0.45) 0%, rgba(130,88,255,0) 44%), radial-gradient(130% 130% at 50% 95%, rgba(29,210,255,0.4) 0%, rgba(29,210,255,0) 45%)',
          backgroundSize: '160% 160%',
          willChange: 'transform, opacity',
        }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      {source ? (
        <motion.div className="relative h-full w-full" style={{ y: parallaxY, willChange: 'transform' }}>
          <motion.img
            src={buildImageUrl(source)}
            alt={project.title}
            loading="lazy"
            decoding="async"
            width={1280}
            height={720}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(event) => {
              event.currentTarget.src = buildImageUrl(null);
            }}
            className="h-full w-full object-cover"
            // Continuous floating motion for luxurious movement.
            animate={mobileReduced ? { y: 0 } : { y: [0, -8, 0] }}
            transition={mobileReduced ? { duration: 0.01 } : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            // Hover zoom and image tone enhancement.
            whileHover={mobileReduced ? undefined : { scale: 1.08, filter: 'brightness(1.05) contrast(1.05)' }}
            style={{ willChange: 'transform, filter' }}
          />
        </motion.div>
      ) : (
        <div className="relative h-full w-full bg-slate-100" />
      )}

      {/* Hover shine pass from left to right. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.5)_45%,rgba(255,255,255,0)_100%)] transition-transform duration-700 ease-out group-hover:translate-x-[300%]"
      />
    </div>
  );
}
