import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
// animations removed for static showcase
import api from '../services/api';
import { fallbackServices } from '../utils/siteData';
import { useMediaQuery } from '../utils/helpers';

const SLIDE_INTERVAL = 3500;

export default function ServiceShowcase() {
  const [services, setServices] = useState(fallbackServices.slice(0, 6));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoRestart, setAutoRestart] = useState(true);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const intervalRef = useRef(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/services', { params: { page: 1, limit: 8 } });
      const items = response.data.data || [];
      if (items.length > 0) setServices(items);
      else setServices(fallbackServices.slice(0, 6));
    } catch {
      setServices(fallbackServices.slice(0, 6));
      setError('Unable to load live services right now. Showing fallback content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    const onUpdate = () => fetchServices();
    window.addEventListener('anova:data-updated', onUpdate);
    return () => window.removeEventListener('anova:data-updated', onUpdate);
  }, [fetchServices]);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % services.length);
  }, [services.length]);

  useEffect(() => {
    if (!autoRestart || paused || prefersReducedMotion) return;
    intervalRef.current = window.setInterval(next, SLIDE_INTERVAL);
    return () => window.clearInterval(intervalRef.current);
  }, [next, paused, autoRestart, services.length, prefersReducedMotion]);

  const handleRestart = () => {
    setCurrent(0);
    setAutoRestart(true);
    setPaused(false);
  };

  const goTo = (index) => {
    setCurrent(index);
    setPaused(true);
  };

  const service = services[current] || services[0];
  const padded = String(current + 1).padStart(2, '0');

  return (
    <section className="bg-[#f7f9fc] py-16 sm:py-20">
      <div className="section-shell space-y-10">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c8d8ff] bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#2f6df7] shadow-[0_2px_8px_rgba(47,109,247,0.12)]">
            <span className="h-2 w-2 rounded-full bg-[#2f6df7]" />
            Who We Are
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#0f1b3f] sm:text-4xl">
            See Anova Technologies in Action
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[#4d5f84]">
            Watch how we help businesses achieve their digital goals through cutting-edge technology and creative solutions.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          </div>
        ) : null}

        {error ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchServices}
              className="rounded-md bg-amber-100 px-3 py-1.5 font-semibold text-amber-900 transition hover:bg-amber-200"
            >
              Retry
            </button>
          </div>
        ) : null}

        {/* Showcase Card */}
        <div
          className="card-animate relative overflow-hidden rounded-[24px] shadow-[0_24px_60px_rgba(10,30,90,0.28)]"
          style={{ background: 'linear-gradient(135deg,#081f55 0%,#0a2a66 45%,#0b2f74 100%)' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { if (autoRestart) setPaused(false); }}
        >
          {/* Wave SVG background */}
          <svg
            className="pointer-events-none absolute bottom-0 left-0 w-full opacity-20"
            viewBox="0 0 900 200"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0,100 C150,180 350,20 600,100 C750,150 850,60 900,100 L900,200 L0,200 Z" fill="#2f6df7" />
            <path d="M0,140 C200,80 400,180 700,120 C800,100 880,140 900,130 L900,200 L0,200 Z" fill="#3b82f6" opacity="0.5" />
          </svg>

          {/* Top-left brand */}
          <div className="absolute left-6 top-5 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#2f6df7]">
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.32em] text-white/80">Anova</span>
          </div>

          {/* Service content */}
          <div className="relative flex min-h-[340px] flex-col items-center justify-center px-6 py-20 text-center sm:min-h-[400px]">
              <div key={current} className="space-y-5">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.36em] text-[#7aaeff]">
                  // Service {padded}
                </p>
                <h3 className="max-w-2xl text-4xl font-bold leading-[1.06] text-white sm:text-6xl">
                  {service.title}
                </h3>
                {service.description ? (
                  <p className="mx-auto max-w-lg text-[15px] leading-7 text-white/60 line-clamp-2">
                    {service.description}
                  </p>
                ) : null}
              </div>
          </div>

          {/* Bottom controls */}
          <div className="relative flex items-center gap-4 border-t border-white/10 px-6 py-4">
            <button
              type="button"
              onClick={handleRestart}
              className="grid h-10 w-10 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
              title="Restart slideshow"
              aria-label="Restart service slideshow"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <div className="flex flex-1 items-center gap-1.5">
              {services.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => goTo(index)}
                  className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-white/10"
                  aria-label={`Go to service slide ${index + 1}`}
                  aria-current={index === current ? 'true' : undefined}
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === current
                        ? 'w-7 bg-white'
                        : 'w-4 bg-white/35 hover:bg-white/55'
                    }`}
                  />
                </button>
              ))}
            </div>

            <span className="text-[11px] font-semibold text-white/40 tracking-widest">
              {padded} / {String(services.length).padStart(2, '0')}
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
