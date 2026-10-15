/**
 * Blueprint figures for the page, built once at build time (render.ts).
 *
 * Every stroked path gets pathLength="1" and a draw-order bucket (data-k,
 * 0–9, in painter's order), so the page can draw each figure in like a pen on
 * a blueprint: back to front, bottom to top, then the fills settle in and
 * hide the lines behind them. Without JavaScript, or with reduced motion,
 * the figures are simply drawn.
 */
import { coreFigure } from './core';
import { boardFigure } from './board';
import { stageFigure } from './ladder';

const BUCKETS = 10;

export function drawable(svg: string) {
  const total = (svg.match(/<path class="iso-line/g) ?? []).length || 1;
  let i = 0;
  return svg.replace(/<path class="iso-line/g, () => {
    const kBucket = Math.min(BUCKETS - 1, Math.floor((i++ / total) * BUCKETS));
    return `<path pathLength="1" data-k="${kBucket}" class="iso-line`;
  });
}

export function core(label: string) {
  const f = coreFigure(label);
  return { ...f, svg: drawable(f.svg) };
}

export function board(label: string) {
  const f = boardFigure(label);
  return { ...f, svg: drawable(f.svg) };
}

export function stage(id: string, label: string) {
  return drawable(stageFigure(id, label));
}
