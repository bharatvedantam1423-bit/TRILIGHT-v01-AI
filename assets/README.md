# Source images

Full-size originals, kept for re-exporting. They are **not** served; the site
uses the optimised WebP copies in `public/img/`.

| Original | Served as |
|---|---|
| `originals/ladder/01-explorer-…png` … `08-trl8-…png` | `public/img/ladder/<stage>.webp` (1200 px wide) |
| `originals/loop/01-sense-ceiling-smoke-detector.webp` … `03-act-sprinkler-and-call.webp` | `public/img/loop/<step>.webp` (1254 px square; the line-art overlays in `src/blueprint/overlays.ts` are placed on these exact pictures) |

To replace one, put the new original here and export a WebP to the matching
`public/img/` path (same file name). See `docs/image-prompts.md` for the prompts.
