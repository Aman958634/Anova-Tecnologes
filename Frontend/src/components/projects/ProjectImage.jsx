import { buildImageUrl } from '../../utils/helpers';
import { resolveProjectImage } from './animationUtils';

export default function ProjectImage({ project }) {
  const source = resolveProjectImage(project);

  return (
    <div className="relative h-[210px] overflow-hidden sm:h-[250px] md:h-[260px] lg:h-[220px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 120% at 10% 10%, rgba(61,142,255,0.5) 0%, rgba(61,142,255,0) 42%), radial-gradient(120% 120% at 88% 18%, rgba(130,88,255,0.45) 0%, rgba(130,88,255,0) 44%), radial-gradient(130% 130% at 50% 95%, rgba(29,210,255,0.4) 0%, rgba(29,210,255,0) 45%)',
        }}
      />

      {source ? (
        <div className="relative h-full w-full">
          <img
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
          />
        </div>
      ) : (
        <div className="relative h-full w-full bg-slate-100" />
      )}
    </div>
  );
}
