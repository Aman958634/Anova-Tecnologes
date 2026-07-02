import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { fallbackServices } from '../utils/siteData';
import './Services.css';

const SERVICE_ICON_SLUGS = [
  'database',
  'api',
  'web',
  'mobile',
  'ui',
  'ux',
  'design',
  'cloud',
  'seo',
  'security',
  'software',
  'market'
];

function resolveServiceIcon(service) {
  const source = `${service.icon || ''} ${service.title || ''} ${service.description || ''}`.toLowerCase();
  for (const term of SERVICE_ICON_SLUGS) {
    if (source.includes(term)) return term;
  }
  return 'service';
}

function normalizeFeatures(service) {
  if (Array.isArray(service.key_features) && service.key_features.length) {
    return service.key_features.filter(Boolean);
  }

  if (typeof service.key_features === 'string') {
    return service.key_features.split(',').map((item) => item.trim()).filter(Boolean);
  }

  const title = (service.title || '').toLowerCase();
  if (title.includes('app') || title.includes('mobile')) {
    return ['Android & iOS App Development', 'User-Friendly Interfaces', 'Rapid Iteration & Deployment'];
  }

  if (title.includes('cloud')) {
    return ['Scalable Infrastructure', 'Managed Deployments', 'Secure Cloud Architecture'];
  }

  if (title.includes('seo') || title.includes('marketing')) {
    return ['SEO Optimization', 'Paid Campaign Management', 'Conversion-Focused Strategy'];
  }

  return ['Responsive Design', 'Fast Performance', 'Business-First Solutions'];
}

const ICON_THEMES = [
  { bg: '#eaf1ff', color: '#2f6df7' },
  { bg: '#e9f8f0', color: '#168f57' },
  { bg: '#fff1e8', color: '#ea6b1f' },
  { bg: '#f3ecff', color: '#7e3af2' },
  { bg: '#e8f8ff', color: '#0c7ca6' },
  { bg: '#ffeef3', color: '#d6336c' }
];

export default function Services() {
  const [services, setServices] = useState(fallbackServices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/services', { params: { page: 1, limit: 20 } });
      const items = response.data?.data || [];
      setServices(items.length ? items : fallbackServices);
    } catch (err) {
      setError('Unable to load services right now. Please try again later.');
      setServices(fallbackServices);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const statusMessage = useMemo(() => {
    if (loading) return 'Loading services...';
    if (error) return error;
    return `${services.length} services available`;
  }, [loading, error, services.length]);

  return (
    <main className="services-page">
      <section className="services-hero">
        <div className="services-hero__inner">
          <div className="services-hero__badge">
            <span>Who We Are</span>
          </div>
          <h1 className="services-hero__title">Our Services Designed for Growth</h1>
          <p className="services-hero__copy">
            Anova Technologies builds digital experiences that work beautifully on every screen. From responsive web apps to mobile-first solutions, our services keep your business visible and performant.
          </p>
          <div className="services-hero__actions">
            <a className="services-hero__button services-hero__button--primary" href="#services">
              View Services
            </a>
            <a className="services-hero__button services-hero__button--secondary" href="/contact">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <section id="services" className="services-section">
        <div className="services-shell">
          <div className={`services-status ${error ? 'services-error' : ''}`}>
            {statusMessage}
          </div>

          <div className="services-grid">
            {services.map((service, index) => {
              const features = normalizeFeatures(service).slice(0, 3);
              const theme = ICON_THEMES[index % ICON_THEMES.length];
              return (
                <article key={service.id || service.title} className="service-card">
                  <div className="service-card__content">
                    <div
                      className="service-card__header"
                      style={{ background: theme.bg, color: theme.color }}
                    >
                      {resolveServiceIcon(service).slice(0, 1).toUpperCase()}
                    </div>
                    <h2 className="service-card__title">{service.title}</h2>
                    <p className="service-card__description">
                      {service.description || 'High-quality service designed to help your business grow.'}
                    </p>
                    <div className="service-card__features">
                      {features.map((feature) => (
                        <div key={feature} className="service-card__feature">
                          <span className="service-card__feature-indicator" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="service-card__footer">
                    <a className="service-card__link" href="/contact">
                      Learn more
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
