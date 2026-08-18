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
 * Also carries the franchisee/applicant-portal map (routes.portal.json, see
 * gen-routes-portal.mjs), via a parallel `resolvePortal`/`listPortal` pair.
 * This does NOT change `resolve`/`list`/`MAP` (brand) in any way.
 *
 *   const { resolvePortal } = require('.../capture/routes.js');
 *   const url = resolvePortal('MY_LOCATIONS');
 *
 * CLI:
 *   node routes.js list [--static] [--portal]
 *   node routes.js resolve <NAME> [--portal] [key=value ...]
 */

const fs = require('fs');
const path = require('path');
const { baseUrlFor } = require('./session.js');

const MAP_FILE = path.join(__dirname, 'routes.brand.json');
const MAP = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));

const PORTAL_MAP_FILE = path.join(__dirname, 'routes.portal.json');
const PORTAL_MAP = JSON.parse(fs.readFileSync(PORTAL_MAP_FILE, 'utf8'));

function listFrom(map, { staticOnly = false } = {}) {
  return Object.keys(map)
    .filter((k) => k !== '_meta')
    .filter((k) => !staticOnly || map[k].static);
}

function resolveFrom(map, name, params, base) {
  const entry = map[name];
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

/** Route names, optionally filtered to the directly-shootable (no :params) ones. */
function list(opts = {}) {
  return listFrom(MAP, opts);
}

/**
 * Resolve a route name + params to an absolute staging URL.
 * `base` defaults to session.js's brand-dashboard base URL; pass one
 * explicitly to avoid a repeat env read in a tight loop.
 */
function resolve(name, params = {}, base = baseUrlFor('brand')) {
  return resolveFrom(MAP, name, params, base);
}

/** Same as `list`, against the franchisee/applicant-portal route map. */
function listPortal(opts = {}) {
  return listFrom(PORTAL_MAP, opts);
}

/** Same as `resolve`, against the franchisee/applicant-portal route map. */
function resolvePortal(name, params = {}, base = baseUrlFor('portal')) {
  return resolveFrom(PORTAL_MAP, name, params, base);
}

module.exports = { resolve, list, MAP, resolvePortal, listPortal, PORTAL_MAP };

if (require.main === module) {
  const [cmd, ...rest] = process.argv.slice(2);
  const portal = rest.includes('--portal');
  const rest2 = rest.filter((r) => r !== '--portal');
  if (cmd === 'list') {
    const staticOnly = rest2.includes('--static');
    console.log((portal ? listPortal : list)({ staticOnly }).join('\n'));
  } else if (cmd === 'resolve') {
    const [name, ...pairs] = rest2;
    const params = Object.fromEntries(pairs.map((p) => p.split('=')));
    console.log((portal ? resolvePortal : resolve)(name, params));
  } else {
    console.log(
      'usage: node routes.js list [--static] [--portal] | resolve <NAME> [--portal] [key=value ...]'
    );
    process.exitCode = 1;
  }
}
