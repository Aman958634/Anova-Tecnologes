import { Link } from 'react-router-dom';
import { ArrowUpRight, Facebook, Linkedin, Mail, MapPin, Phone, Instagram, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import { navLinks } from '../utils/siteData';

export default function Footer() {
  const socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com', Icon: Facebook },
    { label: 'LinkedIn', href: 'https://linkedin.com', Icon: Linkedin },
    { label: 'Instagram', href: 'https://instagram.com', Icon: Instagram },
    { label: 'YouTube', href: 'https://youtube.com', Icon: Youtube }
  ];

  return (
    <footer className="border-t border-[#0f2f6d] bg-[#071d4a] text-white">
      <div className="section-shell grid gap-10 py-16 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.35 }} className="space-y-4">
          <img
            src="/logoanova-white.webp"
            alt="Anova Technologies logo"
            width={166}
            height={66}
            className="h-auto w-[112px] max-w-none object-contain drop-shadow-[0_4px_12px_rgba(255,255,255,0.14)] sm:w-[166px]"
            loading="lazy"
            decoding="async"
          />
          <p className="max-w-xl text-sm leading-7 text-white/75">
            We Build Digital Solutions That Grow Your Business. Your Idea, Our Technology, Your Online Success!
          </p>
          <div className="flex gap-3 text-white/75">
            {socialLinks.map(({ label, href, Icon }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ANOVA Technologies on ${label}`}
                whileHover={{ y: -3 }}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10"
              >
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
              <Link key={item} to="/services" className="flex items-center gap-2 transition hover:text-white">
                <ArrowUpRight className="h-4 w-4" /> {item}
              </Link>
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
