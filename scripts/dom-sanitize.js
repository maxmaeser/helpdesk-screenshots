// dom-sanitize.js
//
// Reusable DOM sanitizer for FSAI helpdesk staging captures. Strips real PII
// (emails, phones) from the live page before a screenshot is taken, and can
// "freshen" relative-time chips ("4 months ago") so shots don't look stale.
//
// Freshening is marker-gated by default (see freshenDates below): it rewrites a
// duration only when the surrounding chip reads as a relative time. Before
// 2026-08-26 it rewrote every "<n> <unit>" on the page, which corrupted product
// copy - the how-to-invite-users dialog shipped reading "Invites are valid for
// 1 week" when the product says "7 days".
//
// Usage A (Node/Playwright):
//   const { sanitize } = require('.../dom-sanitize.js');
//   const counts = await page.evaluate(sanitize, config); // => {emails,phones,dates,custom}
//
// Usage B (paste-in): copy the body of sanitize() into any page.evaluate:
//   await page.evaluate((config) => { /* body of sanitize() */ }, config);
//
// config = {
//   replacements:  [{ find, replace }],   // custom regex-source-or-literal rules
//   emails:        false | string,        // replacement email or '{first}.{last}@example.com' pattern
//   phones:        false | string,        // literal replacement, e.g. '(720) 555-0142'
//   freshenDates:  false | 'auto' | 'auto-all' | [{ find, replace }],
// }
//
// freshenDates values:
//   (omitted) / 'auto'  Freshen ONLY durations that read as a relative timestamp,
//                       i.e. a relative-time marker ("ago", "from now") sits in the
//                       node or in its nearest few ancestors. This is the safe default.
//   'auto-all'          Legacy behavior: freshen EVERY "<n> <unit>" on the page, with
//                       no marker required. Rewrites product copy ("Invites are valid
//                       for 7 days") as well as timestamps. Opt in per shot, never by
//                       default, and only when you have checked the frame by eye.
//   false               Do not freshen anything.
//   [{find,replace}]    Explicit rewrite rules, applied verbatim.
// Omitted keys use the defaults below. Returns a count report.

function sanitize(config) {
  config = config || {};

  const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  // Two shapes, alternated: NANP (optional +1, optional parens, dash/dot/space
  // separators, or a fully bare 10-digit run) and international (leading "+",
  // a 1-3 digit country code, then 8-13 more digits with optional spaces,
  // dashes, or parens - e.g. "+43677887711" or "+44 20 7946 0958"). Both
  // branches sit inside digit-adjacency guards, (?<!\d) and (?!\d), rather
  // than \b - \b treats digits and letters as the same "word" class, so it
  // wouldn't stop a NANP-shaped chunk from being carved out of a longer bare
  // digit run (an ID, a timestamp, a path segment). The guards require the
  // match to be exactly phone-length and isolated on both sides, so e.g. a
  // 14-digit ID never partially matches. This also fixes the original bug
  // where an intl number (no leading "1") only partially matched, leaving a
  // stray prefix fragment (e.g. "+4" from "+43677887711") unreplaced.
  const NANP_PHONE = String.raw`(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}`;
  const INTL_PHONE = String.raw`\+\d{1,3}[-.\s]?\(?\d{2,4}\)?(?:[-.\s]?\d{2,4}){1,4}`;
  const PHONE_RE = new RegExp(`(?<!\\d)(?:${INTL_PHONE}|${NANP_PHONE})(?!\\d)`, 'g');
  // Matches "N unit" WITHOUT requiring a trailing "ago" in the same node. Some UIs
  // (e.g. an activity feed) render a chip as split sibling text nodes -
  // <span>・{"4 months"}{" ago"}</span> is really 3 separate text nodes: "・",
  // "4 months", " ago". A regex anchored on "...ago" would silently miss the
  // isolated middle node, so we match the number+unit alone and let "ago" (or
  // whatever else shares the node) pass through untouched.
  const DATE_RE = /\b(\d+)\s+(day|days|week|weeks|month|months|year|years)\b/gi;
  const UNIT_DAYS = { day: 1, days: 1, week: 7, weeks: 7, month: 30, months: 30, year: 365, years: 365 };
  // Bounded recent-past ladder, oldest -> freshest. 'auto' remaps whatever relative
  // times exist onto this window so shots always read as recent, regardless of
  // how stale the underlying staging data actually is.
  const LADDER = ['8 weeks', '7 weeks', '6 weeks', '5 weeks', '4 weeks', '3 weeks', '2 weeks', '1 week', '5 days', '3 days', '2 days', '1 day'];
  // A duration string is only a relative TIMESTAMP when something nearby says so.
  // Without this gate DATE_RE also matches product copy - trial lengths, expiry
  // windows, retention periods, date-range chips ("Last 30 days"), segment names
  // ("No Activity in 90 Days") - and freshenAuto silently rewrites the product's
  // own words. That is a correctness defect in the finished screenshot; a
  // timestamp that still reads "6 months ago" is only a cosmetic one. So the
  // default now requires a marker and the unanchored sweep is opt-in ('auto-all').
  const REL_MARKER_RE = /\b(?:ago|from now)\b/i;
  // How far up the tree to look for the marker, and how much text an ancestor may
  // hold before it stops counting as "the chip" and starts counting as prose. A
  // chip like <span>{bullet}{"4 months"}{" ago"}</span> splits into sibling text nodes,
  // so the marker usually lives one or two elements up, inside a short subtree.
  const MARKER_ANCESTOR_LEVELS = 3;
  const MARKER_ANCESTOR_MAX_CHARS = 120;
  // Durations left alone by the marker gate, reported as counts.datesSkipped.
  // Non-zero means the page held a duration that reads as product copy - worth an
  // eyeball before the shot ships.
  let skipped = 0;

  function textNodes() {
    const nodes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }
  function fields() {
    return Array.prototype.slice.call(document.querySelectorAll('input, textarea'));
  }

  // Runs `re` (global) + `replacer` against every text node and input/textarea
  // value on the page. Returns the number of individual matches replaced.
  function replaceEverywhere(re, replacer) {
    let count = 0;
    textNodes().forEach((node) => {
      const v = node.nodeValue;
      if (!v) return;
      const m = v.match(re);
      if (m) {
        count += m.length;
        node.nodeValue = v.replace(re, replacer);
      }
    });
    fields().forEach((el) => {
      const v = el.value;
      if (!v) return;
      const m = v.match(re);
      if (m) {
        count += m.length;
        el.value = v.replace(re, replacer);
      }
    });
    return count;
  }

  // Preserves a name-ish local part when derivable: "jane.doe@corp.com" -> pattern
  // with {first}=jane, {last}=doe. Falls back gracefully when no separator exists.
  function emailReplacer(pattern) {
    return function (match) {
      const local = match.slice(0, match.indexOf('@'));
      const parts = local.split(/[._-]+/).filter(Boolean);
      const first = (parts[0] || 'user').toLowerCase();
      const last = (parts.length > 1 ? parts[parts.length - 1] : '').toLowerCase();
      return pattern.replace(/\{first\}/g, first).replace(/\{last\}/g, last).replace(/[._-]+@/, '@');
    };
  }

  // True when this text node sits inside something that reads as a relative time.
  // Checks the node itself, then walks up MARKER_ANCESTOR_LEVELS elements, giving
  // up as soon as an ancestor's text is long enough to be prose rather than a chip
  // (which also stops "ago" from somewhere else on the page leaking in).
  function hasRelativeMarker(node) {
    if (REL_MARKER_RE.test(node.nodeValue || '')) return true;
    let el = node.parentElement || (node.parentNode && node.parentNode.nodeType === 1 ? node.parentNode : null);
    for (let i = 0; el && i < MARKER_ANCESTOR_LEVELS; i++) {
      const t = el.textContent || '';
      if (t.length > MARKER_ANCESTOR_MAX_CHARS) return false;
      if (REL_MARKER_RE.test(t)) return true;
      el = el.parentElement;
    }
    return false;
  }

  function buildLadder(n) {
    if (n <= 0) return [];
    if (n === 1) return ['2 days'];
    const step = (LADDER.length - 1) / (n - 1);
    return Array.from({ length: n }, (_, i) => LADDER[Math.round(i * step)]);
  }

  // Ranks distinct relative-time magnitudes (oldest -> newest) and remaps each
  // onto LADDER, preserving relative order (and ties) without needing to know
  // the true dates. Works across both split-sibling chips and single-node
  // "N unit ago" phrases, since DATE_RE only requires the number+unit substring;
  // hasRelativeMarker() is what keeps that looseness from reaching product copy.
  function freshenAuto(opts) {
    const requireMarker = !(opts && opts.requireMarker === false);
    const found = [];
    const single = new RegExp(DATE_RE.source, 'i');
    skipped = 0;
    textNodes().forEach((node) => {
      const v = node.nodeValue;
      const m = v && single.exec(v);
      if (!m) return;
      if (requireMarker && !hasRelativeMarker(node)) { skipped++; return; }
      found.push({ target: node, isField: false, days: Number(m[1]) * UNIT_DAYS[m[2].toLowerCase()] });
    });
    fields().forEach((el) => {
      const v = el.value;
      const m = v && single.exec(v);
      if (!m) return;
      // A field value is one string, so the marker must be in the value itself.
      if (requireMarker && !REL_MARKER_RE.test(v)) { skipped++; return; }
      found.push({ target: el, isField: true, days: Number(m[1]) * UNIT_DAYS[m[2].toLowerCase()] });
    });
    if (!found.length) return 0;
    const uniqueDays = Array.from(new Set(found.map((f) => f.days))).sort((a, b) => b - a);
    const ladder = buildLadder(uniqueDays.length);
    const rungFor = {};
    uniqueDays.forEach((d, i) => { rungFor[d] = ladder[i]; });
    found.forEach((f) => {
      const fresh = rungFor[f.days];
      if (f.isField) f.target.value = f.target.value.replace(single, fresh);
      else f.target.nodeValue = f.target.nodeValue.replace(single, fresh);
    });
    return found.length;
  }

  function toGlobalRegex(find) {
    try { return new RegExp(find, 'g'); } catch (e) { return null; }
  }

  const counts = { emails: 0, phones: 0, dates: 0, datesSkipped: 0, custom: 0 };

  if (config.emails !== false) {
    const pattern = typeof config.emails === 'string' ? config.emails : '{first}.{last}@example.com';
    counts.emails = replaceEverywhere(EMAIL_RE, emailReplacer(pattern));
  }

  if (config.phones !== false) {
    const replacement = typeof config.phones === 'string' ? config.phones : '(720) 555-0142';
    counts.phones = replaceEverywhere(PHONE_RE, replacement);
  }

  if (config.freshenDates === false) {
    // skip
  } else if (config.freshenDates === 'auto-all') {
    // Explicit, per-shot opt-in to the pre-2026-08-26 unanchored sweep.
    counts.dates = freshenAuto({ requireMarker: false });
  } else if (config.freshenDates === 'auto' || config.freshenDates === undefined) {
    counts.dates = freshenAuto({ requireMarker: true });
  } else if (Array.isArray(config.freshenDates)) {
    config.freshenDates.forEach((rule) => {
      const re = toGlobalRegex(rule.find);
      if (re) counts.dates += replaceEverywhere(re, rule.replace);
    });
  }

  if (Array.isArray(config.replacements)) {
    config.replacements.forEach((rule) => {
      const re = toGlobalRegex(rule.find);
      if (re) counts.custom += replaceEverywhere(re, rule.replace);
    });
  }

  counts.datesSkipped = skipped;
  return counts;
}

if (typeof module !== 'undefined') module.exports = { sanitize };
