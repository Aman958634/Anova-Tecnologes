import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const ServiceShowcase = lazy(() => import('../components/ServiceShowcase'));
const AboutSection = lazy(() => import('../components/sections').then((module) => ({ default: module.AboutSection })));
const HomeServicesSection = lazy(() => import('../components/sections').then((module) => ({ default: module.HomeServicesSection })));
const ProjectsSection = lazy(() => import('../components/sections').then((module) => ({ default: module.ProjectsSection })));
const TestimonialsSection = lazy(() => import('../components/sections').then((module) => ({ default: module.TestimonialsSection })));
const ContactSection = lazy(() => import('../components/sections').then((module) => ({ default: module.ContactSection })));

export default function Home() {
  const [shouldLoadDeferredSections, setShouldLoadDeferredSections] = useState(false);

  useEffect(() => {
    const loadDeferredSections = () => setShouldLoadDeferredSections(true);

    const interactionEvents = ['scroll', 'touchstart', 'mousemove', 'keydown'];
    const onFirstInteraction = () => {
      loadDeferredSections();
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, onFirstInteraction);
      });
    };

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, onFirstInteraction, { once: true, passive: true });
    });

    // Keep perf-friendly interaction-first behavior, but guarantee sections appear
    // even when no interaction event fires (common in synthetic/mobile captures).
    const guaranteedLoad = window.setTimeout(loadDeferredSections, 12000);

    return () => {
      window.clearTimeout(guaranteedLoad);
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, onFirstInteraction);
      });
    };
  }, []);

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ANOVA Technologies',
    url: 'https://anova-tecnologes-app.vercel.app',
    logo: 'https://anova-tecnologes-app.vercel.app/logoanova-white.webp',
    description: 'Full-service digital solutions company building modern websites, web applications, mobile apps, and digital products that help businesses grow.',
    sameAs: [
      'https://anova-tecnologes-app.vercel.app',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9586342070',
      contactType: 'customer support',
      availableLanguage: 'English',
    },
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'ANOVA Technologies',
    description: 'Full-service digital solutions company specializing in web development, mobile app development, UI/UX design, cloud solutions, and AI-powered features.',
    url: 'https://anova-tecnologes-app.vercel.app',
    image: 'https://anova-tecnologes-app.vercel.app/logoanova.webp',
    areaServed: { '@type': 'Country', name: 'India' },
    serviceType: [
      'Web Development',
      'Mobile App Development',
      'UI/UX Design',
      'Cloud Solutions',
      'AI Solutions',
      'Digital Marketing',
    ],
  };

  return (
    <>
      <SEO
        title="Home"
        description="ANOVA Technologies is a full-service digital solutions company building modern websites, web applications, mobile apps, and digital products that help businesses grow."
        url="/"
        schema={[orgSchema, serviceSchema]}
      />
      <section className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-gradient-to-b from-[#071c46] via-[#0a2c72] to-[#0f3a92] px-4 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex h-full max-w-[1000px] flex-col items-center justify-center text-center">
          <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs tracking-[0.14em] text-white/85">
            Build. Grow. Transform.
          </p>
          <h1 className="mt-[20px] max-w-4xl text-center text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            𝗖𝘂𝘀𝘁𝗼𝗺 𝗪𝗲𝗯 & 𝗦𝗼𝗳𝘁𝘄𝗮𝗿𝗲 𝗦𝗼𝗹𝘂𝘁𝗶𝗼𝗻𝘀
                   𝗕𝘂𝗶𝗹𝘁 𝗳𝗼𝗿 𝗕𝘂𝘀𝗶𝗻𝗲𝘀𝘀 𝗚𝗿𝗼𝘄𝘁𝗵
          </h1>
          <p className="mt-[24px] max-w-2xl text-center text-base text-blue-100 sm:text-lg">
            ANOVA Technologies helps startups and enterprises launch fast, scalable digital products with modern engineering and measurable outcomes.
          </p>
          <div className="mt-[32px] flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-[20px]">
            <Link
              to="/contact"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0a2c72] transition hover:bg-blue-100"
            >
              Start A Project
            </Link>
            <Link
              to="/services"
              className="rounded-xl border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {shouldLoadDeferredSections ? (
        <Suspense fallback={<div className="h-24" aria-hidden="true" />}>
          <ServiceShowcase />
          <AboutSection />
          <HomeServicesSection />
          <ProjectsSection />
          <TestimonialsSection />
          <ContactSection />
        </Suspense>
      ) : (
        <div className="h-24" aria-hidden="true" />
      )}
    </>
  );
}
