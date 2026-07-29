import SEO from '../components/SEO';
import { ServicesSection } from '../components/sections';

const faqs = [
  {
    question: 'What does your pricing look like?',
    answer: 'We tailor every project to its specific scope, complexity, and timeline. Pricing is based on the features, integrations, and design requirements you need. We provide transparent proposals before any work begins.',
  },
  {
    question: 'How long does a typical project take?',
    answer: 'Timelines vary depending on the project scope. A standard business website typically takes a few weeks, while more complex applications like custom dashboards or mobile apps can take several months. We outline milestones and communicate progress throughout.',
  },
  {
    question: 'What is your development process?',
    answer: 'We follow a structured process: discovery and requirements gathering, UX wireframing and design, development and iterative builds, QA testing, and launch. We work in sprints so you can review progress at every stage.',
  },
  {
    question: 'Do you offer maintenance and support after launch?',
    answer: 'Yes. We offer ongoing maintenance and support packages that include monitoring, security updates, bug fixes, and feature enhancements. We want your digital product to stay reliable long after launch.',
  },
  {
    question: 'What technology stack do you use?',
    answer: 'We work with modern technologies including React, Node.js, Express, and MySQL for full-stack development, along with cloud hosting and CI/CD pipelines. We choose tools based on what best fits each project.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function Services() {
  return (
    <>
      <SEO
        title="Services"
        description="Explore ANOVA Technologies services — web development, mobile app development, UI/UX design, cloud solutions, AI features, and digital marketing."
        url="/services"
        schema={faqSchema}
      />
      <ServicesSection />
    </>
  );
}
