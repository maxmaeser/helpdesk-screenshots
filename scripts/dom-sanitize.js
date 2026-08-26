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
//   names:         false | true | { initials: false },  // real personal names, see below
//   freshenDates:  false | 'auto' | 'auto-all' | [{ find, replace }],
// }
//
// names values:
//   (omitted) / true    Mask every name on the ROSTER below - the real people who
//                       appear in FSAI staging data - plus their initials where the
//                       person is also named in full somewhere on the same page.
//                       ON BY DEFAULT since 2026-08-26: names were never in scope
//                       before that, so every capture showing a user list, an
//                       activity feed, an assignee or an avatar shipped a real
//                       surname to a public repo.
//   { initials: false } Roster names only, leave two-letter avatar chips alone.
//   false               Do not mask names at all.
//
// WHAT NAME MASKING CANNOT DO. The roster is a LIST, not a detector. There is no
// safe way to recognise "this capitalised pair is a person" in a product UI:
// "Brand Standards", "Sales Analytics" and "Send Invites" have the identical
// shape, and a detector that masked them would silently corrupt the product's own
// words in every future capture - the same class of defect as the pre-2026-08-26
// date sweep, which shipped "Invites are valid for 1 week" over the product's
// "7 days". So an unknown real name in seeded data reaches the frame unmasked.
// Two things compensate, and both are mandatory, not optional:
//   1. Put the unknown name in `replacements` for that shot.
//   2. Keep the capture runner's pre-shutter assertion, which reads back
//      document.body.innerText plus every input/textarea value and REFUSES to
//      write the PNG while a forbidden string survives. The roster narrows what
//      you have to think about; the assertion is what actually stops a leak.
// Avatar PHOTOGRAPHS are also PII and are deliberately out of scope here: the
// replacement is the app's own person-glyph fallback markup, which only the shot
// spec knows how to donate. Handle them there, behind an assertDom gate.
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
//                          NOTE this widens WHERE we mask, not what counts as
//                          phone-shaped: a run outside the 10-14 band still needs
//                          a label, because at 9 or 16 digits the shape carries no
//                          information at all and there would be nothing left
//                          separating a phone from an account number.
//   false                  Do not run the bare branch at all.
// Read counts.phonesBareSkipped: non-zero means the page held a phone-shaped
// digit run this branch deliberately left alone - worth an eyeball. It counts
// EVERY declined candidate, including ones declined on length; before 2026-08-26
// those returned early and the count silently under-reported.
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
  // The widths a LABELLED value may take. Shape alone cannot vouch for a run this
  // short or this long - 9 digits is also an account number, 16 is also a card
  // number - so these bounds apply ONLY where hasPhoneContext/fieldHasPhoneContext
  // has already said "this field is a phone number". Inside the strict band above
  // the shape is suggestive enough on its own for `phonesBare: 'all'` to act on it
  // unlabelled; outside it a label is mandatory and there is no escape hatch.
  //
  // Both bounds come from real pages that shipped unmasked, not from theory: a
  // 16-digit value in a <td> under a "Phone" <th>, and a 9-digit labelled number,
  // were each rejected on LENGTH before the context gate was ever consulted, so
  // the column header never got a vote. 17 is the ceiling deliberately - E.164
  // allows 15 digits and a trunk-prefixed international form adds a couple, while
  // 18+ is the ID/accession range that the "never carve a phone out of a long
  // run" test pins down.
  const BARE_PHONE_LABELLED_MIN_DIGITS = 7;
  const BARE_PHONE_LABELLED_MAX_DIGITS = 17;
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
  // 2026-08-26: was 4, one level too shallow for a field CARD. A vendor detail
  // panel renders its value at
  //     div(value) -> div.relative -> div.flex -> div -> div(label + value)
  // so the "Phone" label is only reachable at the FIFTH ancestor - while the same
  // value inside a <table> masked correctly via its <th>, which made it read as a
  // value-specific bug rather than a depth limit. Raising this is safe because the
  // walk is bounded by EVIDENCE, not by depth: it stops at the first ancestor whose
  // text runs past PHONE_CONTEXT_MAX_CHARS, and at the first one wide enough to
  // hold a second phone-shaped value (countPhoneCandidates > 1), where a "Phone"
  // label is a neighbouring row's rather than this value's.
  const PHONE_CONTEXT_LEVELS = 6;
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

  // ---- text RUNS: values split across adjacent text nodes -------------------
  // Until 2026-08-26 every PII pass rewrote ONE text node at a time, so a value
  // split across siblings could never match. That is not a corner case: React
  // renders `{user.first} {user.last}` as three sibling text nodes with an HTML
  // comment between them, so "Creed" / " " / "Smith" is the ordinary shape of a
  // name in this product, and EMAIL_RE, PHONE_RE and every `replacements` rule
  // walked straight past it. freshenDates already coped, by matching the
  // number+unit alone and looking for its "ago" marker in an ancestor; the PII
  // paths had no equivalent.
  //
  // A run is a maximal sequence of text nodes that render as ONE line of text.
  // Two rules decide where a run ends, and both are deliberately conservative,
  // because joining too eagerly is the dangerous direction:
  //   1. A non-inline element (DIV, P, LI, TD, BR ...) ends the run. Two values in
  //      two blocks are two values - a name split across two <td>s stays split,
  //      and that is a documented miss, not an oversight.
  //   2. Crossing an ELEMENT boundary additionally requires whitespace at the
  //      junction. Without this, <span>Email</span><span>a@b.com</span> joins into
  //      "Emaila@b.com" and EMAIL_RE eats the label into the local part, deleting
  //      the word "Email" from the finished screenshot. Text nodes under the SAME
  //      parent are always joined: nothing renders a label glued to its value with
  //      no space, so that shape is a split value, not a label/value pair.
  const INLINE_TAGS = {
    A: 1, ABBR: 1, B: 1, BDI: 1, BDO: 1, CITE: 1, CODE: 1, DATA: 1, DEL: 1, DFN: 1,
    EM: 1, I: 1, INS: 1, KBD: 1, LABEL: 1, MARK: 1, Q: 1, RP: 1, RT: 1, RUBY: 1,
    S: 1, SAMP: 1, SMALL: 1, SPAN: 1, STRONG: 1, SUB: 1, SUP: 1, TIME: 1, U: 1,
    VAR: 1, WBR: 1, FONT: 1, BIG: 1, TT: 1, NOBR: 1, OUTPUT: 1,
  };
  // A run this long is prose, not a field. Capping it bounds the cost of the
  // combined-string rewrite on a page with a very long inline stretch.
  const RUN_MAX_CHARS = 4000;

  function joinable(a, b) {
    if (a.parentNode === b.parentNode) return true;
    return /\s$/.test(a.nodeValue || '') || /^\s/.test(b.nodeValue || '');
  }

  function textRuns() {
    const runs = [];
    let run = [];
    let len = 0;
    function flush() { if (run.length) runs.push(run); run = []; len = 0; }
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let prev = null;
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeType === 1) {
        // The walker reports an element when it ENTERS it, which is exactly when a
        // block boundary starts. Entering an inline element is not a boundary.
        if (!INLINE_TAGS[n.tagName]) { flush(); prev = null; }
        continue;
      }
      if (prev && (!joinable(prev, n) || len > RUN_MAX_CHARS)) flush();
      run.push(n);
      len += (n.nodeValue || '').length;
      prev = n;
    }
    flush();
    return runs;
  }

  // Runs `re` + `replacer` across ONE run as if it were a single string, then
  // writes the result back across the same nodes. A replacement lands entirely in
  // the node that held the START of the match; the rest of the matched span is
  // removed from the nodes that held it. Unmatched text goes back exactly where it
  // came from, so a run with no match is byte-identical and untouched.
  function replaceInRun(nodes, re, replacer) {
    const single = new RegExp(re.source, re.flags.replace('g', ''));
    const fn = typeof replacer === 'function'
      ? replacer
      : function (m) { return String(m).replace(single, replacer); };

    if (nodes.length === 1) {
      const v = nodes[0].nodeValue;
      if (!v) return 0;
      re.lastIndex = 0;
      const m = v.match(re);
      if (!m) return 0;
      re.lastIndex = 0;
      nodes[0].nodeValue = v.replace(re, replacer);
      return m.length;
    }

    const values = nodes.map((n) => n.nodeValue || '');
    const combined = values.join('');
    re.lastIndex = 0;
    if (!re.test(combined)) { re.lastIndex = 0; return 0; }

    const starts = [];
    let acc = 0;
    values.forEach((v) => { starts.push(acc); acc += v.length; });
    const out = values.map(() => '');
    function nodeAt(pos) {
      let i = nodes.length - 1;
      while (i > 0 && starts[i] > pos) i--;
      return i;
    }
    function copy(from, to) {
      for (let k = 0; k < nodes.length; k++) {
        const s = Math.max(from, starts[k]);
        const e = Math.min(to, starts[k] + values[k].length);
        if (e > s) out[k] += combined.slice(s, e);
      }
    }

    let cursor = 0;
    let count = 0;
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(combined)) !== null) {
      if (m[0] === '') { re.lastIndex++; continue; }
      copy(cursor, m.index);
      out[nodeAt(m.index)] += String(fn.apply(null, Array.prototype.slice.call(m).concat([m.index, combined])));
      cursor = m.index + m[0].length;
      count++;
    }
    re.lastIndex = 0;
    copy(cursor, combined.length);
    nodes.forEach((n, k) => { if (values[k] !== out[k]) n.nodeValue = out[k]; });
    return count;
  }

  // Runs `re` (global) + `replacer` against every text node and input/textarea
  // value on the page. Returns the number of individual matches replaced.
  function replaceEverywhere(re, replacer) {
    let count = 0;
    textRuns().forEach((run) => { count += replaceInRun(run, re, replacer); });
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

  // Until 2026-08-26 this PRESERVED the real local part: it documented itself as
  // keeping "a name-ish local part", so max.maeser@franchisesystems.ai became
  // max.maeser@example.com. The domain was hidden and the identity was kept,
  // which for PII is worse than doing nothing - the address LOOKS sanitized, so
  // nobody re-reads it. Two of those shipped to live articles.
  //
  // Now the local part is replaced outright. {first}/{last} still work, but they
  // resolve to the SYNTHETIC identity, never the real one:
  //   - if any token of the real local part is a roster name, that person's fixed
  //     synthetic identity is used, so the address and the display name on the
  //     same page agree and the same person reads the same way in every shot;
  //   - otherwise the address is assigned the next unused name from EMAIL_POOL,
  //     stable per address for the life of the call, so two mentions of one
  //     address do not become two people.
  // An address already on a reserved domain (example.com and friends, RFC 2606)
  // is left EXACTLY as it is: it is already safe, re-masking it would churn
  // previously-cleaned captures, and leaving it makes the pass idempotent.
  const SAFE_EMAIL_DOMAIN_RE = /(?:^|\.)(?:example\.(?:com|org|net)|example|invalid|test|localhost)$/i;
  const EMAIL_POOL = ['alex.rivera', 'sam.okafor', 'robin.ellis', 'dana.reyes', 'priya.raman', 'jamie.fox', 'morgan.diaz', 'kai.lindqvist'];
  const emailAssigned = {};
  let emailPoolIdx = 0;
  let emailsSkipped = 0;

  function emailReplacer(pattern) {
    return function (match) {
      const at = match.indexOf('@');
      if (SAFE_EMAIL_DOMAIN_RE.test(match.slice(at + 1))) { emailsSkipped++; return match; }
      const key = match.toLowerCase();
      if (emailAssigned[key]) return emailAssigned[key];
      // The +tag is dropped before resolution: "max+762134@..." is still Max.
      const tokens = match.slice(0, at).replace(/\+.*$/, '').split(/[._-]+/).filter(Boolean);
      let id = null;
      for (let i = 0; i < tokens.length && !id; i++) id = SURNAME_INDEX[tokens[i].toLowerCase()] || null;
      for (let i = 0; i < tokens.length && !id; i++) id = FIRST_INDEX[tokens[i].toLowerCase()] || null;
      let first;
      let last;
      if (id) {
        first = id.first.toLowerCase();
        last = id.last.toLowerCase();
      } else {
        const n = emailPoolIdx++;
        const pooled = EMAIL_POOL[n % EMAIL_POOL.length].split('.');
        const suffix = n >= EMAIL_POOL.length ? String(Math.floor(n / EMAIL_POOL.length) + 1) : '';
        first = pooled[0];
        last = pooled[1] + suffix;
      }
      const out = pattern.replace(/\{first\}/g, first).replace(/\{last\}/g, last).replace(/[._-]+@/, '@');
      emailAssigned[key] = out;
      return out;
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

    // `contextFn` is a thunk rather than a boolean so the DOM walk runs only for
    // text that actually holds a phone-shaped candidate, and at most once per
    // node. Under `phonesBare: 'all'` an in-band run short-circuits before the
    // thunk is ever called, so the escape hatch stays as cheap as it was.
    function rewrite(text, contextFn) {
      let ctx = null;
      const gated = () => (ctx === null ? (ctx = !!contextFn()) : ctx);
      return text.replace(BARE_PHONE_RE, (match) => {
        const digits = match.replace(/\D/g, '');
        const n = digits.length;
        // Not phone-shaped at ANY confidence level, so not a candidate and not a
        // skip either - counting these would drown the report in page furniture.
        if (n < BARE_PHONE_LABELLED_MIN_DIGITS || n > BARE_PHONE_LABELLED_MAX_DIGITS) return match;
        // This pass runs after PHONE_RE, so the masked value is already on the
        // page. Leave it alone rather than counting it a second time.
        if (digits === replacementDigits) return match;
        // Inside the strict band the shape is suggestive on its own, so 'all' may
        // act on it unlabelled. Outside it only an actual label may vouch.
        const inStrictBand = n >= BARE_PHONE_MIN_DIGITS && n <= BARE_PHONE_MAX_DIGITS;
        const allowed = inStrictBand ? (!requireContext || gated()) : gated();
        // Every declined candidate is counted, whatever declined it. Until
        // 2026-08-26 an over- or under-length run returned above without ever
        // reaching this line, so phonesBareSkipped reported 1-2 while three values
        // were actually left unmasked on the page. A count that under-reports is
        // worse than no count at all, because the capture agent trusts it.
        if (!allowed) { skipped++; return match; }
        replaced++;
        return replacement;
      });
    }

    textNodes().forEach((node) => {
      const v = node.nodeValue;
      if (!v || !/\d/.test(v)) return;
      const next = rewrite(v, () => hasPhoneContext(node));
      if (next !== v) node.nodeValue = next;
    });
    fields().forEach((el) => {
      const v = el.value;
      if (!v || !/\d/.test(v)) return;
      const next = rewrite(v, () => fieldHasPhoneContext(el));
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

  // ---- real personal names -------------------------------------------------
  // THE ROSTER. Each identity is one real person (or one seeded demo account that
  // stands for one) and the synthetic identity that replaces them everywhere.
  // These pairings are FIXED and must not be re-rolled: a reader following an
  // article across six screenshots has to see the same person each time, and a
  // previously-cleaned capture already on GitHub used these exact names.
  const IDENTITIES = {
    avery: { key: 'avery', first: 'Jordan', last: 'Avery', initials: 'JA' },
    chen: { key: 'chen', first: 'Riley', last: 'Chen', initials: 'RC' },
    morgan: { key: 'morgan', first: 'Taylor', last: 'Morgan', initials: 'TM' },
    brooks: { key: 'brooks', first: 'Casey', last: 'Brooks', initials: 'CB' },
    pratt: { key: 'pratt', first: 'Devon', last: 'Pratt', initials: 'DP' },
  };
  // Real surnames, longest-first so "Radin-Grant" wins over "Radin". The
  // near-miss spellings are in the staging seed data as separate accounts for the
  // same people ("Maser", "Raidin", "Minkhorst"), and they identify the person
  // just as well as the correct spelling does.
  const REAL_SURNAMES = [
    ['Radin-Grant', 'morgan'], ['Raidin', 'morgan'], ['Radin', 'morgan'],
    ['Monkhirst', 'brooks'], ['Minkhorst', 'brooks'],
    ['Whiteside', 'pratt'], ['Whiteman', 'pratt'],
    ['Schmidt', 'chen'], ['Schmit', 'chen'],
    ['Maeser', 'avery'], ['Maser', 'avery'],
    ['Mifflin', 'avery'], ['Bratton', 'avery'],
  ];
  // Real first names. Used to resolve a FULL name and an email local part always;
  // used STANDING ALONE only when the name is not also an ordinary UI word.
  const REAL_FIRSTS = [
    ['Maximilian', 'avery'], ['Max', 'avery'], ['Creed', 'avery'], ['Claude', 'avery'],
    ['Joshua', 'morgan'], ['Josh', 'morgan'],
    ['Nathan', 'brooks'],
    ['William', 'chen'], ['Bill', 'chen'],
    ['Jonathan', 'pratt'],
  ];
  // First names that are ALSO ordinary words in this product's UI. Masking these
  // on their own would rewrite the product's copy - "Max file size", "Bill of
  // materials", "Claude Code" - which is the failure mode that matters most here:
  // a stale timestamp is cosmetic, a corrupted sentence is a wrong screenshot
  // that nobody will re-read. They are still masked as part of a full name and
  // still resolve an email local part, where the shape leaves no ambiguity.
  const AMBIGUOUS_FIRSTS = { max: 1, bill: 1, claude: 1, will: 1, grant: 1, art: 1, mark: 1, josh: 1 };
  // Full names whose SURNAME is not itself real, so the surname rules cannot see
  // them. "Smith" is far too common to mask on its own.
  const REAL_FULL_NAMES = [['Creed Smith', 'avery']];

  const SURNAME_INDEX = {};
  REAL_SURNAMES.forEach((e) => { SURNAME_INDEX[e[0].toLowerCase()] = IDENTITIES[e[1]]; });
  const FIRST_INDEX = {};
  REAL_FIRSTS.forEach((e) => { FIRST_INDEX[e[0].toLowerCase()] = IDENTITIES[e[1]]; });

  function reEscape(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  // Letter-only boundaries, not \b, for the same reason PHONE_LABEL_RE uses them:
  // an element's text nodes concatenate with no separator, so a real boundary is
  // often a letter/non-letter transition that \b does not see. They also keep
  // "Maser" out of "Maserati" and let "Maeser's" mask to "Avery's".
  function bounded(body, flags) { return new RegExp('(?<![A-Za-z])(?:' + body + ')(?![A-Za-z])', flags); }
  const SURNAME_ALT = REAL_SURNAMES.map((e) => reEscape(e[0])).join('|');
  const FIRST_ALT = REAL_FIRSTS.filter((e) => !AMBIGUOUS_FIRSTS[e[0].toLowerCase()]).map((e) => reEscape(e[0])).join('|');
  const SPACE = '[ \\t\\u00A0\\u2007\\u202F]{1,3}';

  // "MM" -> the identity it belongs to, filled in only when a FULL name is
  // actually matched on this page. That gate is what makes the initials pass safe:
  // a page with a "MM" cell and nobody named Maeser on it is left alone.
  const initialsSeen = {};

  // ALL CAPS in, ALL CAPS out; all lower in, all lower out; anything else keeps
  // the synthetic name's own capitalisation.
  function applyCase(sample, out) {
    if (/[A-Z]/.test(sample) && !/[a-z]/.test(sample)) return out.toUpperCase();
    if (/[a-z]/.test(sample) && !/[A-Z]/.test(sample)) return out.toLowerCase();
    return out;
  }

  function maskNames(opts) {
    let n = 0;
    const wantInitials = !(opts && opts.initials === false);

    // 1. Explicit full names first, so "Creed Smith" cannot be picked apart into
    //    a bare first name by rule 4 below.
    REAL_FULL_NAMES.forEach((entry) => {
      const id = IDENTITIES[entry[1]];
      const parts = entry[0].split(/\s+/);
      const re = bounded(reEscape(parts[0]) + SPACE + reEscape(parts[1]), 'gi');
      n += replaceEverywhere(re, (m) => {
        initialsSeen[(parts[0][0] + parts[1][0]).toUpperCase()] = id;
        return applyCase(m, id.first + ' ' + id.last);
      });
    });

    // 2. "<Firstname> <RealSurname>" as a unit, whatever the first name is - the
    //    seed data pairs these surnames with a dozen different first names. When
    //    the preceding word is not capitalised it is ordinary prose ("the Maeser
    //    account"), so only the surname is replaced.
    if (SURNAME_ALT) {
      const full = new RegExp('(?<![A-Za-z])([A-Za-z][A-Za-z\'\u2019]{0,20})(' + SPACE + ')(' + SURNAME_ALT + ')(?![A-Za-z])', 'gi');
      n += replaceEverywhere(full, (m, first, sp, sur) => {
        const id = SURNAME_INDEX[sur.toLowerCase()];
        if (!/^[A-Z]/.test(first)) return first + sp + applyCase(sur, id.last);
        initialsSeen[(first[0] + sur[0]).toUpperCase()] = id;
        return applyCase(sur, id.first + ' ' + id.last);
      });

      // 3. A surname standing on its own ("Owner: Maeser", "Radin-Grant Holdings").
      n += replaceEverywhere(bounded(SURNAME_ALT, 'gi'), (m) => applyCase(m, SURNAME_INDEX[m.toLowerCase()].last));
    }

    // 4. A first name standing on its own, but only the unambiguous ones.
    if (FIRST_ALT) {
      n += replaceEverywhere(bounded(FIRST_ALT, 'gi'), (m) => applyCase(m, FIRST_INDEX[m.toLowerCase()].first));
    }

    // 5. Avatar initials, for identities that were actually named on this page.
    //    An avatar chip is its own text node holding exactly two capitals, so an
    //    exact whole-node match is enough and cannot reach into a sentence.
    if (wantInitials) {
      textNodes().forEach((node) => {
        const v = node.nodeValue;
        if (!v) return;
        const t = v.trim();
        if (t.length !== 2 || !/^[A-Z]{2}$/.test(t)) return;
        const id = initialsSeen[t];
        if (!id) return;
        node.nodeValue = v.replace(t, id.initials);
        n++;
      });
    }
    return n;
  }

  const counts = { emails: 0, emailsSkipped: 0, phones: 0, phonesBare: 0, phonesBareSkipped: 0, names: 0, dates: 0, datesSkipped: 0, custom: 0 };

  if (config.emails !== false) {
    const pattern = typeof config.emails === 'string' ? config.emails : '{first}.{last}@example.com';
    counts.emails = replaceEverywhere(EMAIL_RE, emailReplacer(pattern)) - emailsSkipped;
    counts.emailsSkipped = emailsSkipped;
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

  // Names run AFTER emails on purpose. Masking "maeser" first would rewrite the
  // local part of max.maeser@... to max.avery@..., and the email pass would then
  // no longer recognise whose address it is, so the display name and the address
  // on the same page would end up as two different people.
  if (config.names !== false) {
    counts.names = maskNames(typeof config.names === 'object' && config.names ? config.names : {});
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
