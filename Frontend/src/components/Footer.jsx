import { Link } from 'react-router-dom';
import { ArrowUpRight, Facebook, Linkedin, Mail, MapPin, Phone, Instagram, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import { navLinks } from '../utils/siteData';

export default function Footer() {
  return (
    <footer className="border-t border-[#0f2f6d] bg-[#071d4a] text-white">
      <div className="section-shell grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.35 }} className="space-y-4">
          <img
            src="/logoanova-white.png"
            alt="Anova Technologies"
            className="h-auto w-[112px] max-w-none object-contain drop-shadow-[0_4px_12px_rgba(255,255,255,0.14)] sm:w-[166px]"
            loading="lazy"
            decoding="async"
          />
          <p className="max-w-xl text-sm leading-7 text-white/75">
            We Build Digital Solutions That Grow Your Business. Your Idea, Our Technology, Your Online Success!
          </p>
          <div className="flex gap-3 text-white/75">
            {[Facebook, Linkedin, Instagram, Youtube].map((Icon, index) => (
              <motion.a key={index} href="/" whileHover={{ y: -3 }} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10">
                <Icon className="h-4 w-4" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-white/90">Quick Links</h3>
          <div className="grid gap-3 text-sm text-white/75">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="flex items-center gap-2 transition hover:text-white">
                <ArrowUpRight className="h-4 w-4" /> {link.label}
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-white/90">Our Services</h3>
          <div className="grid gap-3 text-sm text-white/75">
            {['Website Development', 'Application Development', 'Digital Marketing', 'UI/UX Design', 'Cloud Solutions'].map((item) => (
              <span key={item} className="flex items-center gap-2 transition hover:text-white">
                <ArrowUpRight className="h-4 w-4" /> {item}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.35, delay: 0.15 }}>
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-white/90">Contact Info</h3>
          <div className="grid gap-4 text-sm text-white/80">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-[#7faaff]" />
              <span className="uppercase tracking-[0.18em] text-white/45">Email</span>
              <span className="text-white/90">anovatechnologies5@gmail.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-[#7faaff]" />
              <span className="uppercase tracking-[0.18em] text-white/45">Phone</span>
              <span className="text-white/90">9586342070 | 9313327727</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 shrink-0 text-[#7faaff]" />
              <span className="uppercase tracking-[0.18em] text-white/45">Location</span>
              <span className="text-white/90">India, Gujarat</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.88 1.54 2.31 1.09 2.87.83.09-.66.35-1.09.63-1.34-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.85c.85 0 1.71.12 2.5.35 1.9-1.32 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.31.68.92.68 1.86 0 1.34-.01 2.42-.01 2.75 0 .27.18.59.69.49C19.14 20.61 22 16.77 22 12.24 22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.24 2H21l-6.92 7.9L22 22h-6.8l-5.32-6.92L3.82 22H1l7.45-8.5L2 2h6.96l4.84 6.34L18.24 2Zm-1.2 18h1.53L8.12 3.9H6.48L17.04 20Z" />
    </svg>
  );
}
