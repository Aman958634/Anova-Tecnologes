import SEO from '../components/SEO';
import { AboutSection, ContactSection, HeroSection, HomeServicesSection, ProjectsSection, TestimonialsSection } from '../components/sections';
import ServiceShowcase from '../components/ServiceShowcase';

export default function Home() {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ANOVA Technologies',
    url: 'https://anova-tecnologes-app.vercel.app',
    logo: 'https://anova-tecnologes-app.vercel.app/logoanova-white.png',
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
    image: 'https://anova-tecnologes-app.vercel.app/logoanova.png',
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
      <HeroSection />
      <ServiceShowcase />
      <AboutSection />
      <HomeServicesSection />
      <ProjectsSection />
      <TestimonialsSection />
      <ContactSection />
    </>
  );
}
