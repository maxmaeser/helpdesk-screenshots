/**
 * fsai-capture / shoot.js  —  minimal declarative shot runner (pilot build)
 *
 * Runs an article shot spec against an authenticated staging session and writes
 * 2x raw PNGs. Written during the how-to-invite-users reshoot pilot (2026-08-25)
 * to stop the "19 throwaway Playwright scripts per 5 screenshots" pattern the
 * capture README calls out.
 *
 *   node shoot.js shots/how-to-invite-users.js                 # all shots -> ./out
 *   node shoot.js shots/how-to-invite-users.js --only invite-modal-v2.png
 *   node shoot.js shots/how-to-invite-users.js --out /tmp/x    # elsewhere
 *   node shoot.js shots/how-to-invite-users.js --recon         # full-viewport, no clip
 *   node shoot.js shots/how-to-invite-users.js --headed        # watch it
 *
 * A spec module exports:
 *   {
 *     surface: 'brand' | 'portal',
 *     article: '<folder-name>',
 *     shots: [{
 *       file:     'name.png',                   // raw/ filename
 *       url:      (r) => r.resolve('X') + '?y', // r = { resolve, resolvePortal }
 *       ready:    'text=Members',               // optional selector waited on
 *       settle:   1200,                         // optional extra ms
 *       prepare:  async (page) => {},           // clicks / fills / seeding
 *       sanitize: { emails: '...', ... },       // dom-sanitize config, or false
 *       clip:     { x, y, width, height }       // CSS px, viewport-relative
 *              |  { selector: '[role=dialog]', pad: 40 }
 *              |  undefined                     // whole viewport
 *     }]
 *   }
 *
 * Everything the capture README calls "standing chrome to remove before every
 * shutter" is handled here once, after every navigation, so specs stay short.
 */

const fs = require('fs');
const path = require('path');

const { getContext, closeAll } = require('./session.js');
const routes = require('./routes.js');
const { sanitize } = require('../dom-sanitize.js');

const SCALE = 2; // helpdesk raws are 2x, always

function parseArgs(argv) {
  const out = { spec: null, only: [], outDir: null, recon: false, headed: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--only') out.only.push(argv[++i]);
    else if (a === '--out') out.outDir = argv[++i];
    else if (a === '--recon') out.recon = true;
    else if (a === '--headed') out.headed = true;
    else if (!out.spec) out.spec = a;
  }
  return out;
}

/** The README's "standing chrome" list. Safe to call after every navigation. */
async function stripChrome(page) {
  await page.addStyleTag({ content: '* { outline: none !important; }' }).catch(() => {});
  await page.evaluate(() => {
    // Onboarding checklist: pinned bottom-right at z-[120], intercepts clicks.
    document.querySelectorAll('[data-fsai-guide]').forEach((e) => e.remove());
    // Staging-only sidebar noise that never exists in production.
    for (const el of document.querySelectorAll('a, button, div, span')) {
      const t = (el.textContent || '').trim();
      if (t === 'Knowledge Base' && el.closest('nav')) el.remove();
      if (t === 'Staging Test Brand') el.remove();
    }
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }).catch(() => {});
}

async function clipFor(page, shot) {
  if (!shot.clip) return undefined;
  if (shot.clip.selector) {
    const { selector, pad = 0 } = shot.clip;
    const box = await page.locator(selector).first().boundingBox();
    if (!box) throw new Error(`clip selector not found: ${selector}`);
    return {
      x: Math.round(box.x - pad),
      y: Math.round(box.y - pad),
      width: Math.round(box.width + pad * 2),
      height: Math.round(box.height + pad * 2),
    };
  }
  return shot.clip;
}

function pngSize(file) {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(24);
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.spec) {
    console.error('usage: node shoot.js <spec.js> [--only file.png] [--out dir] [--recon] [--headed]');
    process.exit(2);
  }
  const spec = require(path.resolve(args.spec));
  const outDir = path.resolve(args.outDir || path.join(process.cwd(), 'out'));
  fs.mkdirSync(outDir, { recursive: true });

  const { page } = await getContext(spec.surface || 'brand', {
    headless: !args.headed,
  });

  const results = [];
  const shots = spec.shots.filter((s) => !args.only.length || args.only.includes(s.file));

  for (const shot of shots) {
    const t0 = Date.now();
    const rec = { file: shot.file, ok: false };
    try {
      const url = typeof shot.url === 'function' ? shot.url(routes) : shot.url;
      rec.url = url;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await stripChrome(page);
      if (shot.ready) await page.waitForSelector(shot.ready, { timeout: 30000 });
      await page.waitForTimeout(shot.settle ?? 1500);
      await stripChrome(page);

      if (shot.prepare) {
        await shot.prepare(page, { stripChrome });
        await stripChrome(page);
      }

      if (shot.sanitize !== false) {
        rec.sanitized = await page.evaluate(sanitize, shot.sanitize || {});
        // Defensive second pass: React can re-render a row after the first.
        await page.waitForTimeout(300);
        await page.evaluate(sanitize, shot.sanitize || {});
      }

      const clip = args.recon ? undefined : await clipFor(page, shot);
      rec.clip = clip || 'viewport';
      const dest = path.join(outDir, args.recon ? `recon-${shot.file}` : shot.file);
      await page.screenshot({ path: dest, clip });

      const size = pngSize(dest);
      rec.size = `${size.width}x${size.height}`;
      if (clip) {
        const want = `${clip.width * SCALE}x${clip.height * SCALE}`;
        if (rec.size !== want) throw new Error(`not 2x: got ${rec.size}, want ${want}`);
      }
      rec.ok = true;
      rec.path = dest;
    } catch (err) {
      rec.error = err.message;
    }
    rec.seconds = ((Date.now() - t0) / 1000).toFixed(1);
    results.push(rec);
    console.log(JSON.stringify(rec));
  }

  await closeAll();
  const failed = results.filter((r) => !r.ok);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
