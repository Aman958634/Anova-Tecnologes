import { useEffect, useMemo, useRef, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';
import { gridStagger } from './animationUtils';

export default function ProjectGrid({ projects }) {
  const [liked, setLiked] = useState({});
  const [mobileReduced, setMobileReduced] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1024px), (prefers-reduced-motion: reduce)');
    const update = () => setMobileReduced(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    // Lenis smooth scrolling for premium in-section motion continuity.
    const lenis = new Lenis({ duration: 1.06, smoothWheel: true, smoothTouch: false, wheelMultiplier: 0.9 });
    const raf = (time) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
    };
  }, []);

  const data = useMemo(() => projects || [], [projects]);

  return (
    <motion.div
      variants={gridStagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {data.map((project, index) => (
        <ProjectCard
          key={project.id || project.title}
          project={project}
          index={index}
          liked={Boolean(liked[project.id])}
          onToggleLike={(id) => setLiked((prev) => ({ ...prev, [id]: !prev[id] }))}
          mobileReduced={mobileReduced}
        />
      ))}
    </motion.div>
  );
}
