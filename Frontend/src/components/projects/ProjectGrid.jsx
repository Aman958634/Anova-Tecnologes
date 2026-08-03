import { useCallback, useEffect, useMemo, useState } from 'react';
import ProjectCard from './ProjectCard';

export default function ProjectGrid({ projects }) {
  const [liked, setLiked] = useState({});

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
        />
      ))}
    </div>
  );
}
