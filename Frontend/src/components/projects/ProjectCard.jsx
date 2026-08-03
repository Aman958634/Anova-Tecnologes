import { memo, useMemo } from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import ProjectButton from './ProjectButton';
import ProjectImage from './ProjectImage';
import { cardIconBg, chipColor, getCardIcon, getProjectTags } from './animationUtils';

function ProjectCard({ project, index, liked, onToggleLike }) {
  const tags = useMemo(() => getProjectTags(project), [project]);
  const CardIcon = getCardIcon(index);

  return (
    <div className="h-full">
      <article className="group relative h-full overflow-hidden rounded-[20px] border border-white/45 bg-white/55 shadow-[0_10px_28px_rgba(15,23,42,0.10)] backdrop-blur-xl">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[20px] p-[1px]"
          style={{
            background: 'linear-gradient(120deg, rgba(56,126,255,0.9), rgba(132,94,255,0.86), rgba(41,214,255,0.9), rgba(56,126,255,0.9))',
            backgroundSize: '260% 260%',
          }}
        >
          <span className="block h-full w-full rounded-[19px] bg-[rgba(248,251,255,0.88)]" />
        </span>

        <div className="relative z-[2]">
          <ProjectImage project={project} />

          <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${chipColor(index)}`}>
            {tags[0]}
          </span>

          <button
            type="button"
            onClick={() => onToggleLike(project.id)}
            aria-label={liked ? `Remove ${project.title} from favorites` : `Add ${project.title} to favorites`}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/60 bg-white/75 shadow-[0_10px_20px_rgba(22,49,98,0.16)] backdrop-blur"
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
          </button>
        </div>

        <div className="relative z-[2] p-5">
          <div className={`-mt-9 mb-4 inline-grid h-12 w-12 place-items-center rounded-[14px] bg-gradient-to-br ${cardIconBg(index)} shadow-[0_14px_30px_rgba(35,89,210,0.20)]`}>
            <CardIcon className="h-5 w-5" />
          </div>

          <h3 className="text-[17px] font-bold text-[#0f1b3f]">{project.title}</h3>
          <p className="mt-1.5 line-clamp-3 text-[13px] leading-[1.6] text-[#4d5f84]">{project.description}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={`${project.id || project.title}-${tag}`}
                className="rounded-full border border-[#d6e4ff] bg-white/78 px-2.5 py-1 text-[11px] font-semibold text-[#355487] shadow-[0_4px_14px_rgba(26,78,190,0.08)]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <ProjectButton href={project.live_demo_url} label="View Case Study" />
            <a
              href={project.live_demo_url || '#contact'}
              aria-label={`Open ${project.title} case study`}
              target={project.live_demo_url ? '_blank' : undefined}
              rel="noreferrer"
              className="grid h-8 w-8 place-items-center rounded-full border border-[#d6dfef] bg-[#f4f7ff] text-[#3c4f7a]"
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
