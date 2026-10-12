import { defineConfig, loadEnv } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderBody, meta } from './src/render';

// The brand mark is inlined (not an <img>) so the scroll scenes can animate it.
const markSvg = readFileSync(resolve(__dirname, 'public/brand/mark.svg'), 'utf8')
  .replace('<svg ', '<svg class="mark" role="presentation" focusable="false" ');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [
      {
        name: 'trl8-static-render',
        transformIndexHtml: {
          order: 'pre',
          handler(html, ctx) {
            if (!ctx.filename.endsWith('index.html')) return html;
            return html
              .replace('<!--@body-->', renderBody({ markSvg, helpEmail: env.VITE_HELP_EMAIL ?? '' }))
              .replaceAll('%TRL8_TITLE%', meta.title)
              .replaceAll('%TRL8_DESC%', meta.description);
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
