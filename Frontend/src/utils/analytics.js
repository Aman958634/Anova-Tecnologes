const GA_MEASUREMENT_ID = 'G-WFLRB2DR31';

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
