import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout({ children }) {
  const location = useLocation();
  const lenisRef = useRef(null);

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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      direction: 'vertical',
      lerp: 0.09,
      wheelMultiplier: 0.75,
      smoothTouch: false
    });

    lenisRef.current = lenis;
    document.documentElement.style.scrollBehavior = 'auto';

    let frame = null;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const handleAnchorClicks = (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -92, duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    };

    document.addEventListener('click', handleAnchorClicks);

    return () => {
      document.removeEventListener('click', handleAnchorClicks);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 0.55, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
