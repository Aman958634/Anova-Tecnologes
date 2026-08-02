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

  const load = () => {
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

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(load, { timeout: 2000 });
    return;
  }

  window.setTimeout(load, 1200);
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
