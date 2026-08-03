import { ArrowRight } from 'lucide-react';

export default function ProjectButton({ href, label = 'View Case Study', variant }) {
  const base =
    "group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-200";

  const styles = variant === 'minimal'
    ? 'border border-[#E5E7EB] bg-white text-slate-700 hover:bg-slate-50'
    : 'border border-[#c9dbff] bg-white/60 text-[#1f58cc] shadow-[0_8px_24px_rgba(47,109,247,0.14)] hover:border-[#8eb4ff] hover:text-[#0d47bd]';

  return (
    <a
      href={href || '#contact'}
      target={href ? '_blank' : undefined}
      rel="noreferrer"
      className={`${base} ${styles}`}
    >
      <span className="relative z-10">{label}</span>

      <span className="relative z-10">
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </a>
  );
}
