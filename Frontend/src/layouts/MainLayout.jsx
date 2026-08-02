import { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useMediaQuery } from '../utils/helpers';

const ChatbotWidget = lazy(() => import('../components/ChatbotWidget'));
const ThreeBackground = lazy(() => import('../components/ThreeBackground'));
const ENABLE_THREE_BACKGROUND = import.meta.env.VITE_ENABLE_THREE_BACKGROUND === 'true';
const ENABLE_CHATBOT_WIDGET = import.meta.env.VITE_ENABLE_CHATBOT_WIDGET === 'true';

export default function MainLayout({ children }) {
  const location = useLocation();
  const [shouldLoadThreeBackground, setShouldLoadThreeBackground] = useState(false);
  const [shouldLoadChatbot, setShouldLoadChatbot] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isMobileViewport = typeof window !== 'undefined'
    ? window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)').matches
    : false;
  const shouldRenderThreeBackground = ENABLE_THREE_BACKGROUND && shouldLoadThreeBackground && !isMobile && !isTablet && !isMobileViewport && !prefersReducedMotion;
  // Offset page content by the fixed navbar height plus the iOS safe area inset.
  const contentOffsetStyle = { paddingTop: 'calc(80px + env(safe-area-inset-top))' };

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
    let fallbackTimer;

    const enableDeferredFeatures = () => {
      setShouldLoadThreeBackground(true);
      setShouldLoadChatbot(true);
    };

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(enableDeferredFeatures, { timeout: 7000 });
      return () => window.cancelIdleCallback(idleId);
    }

    fallbackTimer = window.setTimeout(enableDeferredFeatures, 7000);
    return () => window.clearTimeout(fallbackTimer);
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
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {shouldRenderThreeBackground ? (
        <Suspense fallback={null}>
          <ThreeBackground />
        </Suspense>
      ) : null}
      <Navbar />
      {isMobileViewport ? (
        <main id="main-content" className="relative z-[1] mobile-static-render" style={contentOffsetStyle}>
          {children}
        </main>
      ) : (
        <AnimatePresence mode="wait">
          <motion.main
            id="main-content"
            key={location.pathname}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0.15 : isTablet ? 0.18 : 0.2, ease: 'easeOut' }}
            className="relative z-[1]"
            style={contentOffsetStyle}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      )}
      <Footer />
      {ENABLE_CHATBOT_WIDGET && shouldLoadChatbot ? (
        <Suspense fallback={null}>
          <ChatbotWidget />
        </Suspense>
      ) : null}
    </div>
  );
}
