import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatbotWidget from '../components/ChatbotWidget';
import ThreeBackground from '../components/ThreeBackground';

export default function MainLayout({ children }) {
  const location = useLocation();

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isTouchMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
    if (!isTouchMobile) return undefined;
    document.body.classList.add('mobile-render-safe');
    return () => {
      document.body.classList.remove('mobile-render-safe');
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const targets = Array.from(
      document.querySelectorAll('main section, main .card-animate, footer')
    );

    targets.forEach((node) => node.classList.add('fx-reveal', 'fx-reveal--visible'));

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fx-reveal--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    targets.forEach((node) => observer.observe(node));

    const revealFallback = window.setTimeout(() => {
      targets.forEach((node) => {
        if (!node.classList.contains('fx-reveal--visible')) {
          node.classList.add('fx-reveal--visible');
        }
      });
    }, 500);

    return () => {
      observer.disconnect();
      window.clearTimeout(revealFallback);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return undefined;
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-[#071c46] text-slate-100">
      <ThreeBackground />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-[1] pt-[80px]"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
