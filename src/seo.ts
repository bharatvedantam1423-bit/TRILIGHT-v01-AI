/**
 * Search and sharing: everything that goes in <head> besides styles and
 * scripts, plus robots.txt and sitemap.xml. Built at build time by
 * vite.config.ts; nothing here runs in the browser.
 *
 * Facts in the description and structured data come from content.ts and
 * docs/TRL8-program.md. Change SITE_URL (or VITE_SITE_URL) if the domain moves.
 */
import { faq } from './content';

export const SITE_URL_DEFAULT = 'https://www.trilight.niatindia.com';
/** NIAT's Google Tag Manager container. VITE_GTM_ID overrides it. */
export const GTM_ID_DEFAULT = 'GTM-PF5GKBN9';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const seo = {
  title: 'TRILIGHT by NIAT | Turn Your Hardware Ideas Into Real-world Products',
  description:
    'TRILIGHT is NIAT’s funded journey for students to take a hardware, robotics or Physical AI idea from concept to a real product. Grants up to ₹5 Lakh per team.',
  ogImageAlt: 'Trilight: Turn Your Hardware Ideas Into Real-world Products. Up to ₹5 Lakh grant per team, ₹3 Cr grant pool, 8 stages, Demo Day April 2027.',
  /** Bump ?v= when og.jpg changes, so LinkedIn, WhatsApp and X fetch the new image. */
  ogImage: '/og.jpg?v=2',
  keywords: 'TRILIGHT, NIAT, hardware program, Physical AI, robotics, IoT, student grant, Technology Readiness Level, TRL, prototype, NxtWave',
};

/** Structured data: who runs it, the program itself, and the FAQ. */
function jsonLd(url: string) {
  const org = {
    '@type': 'Organization',
    '@id': 'https://www.niatindia.com/#org',
    name: 'NIAT',
    alternateName: 'NxtWave Institute of Advanced Technologies',
    url: 'https://www.niatindia.com/',
  };
  const graph = [
    org,
    {
      '@type': 'WebSite',
      '@id': `${url}/#website`,
      url: `${url}/`,
      name: 'TRILIGHT',
      inLanguage: 'en-IN',
      publisher: { '@id': org['@id'] },
    },
    {
      '@type': 'WebPage',
      '@id': `${url}/#webpage`,
      url: `${url}/`,
      name: seo.title,
      description: seo.description,
      isPartOf: { '@id': `${url}/#website` },
      primaryImageOfPage: `${url}/og.jpg`,
      inLanguage: 'en-IN',
    },
    {
      '@type': 'EducationalOccupationalProgram',
      '@id': `${url}/#program`,
      name: 'TRILIGHT',
      description: seo.description,
      url: `${url}/`,
      provider: { '@id': org['@id'] },
      educationalProgramMode: 'blended',
      timeToComplete: 'P2Y',
      numberOfCredits: 0,
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'INR', category: 'Free' },
      occupationalCategory: 'Hardware and embedded systems engineering',
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}/#faq`,
      mainEntity: faq.items.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];
  // </script> can't appear inside the JSON.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

/** The <head> tags. GA4 / GTM are added only when their IDs are set. */
export function headTags(url: string, ids: { ga?: string; gtm?: string }) {
  const tags = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}">`,
    `<meta name="keywords" content="${esc(seo.keywords)}">`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">`,
    `<link rel="canonical" href="${url}/">`,
    `<meta name="author" content="NIAT">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="TRILIGHT">`,
    `<meta property="og:locale" content="en_IN">`,
    `<meta property="og:title" content="${esc(seo.title)}">`,
    `<meta property="og:description" content="${esc(seo.description)}">`,
    `<meta property="og:url" content="${url}/">`,
    `<meta property="og:image" content="${url}${seo.ogImage}">`,
    `<meta property="og:image:type" content="image/jpeg">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(seo.ogImageAlt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(seo.title)}">`,
    `<meta name="twitter:description" content="${esc(seo.description)}">`,
    `<meta name="twitter:image" content="${url}${seo.ogImage}">`,
    `<meta name="twitter:image:alt" content="${esc(seo.ogImageAlt)}">`,
    `<link rel="manifest" href="/site.webmanifest">`,
    `<script type="application/ld+json">${jsonLd(url)}</script>`,
  ];
  if (ids.gtm) {
    tags.push(`<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${esc(ids.gtm)}');</script>`);
  }
  if (ids.ga) {
    tags.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(ids.ga)}"></script>`);
    tags.push(`<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(ids.ga)}');</script>`);
  }
  return tags.join('\n  ');
}

/** GTM's no-JS fallback, right after <body>. */
export function bodyStart(ids: { gtm?: string }) {
  return ids.gtm
    ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${esc(ids.gtm)}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`
    : '';
}

export function robotsTxt(url: string) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`;
}

export function sitemapXml(url: string, lastmod: string) {
  const pages = [
    { loc: `${url}/`, priority: '1.0', freq: 'weekly' },
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages
  .map(
    (p, i) => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>${i === 0 ? `\n    <image:image><image:loc>${url}/og.jpg</image:loc></image:image>` : ''}
  </url>`,
  )
  .join('\n')}
</urlset>
`;
}

export function manifest() {
  return JSON.stringify(
    {
      name: 'TRILIGHT by NIAT',
      short_name: 'TRILIGHT',
      description: seo.description,
      start_url: '/',
      display: 'standalone',
      background_color: '#030c16',
      theme_color: '#030c16',
      icons: [
        { src: '/brand/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  );
}
