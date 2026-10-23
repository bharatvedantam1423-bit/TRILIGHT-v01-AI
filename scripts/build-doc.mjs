/**
 * Builds public/program.html, the "Get Full Details" page, from
 * docs/TRL8-program.md, so the page and the document never drift apart.
 * Runs before every build (package.json "prebuild"/"predev").
 *   node scripts/build-doc.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const md = readFileSync(join(ROOT, 'docs/TRL8-program.md'), 'utf8')
  // The repo-only note under the title block isn't for readers of the page.
  .replace(/^> Reference copy of the program document[\s\S]*?\n\n/m, '');
const body = marked.parse(md, { gfm: true });

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TRL8 · The Trilight Program, in full</title>
<meta name="description" content="The full TRL8 (Trilight) program document: stages, gates, grants, GRIT Miles, safety, FAQs, glossary and case studies.">
<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..600&family=JetBrains+Mono:wght@400&display=swap">
<style>
:root{--bg:#f7f7f4;--card:#eeeee9;--ink:#0c1720;--ink2:#3d4a54;--muted:#879097;--line:rgba(12,23,32,.12);--teal:#007a78;color-scheme:light}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink2);font:16px/1.7 'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
header{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px max(20px,calc((100vw - 860px)/2));background:rgba(252,252,250,.88);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
header img{width:112px;display:block}
header nav{display:flex;gap:8px}
.b{display:inline-flex;align-items:center;height:36px;font:500 14px/1 'Inter',sans-serif;color:var(--ink);text-decoration:none;border:1px solid rgba(12,23,32,.22);padding:0 12px;background:none;cursor:pointer}
.b:hover{border-color:var(--ink)}
.b--ink{background:var(--ink);color:#f7f7f4;border-color:var(--ink)}
.b--ink:hover{background:#1d2b36}
main{max-width:860px;margin:0 auto;padding:56px 20px 96px}
h1,h2,h3{font-family:'Inter',sans-serif;font-weight:500;color:var(--ink);letter-spacing:-.022em;line-height:1.12;text-wrap:balance}
h1{font-size:clamp(2.2rem,4.4vw,3.2rem);margin:0 0 14px}
h2{font-size:1.75rem;margin:64px 0 16px;padding-top:28px;border-top:1px solid var(--line)}
h3{font-size:1.2rem;margin:36px 0 10px}
p,li{text-wrap:pretty}
a{color:var(--teal)}
strong{color:var(--ink);font-weight:600}
table{width:100%;border-collapse:collapse;margin:18px 0;font-size:14.5px;display:block;overflow-x:auto}
th,td{text-align:left;vertical-align:top;padding:10px 12px;border-bottom:1px solid var(--line)}
th{font:400 11px 'JetBrains Mono',monospace;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}
blockquote{margin:22px 0;padding:16px 20px;background:var(--card);border-left:2px solid #00b6b4;color:var(--ink2)}
blockquote p{margin:.3em 0}
pre{background:var(--card);padding:16px;overflow-x:auto;border:1px solid var(--line);font:13px 'JetBrains Mono',monospace}
hr{display:none}
::selection{background:#8fe3e0}
@media print{header{display:none}body{background:#fff;color:#222}h1,h2,h3,strong{color:#000}th,td{border-color:#ccc}blockquote,pre{background:#f4f6f8}a{color:#0b5ca9}}
</style>
</head>
<body>
<header>
  <a href="/"><img src="/brand/wordmark-dark.svg" alt="Trilight, back to the site" width="112" height="25"></a>
  <nav><button class="b" onclick="window.print()">Download PDF</button><a class="b b--ink" href="/#register">Join the Program</a></nav>
</header>
<main>
${body}
</main>
</body>
</html>
`;
writeFileSync(join(ROOT, 'public/program.html'), html);
console.log('wrote public/program.html');
