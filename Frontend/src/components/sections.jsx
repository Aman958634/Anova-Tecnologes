import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, BarChart3, CheckCircle2, Clock3, Code2, Cloud, Cpu, Database, Globe, GraduationCap, Heart, HeartHandshake, LayoutPanelTop, Link2, Mail, MapPin, Megaphone, Monitor, Palette, Phone, PlayCircle, ShoppingCart, Smartphone, Star, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';
import { buildImageUrl, starsFromRating, getImageOverride } from '../utils/helpers';
import { fallbackServices, fallbackTeam, fallbackTestimonials } from '../utils/siteData';
import SectionHeading from './SectionHeading';
import api from '../services/api';

function SectionCard({ children, className = '' }) {
  return <div className={`card-animate rounded-[22px] border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)] ${className}`}>{children}</div>;
}

const SERVICE_ICON_MAP = [
  ['database', Database],
  ['db', Database],
  ['api', Link2],
  ['integration', Link2],
  ['web', Globe],
  ['website', Globe],
  ['app', Smartphone],
  ['mobile', Smartphone],
  ['ui', Palette],
  ['ux', Palette],
  ['design', LayoutPanelTop],
  ['cloud', Cloud],
  ['ai', Cpu],
  ['ml', Cpu],
  ['market', Megaphone],
  ['seo', BarChart3],
  ['security', ShieldCheck],
  ['devops', Cloud],
  ['software', Code2],
  ['development', Code2]
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0a2a66]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(60,123,255,0.22),_rgba(10,42,102,0)_44%)]" />
      <div className="section-shell relative flex min-h-[calc(100vh-5rem)] items-center justify-center py-20 lg:py-24">
        <div className="max-w-5xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/90"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#4ea1ff]" /> Premium IT Solutions Agency
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mx-auto max-w-5xl text-[2.8rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-[4rem] lg:text-[4.8rem]"
          >
            <span className="bg-gradient-to-r from-white via-[#dce9ff] to-[#9fc1ff] bg-clip-text text-transparent">Your Idea, Our Technology, Your Online Success</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mx-auto mt-6 max-w-3xl text-[1.1rem] leading-9 text-white/90 sm:text-[1.2rem]"
          >
            We build scalable digital solutions that grow your business. From enterprise web applications to engaging digital marketing campaigns.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a href="#contact" className="btn-primary min-w-[190px]">Start Your Project</a>
            <a href="#projects" className="btn-secondary min-w-[190px]">View Our Work</a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export function HomeServicesSection() {
  const [services, setServices] = useState(fallbackServices);

  const resolveServiceIcon = (service) => {
    const source = `${service.icon || ''} ${service.title || ''} ${service.description || ''}`.toLowerCase();
    for (const [keyword, Icon] of SERVICE_ICON_MAP) {
      if (source.includes(keyword)) return Icon;
    }
    return Code2;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.985 },
    show: { opacity: 1, y: 0, scale: 1 }
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.08
      }
    }
  };

  const iconTheme = (index) => {
    const themes = [
      'bg-[#eaf1ff] text-[#2f6df7]',
      'bg-[#e9f8f0] text-[#168f57]',
      'bg-[#fff1e8] text-[#ea6b1f]',
      'bg-[#f3ecff] text-[#7e3af2]',
      'bg-[#e8f8ff] text-[#0c7ca6]',
      'bg-[#ffeef3] text-[#d6336c]'
    ];
    return themes[index % themes.length];
  };

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
    try {
      const response = await api.get('/services', { params: { page: 1, limit: 100 } });
      const items = response.data.data || [];
      setServices(items.length > 0 ? items : fallbackServices);
    } catch {
      setServices(fallbackServices);
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
    const intervalId = window.setInterval(fetchServices, 10000);

    return () => {
      window.removeEventListener('anova:data-updated', onDataUpdated);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(intervalId);
    };
  }, [fetchServices]);

  return (
    <section id="services" className="bg-[#f3f5f8] py-12 text-slate-900 sm:py-14">
      <div className="section-shell">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.22 }}
          variants={gridVariants}
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id || service.title}
              variants={cardVariants}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="relative"
            >
            <SectionCard className="h-full rounded-[14px] border border-[#d7dce6] bg-[#f7f9fc] shadow-[0_6px_16px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_30px_rgba(15,23,42,0.12)]">
              <div className="space-y-5 p-8">
              <div className={`grid h-[64px] w-[64px] place-items-center rounded-[16px] ${iconTheme(index)}`}>
                {(() => {
                  const Icon = resolveServiceIcon(service);
                  return <Icon className="h-7 w-7" />;
                })()}
              </div>
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
            </SectionCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function ServicesSection() {
  const [services, setServices] = useState(fallbackServices);

  const fetchServices = useCallback(async () => {
    try {
      const response = await api.get('/services', { params: { page: 1, limit: 20 } });
      const items = response.data.data || [];
      setServices(items.length ? items : fallbackServices);
    } catch {
      setServices(fallbackServices);
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
        <div className="space-y-16 lg:space-y-20">
          {services.map((service, index) => {
            const isReversed = index % 2 === 1;
            const bullets = resolveFeatures(service);

            return (
              <div
                key={service.id || service.title}
                className={`card-animate grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16 ${isReversed ? 'lg:[direction:rtl]' : ''}`}
              >
                <div className={`space-y-6 ${isReversed ? 'lg:[direction:ltr]' : ''}`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2f6df7] ring-1 ring-[#dbe6ff]">
                    <span className="text-xl">▣</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-[#163c88]">{service.title}</h2>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">{service.description}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-[#163c88]">Key Features</p>
                    <div className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
                      {bullets.map((bullet) => (
                        <div key={bullet} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2f6df7]" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a href="/contact" className="inline-flex items-center rounded-md bg-[#2f6df7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245fe0]">
                    Request Service
                  </a>
                </div>

                <div className={`flex ${isReversed ? 'lg:[direction:ltr]' : ''}`}>
                  <div className="card-animate relative h-[320px] w-full overflow-hidden rounded-[20px] border border-slate-200 bg-[#f5f7fb] shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:h-[360px]">
                    {service.image_url ? (
                      <img src={buildImageUrl(service.image_url)} alt={service.title} onError={(e) => { e.currentTarget.src = buildImageUrl(null); }} className="h-full w-full object-cover bg-[#f5f7fb]" />
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

      <div className="bg-[#eaf1ff] px-4 py-16 text-center sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <h3 className="text-2xl font-semibold tracking-tight text-[#163c88] sm:text-[1.8rem]">Not sure which service you need?</h3>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Our experts can help analyze your business requirements and suggest the most effective digital solutions for your specific goals.
          </p>
          <a href="/contact" className="mt-8 inline-flex items-center justify-center rounded-md bg-[#2f6df7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#245fe0]">
            Talk to an Expert
          </a>
        </div>
      </div>
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
    <section id="about" className="bg-[#eef4ff] py-24 text-slate-900">
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
              className="h-[420px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(10,42,102,0.25))]" />
            <div className="absolute inset-0 grid place-items-center">
              <button className="grid h-20 w-20 place-items-center rounded-full bg-[#2f6df7] text-white shadow-lg">
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
        {stats.map(([value, label]) => (
          <div key={label} className="card-animate rounded-xl px-2 py-3 text-center">
            <p className="text-[2rem] font-semibold leading-none text-[#15387c]">{value}</p>
            <p className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [liked, setLiked] = useState({});

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/projects', { params: { page: 1, limit: 9 } });
      setProjects(response.data.data || []);
    } catch {
      setProjects([]);
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

  const allTags = useMemo(() => {
    const tags = new Set();
    projects.forEach((p) => {
      if (Array.isArray(p.tags)) p.tags.forEach((t) => tags.add(t));
    });
    return ['All', ...Array.from(tags).slice(0, 4)];
  }, [projects]);

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return projects;
    return projects.filter((p) => Array.isArray(p.tags) && p.tags.includes(activeFilter));
  }, [projects, activeFilter]);

  const tagIcon = (tag = '') => {
    const t = tag.toLowerCase();
    if (t.includes('health')) return <HeartHandshake className="h-3.5 w-3.5" />;
    if (t.includes('edu') || t.includes('school')) return <GraduationCap className="h-3.5 w-3.5" />;
    if (t.includes('food') || t.includes('restaurant')) return <UtensilsCrossed className="h-3.5 w-3.5" />;
    if (t.includes('web') || t.includes('react')) return <Code2 className="h-3.5 w-3.5" />;
    if (t.includes('biz') || t.includes('business')) return <ShoppingCart className="h-3.5 w-3.5" />;
    return <Monitor className="h-3.5 w-3.5" />;
  };

  const cardIconBg = (index) => {
    const themes = [
      'bg-[#e8eeff] text-[#3a5cf4]',
      'bg-[#fff3e8] text-[#e07b1a]',
      'bg-[#eef6ff] text-[#2f78ff]',
      'bg-[#f0faf0] text-[#22a06b]',
      'bg-[#fdf0ff] text-[#a855f7]',
      'bg-[#fff0f4] text-[#f43f6e]',
    ];
    return themes[index % themes.length];
  };

  const chipColor = (index) => {
    const chips = [
      'bg-[#dcf5e7] text-[#1a7a46]',
      'bg-[#dff0ff] text-[#1a5bb5]',
      'bg-[#f2e6ff] text-[#7c3aed]',
      'bg-[#fff3dc] text-[#a05d00]',
      'bg-[#fde8ee] text-[#c0234e]',
      'bg-[#dff8ff] text-[#0369a1]',
    ];
    return chips[index % chips.length];
  };

  const linkColor = (index) => {
    const colors = ['text-[#2563eb]', 'text-[#16a34a]', 'text-[#7c3aed]', 'text-[#d97706]', 'text-[#db2777]', 'text-[#0891b2]'];
    return colors[index % colors.length];
  };

  const CardIcon = (index) => {
    const icons = [Monitor, UtensilsCrossed, GraduationCap, Code2, ShoppingCart, HeartHandshake];
    const Icon = icons[index % icons.length];
    return <Icon className="h-5 w-5" />;
  };

  return (
    <section id="projects" className="bg-[#f0f3fa] py-16 text-slate-900 sm:py-20">
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

        {/* Filter tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition ${
                activeFilter === tag
                  ? 'bg-[#2f6df7] text-white shadow-[0_6px_18px_rgba(47,109,247,0.3)]'
                  : 'border border-[#d4dff5] bg-white text-[#3c4f7a] hover:border-[#2f6df7] hover:text-[#2f6df7]'
              }`}
            >
              {tag !== 'All' ? tagIcon(tag) : null}
              {tag}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, index) => (
            <motion.div
              key={project.id || project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.32, delay: index * 0.05 }}
            >
              <div className="card-animate overflow-hidden rounded-[18px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition hover:shadow-[0_16px_36px_rgba(15,23,42,0.13)]">

                {/* Image area */}
                <div className="relative h-[210px] overflow-hidden">
                  <img
                    src={buildImageUrl(project.image_url)}
                    alt={project.title}
                    onError={(e) => { e.currentTarget.src = buildImageUrl(null); }}
                    className="h-full w-full object-cover bg-[#f0f3fa]"
                  />
                  {/* Category chip */}
                  <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${chipColor(index)}`}>
                    {Array.isArray(project.tags) && project.tags[0] ? project.tags[0] : 'Project'}
                  </span>
                  {/* Heart button */}
                  <button
                    onClick={() => setLiked((prev) => ({ ...prev, [project.id]: !prev[project.id] }))}
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white shadow-md transition hover:scale-110"
                  >
                    <Heart className={`h-4 w-4 ${liked[project.id] ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                  </button>
                </div>

                {/* Card body */}
                <div className="p-5">
                  {/* Floating icon */}
                  <div className={`-mt-9 mb-4 inline-grid h-12 w-12 place-items-center rounded-[14px] shadow-md ${cardIconBg(index)}`}>
                    {CardIcon(index)}
                  </div>

                  <h3 className="text-[17px] font-bold text-[#0f1b3f]">{project.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-[1.6] text-[#4d5f84] line-clamp-3">{project.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <a
                      href={project.live_demo_url || '#contact'}
                      target={project.live_demo_url ? '_blank' : undefined}
                      rel="noreferrer"
                      className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${linkColor(index)}`}
                    >
                      View Case Study <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={project.live_demo_url || '#contact'}
                      target={project.live_demo_url ? '_blank' : undefined}
                      rel="noreferrer"
                      className="grid h-8 w-8 place-items-center rounded-full border border-[#d6dfef] bg-[#f4f7ff] text-[#3c4f7a] transition hover:bg-[#2f6df7] hover:text-white"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);

  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await api.get('/testimonials');
      const items = response.data.data || [];
      setTestimonials(items.length > 0 ? items : fallbackTestimonials);
    } catch {
      setTestimonials(fallbackTestimonials);
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

  return (
    <section className="bg-white py-24 text-slate-900">
      <div className="section-shell space-y-10">
        <SectionHeading center eyebrow="Client Success Stories" title="Client Success Stories" description="Trusted results that speak for themselves." />
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <SectionCard key={item.id || item.name} className="h-full p-6">
              <div className="flex items-center gap-2 text-amber-400">
                {starsFromRating(item.rating).map((filled, index) => <Star key={index} className={`h-4 w-4 ${filled ? 'fill-current' : 'opacity-30'}`} />)}
              </div>
              <p className="mt-5 text-[0.92rem] italic leading-7 text-slate-600">“{item.review}”</p>
              <div className="mt-6 flex items-center gap-3">
                <img src={buildImageUrl(item.photo_url)} alt={item.name} onError={(e) => { e.currentTarget.src = buildImageUrl(null); }} className="h-10 w-10 rounded-full object-cover bg-white" />
                <div>
                  <h3 className="text-sm font-semibold text-[#163c88]">{item.name}</h3>
                  <p className="text-[0.76rem] text-slate-500">{item.designation}</p>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TeamSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="section-shell space-y-10">
        <SectionHeading eyebrow="Team" title="The people behind the polish." description="An intentionally compact team block with social links and elevated portrait cards." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {fallbackTeam.map((member) => (
            <SectionCard key={member.id} className="overflow-hidden p-0">
              <img src={member.image} alt={member.name} onError={(e) => { e.currentTarget.src = buildImageUrl(null); }} className="h-72 w-full object-cover bg-[#f8fafc]" />
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
    <section id="blog" className="bg-white py-20 sm:py-24">
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
                <a href="/contact" className="btn-secondary w-fit px-4 py-2 text-sm">Read More</a>
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section id="contact" className="relative overflow-hidden bg-[#102c66] py-20 text-white sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,156,255,0.18),_transparent_45%)]" />
      <div className="section-shell relative flex flex-col items-center text-center">
        <h2 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.4rem]">Ready to Transform Your Digital Presence?</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
          Let&apos;s discuss how our technology solutions can help you achieve your business goals.
        </p>
        <a href="/contact" className="mt-8 inline-flex items-center justify-center rounded-md bg-[#2f6df7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#245fe0]">
          Contact Us Today
        </a>
      </div>
    </section>
  );
}
