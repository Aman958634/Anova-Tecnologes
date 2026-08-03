import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, Code2, Cloud, Cpu, Globe, Mail, MapPin, Megaphone, Palette, Phone, PlayCircle, Smartphone, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { buildImageUrl, imageFallbackByKey } from '../utils/helpers';
import { fallbackServices, fallbackTeam } from '../utils/siteData';
import SectionHeading from './SectionHeading';
import ProjectGrid from './projects/ProjectGrid';
import { sectionEnter } from './projects/animationUtils';
import TestimonialSection from './testimonials/TestimonialSection';
import api from '../services/api';

function SectionCard({ children, className = '' }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.002 }}
      whileTap={{ scale: 0.997 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`card-animate rounded-[22px] border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </motion.div>
  );
}

const sectionReveal = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

const serviceCardReveal = {
  hidden: { opacity: 0, y: 26, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

function AnimatedCounter({ value, duration = 1200, delay = 80, className = '' }) {
  const [count, setCount] = useState(0);
  const [suffix, setSuffix] = useState('');

  useEffect(() => {
    const parsedValue = Number(String(value).replace(/[^0-9]/g, '')) || 0;
    const parsedSuffix = String(value).replace(/[0-9]/g, '');
    setSuffix(parsedSuffix);

    let frame = null;
    let start = null;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start - delay;
      if (elapsed < 0) {
        frame = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(parsedValue * progress));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, duration, delay]);

  return <span className={className}>{count}{suffix}</span>;
}

const SERVICE_KIND_CONFIG = {
  mobile: {
    icon: Smartphone,
    shellClass: 'from-[#d8ebff] via-[#bfe0ff] to-[#a4d2ff] text-[#145dc8]',
  },
  web: {
    icon: Globe,
    shellClass: 'from-[#d8f1ff] via-[#c2e9ff] to-[#9fdbff] text-[#0f6f9b]',
  },
  cloud: {
    icon: Cloud,
    shellClass: 'from-[#d8e7ff] via-[#c8dcff] to-[#adc9ff] text-[#2450c0]',
  },
  ai: {
    icon: Cpu,
    shellClass: 'from-[#e8ddff] via-[#d8cbff] to-[#c1afff] text-[#5e33b3]',
  },
  uiux: {
    icon: Palette,
    shellClass: 'from-[#ffe5f4] via-[#ffd6eb] to-[#ffc4e1] text-[#ba2f75]',
  },
  marketing: {
    icon: Megaphone,
    shellClass: 'from-[#ffe9d8] via-[#ffdbc2] to-[#ffccaa] text-[#b85b16]',
  },
  default: {
    icon: Code2,
    shellClass: 'from-[#e7efff] via-[#d9e7ff] to-[#c6dcff] text-[#275fcf]',
  },
};

const getServiceKind = (service) => {
  const source = `${service.icon || ''} ${service.title || ''} ${service.description || ''}`.toLowerCase();
  if (source.includes('mobile') || source.includes('app')) return 'mobile';
  if (source.includes('web') || source.includes('website') || source.includes('software')) return 'web';
  if (source.includes('cloud') || source.includes('devops')) return 'cloud';
  if (source.includes('ai') || source.includes('ml') || source.includes('intelligent')) return 'ai';
  if (source.includes('ui') || source.includes('ux') || source.includes('design')) return 'uiux';
  if (source.includes('market') || source.includes('seo') || source.includes('ads')) return 'marketing';
  return 'default';
};

function ServiceIconVisual({ service }) {
  const kind = getServiceKind(service);
  const config = SERVICE_KIND_CONFIG[kind] || SERVICE_KIND_CONFIG.default;
  const Icon = config.icon;

  return (
    <div className="relative">
      <div className="relative grid h-[78px] w-[78px] place-items-center rounded-[22px] border border-white/45 bg-white/28 shadow-[0_18px_40px_rgba(16,56,140,0.28),inset_0_1px_0_rgba(255,255,255,0.65)]">
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-[2px] rounded-[20px] bg-gradient-to-br ${config.shellClass}`}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[1px] rounded-[21px] border border-white/35"
        />

        <div className="relative z-10">
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0b2659] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,140,255,0.16),_rgba(11,38,89,0.70)_45%)]" />
      <div className="section-shell relative py-14 sm:py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 sm:gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="max-w-2xl lg:max-w-none"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.10)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#5ab4ff]" /> Premium IT Solutions Agency
            </span>

            <h1 className="mt-6 text-[2rem] font-semibold leading-tight tracking-tight text-white sm:mt-8 sm:text-5xl lg:text-6xl">
              Transforming Ideas into Powerful Digital Solutions
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
              We build modern websites, mobile apps, and digital marketing strategies that help businesses grow faster.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <a href="#contact" className="inline-flex items-center justify-center rounded-full bg-[#2471ff] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#1f5fe6]">
                Get Free Website Audit
              </a>
              <a href="#projects" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                View Our Work
              </a>
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#122d62] shadow-[0_45px_80px_rgba(7,25,74,0.35)] sm:rounded-[32px]">
              <img
                src="/laptop-hero.svg"
                alt="Hero visual showing ANOVA digital product showcase"
                width={1200}
                height={675}
                fetchPriority="high"
                decoding="async"
                className="h-[260px] w-full object-cover object-center sm:h-[400px] lg:h-[560px]"
              />

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function HomeServicesSection() {
  const [services, setServices] = useState(fallbackServices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const normalizedFeatures = (service) => {
    if (Array.isArray(service.key_features)) return service.key_features.filter(Boolean);
    if (typeof service.key_features === 'string') {
      return service.key_features.split(',').map((item) => item.trim()).filter(Boolean);
    }
    const source = `${service.title || ''}`.toLowerCase();
    if (source.includes('app') || source.includes('mobile')) {
      return ['Android & iOS App Development', 'User-Friendly & High-Performance Apps', 'Business-Centric Custom Solutions'];
    }
    if (source.includes('market')) {
      return ['Social Media Marketing', 'SEO & Website Optimization', 'Google Ads & PPC Campaigns'];
    }
    return ['Attractive & Responsive Design', 'User-Friendly Experience', 'Best for Services & Businesses'];
  };

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/services', { params: { page: 1, limit: 100 } });
      const items = response.data.data || [];
      setServices(items.length > 0 ? items : fallbackServices);
    } catch {
      setError('Unable to load live services right now. Showing fallback services.');
      setServices(fallbackServices);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();

    const onDataUpdated = () => fetchServices();
    const onStorage = (event) => {
      if (event.key === 'anova:data-updated') fetchServices();
    };

    window.addEventListener('anova:data-updated', onDataUpdated);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('anova:data-updated', onDataUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchServices]);

  return (
    <section
      id="services"
      className="bg-[#f3f5f8] py-12 text-slate-900 sm:py-14"
    >
      <div className="section-shell">
        {error ? (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
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

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`home-services-skeleton-${index}`} className="h-[360px] animate-pulse rounded-3xl border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : null}

        <div className={`${loading ? 'hidden ' : ''}grid gap-6 sm:grid-cols-2 xl:grid-cols-3`}>
          {services.map((service) => (
            <div key={service.id || service.title} className="group relative">
              <div className="relative h-full overflow-hidden rounded-3xl border border-white/45 bg-white/82 p-[1px] shadow-[0_14px_38px_rgba(14,30,84,0.14)]">
                <div className="relative h-full rounded-[22px] border border-[#d9e7ff]/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(243,248,255,0.88)_100%)] p-8">
                  <div className="space-y-5">
                    <ServiceIconVisual service={service} />
                    <h3 className="text-[16px] font-semibold leading-[1.35] text-[#162f63]">{service.title}</h3>
                    <p className="line-clamp-3 min-h-[84px] text-[13px] leading-[1.55] text-[#4d5f84]">{service.description}</p>

                    <ul className="mt-2 space-y-1.5">
                      {normalizedFeatures(service).slice(0, 3).map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-[13px] font-medium leading-[1.5] text-[#203760]">
                          <CheckCircle2 className="mt-0.5 h-[16px] w-[16px] shrink-0 text-[#2974ff]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <a href="#projects" className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-[#1f67ff]">
                      Learn more
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServicesSection() {
  const [services, setServices] = useState(fallbackServices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/services', { params: { page: 1, limit: 20 } });
      const items = response.data.data || [];
      setServices(items.length ? items : fallbackServices);
    } catch (err) {
      setError('Unable to load services right now. Please try again later.');
      setServices(fallbackServices);
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveFeatures = (service) => {
    if (Array.isArray(service.key_features) && service.key_features.length) return service.key_features;
    if (typeof service.key_features === 'string') {
      const parsed = service.key_features.split(',').map((item) => item.trim()).filter(Boolean);
      if (parsed.length) return parsed;
    }
    return [
      'Attractive & Responsive Design',
      'Best for Services & Businesses',
      'User-Friendly Experience',
      'SEO Friendly & Fast Loading'
    ];
  };

  useEffect(() => {
    fetchServices();

    const onDataUpdated = () => fetchServices();
    const onStorage = (event) => {
      if (event.key === 'anova:data-updated') fetchServices();
    };

    window.addEventListener('anova:data-updated', onDataUpdated);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('anova:data-updated', onDataUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchServices]);

  const statusMessage = loading
    ? 'Loading services...'
    : error
    ? error
    : `${services.length} services available`;

  return (
    <section id="services" className="bg-white text-slate-900">
      <div className="bg-[#102c66] px-4 py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Our Services</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
            Comprehensive digital solutions to accelerate your business growth. We combine technical expertise with industry best practices to deliver outstanding results.
          </p>
        </div>
      </div>

      <div className="section-shell py-16 sm:py-20 lg:py-24">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span>{statusMessage}</span>
          {error ? (
            <button
              type="button"
              onClick={fetchServices}
              className="rounded-md bg-red-100 px-3 py-1.5 font-semibold text-red-800 transition hover:bg-red-200"
            >
              Retry
            </button>
          ) : null}
        </div>
        <div className="space-y-8">
          {services.map((service, index) => {
            const isReversed = index % 2 === 1;
            const bullets = resolveFeatures(service);

            return (
              <div
                key={service.id || service.title}
                className={`overflow-hidden rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 ${isReversed ? 'lg:grid-flow-col-dense lg:grid-cols-[0.95fr_1.05fr]' : ''}`}
              >
                <div className="space-y-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2f6df7] ring-1 ring-[#dbe6ff]">
                    <span className="text-xl">▣</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-[#163c88] sm:text-2xl">{service.title}</h2>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{service.description}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-[#163c88]">Key Features</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {bullets.map((bullet) => (
                        <div key={bullet} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2f6df7]" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link to="/contact" className="inline-flex items-center rounded-md bg-[#2f6df7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245fe0]">
                    Request Service
                  </Link>
                </div>

                <div className="mt-6 lg:mt-0">
                  <div className="relative h-[240px] w-full overflow-hidden rounded-[20px] border border-slate-200 bg-[#f5f7fb] sm:h-[320px]">
                    {service.image_url ? (
                      <img
                        src={buildImageUrl(service.image_url)}
                        alt={service.title}
                        loading="lazy"
                        decoding="async"
                        width={1280}
                        height={720}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
                        onError={(e) => { e.currentTarget.src = buildImageUrl(null); }}
                        className="h-full w-full object-cover bg-[#f5f7fb]"
                      />
                    ) : (
                      <div className="grid h-full place-items-center">
                        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#e7efff] text-[#2f6df7] shadow-[0_10px_24px_rgba(47,109,247,0.12)]">
                          <span className="text-2xl">▣</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {services.length === 0 ? (
        <div className="section-shell py-16 text-center">
          <p className="text-base text-slate-600">No services are available right now. Please check back later.</p>
        </div>
      ) : (
        <div className="bg-[#eaf1ff] px-4 py-16 text-center sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            <h3 className="text-2xl font-semibold tracking-tight text-[#163c88] sm:text-[1.8rem]">Not sure which service you need?</h3>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Our experts can help analyze your business requirements and suggest the most effective digital solutions for your specific goals.
            </p>
            <Link to="/contact" className="mt-8 inline-flex items-center justify-center rounded-md bg-[#2f6df7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#245fe0]">
              Talk to an Expert
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

export function AboutSection() {
  const [stats, setStats] = useState([
    ['156+', 'Projects Completed'],
    ['200+', 'Happy Clients'],
    ['8+', 'Years Experience'],
    ['14', 'Team Members']
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/stats');
      setStats([
        [response.data.projects_completed || '156+', 'Projects Completed'],
        [response.data.happy_clients || '200+', 'Happy Clients'],
        [response.data.years_experience || '8+', 'Years Experience'],
        [response.data.team_members || '14', 'Team Members']
      ]);
    } catch {
      setStats([
        ['156+', 'Projects Completed'],
        ['200+', 'Happy Clients'],
        ['8+', 'Years Experience'],
        ['14', 'Team Members']
      ]);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const onDataUpdated = () => fetchStats();
    const onStorage = (event) => {
      if (event.key === 'anova:data-updated') fetchStats();
    };

    window.addEventListener('anova:data-updated', onDataUpdated);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('anova:data-updated', onDataUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchStats]);

  return (
    <motion.section
      id="about"
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.18 }}
      className="bg-[#eef4ff] py-24 text-slate-900"
    >
      <div className="section-shell grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <SectionHeading
            eyebrow="Why Choose Anova Technologies?"
            title="We don't just build websites; we engineer digital experiences that drive measurable results."
            description="Our approach combines technical excellence with deep business understanding."
          />

          <div className="mt-10 space-y-6">
            {[
              { icon: CheckCircle2, title: '100% Quality Work', text: 'Rigorous quality assurance across all deliverables.' },
              { icon: Clock3, title: 'On-time Delivery', text: 'We respect your deadlines and deliver consistently.' },
              { icon: ShieldCheck, title: '24/7 Support', text: 'Dedicated support team available round the clock.' }
            ].map((item) => (
              <div key={item.title} className="card-animate flex gap-4 rounded-2xl border border-transparent p-2 transition hover:border-[#dbe6ff]">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#2f6df7] shadow-sm ring-1 ring-[#dbe6ff]">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[1.03rem] font-semibold text-[#163c88]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative justify-self-center">
          <div className="relative overflow-hidden rounded-[18px] shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
              alt="Team working together"
              loading="lazy"
              decoding="async"
              width={1200}
              height={800}
              sizes="(max-width: 1024px) 100vw, 50vw"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-image.svg';
              }}
              className="h-[420px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(10,42,102,0.25))]" />
            <div className="absolute inset-0 grid place-items-center">
              <button type="button" aria-label="Play company introduction video" className="grid h-20 w-20 place-items-center rounded-full bg-[#2f6df7] text-white shadow-lg">
                <PlayCircle className="h-10 w-10" />
              </button>
            </div>
          </div>

          <div className="absolute -bottom-6 left-0 rounded-2xl bg-white px-5 py-4 shadow-[0_16px_35px_rgba(15,23,42,0.18)]">
            <p className="text-[1.45rem] font-bold leading-none text-[#16387c]">100%</p>
            <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Client Satisfaction</p>
          </div>
        </div>
      </div>

      <div className="section-shell mt-16 grid gap-4 rounded-[22px] bg-white px-6 py-8 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:grid-cols-4">
        {stats.map(([value, label], index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="card-animate rounded-xl px-2 py-3 text-center"
          >
            <p className="text-[2rem] font-semibold leading-none text-[#15387c]">
              <AnimatedCounter value={value} className="inline-block" />
            </p>
            <p className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-slate-500">{label}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/projects', { params: { page: 1, limit: 9 } });
      setProjects(response.data.data || []);
    } catch {
      setError('Unable to load projects right now. Please retry.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    const onDataUpdated = () => fetchProjects();
    const onStorage = (event) => { if (event.key === 'anova:data-updated') fetchProjects(); };
    window.addEventListener('anova:data-updated', onDataUpdated);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('anova:data-updated', onDataUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchProjects]);

  return (
    <motion.section
      id="projects"
      variants={sectionEnter}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.2 }}
      className="bg-[#f0f3fa] py-16 text-slate-900 sm:py-20"
    >
      <div className="section-shell space-y-10">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c6d4ff] bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2f6df7]">
            Our Work
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#0f1b3f] sm:text-5xl">
            Our <span className="text-[#2f6df7]">Projects</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[#4d5f84]">
            We build digital solutions that drive growth and make a real impact for our clients.
          </p>
        </div>

        {!loading ? <ProjectGrid projects={projects} /> : null}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`projects-skeleton-${index}`} className="h-[350px] animate-pulse rounded-[20px] border border-slate-200 bg-white" />
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchProjects}
              className="rounded-md bg-red-100 px-3 py-1.5 font-semibold text-red-800 transition hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        ) : null}

      </div>
    </motion.section>
  );
}

export function TestimonialsSection() {
  return <TestimonialSection />;
}

export function TeamSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="section-shell space-y-10">
        <SectionHeading eyebrow="Team" title="The people behind the polish." description="An intentionally compact team block with social links and elevated portrait cards." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {fallbackTeam.map((member) => (
            <SectionCard key={member.id} className="overflow-hidden p-0">
              <img
                src={buildImageUrl(member.image_url || member.image, imageFallbackByKey())}
                alt={member.name}
                loading="lazy"
                decoding="async"
                width={720}
                height={720}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                onError={(e) => { e.currentTarget.src = imageFallbackByKey(); }}
                className="h-72 w-full object-cover bg-[#f8fafc]"
              />
              <div className="space-y-2 p-6 text-center">
                <h3 className="text-lg font-semibold text-[#163c88]">{member.name}</h3>
                <p className="text-sm text-slate-500">{member.designation}</p>
                <div className="flex justify-center gap-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                  <Phone className="h-4 w-4" />
                  <MapPin className="h-4 w-4" />
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BlogSection() {
  const blogs = [
    { title: 'Designing premium SaaS landing pages', category: 'Design', published_at: '2026-06-24', excerpt: 'How to combine clarity, hierarchy, and motion.' },
    { title: 'Building admin dashboards that feel clean', category: 'Engineering', published_at: '2026-06-18', excerpt: 'A practical pattern for data-heavy admin UX.' },
    { title: 'Why dark + light mode matters', category: 'Product', published_at: '2026-06-10', excerpt: 'Accessibility and brand expression in one system.' }
  ];

  return (
    <motion.section
      id="blog"
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.2 }}
      className="bg-white py-20 sm:py-24"
    >
      <div className="section-shell space-y-10">
        <SectionHeading eyebrow="Blog" title="Fresh content to support credibility and SEO." description="Search-friendly article cards with dates, categories, and clear calls to action." />
        <div className="grid gap-6 lg:grid-cols-3">
          {blogs.map((post) => (
            <SectionCard key={post.title} className="overflow-hidden p-0">
              <div className="aspect-[16/10] bg-gradient-to-br from-slate-800 to-slate-900" />
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-[#2f6df7]">
                  <span>{post.category}</span>
                  <span>{post.published_at}</span>
                </div>
                <h3 className="text-xl font-semibold text-[#163c88]">{post.title}</h3>
                <p className="text-sm leading-7 text-slate-600">{post.excerpt}</p>
                <Link to="/contact" className="btn-secondary w-fit px-4 py-2 text-sm">Read More</Link>
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export function ContactSection() {
  return (
    <motion.section
      id="contact"
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.18 }}
      className="relative overflow-hidden bg-[#102c66] py-20 text-white sm:py-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,156,255,0.18),_transparent_45%)]" />
      <div className="section-shell relative flex flex-col items-center text-center">
        <h2 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.4rem]">Ready to Transform Your Digital Presence?</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
          Let&apos;s discuss how our technology solutions can help you achieve your business goals.
        </p>
        <Link to="/contact" className="mt-8 inline-flex items-center justify-center rounded-md bg-[#2f6df7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#245fe0]">
          Contact Us Today
        </Link>
      </div>
    </motion.section>
  );
}
