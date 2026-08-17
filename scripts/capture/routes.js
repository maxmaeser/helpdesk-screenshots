/**
 * fsai-capture / routes.js (Phase 2)
 *
 * Canonical brand-dashboard URL map, generated from fsai-codebase
 * apps/brand-dashboard/src/utils/routes.ts (see gen-routes.mjs). Removes the
 * need for a capture agent to click-hunt for a page: resolve a route name to
 * an absolute staging URL instead.
 *
 *   const { resolve } = require('.../capture/routes.js');
 *   const { baseUrlFor } = require('.../capture/session.js');
 *   const url = resolve('SALES', {}, baseUrlFor('brand'));
 *   await page.goto(url);
 *
 * CLI:
 *   node routes.js list [--static]
 *   node routes.js resolve <NAME> [key=value ...]
 */

const fs = require('fs');
const path = require('path');
const { baseUrlFor } = require('./session.js');

const MAP_FILE = path.join(__dirname, 'routes.brand.json');
const MAP = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));

/** Route names, optionally filtered to the directly-shootable (no :params) ones. */
function list({ staticOnly = false } = {}) {
  return Object.keys(MAP)
    .filter((k) => k !== '_meta')
    .filter((k) => !staticOnly || MAP[k].static);
}

/**
 * Resolve a route name + params to an absolute staging URL.
 * `base` defaults to session.js's brand-dashboard base URL; pass one
 * explicitly to avoid a repeat env read in a tight loop.
 */
function resolve(name, params = {}, base = baseUrlFor('brand')) {
  const entry = MAP[name];
  if (!entry) {
    throw new Error(`unknown route "${name}" (see routes.js list())`);
  }
  let p = entry.path;
  for (const key of entry.params) {
    if (params[key] == null) {
      throw new Error(`resolve("${name}"): missing required param "${key}"`);
    }
    p = p.replace(`:${key}`, encodeURIComponent(params[key]));
  }
  return base.replace(/\/$/, '') + p;
}

module.exports = { resolve, list, MAP };

if (require.main === module) {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === 'list') {
    const staticOnly = rest.includes('--static');
    console.log(list({ staticOnly }).join('\n'));
  } else if (cmd === 'resolve') {
    const [name, ...pairs] = rest;
    const params = Object.fromEntries(pairs.map((p) => p.split('=')));
    console.log(resolve(name, params));
  } else {
    console.log('usage: node routes.js list [--static] | resolve <NAME> [key=value ...]');
    process.exitCode = 1;
  }
}
