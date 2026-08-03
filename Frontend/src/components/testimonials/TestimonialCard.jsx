import { buildImageUrl } from '../../utils/helpers';
import StarRating from './StarRating';

export default function TestimonialCard({ item }) {
  return (
    <div className="h-full">
      <article className="group relative h-full overflow-hidden rounded-[22px] border border-white/40 bg-white/92 p-[1px] shadow-[0_12px_34px_rgba(15,23,42,0.10)]">
        <div className="relative z-[2] h-full rounded-[21px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,250,255,0.90))] p-6">
          <div className="relative z-[4] flex h-full flex-col">
            <StarRating rating={item.rating} />
            <p className="mt-5 text-[0.93rem] italic leading-7 text-slate-600">"{item.review}"</p>

            <div className="mt-6 flex items-center gap-3">
              <img
                src={buildImageUrl(item.photo_url)}
                alt={item.name}
                loading="lazy"
                decoding="async"
                width={88}
                height={88}
                onError={(event) => {
                  event.currentTarget.src = buildImageUrl(null);
                }}
                className="h-11 w-11 rounded-full object-cover bg-white ring-2 ring-white/80"
              />
              <div>
                <h3 className="text-sm font-semibold text-[#163c88]">{item.name}</h3>
                <p className="text-[0.76rem] text-slate-500">{item.designation}</p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
