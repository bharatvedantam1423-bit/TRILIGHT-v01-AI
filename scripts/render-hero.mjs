/**
 * Prerenders the hero's static board into images, so the page scrolls and
 * zooms a picture instead of re-rasterising ~3,000 SVG paths every frame.
 *
 *   node scripts/render-hero.mjs
 *
 * Writes public/img/hero/base(-sm).webp (the board and the parts behind the
 * socket) and public/img/hero/front(-sm).webp (the low parts in front of it,
 * transparent). Re-run after changing src/blueprint/hero.ts or the palette.
 * Needs Playwright with Chromium and Python 3 with Pillow (for WebP).
 */
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(process.env.PLAYWRIGHT_FROM ?? import.meta.url);
const { chromium } = require('playwright');

const tmp = mkdtempSync(join(tmpdir(), 'hero-'));
await build({ entryPoints: [join(ROOT, 'src/blueprint/index.ts')], bundle: true, format: 'esm', platform: 'node', outfile: join(tmp, 'bp.mjs'), logLevel: 'warning' });
const { heroScene } = await import(join(tmp, 'bp.mjs'));
const { base, front } = heroScene();
const css = readFileSync(join(ROOT, 'src/blueprint/blueprint.css'), 'utf8');

// The board sits behind the copy, so it is drawn quieter than other figures.
const DIM = `.bp-svg{--bp-hi:#a9d4e8;--bp-mid:#4f8fb0;--bp-lo:#2c6084;--bp-faint:#183d58;--bp-dot:#8cc3dd;--bp-lit:#2bb8b6;--bp-w:.8}`;

const browser = await chromium.launch();
for (const [name, svg, opaque] of [['base', base, true], ['front', front, false]]) {
  for (const [suffix, width] of [['', 2600], ['-sm', 1300]]) {
    const page = await browser.newPage({ viewport: { width, height: Math.round(width * 0.78) } });
    await page.setContent(`<!doctype html><style>${css}${DIM}html,body{margin:0;background:${opaque ? '#030c16' : 'transparent'}}svg{width:${width}px;height:auto}</style>${svg}`);
    const png = join(tmp, `${name}${suffix}.png`);
    await page.screenshot({ path: png, omitBackground: !opaque, clip: { x: 0, y: 0, width, height: Math.round(width * 0.78) } });
    const out = join(ROOT, 'public/img/hero', `${name}${suffix}.webp`);
    execFileSync('python3', ['-c', `from PIL import Image; Image.open(${JSON.stringify(png)}).save(${JSON.stringify(out)}, 'WEBP', quality=${opaque ? 82 : 88}, method=6)`]);
    console.log('wrote', out);
    await page.close();
  }
}
await browser.close();
writeFileSync(join(tmp, 'done'), '');
