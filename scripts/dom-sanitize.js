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
//   phonesBare:    false | 'context' | 'all',  // bare national-format numbers, see below
//   freshenDates:  false | 'auto' | 'auto-all' | [{ find, replace }],
// }
//
// phonesBare values:
//   (omitted) / 'context'  Mask a BARE national-format run (no country code, 10-14
//                          digits) only where the surrounding DOM says "phone" -
//                          a phone-ish label, aria-label, placeholder, name/id,
//                          <input type="tel">, or the matching column header.
//                          This is the safe default.
//   'all'                  Mask every isolated 10-14 digit run on the page,
//                          labelled or not. Masks order numbers, invoice numbers
//                          and epoch timestamps too. Opt in per shot only, and
//                          only when you have checked the frame by eye.
//   false                  Do not run the bare branch at all.
// Read counts.phonesBareSkipped: non-zero means the page held a phone-shaped
// digit run this branch deliberately left alone - worth an eyeball.
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
  // Two SELF-EVIDENT shapes, alternated, matched anywhere on the page because
  // their formatting alone identifies them as a phone number:
  //   NANP  - parens round the area code, or dash/dot/space separators between
  //           all three groups, with an optional leading "1" ("(303) 555-1212",
  //           "303-555-1212", "1 303 555 1212").
  //   INTL  - a leading "+", a 1-3 digit country code, then 8-13 more digits with
  //           optional spaces, dashes or parens ("+43677887711", "+44 20 7946 0958").
  //           Everything with a "+" lands here, including "+1 303-555-1212".
  // Both sit inside digit-adjacency guards, (?<!\d) and (?!\d), rather than \b -
  // \b treats digits and letters as the same "word" class, so it wouldn't stop a
  // phone-shaped chunk from being carved out of a longer bare digit run (an ID, a
  // timestamp, a path segment). The guards require the match to be exactly
  // phone-length and isolated on both sides, so e.g. a 14-digit ID never partially
  // matches. They also fix the original bug where an intl number (no leading "1")
  // only partially matched, leaving a stray prefix fragment ("+4" from
  // "+43677887711") unreplaced.
  //
  // 2026-08-26: NANP used to make every separator optional, so it also swallowed
  // any BARE 10-digit run. That is the exact width of a Unix epoch timestamp
  // (every second from 2001 to 2286), so the sanitizer was quietly masking
  // timestamps and 10-digit IDs in product UI. Bare runs now go through the
  // context-gated branch below instead, where a label has to vouch for them.
  const NANP_PHONE = String.raw`(?:1[-.\s]?)?(?:\(\d{3}\)[-.\s]?\d{3}[-.\s]?\d{4}|\d{3}[-.\s]\d{3}[-.\s]\d{4})`;
  // The (?<![A-Za-z0-9_]) on the "+" is load-bearing. Without it INTL also matched
  // the plus-tag inside an email local part: "max+762134@franchisesystems.ai"
  // became "max(720) 555-0142@example.com", putting a mangled address in the
  // frame. A real international number is never glued to a word character.
  const INTL_PHONE = String.raw`(?<![A-Za-z0-9_])\+\d{1,3}[-.\s]?\(?\d{2,4}\)?(?:[-.\s]?\d{2,4}){1,4}`;
  const PHONE_RE = new RegExp(`(?<!\\d)(?:${INTL_PHONE}|${NANP_PHONE})(?!\\d)`, 'g');

  // ---- bare national-format numbers ---------------------------------------
  // NANP needs formatting and INTL needs a leading "+", so a bare national run
  // with neither - a UK mobile "07717325656", 11 digits, no country code - matched
  // NOTHING and reached the raw unmasked. That shipped: the Phone column of
  // how-to-invite-a-franchisee-to-their-portal/franchisee-banner-portal-access.png
  // went live on the helpdesk with a real mobile in it. Any national format
  // without a country code had the same hole.
  //
  // Shape alone cannot close it. An isolated 10-14 digit run is exactly what an
  // order number, an invoice number, a UUID fragment and an epoch timestamp look
  // like, so matching this shape page-wide would silently mask real product data
  // in every future capture - a quieter and worse failure than the one being
  // fixed. So this branch is CONTEXT-GATED (see hasPhoneContext): it fires only
  // where the surrounding DOM says the value is a phone number. Precision beats
  // recall here - a number this branch misses costs one reshoot, a false positive
  // corrupts every capture from now on. `phonesBare: 'all'` is the escape hatch
  // for a genuinely unlabelled number.
  //
  // The candidate is deliberately wider than a phone (2-6 digits per group, up to
  // 6 groups) and the digit COUNT is checked in the replacer, so an over-long run
  // is consumed whole and then declined rather than having a phone carved out of
  // its middle - the same isolation property the (?<!\d)/(?!\d) guards give the
  // branches above. The [\w-] guards additionally stop a hex/UUID segment from
  // qualifying.
  const BARE_PHONE_RE = /(?<![\w-])\(?\d{2,6}\)?(?:[-.\s]?\(?\d{2,6}\)?){0,5}(?![\w-])/g;
  const BARE_PHONE_MIN_DIGITS = 10;
  const BARE_PHONE_MAX_DIGITS = 14;
  // What counts as "this is a phone field". The boundaries are LETTER-only, not
  // \b: an element's textContent concatenates its text nodes with no separator,
  // so a label/value pair renders as "Phone07717325656" and \b would find no
  // boundary between the label and the digits it is vouching for. Letter-only
  // boundaries still keep "tel" out of "hotel" and "cell" out of "cells".
  const PHONE_LABEL_RE = /(?<![A-Za-z])(?:phones|phone|telephone|mobile|tel|cellphone|cell|fax|whatsapp)(?![A-Za-z])/i;
  // Attributes that name a field. Checked on the element itself, never inherited,
  // so a sibling field in the same form cannot vouch for this one.
  const PHONE_LABEL_ATTRS = ['aria-label', 'aria-labelledby', 'placeholder', 'title', 'name', 'id', 'data-testid', 'data-field', 'data-label', 'autocomplete'];
  // Same bounds as the relative-time gate above, and for the same reason: a label
  // and its value share a small container, so look up a few short levels and stop
  // as soon as an ancestor is big enough to be prose rather than a field row.
  const PHONE_CONTEXT_LEVELS = 4;
  const PHONE_CONTEXT_MAX_CHARS = 160;
  // Separate RegExp object with the same source, used only for counting, so the
  // scan can never share lastIndex with the pass that is rewriting.
  const BARE_PHONE_SCAN_RE = new RegExp(BARE_PHONE_RE.source, 'g');
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

  // True when this element itself is named as a phone field. Attributes only -
  // deliberately NOT inherited from ancestors, so an "Invoice number" input does
  // not get vouched for by a "Mobile" input sitting in the same <form>.
  function elementSaysPhone(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.tagName === 'INPUT' && String(el.getAttribute('type') || '').toLowerCase() === 'tel') return true;
    for (let i = 0; i < PHONE_LABEL_ATTRS.length; i++) {
      const v = el.getAttribute(PHONE_LABEL_ATTRS[i]);
      if (v && PHONE_LABEL_RE.test(v)) return true;
    }
    return false;
  }

  // Table cells get their name from the column header, which is nowhere near them
  // in the tree. Maps the cell's index onto the header row's cell at the same index.
  function columnSaysPhone(el) {
    const cell = el && el.closest ? el.closest('td, th') : null;
    if (!cell) return false;
    const row = cell.parentElement;
    const table = cell.closest('table');
    if (!row || !table) return false;
    const idx = Array.prototype.indexOf.call(row.children, cell);
    const headRow = table.querySelector('thead tr') || table.querySelector('tr');
    if (!headRow || headRow === row) return false;
    const head = headRow.children[idx];
    return !!head && PHONE_LABEL_RE.test(separatedText(head, PHONE_CONTEXT_MAX_CHARS));
  }

  // An element's text with its text nodes kept APART. element.textContent glues
  // adjacent nodes together with no separator, so a label/value pair comes back as
  // "Phone07717325656" - which hides the boundary the label matcher needs AND
  // hides both numbers from the candidate counter (each ends up glued to a letter
  // and fails the [\w-] guard). Joining on a newline restores both. Bails out as
  // soon as it is over `limit`, so this stays cheap on a large subtree.
  function separatedText(el, limit) {
    let out = '';
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const v = n.nodeValue;
      if (!v) continue;
      out += (out ? '\n' : '') + v;
      if (out.length > limit) break;
    }
    return out;
  }

  // How many phone-shaped runs a chunk of text holds. Used to tell "one field row"
  // (a label and its one value) from "a list of rows", where a label in one row
  // must not be allowed to vouch for a number in another.
  function countPhoneCandidates(text) {
    let n = 0;
    String(text).replace(BARE_PHONE_SCAN_RE, (m) => {
      const d = m.replace(/\D/g, '');
      if (d.length >= BARE_PHONE_MIN_DIGITS && d.length <= BARE_PHONE_MAX_DIGITS) n++;
      return m;
    });
    return n;
  }

  // True when this text node sits inside something labelled as a phone number.
  // Checks the node's own text, then walks up PHONE_CONTEXT_LEVELS elements,
  // giving up as soon as an ancestor's text is long enough to be prose rather
  // than a field row (which also stops the word "phone" from elsewhere on the
  // page leaking in), and finally tries the column header.
  function hasPhoneContext(node) {
    if (PHONE_LABEL_RE.test(node.nodeValue || '')) return true;
    const start = node.parentElement || (node.parentNode && node.parentNode.nodeType === 1 ? node.parentNode : null);
    let el = start;
    for (let i = 0; el && i < PHONE_CONTEXT_LEVELS; i++) {
      if (elementSaysPhone(el)) return true;
      const t = separatedText(el, PHONE_CONTEXT_MAX_CHARS);
      if (t.length > PHONE_CONTEXT_MAX_CHARS) break;
      // Stop before an ancestor wide enough to hold a second phone-shaped value:
      // at that point a "Phone" label somewhere inside it is no longer evidence
      // about THIS number, it is a neighbouring row's label.
      if (countPhoneCandidates(t) > 1) break;
      if (PHONE_LABEL_RE.test(t)) return true;
      el = el.parentElement;
    }
    return columnSaysPhone(start);
  }

  // Field values are not in the text tree, so a field is judged on its own
  // attributes, its <label>, its column header, and - for the very common
  // unlabelled case - the text of the smallest container that holds ONLY this
  // field. That last rule is what catches the franchisee panel, where the Phone
  // value is an <input type="text" placeholder="-"> with no aria-label, no name
  // and no id, and the word "Phone" is a sibling div three levels up. The
  // one-field constraint is what keeps it honest: as soon as a container holds a
  // second field the walk stops, so a "Mobile" input cannot vouch for the
  // "Invoice number" input next to it.
  const PHONE_FIELD_LEVELS = 6; // field wrappers nest deeper than text chips
  function fieldHasPhoneContext(el) {
    if (elementSaysPhone(el)) return true;
    const labels = el.labels ? Array.prototype.slice.call(el.labels) : [];
    for (let i = 0; i < labels.length; i++) {
      if (PHONE_LABEL_RE.test(labels[i].textContent || '')) return true;
    }
    const id = el.getAttribute('id');
    if (id) {
      let forLabel = null;
      try { forLabel = document.querySelector(`label[for="${CSS.escape(id)}"]`); } catch (e) { forLabel = null; }
      if (forLabel && PHONE_LABEL_RE.test(forLabel.textContent || '')) return true;
    }
    let node = el.parentElement;
    for (let i = 0; node && i < PHONE_FIELD_LEVELS; i++) {
      if (elementSaysPhone(node)) return true;
      if (node.querySelectorAll('input, textarea').length !== 1) break;
      const t = separatedText(node, PHONE_CONTEXT_MAX_CHARS);
      if (t.length > PHONE_CONTEXT_MAX_CHARS) break;
      if (PHONE_LABEL_RE.test(t)) return true;
      node = node.parentElement;
    }
    return columnSaysPhone(el);
  }

  // The bare-national pass. Reports what it replaced AND what it declined, so a
  // capture agent can see that the page held a phone-shaped run it left alone.
  function replaceBarePhones(replacement, requireContext) {
    const replacementDigits = String(replacement).replace(/\D/g, '');
    let replaced = 0;
    let skipped = 0;

    function rewrite(text, gated) {
      return text.replace(BARE_PHONE_RE, (match) => {
        const digits = match.replace(/\D/g, '');
        if (digits.length < BARE_PHONE_MIN_DIGITS || digits.length > BARE_PHONE_MAX_DIGITS) return match;
        // This pass runs after PHONE_RE, so the masked value is already on the
        // page. Leave it alone rather than counting it a second time.
        if (digits === replacementDigits) return match;
        if (requireContext && !gated) { skipped++; return match; }
        replaced++;
        return replacement;
      });
    }

    textNodes().forEach((node) => {
      const v = node.nodeValue;
      if (!v || !/\d/.test(v)) return;
      const next = rewrite(v, requireContext ? hasPhoneContext(node) : true);
      if (next !== v) node.nodeValue = next;
    });
    fields().forEach((el) => {
      const v = el.value;
      if (!v || !/\d/.test(v)) return;
      const next = rewrite(v, requireContext ? fieldHasPhoneContext(el) : true);
      if (next !== v) el.value = next;
    });
    return { replaced, skipped };
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

  const counts = { emails: 0, phones: 0, phonesBare: 0, phonesBareSkipped: 0, dates: 0, datesSkipped: 0, custom: 0 };

  if (config.emails !== false) {
    const pattern = typeof config.emails === 'string' ? config.emails : '{first}.{last}@example.com';
    counts.emails = replaceEverywhere(EMAIL_RE, emailReplacer(pattern));
  }

  if (config.phones !== false) {
    const replacement = typeof config.phones === 'string' ? config.phones : '(720) 555-0142';
    counts.phones = replaceEverywhere(PHONE_RE, replacement);
    // Bare national-format runs, second, so PHONE_RE has already taken the
    // self-evident shapes and this branch only sees what is left.
    if (config.phonesBare !== false) {
      const bare = replaceBarePhones(replacement, config.phonesBare !== 'all');
      counts.phonesBare = bare.replaced;
      counts.phonesBareSkipped = bare.skipped;
    }
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
