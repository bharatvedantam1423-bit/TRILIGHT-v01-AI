import { defineConfig, loadEnv } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderBody, meta } from './src/render';

// The brand mark is inlined (not an <img>) so the scroll scenes can animate it.
const markSvg = readFileSync(resolve(__dirname, 'public/brand/mark.svg'), 'utf8')
  .replace('<svg ', '<svg class="mark" role="presentation" focusable="false" ');
// The footer's oversized wordmark is inlined so CSS can set its colour.
const wordmarkSvg = readFileSync(resolve(__dirname, 'public/brand/wordmark-light.svg'), 'utf8')
  .replace(/<\?xml[^>]*>/, '')
  .replace('<svg ', '<svg class="wordmark" focusable="false" ');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // Share previews (WhatsApp, LinkedIn, X) need an absolute image URL.
  // VITE_SITE_URL wins; on Vercel the production domain is used automatically.
  const siteUrl = (
    env.VITE_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
  ).replace(/\/$/, '');
  return {
    plugins: [
      {
        name: 'trl8-static-render',
        transformIndexHtml: {
          order: 'pre',
          handler(html, ctx) {
            if (!ctx.filename.endsWith('index.html')) return html;
            return html
              .replace('<!--@body-->', renderBody({ markSvg, wordmarkSvg }))
              .replaceAll('%TRL8_TITLE%', meta.title)
              .replaceAll('%TRL8_DESC%', meta.description)
              .replaceAll('%TRL8_OG_IMAGE%', `${siteUrl}/og.jpg`)
              .replaceAll('%TRL8_URL%', `${siteUrl}/`);
          },
        },
      },
    ],
    build: {
      target: 'es2019',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          registered: resolve(__dirname, 'registered.html'),
        },
      },
    },
  };
});
