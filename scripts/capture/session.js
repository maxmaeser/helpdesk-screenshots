/**
 * fsai-capture / session.js
 *
 * Persisted authenticated Playwright sessions for FSAI staging capture.
 *
 * Replaces the "log in again in every throwaway script" pattern with one
 * storageState JSON file per surface, refreshed on demand.
 *
 *   const { getContext, closeAll } = require('.../capture/session.js');
 *   const { browser, ctx, page } = await getContext('brand');
 *   await page.goto('https://staging.app.franchisesystems.ai/sales?app=<uuid>');
 *   ...
 *   await closeAll();
 *
 * CLI:
 *   node session.js verify  brand|portal   # is the stored state still good?
 *   node session.js refresh brand|portal   # log in and (re)write the state file
 *   node session.js info    brand|portal   # cookies/localStorage + expiry summary
 *
 * Auth contract (code-verified against fsai-codebase origin/master, 2026-08-14):
 *   brand  = brand-dashboard. useCookieAuth=true. Auth is ONE HttpOnly cookie
 *            `staging.fsai.session_token` (prod: `fsai.session_token`), a 7-day
 *            server-side DB session. Playwright storageState DOES persist
 *            HttpOnly cookies, so the state file is a complete portable session.
 *            NEVER set X-Brand-Id: validateAuth.ts 401s agent sessions that
 *            send it ("unexpected brand header").
 *   portal = applicant/franchisee portal. useCookieAuth=false. Auth is a
 *            localStorage bearer token `fsai.session_token` on the portal origin.
 *
 * There is no refresh-token flow. Sessions are server-side rows valid 7 days.
 * "Refresh" means "log in again", which is what this file does.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

// Playwright lives in the dev-browser sandbox; there is no local node_modules.
const PLAYWRIGHT_PATH = '/home/max/.dev-browser/node_modules/playwright';
const { chromium } = require(PLAYWRIGHT_PATH);

const CONFIG_DIR = path.join(os.homedir(), '.config', 'fsai-capture');
const ENV_FILE = path.join(CONFIG_DIR, 'login.env');
const META_FILE = path.join(CONFIG_DIR, 'state.meta.json');

/** Helpdesk raws must be 2x. dev-browser is hardcoded 1x — that is why we
 *  launch Playwright directly instead of going through it. */
const DEFAULT_VIEWPORT = { width: 1680, height: 1050 };
const DEFAULT_SCALE = 2;

const SURFACES = {
  brand: {
    urlEnv: 'FSAI_BRAND_DASHBOARD_URL',
    emailEnv: 'FSAI_CLAUDE_EMAIL',
    passwordEnv: 'FSAI_CLAUDE_PASSWORD',
    statePath: path.join(CONFIG_DIR, 'storageState.brand-dashboard.json'),
    loginPath: '/login',
    // Do NOT use "Welcome Back" as a signed-out marker: the authenticated
    // dashboard home greets you with "Welcome Back, <name>". The login card is
    // the only place a password field exists.
    signedOut: ['input[type="password"]'],
    signedIn: ['nav', 'text=Marketing', 'text=Sales'],
    cookieName: 'staging.fsai.session_token',
    login: async (page, baseUrl, email, password) => {
      await page.goto(new URL('/login', baseUrl).href, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(3000);
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      // react-hook-form needs blur/change to settle before the submit enables.
      await page.waitForTimeout(400);
      await page.click('button[type="submit"]');
      // Wait for the URL to leave /login (up to 30s).
      for (let i = 0; i < 30; i++) {
        await page.waitForTimeout(1000);
        if (!/\/login/.test(page.url())) return;
      }
      throw new Error(
        `login: still on ${page.url()} after 30s. 2FA? bad creds? Check ` +
          'for a /login/verify redirect, which needs a human.'
      );
    },
  },
  portal: {
    urlEnv: 'FSAI_FRANCHISEE_PORTAL_URL',
    emailEnv: 'FSAI_FRANCHISEE_EMAIL',
    passwordEnv: 'FSAI_FRANCHISEE_PASSWORD',
    statePath: path.join(CONFIG_DIR, 'storageState.portal.json'),
    loginPath: '/',
    signedOut: ['text=Email address'],
    signedIn: ['nav'],
    localStorageKey: 'fsai.session_token',
    login: async (page, baseUrl, email, password) => {
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      await page.getByPlaceholder('Email address').fill(email);
      await page.locator('input[type="password"]').fill(password);
      await page.waitForTimeout(400);
      await page.getByRole('button', { name: /login/i }).click();
      await page.waitForTimeout(6000);
    },
  },
};

/** login.env values are single-quoted. Strip the quotes or react-hook-form
 *  silently rejects the email and the submit never fires. */
function loadEnv(file = ENV_FILE) {
  const out = {};
  if (!fs.existsSync(file)) throw new Error(`missing creds file: ${file}`);
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return out;
}

function surfaceConf(surface) {
  const conf = SURFACES[surface];
  if (!conf) {
    throw new Error(
      `unknown surface "${surface}" (have: ${Object.keys(SURFACES).join(', ')})`
    );
  }
  return conf;
}

function baseUrlFor(surface, env = loadEnv()) {
  return env[surfaceConf(surface).urlEnv].replace(/\/$/, '');
}

function readMeta() {
  try {
    return JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeMeta(surface, patch) {
  const meta = readMeta();
  meta[surface] = { ...(meta[surface] || {}), ...patch };
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
  fs.chmodSync(META_FILE, 0o600);
}

/** Summarise a state file without printing secrets. */
function describeState(surface) {
  const conf = surfaceConf(surface);
  if (!fs.existsSync(conf.statePath)) {
    return { exists: false, path: conf.statePath };
  }
  const state = JSON.parse(fs.readFileSync(conf.statePath, 'utf8'));
  const cookies = state.cookies || [];
  const target = cookies.find((c) => c.name === conf.cookieName);
  return {
    exists: true,
    path: conf.statePath,
    cookieCount: cookies.length,
    localStorageOrigins: (state.origins || []).map((o) => o.origin),
    sessionCookie: target
      ? {
          name: target.name,
          domain: target.domain,
          path: target.path,
          httpOnly: target.httpOnly,
          secure: target.secure,
          sameSite: target.sameSite,
          expires: target.expires,
          expiresISO:
            target.expires > 0
              ? new Date(target.expires * 1000).toISOString()
              : 'session',
        }
      : null,
    meta: readMeta()[surface] || null,
  };
}

const OPEN = [];

async function launch({ headless = true, slowMo = 0, channel } = {}) {
  const browser = await chromium.launch({
    headless,
    slowMo,
    ...(channel ? { channel } : {}),
  });
  OPEN.push(browser);
  return browser;
}

async function newContext(browser, { storageState, viewport, scale } = {}) {
  const ctx = await browser.newContext({
    viewport: viewport || DEFAULT_VIEWPORT,
    deviceScaleFactor: scale || DEFAULT_SCALE,
    ...(storageState ? { storageState } : {}),
  });
  // Focus rings do not survive navigation, so re-kill them on every load.
  await ctx.addInitScript(() => {
    const inject = () => {
      if (document.getElementById('__fsai_capture_style')) return;
      const s = document.createElement('style');
      s.id = '__fsai_capture_style';
      s.textContent = '* { outline: none !important; }';
      document.head && document.head.appendChild(s);
    };
    document.addEventListener('DOMContentLoaded', inject);
    inject();
  });
  return ctx;
}

/** True if the page looks signed in (app shell present, no login card). */
async function isSignedIn(page, surface) {
  const conf = surfaceConf(surface);
  for (const sel of conf.signedOut) {
    if ((await page.locator(sel).count()) > 0) return false;
  }
  if (/\/login|\/signin/.test(page.url())) return false;
  for (const sel of conf.signedIn) {
    if ((await page.locator(sel).count()) > 0) return true;
  }
  return false;
}

/**
 * Log in with a real browser form submit and persist storageState.
 * Returns the describeState() summary.
 */
async function refresh(surface, { headless = true } = {}) {
  const conf = surfaceConf(surface);
  const env = loadEnv();
  const baseUrl = baseUrlFor(surface, env);
  const email = env[conf.emailEnv];
  const password = env[conf.passwordEnv];
  if (!email || !password) {
    throw new Error(`missing ${conf.emailEnv}/${conf.passwordEnv} in login.env`);
  }

  const browser = await launch({ headless });
  const ctx = await newContext(browser);
  const page = await ctx.newPage();
  try {
    await conf.login(page, baseUrl, email, password);
    await page.waitForTimeout(4000);
    await ctx.storageState({ path: conf.statePath });
    fs.chmodSync(conf.statePath, 0o600);
    writeMeta(surface, {
      capturedAt: new Date().toISOString(),
      landedUrl: page.url(),
      note: 'server-side session, 7-day validity for agent sessions',
    });
    return describeState(surface);
  } finally {
    await ctx.close();
    await browser.close();
    OPEN.splice(OPEN.indexOf(browser), 1);
  }
}

/**
 * Open a fresh context from the stored state. Verifies auth cheaply and
 * self-heals by logging in once if the state is missing/stale.
 *
 * Returns { browser, ctx, page, baseUrl, refreshed }.
 */
async function getContext(surface, opts = {}) {
  const {
    headless = true,
    slowMo = 0,
    channel,
    viewport,
    scale,
    verify = true,
    allowRefresh = true,
    responseLog = null, // pass an array to collect {url,status,method}
  } = opts;
  const conf = surfaceConf(surface);
  const baseUrl = baseUrlFor(surface);

  if (!fs.existsSync(conf.statePath)) {
    if (!allowRefresh) {
      throw new Error(`no stored state at ${conf.statePath}; run: refresh ${surface}`);
    }
    await refresh(surface, { headless });
  }

  let refreshed = false;
  for (let attempt = 0; attempt < 2; attempt++) {
    const browser = await launch({ headless, slowMo, channel });
    const ctx = await newContext(browser, {
      storageState: conf.statePath,
      viewport,
      scale,
    });
    const page = await ctx.newPage();
    if (Array.isArray(responseLog)) {
      page.on('response', (r) =>
        responseLog.push({
          url: r.url(),
          status: r.status(),
          method: r.request().method(),
        })
      );
    }

    if (!verify) return { browser, ctx, page, baseUrl, refreshed };

    await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded' });
    // Poll rather than sleep once: the SPA can take >5s to hydrate on a cold
    // context, and a single early check reads as "not authenticated".
    let ok = false;
    for (let t = 0; t < 12 && !ok; t++) {
      await page.waitForTimeout(2000);
      ok = await isSignedIn(page, surface);
    }
    if (ok) {
      writeMeta(surface, { lastVerifiedAt: new Date().toISOString() });
      return { browser, ctx, page, baseUrl, refreshed };
    }

    const lastUrl = page.url();
    await ctx.close();
    await browser.close();
    OPEN.splice(OPEN.indexOf(browser), 1);
    if (!allowRefresh || attempt === 1) {
      throw new Error(
        `${surface}: stored session not authenticated after 24s (last url ${lastUrl}). ` +
          `Run: node session.js refresh ${surface}`
      );
    }
    await refresh(surface, { headless });
    refreshed = true;
  }
  throw new Error('unreachable');
}

async function closeAll() {
  for (const b of OPEN.splice(0)) {
    try {
      await b.close();
    } catch {}
  }
}

module.exports = {
  getContext,
  refresh,
  describeState,
  loadEnv,
  baseUrlFor,
  isSignedIn,
  launch,
  newContext,
  closeAll,
  SURFACES,
  DEFAULT_VIEWPORT,
  DEFAULT_SCALE,
  CONFIG_DIR,
};

if (require.main === module) {
  const [cmd, surface = 'brand'] = process.argv.slice(2);
  (async () => {
    if (cmd === 'refresh') {
      console.log(JSON.stringify(await refresh(surface), null, 2));
    } else if (cmd === 'info') {
      console.log(JSON.stringify(describeState(surface), null, 2));
    } else if (cmd === 'verify') {
      const { page } = await getContext(surface, { allowRefresh: false });
      console.log(
        JSON.stringify(
          { surface, url: page.url(), signedIn: await isSignedIn(page, surface) },
          null,
          2
        )
      );
    } else {
      console.log('usage: node session.js verify|refresh|info brand|portal');
      process.exitCode = 1;
    }
    await closeAll();
  })().catch(async (e) => {
    console.error('ERROR:', e.message);
    await closeAll();
    process.exit(1);
  });
}
