import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { starsFromRating } from '../../utils/helpers';

export default function StarRating({ rating, inView }) {
  const stars = starsFromRating(rating);

  return (
    <div className="flex items-center gap-1.5 text-amber-400" role="img" aria-label={`Rating: ${rating || 5} out of 5`}>
      {stars.map((filled, index) => (
        <motion.span
          key={`star-${index}`}
          // Sequential star pop when the card enters the viewport.
          initial={{ opacity: 0, y: 6, scale: 0.8 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 6, scale: 0.8 }}
          transition={{ duration: 0.28, delay: index * 0.09, ease: 'easeOut' }}
          style={{ willChange: 'transform, opacity' }}
        >
          <Star className={`h-4 w-4 ${filled ? 'fill-current' : 'opacity-25'}`} />
        </motion.span>
      ))}
    </div>
  );
}
