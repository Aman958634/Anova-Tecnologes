import { AboutSection, ContactSection, HeroSection, HomeServicesSection, ProjectsSection, TestimonialsSection } from '../components/sections';
import ServiceShowcase from '../components/ServiceShowcase';

export default function Home() {
  return (
    <>
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
