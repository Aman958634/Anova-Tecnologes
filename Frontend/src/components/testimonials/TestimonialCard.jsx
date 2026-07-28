import { useRef, useState } from 'react';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';
import { buildImageUrl } from '../../utils/helpers';
import Spotlight from './Spotlight';
import StarRating from './StarRating';

const cardMotion = {
  hidden: { opacity: 0, y: 28, scale: 0.985, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function TestimonialCard({ item, mobileReduced, inView }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const onMouseMove = (event) => {
    if (mobileReduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty('--spotlight-x', `${x}%`);
    cardRef.current.style.setProperty('--spotlight-y', `${y}%`);
  };

  return (
    <motion.div variants={cardMotion} className="h-full">
      <Tilt
        tiltEnable={!mobileReduced}
        perspective={1050}
        tiltMaxAngleX={mobileReduced ? 0 : 10}
        tiltMaxAngleY={mobileReduced ? 0 : 10}
        scale={mobileReduced ? 1 : 1.03}
        transitionSpeed={950}
        glareEnable={false}
        gyroscope={!mobileReduced}
        className="h-full"
      >
        <motion.article
          ref={cardRef}
          onMouseMove={onMouseMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          // Premium hover elevation and shadow with GPU-friendly transforms.
          whileHover={{ y: -8, scale: mobileReduced ? 1.01 : 1.03 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          className="group relative h-full overflow-hidden rounded-[22px] border border-white/40 bg-white/58 p-[1px] shadow-[0_12px_34px_rgba(15,23,42,0.10)] backdrop-blur-xl"
          style={{
            '--spotlight-x': '50%',
            '--spotlight-y': '50%',
            willChange: 'transform, opacity',
          }}
        >
          {/* Animated gradient border for enterprise-grade visual polish. */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[22px]"
            style={{
              background:
                'linear-gradient(120deg, rgba(61,142,255,0.85), rgba(43,208,255,0.85), rgba(143,93,255,0.85), rgba(61,142,255,0.85))',
              backgroundSize: '240% 240%',
            }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 8.8, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative z-[2] h-full rounded-[21px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,250,255,0.90))] p-6">
            <Spotlight active={hovered && !mobileReduced} />

            {/* Glass blur overlay intensifies on hover for premium depth. */}
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[21px] bg-white/10 backdrop-blur-[1.5px]"
              animate={{ opacity: hovered ? 0.8 : 0.35 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />

            {/* Shine sweep creates a refined hover highlight pass. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/2 z-[3] w-1/2 bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.55)_46%,rgba(255,255,255,0)_100%)] transition-transform duration-700 ease-out group-hover:translate-x-[300%]"
            />

            <div className="relative z-[4] flex h-full flex-col">
              <StarRating rating={item.rating} inView={inView} />
              <p className="mt-5 text-[0.93rem] italic leading-7 text-slate-600">"{item.review}"</p>

              <div className="mt-6 flex items-center gap-3">
                <motion.img
                  src={buildImageUrl(item.photo_url)}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.src = buildImageUrl(null);
                  }}
                  className="h-11 w-11 rounded-full object-cover bg-white ring-2 ring-white/80"
                  // Subtle floating avatar motion keeps the card feeling alive.
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ willChange: 'transform' }}
                />
                <div>
                  <h3 className="text-sm font-semibold text-[#163c88]">{item.name}</h3>
                  <p className="text-[0.76rem] text-slate-500">{item.designation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hover glow enhances premium shadow treatment. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[22px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ boxShadow: '0 35px 90px rgba(74,149,255,0.20)' }}
          />
        </motion.article>
      </Tilt>
    </motion.div>
  );
}
