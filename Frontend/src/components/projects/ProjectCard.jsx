import { useEffect, useMemo, useRef } from 'react';
import Tilt from 'react-parallax-tilt';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';
import ProjectButton from './ProjectButton';
import ProjectImage from './ProjectImage';
import { cardEntrance, cardIconBg, chipColor, getCardIcon, getProjectTags } from './animationUtils';

export default function ProjectCard({ project, index, liked, onToggleLike, mobileReduced }) {
  const cardRef = useRef(null);
  const quickX = useRef(null);
  const quickY = useRef(null);
  const tags = useMemo(() => getProjectTags(project), [project]);
  const CardIcon = getCardIcon(index);

  useEffect(() => {
    if (!cardRef.current) return;
    // GSAP quickTo creates smooth cursor-follow spotlight interpolation.
    quickX.current = gsap.quickTo(cardRef.current, '--spot-x', { duration: 0.25, ease: 'power3.out' });
    quickY.current = gsap.quickTo(cardRef.current, '--spot-y', { duration: 0.25, ease: 'power3.out' });
  }, []);

  const onMove = (event) => {
    if (!cardRef.current || !quickX.current || !quickY.current || mobileReduced) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    quickX.current(`${x}%`);
    quickY.current(`${y}%`);
  };

  const resetSpotlight = () => {
    if (!quickX.current || !quickY.current) return;
    quickX.current('50%');
    quickY.current('50%');
  };

  return (
    <motion.div variants={cardEntrance} className="card-animate">
      <Tilt
        tiltEnable={!mobileReduced}
        glareEnable={false}
        scale={mobileReduced ? 1 : 1.03}
        transitionSpeed={900}
        tiltMaxAngleX={mobileReduced ? 0 : 10}
        tiltMaxAngleY={mobileReduced ? 0 : 10}
        perspective={1100}
        gyroscope={!mobileReduced}
        className="h-full"
      >
        <motion.article
          ref={cardRef}
          onMouseMove={onMove}
          onMouseLeave={resetSpotlight}
          whileHover={{ y: mobileReduced ? -4 : -10 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          className="group relative h-full overflow-hidden rounded-[20px] border border-white/45 bg-white/55 shadow-[0_10px_28px_rgba(15,23,42,0.10)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_30px_90px_rgba(56,126,255,0.22)]"
          style={{
            '--spot-x': '50%',
            '--spot-y': '50%',
            willChange: 'transform',
          }}
        >
          {/* Animated gradient border layer with glow on hover. */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[20px] p-[1px]"
            style={{
              background: 'linear-gradient(120deg, rgba(56,126,255,0.9), rgba(132,94,255,0.86), rgba(41,214,255,0.9), rgba(56,126,255,0.9))',
              backgroundSize: '260% 260%',
            }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
          >
            <span className="block h-full w-full rounded-[19px] bg-[rgba(248,251,255,0.88)]" />
          </motion.span>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ boxShadow: 'inset 0 0 36px rgba(70,140,255,0.22)' }}
          />

          {/* Cursor-follow spotlight for interactive premium lighting. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(520px circle at var(--spot-x) var(--spot-y), rgba(111,171,255,0.20), rgba(111,171,255,0) 55%)',
            }}
          />

          <div className="relative z-[2]">
            <ProjectImage project={project} mobileReduced={mobileReduced} />

            <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${chipColor(index)}`}>
              {tags[0]}
            </span>

            <motion.button
              type="button"
              onClick={() => onToggleLike(project.id)}
              whileHover={{ scale: 1.12, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/60 bg-white/75 shadow-[0_10px_20px_rgba(22,49,98,0.16)] backdrop-blur"
            >
              <motion.span
                animate={liked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Heart className={`h-4 w-4 transition-colors ${liked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
              </motion.span>
            </motion.button>
          </div>

          <div className="relative z-[2] p-5">
            <div className={`-mt-9 mb-4 inline-grid h-12 w-12 place-items-center rounded-[14px] bg-gradient-to-br ${cardIconBg(index)} shadow-[0_14px_30px_rgba(35,89,210,0.20)]`}>
              <CardIcon className="h-5 w-5" />
            </div>

            <h3 className="text-[17px] font-bold text-[#0f1b3f]">{project.title}</h3>
            <p className="mt-1.5 line-clamp-3 text-[13px] leading-[1.6] text-[#4d5f84]">{project.description}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <motion.span
                  key={`${project.id || project.title}-${tag}`}
                  whileHover={{ scale: 1.06, y: -1 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                  className="rounded-full border border-[#d6e4ff] bg-white/78 px-2.5 py-1 text-[11px] font-semibold text-[#355487] shadow-[0_4px_14px_rgba(26,78,190,0.08)]"
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <ProjectButton href={project.live_demo_url} label="View Case Study" />
              <motion.a
                href={project.live_demo_url || '#contact'}
                target={project.live_demo_url ? '_blank' : undefined}
                rel="noreferrer"
                whileHover={{ scale: 1.08, x: 2 }}
                whileTap={{ scale: 0.95 }}
                className="grid h-8 w-8 place-items-center rounded-full border border-[#d6dfef] bg-[#f4f7ff] text-[#3c4f7a] transition hover:bg-[#2f6df7] hover:text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </motion.a>
            </div>
          </div>
        </motion.article>
      </Tilt>
    </motion.div>
  );
}
