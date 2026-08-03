import { memo, useMemo, useRef } from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import ProjectButton from './ProjectButton';
import ProjectImage from './ProjectImage';
import { getCardIcon, getProjectTags } from './animationUtils';

function ProjectCard({ project, index, liked, onToggleLike, mobileReduced }) {
  const cardRef = useRef(null);
  const tags = useMemo(() => getProjectTags(project), [project]);
  const CardIcon = getCardIcon(index);

  return (
    <div className="h-full">
      <article
        ref={cardRef}
        className="group relative h-full overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]"
      >
        <div className="relative z-10">
          <ProjectImage project={project} mobileReduced={mobileReduced} />

          <span className="absolute left-3 top-3 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
            {tags[0]}
          </span>

          <button
            type="button"
            onClick={() => onToggleLike(project.id)}
            aria-label={liked ? `Remove ${project.title} from favorites` : `Add ${project.title} to favorites`}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-[#E5E7EB] bg-white shadow-sm"
          >
            <span>
              <Heart className={`h-4 w-4 ${liked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            </span>
          </button>
        </div>

        <div className="relative z-10 p-5">
          <div className="-mt-9 mb-4 inline-grid h-12 w-12 place-items-center rounded-[14px] bg-gray-50 text-slate-900 shadow-sm">
            <CardIcon className="h-5 w-5" />
          </div>

          <h3 className="text-[17px] font-bold text-slate-900">{project.title}</h3>
          <p className="mt-1.5 line-clamp-3 text-[13px] leading-[1.6] text-slate-600">{project.description}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={`${project.id || project.title}-${tag}`}
                className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <ProjectButton href={project.live_demo_url} label="View Case Study" variant="minimal" />
            <a
              href={project.live_demo_url || '#contact'}
              aria-label={`Open ${project.title} case study`}
              target={project.live_demo_url ? '_blank' : undefined}
              rel="noreferrer"
              className="grid h-8 w-8 place-items-center rounded-full border border-[#E5E7EB] bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}

export default memo(ProjectCard, (prev, next) => {
  return (
    prev.project === next.project &&
    prev.index === next.index &&
    prev.liked === next.liked &&
    prev.mobileReduced === next.mobileReduced
  );
});
