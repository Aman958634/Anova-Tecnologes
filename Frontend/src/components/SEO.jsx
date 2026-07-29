import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://anova-tecnologes.vercel.app';

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jsonLd(schema) {
  return JSON.stringify(schema, null, 0);
}

export const schemas = {
  Organization: (overrides = {}) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ANOVA Technologies',
    url: BASE_URL,
    logo: `${BASE_URL}/logoanova-white.png`,
    description:
      'ANOVA Technologies is a full-service digital solutions company building modern websites, web applications, mobile apps, and digital products that help businesses grow.',
    sameAs: [
      'https://anova-tecnologes.vercel.app',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9586342070',
      contactType: 'customer support',
      availableLanguage: 'English',
    },
    ...overrides,
  }),

  ProfessionalService: (overrides = {}) => ({
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'ANOVA Technologies',
    description:
      'Full-service digital solutions company specializing in web development, mobile app development, UI/UX design, cloud solutions, and AI-powered features.',
    url: BASE_URL,
    image: `${BASE_URL}/logoanova.png`,
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    serviceType: [
      'Web Development',
      'Mobile App Development',
      'UI/UX Design',
      'Cloud Solutions',
      'AI Solutions',
      'Digital Marketing',
    ],
    ...overrides,
  }),

  BreadcrumbList: (items = []) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  BlogPosting: (post = {}) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title || '',
    description: post.excerpt || post.description || '',
    image: post.image_url ? [post.image_url] : undefined,
    author: {
      '@type': 'Organization',
      name: 'ANOVA Technologies',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ANOVA Technologies',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logoanova-white.png`,
      },
    },
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at || undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url || undefined,
    },
    url: post.url || undefined,
    keywords: post.tags || post.category ? [post.category, ...(post.tags || [])].filter(Boolean) : undefined,
  }),

  FAQPage: (faqs = []) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }),
};

export default function SEO({
  title,
  description,
  keywords,
  url,
  image,
  noindex = false,
  schema = null,
  breadcrumbs = [],
}) {
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const pageTitle = title ? `${title} | ANOVA Technologies` : 'ANOVA Technologies';
  const metaDescription = description || 'Full-service digital solutions company building modern websites, web applications, mobile apps, and digital products that help businesses grow.';
  const metaKeywords = keywords || 'Web Development, Mobile App Development, UI/UX Design, Cloud Solutions, AI Solutions, Digital Marketing, React.js, Node.js';
  const metaImage = image || '/anova-social-preview-1200x630.png';
  const metaImageUrl = metaImage.startsWith('http') ? metaImage : `${BASE_URL}${metaImage}`;

  return (
    <Helmet titleTemplate="%s | ANOVA Technologies" defaultTitle="ANOVA Technologies">
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <link rel="canonical" href={fullUrl} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="ANOVA Technologies" />
      <meta property="og:image" content={metaImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || 'ANOVA Technologies'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImageUrl} />

      {breadcrumbs.length > 0 && (
        <script type="application/ld+json">
          {jsonLd(schemas.BreadcrumbList(breadcrumbs))}
        </script>
      )}

      {Array.isArray(schema)
        ? schema.map((s, i) => (
            <script key={i} type="application/ld+json">
              {jsonLd(s)}
            </script>
          ))
        : schema && (
            <script type="application/ld+json">{jsonLd(schema)}</script>
          )}
    </Helmet>
  );
}