#!/usr/bin/env node
/**
 * Generates public/sitemap.xml. Runs before `vite build`, so the file is picked
 * up by the normal public/ copy and lands in dist/.
 *
 * The source of truth is the <Seo path="..."> calls in src/pages. That is
 * deliberate: those calls already declare every public route and its canonical
 * URL, so deriving the sitemap from them makes the two impossible to
 * contradict. A separate hand-maintained route list would be a second place to
 * forget, and a sitemap listing a URL whose page declares a different canonical
 * is worse than no sitemap.
 *
 * Routes marked `noindex` (/auth, the 404) are excluded — telling a crawler to
 * index a URL in the sitemap while the page says noindex is a contradiction.
 *
 * As a backstop, every route in App.tsx that is NOT wrapped in ProtectedRoute is
 * checked against the result, and the build fails if one is missing. Adding a
 * public page without SEO tags is then a build error rather than a page that
 * silently never gets indexed.
 *
 * No <changefreq> or <priority>: Google ignores both. <lastmod> comes from the
 * page file's last commit date, because a build-time timestamp would claim every
 * page changed on every deploy, which is exactly the inaccuracy that makes
 * crawlers discount the field.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ORIGIN = 'https://fitmatepro.com';
const PAGES_DIR = 'src/pages';
const APP_FILE = 'src/App.tsx';
const OUT = 'public/sitemap.xml';

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

// --- 1. Collect public routes from <Seo> calls -----------------------------

const seoBlock = /<Seo\s+([^>]*?)\/>/gs;
const found = [];
const dynamicSkipped = [];

for (const file of walk(PAGES_DIR).filter((f) => f.endsWith('.tsx'))) {
  const source = readFileSync(file, 'utf8');
  for (const [, attrs] of source.matchAll(seoBlock)) {
    const noindex = /\bnoindex\b/.test(attrs);
    const literal = attrs.match(/\bpath="([^"]*)"/);

    if (!literal) {
      // A non-literal path (e.g. path={location.pathname}). Only tolerable on a
      // noindex page; anything else is a route we cannot resolve statically and
      // must not guess at.
      if (!noindex) {
        console.error(
          `[sitemap] ${file}: <Seo> has a non-literal path and is not noindex. ` +
            `Cannot determine its URL. Use a literal path or mark it noindex.`
        );
        process.exit(1);
      }
      dynamicSkipped.push(file);
      continue;
    }

    if (noindex) continue;
    found.push({ route: literal[1], file });
  }
}

// --- 2. Backstop: every public route in App.tsx must be covered ------------

const app = readFileSync(APP_FILE, 'utf8');
// Split on <Route so each fragment holds one route's path and element.
const routeFragments = app.split(/<Route\b/).slice(1);
const publicRoutes = [];

for (const fragment of routeFragments) {
  const pathMatch = fragment.match(/path="([^"]*)"/);
  if (!pathMatch) continue;
  const route = pathMatch[1];

  // Only the element for THIS route matters, so look at the text before the
  // next route's JSX ends. ProtectedRoute anywhere in it means gated.
  const element = fragment.slice(0, fragment.indexOf('</Route>') + 1 || undefined);
  if (/ProtectedRoute|PremiumRoute/.test(element)) continue;

  // Parameterised and catch-all routes have no single canonical URL.
  if (route.includes(':') || route.includes('*')) continue;

  publicRoutes.push(route);
}

const covered = new Set(found.map((f) => f.route));
// /auth is public but intentionally noindex, so it is expected to be absent.
// /features/ai-coaching and /features/community-features are noindex — pages
// built on fabricated testimonials and AI claims we no longer stand behind.
const expectedAbsent = new Set(['/auth', '/features/ai-coaching', '/features/community-features']);
const missing = publicRoutes.filter((r) => !covered.has(r) && !expectedAbsent.has(r));

if (missing.length) {
  console.error(
    `[sitemap] These public routes in ${APP_FILE} have no indexable <Seo> tag, ` +
      `so they would never be indexed:\n` +
      missing.map((r) => `  - ${r}`).join('\n') +
      `\nAdd a <Seo> to the page, or mark it noindex if that is intended.`
  );
  process.exit(1);
}

if (!found.length) {
  console.error('[sitemap] No indexable routes found. Refusing to write an empty sitemap.');
  process.exit(1);
}

// --- 3. lastmod from git, per page ----------------------------------------

function lastCommitDate(file) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
  } catch {
    // No git, or the file is untracked. Omit lastmod rather than invent one.
    return null;
  }
}

// --- 4. Write ------------------------------------------------------------

const entries = [...found]
  .sort((a, b) => a.route.localeCompare(b.route))
  .map(({ route, file }) => {
    const lastmod = lastCommitDate(file);
    return [
      '  <url>',
      `    <loc>${ORIGIN}${route}</loc>`,
      ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
      '  </url>',
    ].join('\n');
  });

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<!-- Generated by scripts/generate-sitemap.mjs during build. Do not edit. -->',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries,
  '</urlset>',
  '',
].join('\n');

writeFileSync(OUT, xml, 'utf8');

console.log(`[sitemap] wrote ${OUT} with ${found.length} URLs:`);
for (const { route } of [...found].sort((a, b) => a.route.localeCompare(b.route))) {
  console.log(`  ${ORIGIN}${route}`);
}
if (dynamicSkipped.length) {
  console.log(`[sitemap] skipped ${dynamicSkipped.length} noindex page(s) with dynamic paths`);
}
