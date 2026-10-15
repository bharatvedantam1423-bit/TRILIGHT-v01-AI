/**
 * Blueprint figures for the page, built once at build time (render.ts).
 *
 * Every stroked path gets pathLength="1" and a draw-order bucket (data-k,
 * 0–9, in painter's order), so the page can draw each figure in like a pen on
 * a blueprint: back to front, bottom to top, then the fills settle in and
 * hide the lines behind them. Without JavaScript, or with reduced motion,
 * the figures are simply drawn.
 */
import { loopCard } from './board';
import { stageFigure } from './ladder';
import { heroFigure } from './hero';
import { journeyFigure, forceFigure } from './journey';

const BUCKETS = 10;

export function drawable(svg: string) {
  const total = (svg.match(/<path class="iso-line/g) ?? []).length || 1;
  let i = 0;
  return svg.replace(/<path class="iso-line/g, () => {
    const kBucket = Math.min(BUCKETS - 1, Math.floor((i++ / total) * BUCKETS));
    return `<path pathLength="1" data-k="${kBucket}" class="iso-line`;
  });
}

export function loop(stage: 'sense' | 'decide' | 'act', label: string) {
  return drawable(loopCard(stage, label));
}

export function stage(id: string, label: string) {
  return drawable(stageFigure(id, label));
}

export function heroScene(label: string) {
  const f = heroFigure(label);
  return { ...f, svg: drawable(f.svg) };
}

export function journey(id: string, label: string) {
  return drawable(journeyFigure(id, label));
}

export function force(id: string, label: string) {
  return drawable(forceFigure(id, label));
}
