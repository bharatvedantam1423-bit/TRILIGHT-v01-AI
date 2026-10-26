import { defineConfig, loadEnv } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderBody } from './src/render';
import { headTags, bodyStart, robotsTxt, sitemapXml, manifest, SITE_URL_DEFAULT } from './src/seo';

// The brand mark is inlined (not an <img>) so the scroll scenes can animate it.
const markSvg = readFileSync(resolve(__dirname, 'public/brand/mark.svg'), 'utf8')
  .replace('<svg ', '<svg class="mark" role="presentation" focusable="false" ');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // Canonical URL, share previews and the sitemap need the real public domain.
  // VITE_SITE_URL wins; otherwise the TRILIGHT domain (never a *.vercel.app URL,
  // which would split search ranking).
  const siteUrl = (env.VITE_SITE_URL || SITE_URL_DEFAULT).replace(/\/$/, '');
  const ids = { ga: env.VITE_GA_ID || undefined, gtm: env.VITE_GTM_ID || undefined };
  return {
    plugins: [
      {
        name: 'trl8-static-render',
        transformIndexHtml: {
          order: 'pre',
          handler(html, ctx) {
            if (!ctx.filename.endsWith('index.html')) return html;
            return html
              .replace('<!--@head-->', headTags(siteUrl, ids))
              .replace('<!--@bodystart-->', bodyStart(ids))
              .replace('<!--@body-->', renderBody({ markSvg }));
          },
        },
        // robots.txt, sitemap.xml and the web manifest are generated, so the
        // domain and dates are always right.
        generateBundle() {
          const today = new Date().toISOString().slice(0, 10);
          this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(siteUrl) });
          this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(siteUrl, today) });
          this.emitFile({ type: 'asset', fileName: 'site.webmanifest', source: manifest() });
        },
      },
    ],
    build: {
      target: 'es2019',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
      },
    },
  };
});
