import { useEffect, useState } from 'react';
import { Lightbulb, Target, Users } from 'lucide-react';
import { getTeam } from '../services/api';
import { buildImageUrl, imageFallbackByKey, useMediaQuery } from '../utils/helpers';
import { fallbackTeam } from '../utils/siteData';
import SEO from '../components/SEO';
import { useResource } from '../hooks/useResource';

export default function About() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  const { data: teamMembers = fallbackTeam, loading, error, retry } = useResource(
    () => getTeam(1, 12),
    [getTeam]
  );
  const coreValues = [
    {
      icon: Target,
      title: 'Results-Driven',
      text: 'We focus on solutions that deliver measurable business outcomes, not just beautiful code.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      text: 'We constantly explore new technologies to provide our clients with a competitive edge.'
    },
    {
      icon: Users,
      title: 'Partnership',
      text: 'We view our clients as long-term partners, committing to their ongoing success.'
    }
  ];

  useEffect(() => {
    const onDataUpdated = () => retry();
    const onStorage = (event) => {
      if (event.key === 'anova:data-updated') retry();
    };

    window.addEventListener('anova:data-updated', onDataUpdated);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('anova:data-updated', onDataUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [retry]);

  // Use the site team-working hero image for the About right-side illustration
  const heroImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
  const heroImageFallback = imageFallbackByKey();

  function TeamMemberCard({ member }) {
    const [src, setSrc] = useState(null);

    useEffect(() => {
      const candidate = member.image_url || member.image;
      if (!candidate) {
        setSrc(imageFallbackByKey());
        return;
      }

      // Resolve image URL directly. HEAD probes can fail with strict CORS and cause false fallbacks.
      setSrc(buildImageUrl(candidate, imageFallbackByKey()));
    }, [member]);

    const initials = member.name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 1)
      .join('')
      .toUpperCase();

    return (
      <div key={member.id} className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        {src ? (
          <img
            src={src}
            alt={member.name}
            loading="lazy"
            decoding="async"
            width={720}
            height={900}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            onError={(e) => { e.currentTarget.src = imageFallbackByKey(); }}
            className="h-[250px] w-full object-cover bg-[#eaf1ff]"
          />
        ) : (
          <div className="flex h-[250px] items-center justify-center bg-[#eaf1ff]">
            <span className="text-3xl font-semibold text-[#2f6df7]">{initials}</span>
          </div>
        )}

        <div className="border-t border-slate-200 px-4 py-4 text-center">
          <h3 className="text-[0.95rem] font-bold tracking-tight text-[#163c88]">{member.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{member.designation}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <SEO
        title="About Us"
        description="Learn about ANOVA Technologies — a full-service digital solutions company founded in India, building modern websites, web applications, and mobile apps for businesses worldwide."
        url="/about"
      />
      <div className="bg-white text-slate-900">
      <section className="bg-[#102c66] px-4 py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">About Anova Technologies</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
            We are a full-service digital solutions company passionate about helping businesses establish a powerful digital identity and achieve online success.
          </p>
        </div>
      </section>

      <section className="section-shell py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[0.98fr_1.02fr]">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-[#163c88] sm:text-[2rem]">Our Story</p>
            <div className="mt-4 max-w-xl space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
              <p>
                Founded in India, Anova Technologies started with a simple yet powerful vision: to bridge the gap between innovative ideas and cutting-edge technology.
              </p>
              <p>
                We understood early on that in today&apos;s fast-paced digital landscape, a business needs more than just a website, it needs a comprehensive digital identity that resonates with its audience and drives growth.
              </p>
              <p>
                Today, we are proud to be the technology partner for numerous businesses, delivering everything from high-performance web applications to strategic digital marketing campaigns. Our success is measured entirely by the success of our clients.
              </p>
            </div>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <div className="overflow-hidden rounded-[18px] shadow-[0_20px_55px_rgba(15,23,42,0.18)] w-full max-w-[420px]">
              <img
                src={buildImageUrl(heroImage, heroImageFallback)}
                alt="Team collaboration"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width={1200}
                height={800}
                sizes="(max-width: 1024px) 100vw, 420px"
                onError={(e) => { e.currentTarget.src = heroImageFallback; }}
                className="w-full h-auto sm:h-[420px] object-cover rounded-[18px]"
              />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-2xl font-semibold tracking-tight text-[#163c88] sm:text-[2rem]">Our Core Values</p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              These principles guide every project we undertake and every line of code we write.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {coreValues.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[16px] border border-slate-200 bg-white px-6 py-8 text-center shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#2f6df7] text-white shadow-[0_10px_24px_rgba(47,109,247,0.18)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-[1.02rem] font-semibold text-[#163c88]">{item.title}</h3>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#f8fbff] py-16 sm:py-20">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-2xl font-semibold tracking-tight text-[#163c88] sm:text-[2rem]">Meet Our Experts</p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              The talented individuals behind our successful projects.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {error ? (
              <div className="sm:col-span-2 xl:col-span-4 flex flex-col items-center justify-center gap-3 py-12 text-center">
                <p className="text-sm text-red-600">Unable to load team members right now.</p>
                <button onClick={retry} className="rounded-lg bg-[#2f6df7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2458d0]">
                  Retry
                </button>
              </div>
            ) : loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-[14px] border border-slate-200 bg-slate-100">
                  <div className="h-[250px] w-full bg-slate-200/60" />
                  <div className="space-y-2 p-4 text-center">
                    <div className="mx-auto h-5 w-3/4 rounded bg-slate-200/80" />
                    <div className="mx-auto h-4 w-1/2 rounded bg-slate-200/60" />
                  </div>
                </div>
              ))
            ) : (
              teamMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
