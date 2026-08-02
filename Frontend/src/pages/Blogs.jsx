import SEO from '../components/SEO';
import { BlogSection } from '../components/sections';

const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'ANOVA Technologies Blog',
  description:
    'Guides, case studies, and digital strategy insights from ANOVA Technologies on development, UX, and growth.',
  url: 'https://anova-tecnologes-app.vercel.app/blogs'
};

export default function Blogs() {
  return (
    <>
      <SEO
        title="Blogs"
        description="Read ANOVA Technologies blog articles covering web development, digital strategy, UX, and scalable product engineering."
        url="/blogs"
        schema={blogSchema}
      />
      <BlogSection />
    </>
  );
}
