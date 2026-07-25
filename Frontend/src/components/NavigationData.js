import {
  Bot,
  Cloud,
  Code2,
  Megaphone,
  Palette,
  Smartphone,
} from 'lucide-react';

export const NAV_ITEMS = [
  { key: 'home', label: 'Home', path: '/' },
  {
    key: 'services',
    label: 'Services',
    path: '/services',
    menu: {
      type: 'mega',
      columns: [
        {
          title: 'Web Development',
          icon: Code2,
          items: [
            { label: 'Custom Website Development', path: '/services' },
            { label: 'E-Commerce Development', path: '/services' },
            { label: 'CMS Development', path: '/services' },
            { label: 'Web App Engineering', path: '/services' },
            { label: 'Progressive Web Apps', path: '/services' },
          ],
        },
        {
          title: 'Mobile Apps',
          icon: Smartphone,
          items: [
            { label: 'Android App Development', path: '/services' },
            { label: 'iOS App Development', path: '/services' },
            { label: 'Flutter Development', path: '/services' },
            { label: 'React Native Development', path: '/services' },
            { label: 'Cross Platform Apps', path: '/services' },
          ],
        },
        {
          title: 'UI/UX',
          icon: Palette,
          items: [
            { label: 'UI Design', path: '/services' },
            { label: 'UX Research', path: '/services' },
            { label: 'Wireframes and Prototypes', path: '/services' },
            { label: 'Design Systems', path: '/services' },
            { label: 'Usability Testing', path: '/services' },
          ],
        },
        {
          title: 'AI Solutions',
          icon: Bot,
          items: [
            { label: 'Conversational AI', path: '/services' },
            { label: 'Intelligent Automation', path: '/services' },
            { label: 'Machine Learning Models', path: '/services' },
            { label: 'Data Intelligence', path: '/services' },
            { label: 'AI Integrations', path: '/services' },
          ],
        },
        {
          title: 'Cloud',
          icon: Cloud,
          items: [
            { label: 'Cloud Architecture', path: '/services' },
            { label: 'Cloud Migration', path: '/services' },
            { label: 'DevOps and CI/CD', path: '/services' },
            { label: 'Kubernetes Services', path: '/services' },
            { label: 'Cloud Security', path: '/services' },
          ],
        },
        {
          title: 'Digital Marketing',
          icon: Megaphone,
          items: [
            { label: 'Search Engine Optimization', path: '/services' },
            { label: 'Performance Marketing', path: '/services' },
            { label: 'Social Media Marketing', path: '/services' },
            { label: 'Content Strategy', path: '/services' },
            { label: 'Analytics and Reporting', path: '/services' },
          ],
        },
      ],
      items: [
        { label: 'Custom Website Development', path: '/services' },
        { label: 'Mobile App Development', path: '/services' },
        { label: 'UI/UX Design', path: '/services' },
        { label: 'AI Solutions', path: '/services' },
        { label: 'Cloud Services', path: '/services' },
        { label: 'Digital Marketing', path: '/services' },
      ],
    },
  },
  {
    key: 'solutions',
    label: 'Solutions',
    path: '/services',
    menu: {
      type: 'dropdown',
      items: [
        { label: 'Custom Software', path: '/services' },
        { label: 'AI Solutions', path: '/services' },
        { label: 'Cloud Services', path: '/services' },
        { label: 'Enterprise Apps', path: '/services' },
        { label: 'API Development', path: '/services' },
        { label: 'Consulting', path: '/services' },
      ],
    },
  },
  {
    key: 'industries',
    label: 'Industries',
    path: '/projects',
    menu: {
      type: 'dropdown',
      items: [
        { label: 'Healthcare', path: '/projects' },
        { label: 'Finance', path: '/projects' },
        { label: 'Education', path: '/projects' },
        { label: 'Retail', path: '/projects' },
        { label: 'Manufacturing', path: '/projects' },
        { label: 'Logistics', path: '/projects' },
      ],
    },
  },
  { key: 'projects', label: 'Projects', path: '/projects' },
  {
    key: 'resources',
    label: 'Resources',
    path: '/about',
    menu: {
      type: 'dropdown',
      items: [
        { label: 'Blog', path: '/about' },
        { label: 'Case Studies', path: '/projects' },
        { label: 'Portfolio', path: '/projects' },
        { label: 'Documentation', path: '/about' },
        { label: 'FAQs', path: '/about' },
        { label: 'Support', path: '/contact' },
      ],
    },
  },
  {
    key: 'company',
    label: 'Company',
    path: '/about',
    menu: {
      type: 'dropdown',
      items: [
        { label: 'About Us', path: '/about' },
        { label: 'Our Team', path: '/about' },
        { label: 'Careers', path: '/about' },
        { label: 'Testimonials', path: '/about' },
        { label: 'Partners', path: '/about' },
        { label: 'Contact', path: '/contact' },
      ],
    },
  },
  { key: 'contact', label: 'Contact', path: '/contact' },
];
