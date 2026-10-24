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
<title>TRILIGHT · The Program, in full</title>
<meta name="description" content="The full TRILIGHT program document: stages, gates, grants, GRIT Miles, safety, FAQs, glossary and case studies.">
<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600&family=Raleway:wght@400;500&display=swap">
<style>
:root{--bg:#030c16;--card:#06121f;--ink:#eef5f8;--ink2:#c3ced5;--muted:#8b9aa5;--line:rgba(205,225,235,.12);--teal:#33dcd9;color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink2);font:16px/1.7 Raleway,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
header{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px max(20px,calc((100vw - 860px)/2));background:rgba(3,12,22,.88);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
header img{width:116px;display:block}
header nav{display:flex;gap:10px}
.b{font:600 12px/1 Inter,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--teal);text-decoration:none;border:1px solid rgba(51,220,217,.5);padding:11px 14px;background:none;cursor:pointer}
.b:hover{background:var(--teal);color:#011213}
main{max-width:860px;margin:0 auto;padding:48px 20px 96px}
h1,h2,h3{font-family:Inter,sans-serif;color:var(--ink);letter-spacing:-.02em;line-height:1.15}
h1{font-size:clamp(2rem,4vw,2.8rem);margin:0 0 12px}
h2{font-size:1.6rem;margin:64px 0 16px;padding-top:24px;border-top:1px solid var(--line)}
h3{font-size:1.15rem;margin:36px 0 10px}
a{color:var(--teal)}
strong{color:var(--ink);font-weight:600}
table{width:100%;border-collapse:collapse;margin:18px 0;font-size:14.5px;display:block;overflow-x:auto}
th,td{text-align:left;vertical-align:top;padding:10px 12px;border-bottom:1px solid var(--line)}
th{font:600 12px Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
blockquote{margin:22px 0;padding:16px 20px;background:var(--card);border-left:2px solid var(--teal);color:var(--ink2)}
blockquote p{margin:.3em 0}
pre{background:var(--card);padding:16px;overflow-x:auto;border:1px solid var(--line);font-size:13px}
hr{display:none}
@media print{header{display:none}body{background:#fff;color:#222}h1,h2,h3,strong{color:#000}th,td{border-color:#ccc}blockquote,pre{background:#f4f6f8}a{color:#0b5ca9}}
</style>
</head>
<body>
<header>
  <a href="/"><img src="/brand/wordmark-light.svg" alt="Trilight, back to the site" width="116" height="26"></a>
  <nav><button class="b" onclick="window.print()">Download PDF</button><a class="b" href="/#register">Join the Program</a></nav>
</header>
<main>
${body}
</main>
</body>
</html>
`;
writeFileSync(join(ROOT, 'public/program.html'), html);
console.log('wrote public/program.html');
