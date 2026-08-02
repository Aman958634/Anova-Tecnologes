import { Monitor, UtensilsCrossed, GraduationCap, Code2, ShoppingCart, HeartHandshake } from 'lucide-react';

// Section-level reveal for the full Projects block.
export const sectionEnter = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

// Stagger container so project cards enter one by one.
export const gridStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// Card entrance animation: fade + move up gently + scale into place.
export const cardEntrance = {
  hidden: { opacity: 0, y: 48, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  },
};

export const cardIconBg = (index) => {
  const themes = [
    'from-[#d8e6ff] to-[#bfd4ff] text-[#335ce9]',
    'from-[#ffe8d3] to-[#ffd2ad] text-[#d97312]',
    'from-[#e4f4ff] to-[#cde8ff] text-[#1f78dc]',
    'from-[#e7f8f0] to-[#c9efd9] text-[#169c66]',
    'from-[#f4e8ff] to-[#e4d2ff] text-[#7b42d9]',
    'from-[#ffe6ef] to-[#ffd1e0] text-[#da3e73]',
  ];
  return themes[index % themes.length];
};

export const chipColor = (index) => {
  const chips = [
    'bg-[#dcf5e7]/90 text-[#1a7a46] border-[#b9e8cd]',
    'bg-[#dff0ff]/90 text-[#1a5bb5] border-[#bfddff]',
    'bg-[#f2e6ff]/90 text-[#7c3aed] border-[#dfc7ff]',
    'bg-[#fff3dc]/90 text-[#a05d00] border-[#f6d39b]',
    'bg-[#fde8ee]/90 text-[#c0234e] border-[#f9c0d2]',
    'bg-[#dff8ff]/90 text-[#0369a1] border-[#b6e8fb]',
  ];
  return chips[index % chips.length];
};

export const linkColor = (index) => {
  const colors = ['text-[#2563eb]', 'text-[#16a34a]', 'text-[#7c3aed]', 'text-[#d97706]', 'text-[#db2777]', 'text-[#0891b2]'];
  return colors[index % colors.length];
};

export const getCardIcon = (index) => {
  const icons = [Monitor, UtensilsCrossed, GraduationCap, Code2, ShoppingCart, HeartHandshake];
  return icons[index % icons.length];
};

export const resolveProjectImage = (project) => project.imageUrl || project.image || project.image_url || '';

export const getProjectTags = (project) => {
  if (Array.isArray(project.tags) && project.tags.length) return project.tags;
  return ['Project', 'Case Study'];
};
