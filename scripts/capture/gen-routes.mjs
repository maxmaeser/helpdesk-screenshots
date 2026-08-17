#!/usr/bin/env node
/**
 * fsai-capture / gen-routes.mjs
 *
 * Regenerates routes.brand.json from the live fsai-codebase source of truth:
 *   apps/brand-dashboard/src/utils/routes.ts (the flat `routes` const).
 *
 * Fetches via `gh api` (no clone, no npm deps) and re-derives the same shape
 * gen-routes originally produced. Run this whenever the brand-dashboard route
 * table changes.
 *
 *   node gen-routes.mjs
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO = 'franchiseai/fsai';
const SRC_PATH = 'apps/brand-dashboard/src/utils/routes.ts';
const OUT_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'routes.brand.json'
);

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
}

function fetchSource() {
  const b64 = gh([
    'api',
    `repos/${REPO}/contents/${SRC_PATH}`,
    '--jq',
    '.content',
  ]);
  return Buffer.from(b64, 'base64').toString('utf8');
}

function fetchSha() {
  return gh([
    'api',
    `repos/${REPO}/commits?path=${SRC_PATH}&per_page=1`,
    '--jq',
    '.[0].sha',
  ]).trim();
}

function parseRoutes(source) {
  const start = source.indexOf('const routes = {');
  const end = source.indexOf('} as const;', start);
  if (start === -1 || end === -1) {
    throw new Error('could not locate `const routes = { ... } as const;` block');
  }
  const block = source.slice(start, end);

  const out = {};
  // \s* between the colon and the opening quote also matches newlines, which
  // is what lets this pick up the two entries whose value wraps a line.
  const re = /([A-Z0-9_]+):\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(block))) {
    const [, name, routePath] = m;
    const params = [...routePath.matchAll(/:([A-Za-z0-9]+)/g)].map((p) => p[1]);
    out[name] = { path: routePath, params, static: params.length === 0 };
  }
  return out;
}

const source = fetchSource();
const sha = fetchSha();
const routes = parseRoutes(source);

const doc = {
  _meta: {
    source: { repo: REPO, path: SRC_PATH },
    sourceCommitSha: sha,
    fetchedAt: new Date().toISOString().slice(0, 10),
  },
  ...routes,
};

writeFileSync(OUT_FILE, JSON.stringify(doc, null, 2) + '\n');

const total = Object.keys(routes).length;
const staticCount = Object.values(routes).filter((r) => r.static).length;
console.log(
  `${total} routes (${staticCount} static, ${total - staticCount} parameterized) -> ${OUT_FILE}`
);
