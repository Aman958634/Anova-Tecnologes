import { Star } from 'lucide-react';
import { starsFromRating } from '../../utils/helpers';

export default function StarRating({ rating }) {
  const stars = starsFromRating(rating);

  return (
    <div className="flex items-center gap-1.5 text-amber-400" role="img" aria-label={`Rating: ${rating || 5} out of 5`}>
      {stars.map((filled, index) => (
        <span key={`star-${index}`}>
          <Star className={`h-4 w-4 ${filled ? 'fill-current' : 'opacity-25'}`} />
        </span>
      ))}
    </div>
  );
}
