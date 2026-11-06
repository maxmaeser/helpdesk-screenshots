/**
 * fsai-capture / record.js  --  film a real staging walkthrough as a "take"
 *
 * Writes the take contract in tools/clip/TAKE.md:
 *   tools/clip/takes/<id>/take.json   event log (times in s, rects in video px)
 *   tools/clip/takes/<id>/raw.mp4     2880x1620, 30 fps CFR, H.264 yuv420p, CRF 16
 *   tools/clip/takes/<id>/frames/     CDP screencast JPEGs (deleted unless --keep-frames)
 *
 *   node record.js takes/invite-users.js                # record, encode, validate
 *   node record.js takes/invite-users.js --dry          # stop before any {write:true} click
 *   node record.js takes/invite-users.js --headed       # watch it
 *   node record.js takes/invite-users.js --out /tmp/t   # write elsewhere
 *   node record.js takes/invite-users.js --keep-frames
 *
 * A take spec module exports:
 *   {
 *     id: 'invite-users',                // folder name under tools/clip/takes/
 *     article: 'how-to-invite-users',
 *     surface: 'brand',                  // only 'brand' is wired for now
 *     brand: 'Lumon Cafe',               // key of BRANDS below; switched before filming
 *     start: (r) => r.resolve('SETTINGS_ORGANISATION'),   // r = routes.js
 *     ready: 'text=Members',             // optional selector waited on before filming
 *     sanitize: { emails: '...', ... },  // dom-sanitize config (default SANITIZE below)
 *     steps: [{
 *       step: 1, label: 'Open Members',  // label: verb first, <= 40 chars
 *       action: async (rec, page) => { await rec.click(target, { transition: 'page' }); },
 *     }],
 *     prepare: async (page) => {},       // optional, off camera after settle: cosmetic DOM prep
 *     outro: async (rec, page) => {},    // optional, runs after the last step (hold on the result)
 *   }
 *
 * Inside an action, `rec` knows the current step and label, so a call only
 * names the target. The first stepped call in an action carries the step; any
 * further call in the same action is logged without a step (a plain event).
 *
 *   rec.click(target, { transition, cursor, write })   hover, dwell 1.2 s, click, log
 *   rec.type(target, text, { commit: 'Enter', click })  real typing (70 ms/key), log span
 *   rec.select(target, { transition })                  click a listbox option, kind "select"
 *   rec.wait(what, reason)                              selector | fn | promise | ms; logs a wait span
 *   rec.move(x, y)                                      eased human path, CSS px, logged in video px
 *   rec.result(target, { hold: 2500 })                  mark the result at the end of a step, then hold ms
 *   rec.hold(ms)                                        idle on screen (no event; the template sees the gap)
 *   rec.locate(target)                                  resolve a target to a Locator (exactly 1 visible)
 *
 * `target` is a Locator, a selector string, { role, name, exact, within }, or
 * { css, within } (the same forms as shoot.js callouts). It must resolve to
 * exactly one visible element or the take fails.
 *
 * Safety rails (not optional):
 *   - Any typed or filled text that looks like an email must end @example.com.
 *   - `write: true` on a click marks a staging write (Send, Save, Delete).
 *     With --dry the take ends right before it, so a lane can rehearse safely.
 *   - The live DOM is sanitized continuously (MutationObserver, before paint)
 *     and asserted clean before every step. Standing chrome is stripped the same way.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { getContext, closeAll } = require('./session.js');
const routes = require('./routes.js');
const { sanitize, assertClean } = require('../dom-sanitize.js');

const VIEWPORT = { width: 1440, height: 810 };
const DPR = 2;
const VIDEO = [VIEWPORT.width * DPR, VIEWPORT.height * DPR];
const FPS = 30;
const DWELL_MS = 1200;
const SETTLE_PAGE_MS = 1600; // after a page step (and its wait) before the next move
const SETTLE_LOCAL_MS = 1100; // template: 0.8 s read + 0.6-0.9 s cursor travel + 1.2 s dwell per local step
const TYPE_DELAY_MS = 70;
const SUITE = path.resolve(__dirname, '../../..');
const TAKES_DIR = path.join(SUITE, 'tools/clip/takes');

const SANITIZE = { emails: '{first}.{last}@example.com', phones: '(720) 555-0142', freshenDates: false };
/** Lumon brands hold only fictional seed people, so the generic name guesser
 *  (which turns "Discovery Day invite" or "Personal Information Form" into fake
 *  people) is off there. The real staff accounts that can appear in Lumon
 *  screens are replaced by name instead. Longest names first. */
const STAFF_NAMES = [
  ['Joshua Example Tester', 'Sam Rivera'], ['Joshua Radin-Grant', 'Alex Rowe'], ['Jonathan Whiteside', 'Quinn Harper'],
  ['Nathan Minkhorst', 'Drew Palmer'], ['Joshua Tester', 'Sam Rivera'], ['Claude Maeser', 'Jordan Avery'],
  ['Max Maeser', 'Taylor Morgan'], ['Dennis Teser', 'Robin Hale'], ['Erin Hooper', 'Morgan Ellis'], ['Bill Smith', 'Casey Lin'],
];
const SANITIZE_LUMON = { ...SANITIZE, names: false, replacements: STAFF_NAMES.map(([find, replace]) => ({ find, replace })) };

/** Capture brands. Switching = the same localStorage the Settings org and brand
 *  pickers write (recon 2026-10-18), then a reload. The capture account must be
 *  a member of the org. Lumon Fresh is retired from captures. */
const BRANDS = {
  'Lumon Cafe': { org: 'b752a52c-f3a1-4aef-acf0-603be10f27f2', brand: 'e1cd6b73-53a1-499b-9bc8-fd9b5bf5da80' },
  'Lumon Health': { org: 'b752a52c-f3a1-4aef-acf0-603be10f27f2', brand: '0056cb99-d406-47ba-9364-edbeace60112' },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const r2 = (n) => Math.round(n * 100) / 100;

function parseArgs(argv) {
  const out = { spec: null, outDir: null, headed: false, dry: false, keepFrames: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') out.outDir = argv[++i];
    else if (a === '--headed') out.headed = true;
    else if (a === '--dry') out.dry = true;
    else if (a === '--keep-frames') out.keepFrames = true;
    else if (!out.spec) out.spec = a;
  }
  return out;
}

/** Throws on any email-shaped string that is not @example.com. */
function assertSafeText(text) {
  const emails = String(text).match(/[^\s@]+@[^\s@]+/g) || [];
  for (const e of emails) {
    if (!/@example\.com$/i.test(e)) throw new Error(`refusing to enter "${e}": only @example.com addresses may be typed`);
  }
}

/** Page-side guard: strip standing chrome and sanitize on every DOM mutation,
 *  synchronously in the observer callback, which runs before the next paint, so
 *  the screencast never sees an unmasked frame. Installed as an init script, so
 *  it survives navigations. */
function guardScript(sanitizeSrc, cfg) {
  return `(() => {
    const sanitize = ${sanitizeSrc};
    const cfg = ${JSON.stringify(cfg)};
    const strip = () => {
      document.querySelectorAll('[data-fsai-guide]').forEach((e) => e.remove());
      for (const el of document.querySelectorAll('nav a, nav button, nav div, nav span')) {
        if ((el.textContent || '').trim() === 'Knowledge Base') el.remove();
      }
      for (const el of document.querySelectorAll('span, div, button')) {
        if (el.childElementCount === 0 && (el.textContent || '').trim() === 'Staging Test Brand') el.remove();
      }
    };
    let obs = null, busy = false;
    window.__fsaiGuardStats = { runs: 0, ms: 0, maxMs: 0 };
    const run = () => {
      if (busy || !document.body) return;
      busy = true;
      if (obs) obs.disconnect();
      const t0 = performance.now();
      try { strip(); sanitize(cfg); } catch (e) { window.__fsaiGuardError = String(e); }
      const dt = performance.now() - t0;
      const s = window.__fsaiGuardStats; s.runs++; s.ms += dt; s.maxMs = Math.max(s.maxMs, dt);
      if (obs) obs.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
      busy = false;
    };
    window.__fsaiGuardRun = run;
    const start = () => {
      obs = new MutationObserver(run);
      obs.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
      run();
    };
    if (document.documentElement) start(); else document.addEventListener('DOMContentLoaded', start);
  })();`;
}

class Recorder {
  constructor(page, cdp, framesDir, opts) {
    this.page = page;
    this.cdp = cdp;
    this.framesDir = framesDir;
    this.opts = opts;
    this.frames = []; // { file, ts }
    this.events = [];
    this.t0 = null; // epoch seconds of the first frame
    this.mouse = { x: VIEWPORT.width / 2, y: VIEWPORT.height / 2 };
    this.current = null; // { step, label, used }
    this.stepsSeen = new Set();
  }

  async startFilming() {
    let n = 0;
    this.cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
      const file = `${String(n++).padStart(6, '0')}.jpg`;
      fs.writeFileSync(path.join(this.framesDir, file), Buffer.from(data, 'base64'));
      const ts = metadata.timestamp || Date.now() / 1000;
      this.frames.push({ file, ts });
      if (this.t0 === null) this.t0 = ts;
      this.cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    });
    await this.cdp.send('Page.startScreencast', {
      format: 'jpeg', quality: 92, maxWidth: VIDEO[0], maxHeight: VIDEO[1], everyNthFrame: 1,
    });
    // The first frame defines t = 0. A static page may need a repaint nudge.
    for (let i = 0; i < 50 && this.t0 === null; i++) {
      if (i === 10) await this.page.evaluate(() => { document.body.style.opacity = '0.999'; requestAnimationFrame(() => { document.body.style.opacity = ''; }); });
      await sleep(100);
    }
    if (this.t0 === null) throw new Error('screencast produced no frame in 5 s');
    // Screencast timestamps and Date.now() share the epoch clock; check it.
    const skew = Date.now() / 1000 - this.t0;
    if (skew < -1 || skew > 6) throw new Error(`screencast clock skew ${skew.toFixed(2)} s; timestamps not epoch-based`);
    this.log({ kind: 'start' }, 0);
    this.log({ kind: 'move', ...this.vpx(this.mouse.x, this.mouse.y) });
  }

  async stopFilming() {
    await this.cdp.send('Page.stopScreencast').catch(() => {});
    await sleep(200);
  }

  now() { return r2(Date.now() / 1000 - this.t0); }
  vpx(x, y) { return { x: Math.round(x * DPR), y: Math.round(y * DPR) }; }
  log(ev, t) { const e = { t: t === undefined ? this.now() : t, ...ev }; this.events.push(e); return e; }

  /** Step tag for the next stepped event in the current action (first one only). */
  tag() {
    const c = this.current;
    if (!c || c.used) return {};
    c.used = true;
    this.stepsSeen.add(c.step);
    return { step: c.step, label: c.label };
  }

  locate(target) {
    const page = this.page;
    if (target && typeof target.boundingBox === 'function') return { loc: target, desc: target.toString() };
    if (typeof target === 'string') return { loc: page.locator(`${target} >> visible=true`), desc: target };
    if (target && target.role) {
      const scope = target.within ? page.locator(target.within) : page;
      const o = {};
      if (target.name !== undefined) o.name = target.name;
      if (target.exact !== undefined) o.exact = target.exact;
      const nm = target.name === undefined ? '' : `[name=${JSON.stringify(String(target.name))}]`;
      return { loc: scope.getByRole(target.role, o), desc: `${target.within ? target.within + ' >> ' : ''}role=${target.role}${nm}` };
    }
    if (target && target.css) {
      const sel = `${target.within ? target.within + ' >> ' : ''}${target.css}`;
      return { loc: page.locator(`${sel} >> visible=true`), desc: sel };
    }
    throw new Error(`target must be a Locator, selector string, {role,name} or {css}: ${JSON.stringify(target)}`);
  }

  /** Resolve to exactly one visible element; scroll it into view (logged) and
   *  return its viewport box in CSS px. */
  async box(target, tag) {
    const { loc, desc } = this.locate(target);
    await loc.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const n = await loc.count();
    if (n !== 1) throw new Error(`${tag}: ${desc} matched ${n} elements, need exactly 1`);
    let b = await loc.boundingBox();
    if (!b) throw new Error(`${tag}: ${desc} has no box`);
    if (b.y < 0 || b.y + b.height > VIEWPORT.height || b.x < 0 || b.x + b.width > VIEWPORT.width) {
      const t = this.now();
      await loc.scrollIntoViewIfNeeded();
      await sleep(400);
      this.log({ kind: 'scroll', until: this.now(), target: desc }, t);
      b = await loc.boundingBox();
    }
    return { loc, desc, b };
  }

  rect(b) {
    const x0 = Math.round(b.x * DPR), y0 = Math.round(b.y * DPR);
    const x1 = Math.round((b.x + b.width) * DPR), y1 = Math.round((b.y + b.height) * DPR);
    return [x0, y0, x1 - x0, y1 - y0];
  }

  /** Eased mouse path (ease-in-out with a slight arc), 16 ms ticks, every tick
   *  logged as a move event in video px. */
  async move(x, y, { ms } = {}) {
    const from = { ...this.mouse };
    const dist = Math.hypot(x - from.x, y - from.y);
    if (dist < 1) return;
    const dur = ms || Math.min(900, Math.max(350, 250 + dist * 0.6));
    const ticks = Math.max(8, Math.round(dur / 33));
    // Perpendicular arc, 6% of the distance, always bowing the same way.
    const nx = -(y - from.y) / dist, ny = (x - from.x) / dist, arc = dist * 0.06;
    for (let i = 1; i <= ticks; i++) {
      const u = i / ticks;
      const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      const bow = Math.sin(Math.PI * u) * arc;
      const px = from.x + (x - from.x) * e + nx * bow;
      const py = from.y + (y - from.y) * e + ny * bow;
      await this.page.mouse.move(px, py);
      this.mouse = { x: px, y: py };
      this.log({ kind: 'move', ...this.vpx(px, py) });
      await sleep(dur / ticks);
    }
  }

  async assertClean(where) {
    await this.page.evaluate(() => window.__fsaiGuardRun && window.__fsaiGuardRun());
    try { await assertClean(this.page, this.opts.sanitize); }
    catch (e) { throw new Error(`${where}: DOM not clean before filming it: ${e.message}`); }
  }

  /** Hover, dwell, re-measure, verify the pointer sits on the target, click. */
  async click(target, { transition = 'local', cursor = 'pointer', write = false, kind = 'click' } = {}) {
    const tag = `step ${this.current ? this.current.step : '-'} ${kind}`;
    let { loc, desc, b } = await this.box(target, tag);
    if (write && this.opts.dry) throw Object.assign(new Error(`--dry: stopped before write click ${desc}`), { dryStop: true });
    await this.move(b.x + b.width / 2, b.y + b.height / 2);
    await sleep(DWELL_MS);
    b = await loc.boundingBox(); // hover states and late layout can move it
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    if (Math.hypot(cx - this.mouse.x, cy - this.mouse.y) > 2) await this.move(cx, cy, { ms: 200 });
    const hit = await loc.evaluate((el, [x, y]) => { const h = document.elementFromPoint(x, y); return !!h && (el === h || el.contains(h)); }, [cx, cy]);
    if (!hit) throw new Error(`${tag}: ${desc} is covered at its center`);
    const ev = this.log({ kind, ...this.tag(), rect: this.rect(b), target: desc, transition, cursor, ...(write ? { write: true } : {}) });
    this.lastTransition = transition;
    await this.page.mouse.click(cx, cy);
    return ev;
  }

  select(target, opts = {}) { return this.click(target, { ...opts, kind: 'select' }); }

  /** Real typing into the focused field (or click it first with {click:true}). */
  async type(target, text, { commit, click = false, transition = 'local', cursor = 'text' } = {}) {
    assertSafeText(text);
    const tag = `step ${this.current ? this.current.step : '-'} type`;
    if (click) await this.click(target, { cursor: 'text' });
    const { loc, desc, b } = await this.box(target, tag);
    // Same dwell as a click: the template shows the step (highlight, beat)
    // before the first key lands.
    if (!click) await sleep(DWELL_MS + 600); // no mouse travel here, so dwell covers the template travel too
    const t = this.now();
    await loc.pressSequentially(text, { delay: TYPE_DELAY_MS });
    if (commit) { await sleep(250); await loc.press(commit); }
    await sleep(300);
    const after = (await loc.boundingBox()) || b;
    this.log({ kind: 'type', ...this.tag(), rect: this.rect(after), target: desc, text, ...(commit ? { commit } : {}), until: this.now(), transition, cursor }, t);
    this.lastTransition = transition;
  }

  /** Log a wait span. `what`: selector string (visible), function, promise, or ms. */
  async wait(what, reason) {
    const t = this.now();
    if (typeof what === 'number') await sleep(what);
    else if (typeof what === 'string') await this.page.waitForSelector(what, { state: 'visible', timeout: 30000 });
    else if (typeof what === 'function') await what();
    else await what;
    this.log({ kind: 'wait', until: this.now(), reason }, t);
  }

  async result(target, { hold = 2500 } = {}) {
    if (!this.current) throw new Error('result requires a current step');
    if (!(hold >= 0 && hold < 4000)) throw new Error('result hold must be under 4000 ms');
    const { b } = await this.box(target, 'result');
    const event = this.log({ kind: 'result', step: this.current.step, rect: this.rect(b) });
    await sleep(hold);
    event.until = this.now(); // protect the deliberate result hold from idle-gap trimming
  }

  hold(ms) { return sleep(ms); }
}

/** Pre-select the brand before any app code runs: an init script writes the
 *  same localStorage keys the Settings org and brand pickers write (recon
 *  2026-10-18), once per tab (sessionStorage flag), so later in-take switches
 *  are not fought. Setting them from page.evaluate races the hydrating app,
 *  which rewrites them. */
async function switchBrand(ctx, brandName) {
  const b = BRANDS[brandName];
  if (!b) throw new Error(`unknown brand "${brandName}" (have: ${Object.keys(BRANDS).join(', ')})`);
  await ctx.addInitScript(({ org, brand }) => {
    try {
      if (sessionStorage.getItem('__fsaiBrandSet') === brand) return;
      localStorage.setItem('fsai-selected-brands-single', JSON.stringify([brand]));
      localStorage.setItem('fsai-selected-brands-multi', JSON.stringify([brand]));
      localStorage.setItem('selectedOrganisations-organisation-details-settings', org);
      localStorage.setItem('fsai-brand-scope-v1', JSON.stringify({ version: 1, organisationId: org, scope: { kind: 'all' }, focusBrandId: brand, leadsSurface: null }));
      sessionStorage.setItem('__fsaiBrandSet', brand);
    } catch {}
  }, b);
}

async function brandChipOk(page, brandName) {
  // Top bar brand chip sits in the first 60 CSS px.
  return page.evaluate((name) => [...document.querySelectorAll('button, span, div')].some((el) => {
    const r = el.getBoundingClientRect();
    return r.top < 60 && r.height > 0 && el.childElementCount <= 3 && (el.textContent || '').trim() === name;
  }), brandName);
}

function encode(frames, t0, tEnd, framesDir, outFile) {
  // Concat list with each frame held until the next one: real timing, then
  // resampled to constant 30 fps. The concat demuxer gives the repeated last
  // entry the previous duration again, so the output is capped with -t.
  const lines = [];
  for (let i = 0; i < frames.length; i++) {
    const next = i + 1 < frames.length ? frames[i + 1].ts : t0 + tEnd;
    const d = Math.max(0.001, next - frames[i].ts);
    lines.push(`file '${path.join(framesDir, frames[i].file)}'`, `duration ${d.toFixed(4)}`);
  }
  lines.push(`file '${path.join(framesDir, frames[frames.length - 1].file)}'`);
  const list = path.join(framesDir, 'concat.txt');
  fs.writeFileSync(list, lines.join('\n') + '\n');
  execFileSync('nice', ['-n', '15', 'ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
    '-vf', `scale=${VIDEO[0]}:${VIDEO[1]}:flags=lanczos:in_range=full:out_range=limited,fps=${FPS},format=yuv420p`, '-pix_fmt', 'yuv420p', '-color_range', 'tv',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-r', String(FPS), '-t', tEnd.toFixed(3), '-movflags', '+faststart', outFile], { stdio: 'inherit' });
}

function probe(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=width,height,codec_name,pix_fmt,r_frame_rate:format=duration', '-of', 'json', file]).toString();
  const j = JSON.parse(out);
  return { ...j.streams[0], duration: Number(j.format.duration) };
}

/** The TAKE.md shape checks. Returns a list of problems (empty = valid). */
function validateTake(take) {
  const errs = [];
  const KINDS = ['start', 'end', 'move', 'click', 'type', 'select', 'scroll', 'wait', 'result'];
  const [W, H] = take.videoSize;
  if (W !== VIDEO[0] || H !== VIDEO[1]) errs.push(`videoSize ${W}x${H}`);
  if (take.events[0].kind !== 'start' || take.events[0].t !== 0) errs.push('first event must be start at t=0');
  if (take.events[take.events.length - 1].kind !== 'end') errs.push('last event must be end');
  let last = 0;
  for (const e of take.events) {
    if (!KINDS.includes(e.kind)) errs.push(`bad kind ${e.kind}`);
    if (typeof e.t !== 'number' || e.t < last - 0.011) errs.push(`time not monotonic at t=${e.t} (${e.kind})`);
    last = Math.max(last, e.t);
    if (e.until !== undefined && e.until < e.t) errs.push(`until < t at ${e.t}`);
    if (e.kind === 'move' && (e.x < 0 || e.y < 0 || e.x > W || e.y > H)) errs.push(`move off frame at ${e.t}`);
    if (e.step !== undefined) {
      if (e.kind !== 'result' && (!e.label || e.label.length > 40)) errs.push(`step ${e.step}: label missing or > 40 chars`);
      if (e.kind !== 'result' && !['page', 'local'].includes(e.transition)) errs.push(`step ${e.step}: transition`);
      const [x, y, w, h] = e.rect || [];
      if (!(w > 0 && h > 0 && x >= 0 && y >= 0 && x + w <= W && y + h <= H)) errs.push(`step ${e.step}: rect ${JSON.stringify(e.rect)} not inside ${W}x${H}`);
    }
  }
  return errs;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.spec) {
    console.error('usage: node record.js <take-spec.js> [--dry] [--headed] [--out dir] [--keep-frames]');
    process.exit(2);
  }
  const spec = require(path.resolve(args.spec));
  if (!spec.id || !spec.brand || !spec.start || !Array.isArray(spec.steps)) throw new Error('spec needs id, brand, start, steps');
  if ((spec.surface || 'brand') !== 'brand') throw new Error('only surface "brand" is wired so far');
  const outDir = path.resolve(args.outDir || path.join(TAKES_DIR, spec.id));
  const framesDir = path.join(outDir, 'frames');
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });
  const sanitizeCfg = spec.sanitize || (/^Lumon /.test(spec.brand || '') ? SANITIZE_LUMON : SANITIZE);

  const { ctx, page, baseUrl } = await getContext('brand', { headless: !args.headed, viewport: VIEWPORT, scale: DPR });
  await ctx.addInitScript({ content: guardScript(sanitize.toString(), sanitizeCfg) });

  // Off camera: brand switch, start page, settle.
  await switchBrand(ctx, spec.brand);
  const startUrl = typeof spec.start === 'function' ? spec.start(routes) : spec.start;
  await page.goto(startUrl, { waitUntil: 'domcontentloaded' });
  if (spec.ready) await page.waitForSelector(spec.ready, { timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await sleep(spec.settle ?? 2000);
  let chip = false;
  for (let i = 0; i < 20 && !chip; i++) { chip = await brandChipOk(page, spec.brand); if (!chip) await sleep(500); }
  if (!chip) throw new Error(`brand chip does not read "${spec.brand}" after the switch (url ${page.url()}; top: ${JSON.stringify((await page.locator("body").innerText()).slice(0, 120))})`);
  if (spec.prepare) await spec.prepare(page); // off camera: cosmetic DOM prep (hide private widgets)
  await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2);

  const cdp = await ctx.newCDPSession(page);
  const rec = new Recorder(page, cdp, framesDir, { dry: args.dry, sanitize: sanitizeCfg });
  let failure = null;
  await rec.startFilming();
  try {
    await rec.assertClean('start');
    await rec.hold(1000);
    for (const s of spec.steps) {
      rec.current = { step: s.step, label: s.label, used: false };
      await rec.assertClean(`step ${s.step}`);
      await s.action(rec, page);
      if (!rec.stepsSeen.has(s.step)) throw new Error(`step ${s.step} "${s.label}" logged no click/type/select`);
      rec.current = null;
      // The template pulls the camera back after a page change and lets a
      // local change read before the next cursor travel starts.
      await rec.hold(rec.lastTransition === 'page' ? SETTLE_PAGE_MS : SETTLE_LOCAL_MS);
    }
    if (spec.outro) await spec.outro(rec, page);
    else await rec.hold(2000);
  } catch (e) {
    failure = e;
  }
  rec.log({ kind: 'end' });
  const stats = await page.evaluate(() => ({ stats: window.__fsaiGuardStats, err: window.__fsaiGuardError || null })).catch(() => null);
  await rec.stopFilming();
  await closeAll();

  const take = {
    id: spec.id,
    article: spec.article,
    brand: spec.brand,
    video: 'raw.mp4',
    videoSize: VIDEO,
    viewport: [VIEWPORT.width, VIEWPORT.height],
    dpr: DPR,
    recordedAt: new Date(rec.t0 * 1000).toISOString(),
    ...(failure ? { incomplete: failure.dryStop ? 'dry run' : failure.message } : {}),
    events: rec.events,
  };
  const tEnd = rec.events[rec.events.length - 1].t;
  fs.writeFileSync(path.join(outDir, failure ? 'take.failed.json' : 'take.json'), JSON.stringify(take, null, 2) + '\n');
  if (failure && !failure.dryStop) {
    console.error(`TAKE FAILED: ${failure.message}\n  partial log: ${path.join(outDir, 'take.failed.json')}\n  frames kept: ${framesDir}`);
    process.exit(1);
  }

  const mp4 = path.join(outDir, 'raw.mp4');
  encode(rec.frames, rec.t0, tEnd, framesDir, mp4);
  const p = probe(mp4);
  const errs = validateTake(take);
  if (p.width !== VIDEO[0] || p.height !== VIDEO[1] || p.codec_name !== 'h264' || p.r_frame_rate !== `${FPS}/1` || p.pix_fmt !== 'yuv420p') {
    errs.push(`raw.mp4 is ${p.width}x${p.height} ${p.codec_name} ${p.pix_fmt} ${p.r_frame_rate}`);
  }
  if (!args.keepFrames) fs.rmSync(framesDir, { recursive: true, force: true });
  const steps = take.events.filter((e) => e.step !== undefined).map((e) => ({ step: e.step, label: e.label, kind: e.kind, t: e.t, rect: e.rect.join(',') }));
  console.log(JSON.stringify({ ok: errs.length === 0, outDir, duration: r2(p.duration), frames: rec.frames.length, dry: !!failure, guard: stats, steps, errors: errs }, null, 2));
  if (errs.length) process.exit(1);
}

module.exports = { Recorder, BRANDS, guardScript, validateTake, assertSafeText, VIEWPORT, DPR, VIDEO };

if (require.main === module) {
  main().catch(async (e) => {
    console.error(e);
    await closeAll();
    process.exit(1);
  });
}
