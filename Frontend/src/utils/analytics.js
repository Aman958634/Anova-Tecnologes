const GA_MEASUREMENT_ID = 'G-WFLRB2DR31';

let initialized = false;

/**
 * Load gtag.js exactly once and initialize GA4.
 */
export function initAnalytics() {
  if (typeof window === 'undefined' || initialized) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  const existingScript = document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`);
  if (!existingScript) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  window.gtag('js', new Date());

  // Disable automatic page_view so route changes are tracked manually and accurately.
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

  initialized = true;
}

/**
 * Track SPA route page views for React Router navigation.
 */
export function trackPageView(pathname, search = '') {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_path: `${pathname}${search}`,
    page_location: window.location.href,
  });
}

export { GA_MEASUREMENT_ID };
