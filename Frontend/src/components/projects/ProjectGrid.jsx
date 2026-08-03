import { useCallback, useEffect, useMemo, useState } from 'react';
import ProjectCard from './ProjectCard';
import { gridStagger } from './animationUtils';

export default function ProjectGrid({ projects }) {
  const [liked, setLiked] = useState({});
  const [mobileReduced, setMobileReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1024px), (prefers-reduced-motion: reduce)');
    const update = () => setMobileReduced(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  const data = useMemo(() => projects || [], [projects]);
  const handleToggleLike = useCallback((id) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((project, index) => (
        <ProjectCard
          key={project.id || project.title}
          project={project}
          index={index}
          liked={Boolean(liked[project.id])}
          onToggleLike={handleToggleLike}
          mobileReduced={mobileReduced}
        />
      ))}
    </div>
  );
}
