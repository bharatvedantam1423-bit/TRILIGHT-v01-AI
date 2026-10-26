import { defineConfig, loadEnv } from 'vite';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderBody } from './src/render';
import { headTags, bodyStart, robotsTxt, sitemapXml, manifest, SITE_URL_DEFAULT } from './src/seo';

// The brand mark is inlined (not an <img>) so the scroll scenes can animate it.
const markSvg = readFileSync(resolve(__dirname, 'public/brand/mark.svg'), 'utf8')
  .replace('<svg ', '<svg class="mark" role="presentation" focusable="false" ');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // Canonical URL, share previews and the sitemap need the real public domain.
  // VITE_SITE_URL wins; otherwise the TRILIGHT domain (never a hosting
  // preview URL, which would split search ranking).
  const siteUrl = (env.VITE_SITE_URL || SITE_URL_DEFAULT).replace(/\/$/, '');
  const ids = { ga: env.VITE_GA_ID || undefined, gtm: env.VITE_GTM_ID || undefined };
  // Replit serves the dev preview and the published app through its own
  // proxy domains (*.replit.dev, *.replit.app, custom domains), so Vite's
  // host check is turned off, as in Replit's own Vite templates.
  return {
    appType: 'mpa', // one real page; unknown paths get a 404, not the home page
    server: { host: '0.0.0.0', allowedHosts: true },
    preview: { host: '0.0.0.0', allowedHosts: true },
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
        // When the built site is served with `vite preview` (Replit Autoscale),
        // unknown paths get the site's own 404 page.
        configurePreviewServer(server) {
          return () => {
            server.middlewares.use((req, res, next) => {
              const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
              const file = path.endsWith('/') ? `${path}index.html` : path;
              if (file.endsWith('.html') && existsSync(resolve(__dirname, 'dist', `.${file}`))) return next();
              res.statusCode = 404;
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(readFileSync(resolve(__dirname, 'dist/404.html')));
            });
          };
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
