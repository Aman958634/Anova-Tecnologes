import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { fallbackTestimonials } from '../../utils/siteData';
import TestimonialCard from './TestimonialCard';

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/testimonials');
      const items = response.data.data || [];
      setTestimonials(items.length > 0 ? items : fallbackTestimonials);
    } catch {
      setError('Unable to load live testimonials right now. Showing fallback testimonials.');
      setTestimonials(fallbackTestimonials);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();

    const onDataUpdated = () => fetchTestimonials();
    const onStorage = (event) => {
      if (event.key === 'anova:data-updated') fetchTestimonials();
    };

    window.addEventListener('anova:data-updated', onDataUpdated);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('anova:data-updated', onDataUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchTestimonials]);

  const list = useMemo(() => testimonials || [], [testimonials]);

  return (
    <section className="bg-[#f6f8fc] py-16 text-slate-900 sm:py-20 lg:py-24">
      <div className="section-shell space-y-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c6d4ff] bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2f6df7]">
            Testimonials
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#0f1b3f] sm:text-4xl lg:text-5xl">Client Success Stories</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-[#334155]">Trusted results that speak for themselves.</p>
        </div>

        {error ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchTestimonials}
              className="rounded-md bg-amber-100 px-3 py-1.5 font-semibold text-amber-900 transition hover:bg-amber-200"
            >
              Retry
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`testimonial-skeleton-${index}`} className="h-[280px] animate-pulse rounded-[22px] border border-slate-200 bg-white" />
            ))}
          </div>
        ) : null}

        <div className={`${loading ? 'hidden ' : ''}grid gap-6 sm:grid-cols-2 xl:grid-cols-3`}>
          {list.map((item) => (
            <TestimonialCard key={item.id || item.name} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
