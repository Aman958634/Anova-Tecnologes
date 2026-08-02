import { ProjectsSection } from '../components/sections';
import SEO from '../components/SEO';

export default function Projects() {
  return (
    <>
      <SEO
        title="Projects"
        description="Explore ANOVA Technologies projects including web apps, business websites, and digital products built for performance and growth."
        url="/projects"
      />
      <ProjectsSection />
    </>
  );
}
