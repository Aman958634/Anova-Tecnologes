import { ArrowRight } from 'lucide-react';

export default function ProjectButton({ href, label = 'View Case Study' }) {
  return (
    <a
      href={href || '#contact'}
      target={href ? '_blank' : undefined}
      rel="noreferrer"
      className="relative inline-flex items-center gap-2 rounded-full border border-[#c9dbff] bg-white/60 px-4 py-2 text-[13px] font-semibold text-[#1f58cc] shadow-[0_8px_24px_rgba(47,109,247,0.14)]"
    >
      <span className="relative z-10">{label}</span>
      <span className="relative z-10">
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </a>
  );
}
