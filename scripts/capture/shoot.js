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
 *   node shoot.js shots/how-to-invite-users.js --suffix -callout-pilot
 *                                     # writes invite-modal-v2-callout-pilot.png
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
 *       callouts: [{                            // optional, see below
 *         step: 1, label: 'Title Case Label', side: 'left|right|above|below',
 *         target: { role: 'button', name: 'Invite members', exact: true,
 *                   within: '[role=dialog]' }     // role + name (preferred)
 *              |  { css: 'div:has(> h2:text-is("Members"))', within }  // CSS fallback
 *              |  'any Playwright selector string',
 *       }],
 *     }]
 *   }
 *
 * Callouts: after prepare and sanitize, right before the shutter, every target
 * is resolved on the live page and its bounding box is converted to raw-image
 * pixels (device scale factor applied, clip origin subtracted). After the PNG
 * is saved the boxes go to <out>/.callouts/<png-name>.json:
 *   { shot, raw: [W, H], capturedAt, route, callouts: [{ step, label, side,
 *     target, rect: [x, y, w, h] }] }
 * The shot FAILS (no sidecar, PNG removed) when a target matches zero or more
 * than one visible element, has an empty box, or does not sit fully inside the
 * saved frame. A box is never placed by eye.
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
  const out = { spec: null, only: [], outDir: null, recon: false, headed: false, suffix: '' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--only') out.only.push(argv[++i]);
    else if (a === '--out') out.outDir = argv[++i];
    else if (a === '--recon') out.recon = true;
    else if (a === '--headed') out.headed = true;
    else if (a === '--suffix') out.suffix = argv[++i];
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

const SIDES = ['left', 'right', 'above', 'below'];

/** Turn a callout `target` into a Playwright locator plus the description that
 *  goes in the sidecar. Role + name is preferred; CSS is the fallback. CSS and
 *  raw selector strings are limited to visible elements (getByRole already is),
 *  so a hidden duplicate (a measurement table, a closed menu) cannot make the
 *  count ambiguous. */
function calloutLocator(page, target) {
  if (typeof target === 'string') {
    return { loc: page.locator(`${target} >> visible=true`), desc: target };
  }
  if (target && target.role) {
    const scope = target.within ? page.locator(target.within) : page;
    const opts = {};
    if (target.name !== undefined) opts.name = target.name;
    if (target.exact !== undefined) opts.exact = target.exact;
    const name = target.name === undefined ? '' : `[name=${JSON.stringify(String(target.name))}${target.exact ? '' : ' i'}]`;
    return {
      loc: scope.getByRole(target.role, opts),
      desc: `${target.within ? target.within + ' >> ' : ''}role=${target.role}${name}`,
    };
  }
  if (target && target.css) {
    const sel = `${target.within ? target.within + ' >> ' : ''}${target.css}`;
    return { loc: page.locator(`${sel} >> visible=true`), desc: sel };
  }
  throw new Error(`callout target must be a selector string, {role, name} or {css}: ${JSON.stringify(target)}`);
}

/** Measure every callout of a shot on the live page, in CSS px relative to
 *  the frame origin. `clip` is the CSS-px clip passed to page.screenshot
 *  (viewport-relative, the same space as boundingBox), or undefined for a
 *  whole-viewport shot. toRaw() converts after the PNG exists. */
async function measureCallouts(page, shot, clip) {
  const vp = page.viewportSize();
  const frame = clip || { x: 0, y: 0, width: vp.width, height: vp.height };
  const boxes = [];
  for (const c of shot.callouts) {
    const tag = `callout step ${c.step} "${c.label}"`;
    if (!Number.isInteger(c.step) || !c.label) throw new Error(`${tag}: needs an integer step and a label`);
    if (!SIDES.includes(c.side)) throw new Error(`${tag}: side must be one of ${SIDES.join('|')}, got ${c.side}`);
    const { loc, desc } = calloutLocator(page, c.target);
    const n = await loc.count();
    if (n !== 1) throw new Error(`${tag}: target ${desc} matched ${n} elements, need exactly 1`);
    const box = await loc.boundingBox();
    if (!box || box.width <= 0 || box.height <= 0) throw new Error(`${tag}: target ${desc} has no box`);
    boxes.push({ c, tag, desc, box: { x: box.x - frame.x, y: box.y - frame.y, width: box.width, height: box.height } });
  }
  return { frame, boxes };
}

/** Convert measured CSS boxes to raw-image pixels using the scale of the PNG
 *  that was actually saved (PNG width / frame CSS width). The scale is read
 *  from the file, not from window.devicePixelRatio: on the 2026-10-11 pilot
 *  run the page reported devicePixelRatio 1 while the context rendered at 2x. */
function toRaw(measured, size) {
  const sx = size.width / measured.frame.width;
  const sy = size.height / measured.frame.height;
  if (Math.abs(sx - sy) > 0.01) throw new Error(`PNG ${size.width}x${size.height} is not a uniform scale of the ${measured.frame.width}x${measured.frame.height} frame`);
  const raw = [size.width, size.height];
  const callouts = measured.boxes.map(({ c, tag, desc, box }) => {
    // Round the edges, not the size, so adjacent boxes never drift apart by a pixel.
    const x0 = Math.round(box.x * sx);
    const y0 = Math.round(box.y * sy);
    const x1 = Math.round((box.x + box.width) * sx);
    const y1 = Math.round((box.y + box.height) * sy);
    if (x0 < 0 || y0 < 0 || x1 > raw[0] || y1 > raw[1]) {
      throw new Error(`${tag}: target ${desc} at raw [${x0}, ${y0}, ${x1 - x0}, ${y1 - y0}] is not fully inside the ${raw[0]}x${raw[1]} frame`);
    }
    return { step: c.step, label: c.label, side: c.side, target: desc, rect: [x0, y0, x1 - x0, y1 - y0] };
  });
  return { raw, callouts };
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
    console.error('usage: node shoot.js <spec.js> [--only file.png] [--out dir] [--suffix -name] [--recon] [--headed]');
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
      const name = shot.file.replace(/\.png$/, `${args.suffix}.png`);
      const dest = path.join(outDir, args.recon ? `recon-${name}` : name);

      // Measured on the sanitized DOM (sanitize can change text widths), as
      // close to the shutter as possible.
      const measured = shot.callouts && shot.callouts.length
        ? await measureCallouts(page, shot, clip)
        : null;
      const route = (() => { const u = new URL(page.url()); return u.pathname + u.search; })();
      await page.screenshot({ path: dest, clip });

      const size = pngSize(dest);
      rec.size = `${size.width}x${size.height}`;
      if (clip) {
        const want = `${clip.width * SCALE}x${clip.height * SCALE}`;
        if (rec.size !== want) throw new Error(`not 2x: got ${rec.size}, want ${want}`);
      }
      if (measured) {
        let conv;
        try {
          conv = toRaw(measured, size);
        } catch (err) {
          fs.unlinkSync(dest); // no PNG without its boxes
          throw new Error(`${err.message}; PNG removed`);
        }
        const sidecar = path.join(outDir, '.callouts', `${path.basename(dest)}.json`);
        fs.mkdirSync(path.dirname(sidecar), { recursive: true });
        fs.writeFileSync(sidecar, JSON.stringify({
          shot: path.basename(dest),
          raw: conv.raw,
          capturedAt: new Date().toISOString(),
          route,
          callouts: conv.callouts,
        }, null, 2) + '\n');
        rec.callouts = conv.callouts.map((c) => `${c.step}:${c.rect.join(',')}`);
        rec.sidecar = sidecar;
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
