const GA_MEASUREMENT_ID = 'G-WFLRB2DR31';
const queuedPageViews = [];
let initialized = false;

function flushQueuedPageViews() {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  while (queuedPageViews.length > 0) {
    const { pathname, search } = queuedPageViews.shift();
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_path: `${pathname}${search}`,
      page_location: window.location.href,
    });
  }
}

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return;
  }

  initialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };

  let idleCallbackId = null;
  let fallbackTimerId = null;

  const load = () => {
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onload = () => {
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
      flushQueuedPageViews();
    };
    document.head.appendChild(script);
  };

  const scheduleIdleLoad = () => {
    if (typeof window.requestIdleCallback === 'function') {
      idleCallbackId = window.requestIdleCallback(() => {
        load();
      }, { timeout: 10000 });
    } else {
      fallbackTimerId = window.setTimeout(load, 4000);
    }
  };

  const onFirstInteraction = () => {
    scheduleIdleLoad();
    interactionEvents.forEach((eventName) => {
      window.removeEventListener(eventName, onFirstInteraction);
    });
    if (fallbackTimerId) {
      window.clearTimeout(fallbackTimerId);
    }
  };

  const interactionEvents = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
  interactionEvents.forEach((eventName) => {
    window.addEventListener(eventName, onFirstInteraction, { once: true, passive: true });
  });

  fallbackTimerId = window.setTimeout(scheduleIdleLoad, 15000);
}

/**
 * Track SPA route page views for React Router navigation.
 */
export function trackPageView(pathname, search = '') {
  if (typeof window === 'undefined') return;

  if (typeof window.gtag !== 'function') {
    queuedPageViews.push({ pathname, search });
    return;
  }

  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_path: `${pathname}${search}`,
    page_location: window.location.href,
  });
}

export { GA_MEASUREMENT_ID };
