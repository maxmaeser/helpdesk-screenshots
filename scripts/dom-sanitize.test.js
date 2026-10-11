// dom-sanitize.test.js
//
// Regression test for the freshenDates marker gate.
//
// There is no test framework anywhere in this repo (no package.json, no runner),
// so this is a standalone script: zero dependencies beyond the Playwright install
// the capture scripts already use, plain asserts, non-zero exit on failure.
//
//   node scripts/dom-sanitize.test.js
//   PLAYWRIGHT_PATH=/some/other/playwright node scripts/dom-sanitize.test.js
//
// It runs sanitize() through page.evaluate(), which is exactly how captures call
// it, so the DOM walking and the text-node splitting are the real thing rather
// than a stub.
//
// WHY THIS EXISTS
// Until 2026-08-26 freshenDates defaulted to an unanchored sweep: every
// "<n> <unit>" on the page was remapped onto a recency ladder, timestamp or not.
// The how-to-invite-users invite dialog shipped reading "Invites are valid for
// 1 week" when the product and the article both say "7 days". Fixture A below is
// that dialog. Fixture B is the split-sibling activity chip the sweep exists to
// serve, and it must keep working.

const assert = require('assert');
const path = require('path');

// This file runs on two machines and they install Playwright in different
// places, so the path resolves rather than being hard-coded: PLAYWRIGHT_PATH if
// it is set, then Leo's dev-browser install, then the VPS app's node_modules.
// Before 2026-09-17 the default was Leo's path alone, so on the VPS - the
// machine that holds the canonical corpus - the whole suite died on require().
const LEO_PLAYWRIGHT = '/home/max/.dev-browser/node_modules/playwright';
const VPS_PLAYWRIGHT = '/opt/helpdesk-studio/app/node_modules/playwright';
function loadPlaywright() {
  if (process.env.PLAYWRIGHT_PATH) return require(process.env.PLAYWRIGHT_PATH);
  for (const p of [LEO_PLAYWRIGHT, VPS_PLAYWRIGHT]) {
    try { return require(p); } catch (e) { /* try the next machine */ }
  }
  throw new Error(`playwright not found: set PLAYWRIGHT_PATH, or install it at ${LEO_PLAYWRIGHT} (Leo) or ${VPS_PLAYWRIGHT} (VPS)`);
}
const { chromium } = loadPlaywright();
const { sanitize, assertClean } = require(path.join(__dirname, 'dom-sanitize.js'));

// Fake Stripe-shaped fixture, split into parts so secret scanners do not flag it.
const FAKE_SK = 'sk_' + 'live_' + '51H8xQ2KZvNmLpQr7TdYw3Xc9';

// Fixture A: the how-to-invite-users invite dialog. The footer sentence is
// product copy. "7 days" here is a policy, not a timestamp, and must survive.
const INVITE_DIALOG = `
  <div role="dialog" aria-label="Invite users">
    <h2>Invite users</h2>
    <label for="emails">Emails</label>
    <input id="emails" value="team@example.com" />
    <label for="role">Role</label>
    <select id="role"><option>Member</option></select>
    <p class="footnote">Invites are valid for 7 days and the email must match at signup.</p>
    <button>Send invites</button>
  </div>`;

// Fixture B: a members row whose relative-time chip is split across sibling text
// nodes, the shape the sweep was written for. The bullet, the "11 months" and the
// " ago" are three separate text nodes; the marker lives in the parent span.
const ACTIVITY_CHIP = `
  <table><tbody>
    <tr><td>Jonathan Whiteside</td><td><span class="chip">&#12539;11 months ago</span></td></tr>
    <tr><td>Max Maeser</td><td><span class="chip">&#12539;2 months ago</span></td></tr>
    <tr><td>Dana Reyes</td><td><span class="chip">&#12539;3 days ago</span></td></tr>
  </tbody></table>`;

// Fixture C: the other product-copy shapes the old default corrupted, gathered
// from the corpus audit - analytics date-range chips and built-in segment names.
const PRODUCT_COPY = `
  <div class="filters">
    <button class="range">Last 30 days</button>
    <ul class="segments">
      <li>No Activity in 7 Days</li>
      <li>No Activity in 30 Days</li>
      <li>No Activity in 90 Days</li>
    </ul>
  </div>`;

// Fixture D: the franchisee detail panel from
// how-to-invite-a-franchisee-to-their-portal. The Phone column held a real UK
// mobile, 11 bare digits with no country code, which matched neither the NANP
// branch (exactly 10 digits) nor the international branch (needs a leading "+"),
// so it shipped to a live helpdesk article unmasked. The label sits in a sibling
// header cell, which is what the context gate has to find.
const DETAIL_PANEL = `
  <div class="panel">
    <div class="row"><span class="label">Email</span><span class="value">bill.smith@lumonfresh.com</span></div>
    <div class="row"><span class="label">Phone</span><span class="value phone">07717325656</span></div>
  </div>`;

// Fixture E: the numeric product data the widened branch must NOT touch. All
// three are bare digit runs in exactly the length band a phone lives in.
const NUMERIC_DATA = `
  <div class="records">
    <p class="order">Order number 4059283746152</p>
    <p class="epoch">Created 1755691200</p>
    <p class="uuid">Run 550e8400-e29b-41d4-a716-446655440000</p>
    <p class="mixed">Reference 07717325656 in the audit log</p>
  </div>`;

// Fixture F: a phone-typed input and an aria-labelled field, the two other
// shapes the gate recognizes.
const PHONE_FIELDS = `
  <form>
    <label for="mob">Mobile</label>
    <input id="mob" type="tel" value="07717325656" />
    <input aria-label="Contact phone" value="0161 496 0244" />
    <input aria-label="Invoice number" value="4059283746152" />
  </form>`;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

test('default config leaves product copy in the invite dialog alone', async (page) => {
  await page.setContent(INVITE_DIALOG);
  const counts = await page.evaluate(sanitize, {});
  const text = await page.locator('.footnote').innerText();
  assert.strictEqual(text, 'Invites are valid for 7 days and the email must match at signup.',
    `footer was rewritten: ${text}`);
  assert.strictEqual(counts.dates, 0, 'nothing should have been freshened');
  assert.strictEqual(counts.datesSkipped, 1, 'the 7 days should be reported as skipped');
});

test("freshenDates: 'auto' behaves the same as omitting it", async (page) => {
  await page.setContent(INVITE_DIALOG);
  await page.evaluate(sanitize, { freshenDates: 'auto' });
  const text = await page.locator('.footnote').innerText();
  assert.ok(text.includes('7 days'), `footer was rewritten: ${text}`);
});

test("freshenDates: 'auto-all' still reproduces the old corrupting behavior", async (page) => {
  await page.setContent(INVITE_DIALOG);
  const counts = await page.evaluate(sanitize, { freshenDates: 'auto-all' });
  const text = await page.locator('.footnote').innerText();
  assert.ok(!text.includes('7 days'),
    'auto-all is the documented escape hatch and must keep rewriting everything');
  assert.strictEqual(counts.dates, 1);
});

test('split-sibling relative-time chips are still freshened by default', async (page) => {
  await page.setContent(ACTIVITY_CHIP);
  const counts = await page.evaluate(sanitize, {});
  const chips = await page.locator('.chip').allInnerTexts();
  assert.strictEqual(counts.dates, 3, `expected 3 chips freshened, got ${counts.dates}`);
  chips.forEach((c) => {
    assert.ok(/\bago\b/.test(c), `chip lost its "ago": ${c}`);
    assert.ok(!/\b(11 months|2 months|3 days)\b/.test(c), `chip not freshened: ${c}`);
  });
  // Order must be preserved: oldest chip stays the oldest.
  const days = chips.map((c) => {
    const m = /(\d+)\s+(day|days|week|weeks|month|months|year|years)/i.exec(c);
    return Number(m[1]) * { day: 1, days: 1, week: 7, weeks: 7, month: 30, months: 30, year: 365, years: 365 }[m[2].toLowerCase()];
  });
  assert.ok(days[0] > days[1] && days[1] > days[2], `ladder order lost: ${chips.join(' | ')}`);
});

test('a dialog and an activity feed on the same page are handled independently', async (page) => {
  await page.setContent(`<div>${INVITE_DIALOG}${ACTIVITY_CHIP}</div>`);
  const counts = await page.evaluate(sanitize, {});
  const footer = await page.locator('.footnote').innerText();
  assert.ok(footer.includes('7 days'), `footer was rewritten: ${footer}`);
  assert.strictEqual(counts.dates, 3, 'only the three chips should have been freshened');
  assert.strictEqual(counts.datesSkipped, 1);
});

test('date-range chips and segment names survive the default', async (page) => {
  await page.setContent(PRODUCT_COPY);
  const counts = await page.evaluate(sanitize, {});
  const body = await page.locator('body').innerText();
  ['Last 30 days', 'No Activity in 7 Days', 'No Activity in 30 Days', 'No Activity in 90 Days']
    .forEach((s) => assert.ok(body.includes(s), `product copy rewritten, lost: ${s}`));
  assert.strictEqual(counts.dates, 0);
  assert.strictEqual(counts.datesSkipped, 4);
});

test('emails and phones are still sanitized with the gate in place', async (page) => {
  await page.setContent(`<p>Reach jane.doe@realcorp.com on (303) 555-1212.</p>`);
  const counts = await page.evaluate(sanitize, {});
  const body = await page.locator('body').innerText();
  assert.ok(!body.includes('realcorp.com'), 'email not sanitized');
  assert.ok(!body.includes('303'), 'phone not sanitized');
  assert.strictEqual(counts.emails, 1);
  assert.strictEqual(counts.phones, 1);
});

test('a bare national-format phone in a phone-labelled row is masked', async (page) => {
  await page.setContent(DETAIL_PANEL);
  const counts = await page.evaluate(sanitize, {});
  const body = await page.locator('body').innerText();
  assert.ok(!body.includes('07717325656'), `bare national phone survived: ${body}`);
  assert.ok(!body.includes('7717325656'), `partial phone survived: ${body}`);
  assert.strictEqual(counts.phonesBare, 1, 'the bare phone should be counted');
  assert.ok(!body.includes('lumonfresh.com'), 'email not sanitized');
});

test('order numbers, epochs and UUIDs are NOT masked', async (page) => {
  await page.setContent(NUMERIC_DATA);
  const counts = await page.evaluate(sanitize, {});
  const body = await page.locator('body').innerText();
  assert.ok(body.includes('4059283746152'), '13-digit order number was masked');
  assert.ok(body.includes('1755691200'), '10-digit epoch timestamp was masked');
  assert.ok(body.includes('550e8400-e29b-41d4-a716-446655440000'), 'UUID was masked');
  assert.strictEqual(counts.phones, 0, 'nothing here is NANP or international');
  assert.strictEqual(counts.phonesBare, 0, 'no phone context on this page, so nothing should be masked');
});

test('a phone-shaped run with no phone context is left alone and reported', async (page) => {
  await page.setContent(NUMERIC_DATA);
  const counts = await page.evaluate(sanitize, {});
  const body = await page.locator('body').innerText();
  assert.ok(body.includes('07717325656'),
    'unlabelled digit runs are deliberately left alone - precision over recall');
  assert.ok(counts.phonesBareSkipped >= 2,
    `phone-shaped runs should be reported as skipped, got ${counts.phonesBareSkipped}`);
});

test("phonesBare: 'all' is the escape hatch for an unlabelled phone", async (page) => {
  await page.setContent(NUMERIC_DATA);
  const counts = await page.evaluate(sanitize, { phonesBare: 'all' });
  const body = await page.locator('body').innerText();
  assert.ok(!body.includes('07717325656'), 'escape hatch did not mask the phone');
  assert.ok(!body.includes('4059283746152'), "'all' is unanchored by design and masks the order number too");
  assert.strictEqual(counts.phonesBareSkipped, 0);
});

test("phonesBare: false disables the bare branch entirely", async (page) => {
  await page.setContent(DETAIL_PANEL);
  const counts = await page.evaluate(sanitize, { phonesBare: false });
  const body = await page.locator('body').innerText();
  assert.ok(body.includes('07717325656'), 'bare branch should have been off');
  assert.strictEqual(counts.phonesBare, 0);
});

test('tel inputs and aria-labelled phone fields are masked, invoice fields are not', async (page) => {
  await page.setContent(PHONE_FIELDS);
  const counts = await page.evaluate(sanitize, {});
  const values = await page.locator('input').evaluateAll((els) => els.map((e) => e.value));
  assert.ok(!values[0].includes('07717325656'), 'input[type=tel] not masked');
  assert.ok(!values[1].includes('0161'), 'aria-label="Contact phone" field not masked');
  assert.strictEqual(values[2], '4059283746152', 'invoice-number field must not be masked');
  assert.strictEqual(counts.phonesBare, 2);
});

// Fixture G: the franchisee detail panel from the live product. The Phone value is
// an unlabelled <input type="text" placeholder="-">; the word "Phone" is a sibling
// div three levels up, and the card next to it holds a different field entirely.
const PANEL_FIELDS = `
  <div class="grid">
    <div class="card"><div><div class="relative"><input placeholder="-" value="Billy" /></div></div>First Name</div>
    <div class="card"><div><div class="relative"><input placeholder="-" value="4059283746152" /></div></div>Account number</div>
    <div class="card"><div><div class="relative"><input placeholder="-" value="07717325656" /></div></div>Phone</div>
  </div>`;

test('an unlabelled panel input is masked when its own card says Phone', async (page) => {
  await page.setContent(PANEL_FIELDS);
  const counts = await page.evaluate(sanitize, {});
  const values = await page.locator('input').evaluateAll((els) => els.map((e) => e.value));
  assert.strictEqual(values[1], '4059283746152', 'the account-number card must not be masked');
  assert.ok(!values[2].includes('07717325656'), `panel phone input not masked: ${values[2]}`);
  assert.strictEqual(counts.phonesBare, 1);
});

test('the plus-tag in an email local part is not treated as a phone number', async (page) => {
  await page.setContent(`<p class="e">max+762134@realcorp.com</p>`);
  await page.evaluate(sanitize, {});
  const text = await page.locator('.e').innerText();
  assert.ok(!text.includes('555-0142'), `phone replacement leaked into an email: ${text}`);
  assert.ok(text.endsWith('@example.com'), `email not sanitized: ${text}`);
});

test('formatted NANP and +-prefixed international numbers are still masked', async (page) => {
  await page.setContent(`<ul>
      <li>(303) 555-1212</li>
      <li>303-555-1212</li>
      <li>303.555.1212</li>
      <li>1 303 555 1212</li>
      <li>+1 303-555-1212</li>
      <li>+44 20 7946 0958</li>
      <li>+43677887711</li>
    </ul>`);
  const counts = await page.evaluate(sanitize, {});
  const body = await page.locator('body').innerText();
  ['303', '7946', '677887711'].forEach((frag) =>
    assert.ok(!body.includes(frag), `fragment survived: ${frag} in ${body}`));
  assert.strictEqual(counts.phones, 7, `expected 7 classic phone matches, got ${counts.phones}`);
});

// A bare, unformatted 10-digit run used to match NANP page-wide, which is why the
// sanitizer also masked every 10-digit epoch timestamp it saw. It now needs a
// label, exactly like every other bare national run.
test('a bare 10-digit NANP number is masked in phone context and not outside it', async (page) => {
  await page.setContent(`<div>
      <div class="row"><span>Phone</span><span class="p">3035551212</span></div>
      <div class="row"><span>Session id</span><span class="s">3035551212</span></div>
    </div>`);
  const counts = await page.evaluate(sanitize, {});
  assert.ok(!(await page.locator('.p').innerText()).includes('3035551212'), 'labelled bare NANP not masked');
  assert.strictEqual(await page.locator('.s').innerText(), '3035551212', 'unlabelled bare run was masked');
  assert.strictEqual(counts.phones, 0, 'a bare run is no longer a self-evident NANP match');
  assert.strictEqual(counts.phonesBare, 1);
  assert.strictEqual(counts.phonesBareSkipped, 1);
});

test('a long bare digit run is never partially carved into a phone', async (page) => {
  await page.setContent(`<div><span>Phone</span><span>900123456789012345</span></div>`);
  const counts = await page.evaluate(sanitize, {});
  const body = await page.locator('body').innerText();
  assert.ok(body.includes('900123456789012345'),
    `an 18-digit run must survive even inside phone context: ${body}`);
  assert.strictEqual(counts.phonesBare, 0);
});

// Fixture H: the vendor detail card from the live product, the shape that
// defeated PHONE_CONTEXT_LEVELS = 4. The value sits at
// div.value -> div.relative -> div.flex -> div -> div.field, so the "Phone"
// label is only reachable at the FIFTH ancestor. The identical value inside a
// <table> masked correctly via its <th>, which is what made this look like a
// value-specific bug rather than a depth limit.
const VENDOR_CARD = `
  <div class="field">
    <div class="label">Phone</div>
    <div><div class="flex"><div class="relative"><div class="value">07717325656</div></div></div></div>
  </div>`;

// Fixture I: a members table whose Phone column holds runs on both sides of the
// 10-14 digit band - a 16-digit international-with-trunk-prefix value and a
// 9-digit local one. Both were rejected on LENGTH before the context gate was
// ever consulted, so the column header never got to vouch for them. The table is
// deliberately long enough that the ancestor-text walk bails on
// PHONE_CONTEXT_MAX_CHARS and columnSaysPhone() is what does the vouching.
const PHONE_COLUMN = `
  <table>
    <thead><tr><th>Name</th><th>Phone</th><th>Status</th></tr></thead>
    <tbody>
      <tr><td>Dana Reyes</td><td class="over">0044207946095812</td><td>Active</td></tr>
      <tr><td>Priya Raman</td><td class="under">071732565</td><td>Active</td></tr>
      <tr><td>Marcus Webb</td><td class="inband">07717325656</td><td>Awaiting approval</td></tr>
      <tr><td>Alex Okafor</td><td class="p4">07700900123</td><td>Active</td></tr>
      <tr><td>Sam Iyer</td><td class="p5">07700900456</td><td>Active</td></tr>
    </tbody>
  </table>`;

// Fixture J: the product data the WIDENED band must still leave alone. Same
// three shapes as fixture E plus one run on each side of the strict band, so a
// regression that drops the label requirement shows up here rather than in a
// capture six weeks from now.
const WIDENED_SAFETY = `
  <div class="records">
    <p class="epoch">Created 1755691200</p>
    <p class="order">Order number 4059283746152</p>
    <p class="uuid">Run 550e8400-e29b-41d4-a716-446655440000</p>
    <p class="short">Account 071732565 closed</p>
    <p class="long">Batch 0044207946095812 processed</p>
  </div>`;

test('a Phone label five ancestors up still vouches for the value', async (page) => {
  await page.setContent(VENDOR_CARD);
  const counts = await page.evaluate(sanitize, {});
  const value = await page.locator('.value').innerText();
  assert.ok(!value.includes('07717325656'),
    `vendor-card phone survived - the label is 5 ancestors up: ${value}`);
  assert.strictEqual(counts.phonesBare, 1);
  assert.strictEqual(counts.phonesBareSkipped, 0);
});

test('an over-length value under a Phone column header is masked', async (page) => {
  await page.setContent(PHONE_COLUMN);
  await page.evaluate(sanitize, {});
  const over = await page.locator('.over').innerText();
  assert.ok(!over.includes('0044207946095812'),
    `16-digit value under a Phone header survived: ${over}`);
  assert.ok(!over.includes('20794609'), `partial phone survived: ${over}`);
});

test('an under-length value under a Phone column header is masked', async (page) => {
  await page.setContent(PHONE_COLUMN);
  const counts = await page.evaluate(sanitize, {});
  const under = await page.locator('.under').innerText();
  assert.ok(!under.includes('071732565'),
    `9-digit value under a Phone header survived: ${under}`);
  assert.strictEqual(counts.phonesBare, 5, 'every cell in the Phone column should be masked');
  assert.strictEqual(counts.phonesBareSkipped, 0);
});

test('the widened band still leaves unlabelled product data alone, and COUNTS it', async (page) => {
  await page.setContent(WIDENED_SAFETY);
  const counts = await page.evaluate(sanitize, {});
  const body = await page.locator('body').innerText();
  assert.ok(body.includes('1755691200'), '10-digit epoch timestamp was masked');
  assert.ok(body.includes('4059283746152'), '13-digit order number was masked');
  assert.ok(body.includes('550e8400-e29b-41d4-a716-446655440000'), 'UUID fragment was masked');
  assert.ok(body.includes('071732565'), '9-digit run was masked with no phone context');
  assert.ok(body.includes('0044207946095812'), '16-digit run was masked with no phone context');
  assert.strictEqual(counts.phonesBare, 0);
  // The accounting bug: over- and under-length candidates used to return BEFORE
  // skipped++, so this reported 2 while four runs were actually left alone. A
  // count that under-reports is worse than no count - the capture agent trusts it.
  assert.strictEqual(counts.phonesBareSkipped, 4,
    `all four phone-shaped runs must be reported as skipped, got ${counts.phonesBareSkipped}`);
});

test("phonesBare: 'all' widens WHERE we mask, not what counts as phone-shaped", async (page) => {
  await page.setContent(WIDENED_SAFETY);
  const counts = await page.evaluate(sanitize, { phonesBare: 'all' });
  const body = await page.locator('body').innerText();
  assert.ok(!body.includes('1755691200'), "'all' is unanchored and masks the epoch");
  assert.ok(!body.includes('4059283746152'), "'all' is unanchored and masks the order number");
  assert.ok(body.includes('071732565'),
    'outside the strict band a label must vouch, even under the escape hatch');
  assert.ok(body.includes('0044207946095812'),
    'outside the strict band a label must vouch, even under the escape hatch');
  assert.strictEqual(counts.phonesBare, 2);
  assert.strictEqual(counts.phonesBareSkipped, 2);
});

// ===========================================================================
// NAME MASKING + SPLIT-SIBLING VALUES (added 2026-08-26)
//
// WHY THESE EXIST
// 1. Names were never in scope for this sanitizer. Every capture that showed a
//    user list, an activity feed, an assignee or an avatar shipped a real
//    surname to a public GitHub repo. 06-locations/locations-detail.png showed
//    one name five times.
// 2. emailReplacer deliberately PRESERVED a name-ish local part, so
//    max.maeser@franchisesystems.ai became max.maeser@example.com - the domain
//    was hidden and the identity was kept. For PII that is worse than useless.
// 3. replaceEverywhere rewrote one text node at a time, so any value split
//    across adjacent text nodes - the shape React produces for
//    {first} {last} - could never match. freshenDates already handled split
//    siblings; the PII paths did not.
// ===========================================================================

// Every real token that must never survive a default sanitize.
const REAL_TOKENS = [
  'Maeser', 'Radin-Grant', 'Monkhirst', 'Whiteside', 'Schmit', 'Schmidt',
  'Mifflin', 'Bratton', 'Max Maeser', 'Creed Smith', 'Bill Schmit',
  'Joshua Radin-Grant', 'Nathan Monkhirst', 'maeser',
];

// Fixture K: the surfaces that actually leaked - an assignee chip, an activity
// feed, a bare surname and the signed-in user's real address.
const NAME_SURFACES = `
  <div class="app">
    <div class="assignee"><span class="alabel">Assigned Brand Representative</span><span class="who">Max Maeser</span></div>
    <ul class="feed">
      <li class="f1">Max Maeser changed the status to Active</li>
      <li class="f2">Creed Smith uploaded Store Photos.pdf</li>
      <li class="f3">Joshua Radin-Grant approved the request</li>
      <li class="f4">Nathan Monkhirst left a comment</li>
      <li class="f5">Bill Schmit invited a franchisee</li>
      <li class="f6">Jonathan Whiteside signed in</li>
    </ul>
    <p class="bare">Owner: Maeser</p>
    <p class="mail">max.maeser@franchisesystems.ai</p>
  </div>`;

// Fixture L: values split across ADJACENT TEXT NODES. The <!-- --> separators
// are exactly what React emits between two interpolated expressions, so r1 is
// three sibling text nodes under one parent: "Creed", " ", "Smith". r2 and r3
// split across inline elements instead, with the space its own text node.
const SPLIT_VALUES = `
  <div class="feed">
    <div class="r1">Creed<!-- --> <!-- -->Smith commented on the task</div>
    <div class="r2"><span>Nathan</span> <span>Monkhirst</span> approved</div>
    <div class="r3">Reported by <b>Max</b> <b>Maeser</b></div>
    <p class="se">max.maeser<!-- -->@<!-- -->franchisesystems.ai</p>
    <p class="sp">(303)<!-- --> <!-- -->555-1212</p>
    <p class="sc">Lumon<!-- --> <!-- -->Fresh Hotchkiss</p>
  </div>`;

// Fixture M: product copy that shares words with the roster, plus the numeric
// shapes the phone branches must keep their hands off. Widening WHAT gets
// masked is exactly how a sanitizer starts corrupting the product, so every one
// of these has to come back byte-identical.
const PRODUCT_NOUNS = `
  <div class="copy">
    <p class="p1">Max file size is 25 MB</p>
    <p class="p2">Grant access to the vendor portal</p>
    <p class="p3">Bill of materials</p>
    <p class="p4">Billing and invoices</p>
    <p class="p5">Smith and Sons Plumbing is an approved vendor</p>
    <p class="p6">Order number 4059283746152</p>
    <p class="p7">Created 1755691200</p>
    <p class="p8">Run 550e8400-e29b-41d4-a716-446655440000</p>
    <p class="p9">Brand Standards</p>
    <p class="p10">Claude Code integration</p>
    <p class="p11">Franchise Systems AI</p>
  </div>`;

// Fixture N: a label and its value in two SEPARATE inline elements with no
// whitespace at the junction. element.textContent glues these into
// "Emailjane.doe@realcorp.com", and a run-joiner that is too eager will let
// EMAIL_RE swallow the label into the local part and delete it from the frame.
const LABEL_VALUE = `
  <div class="row"><span class="lab">Email</span><span class="val">jane.doe@realcorp.com</span></div>`;

// Fixture O: adjacent table cells. Joining ACROSS a block boundary is not safe
// (the next cell is a different field), so a name split over two <td>s is a
// documented miss - but a distinctive first name still gets masked on its own.
const CELL_SPLIT = `
  <table><tbody><tr><td class="c1">Creed</td><td class="c2">Smith</td></tr></tbody></table>`;

test('real names are masked by default', async (page) => {
  await page.setContent(NAME_SURFACES);
  const counts = await page.evaluate(sanitize, {});
  const body = await page.locator('body').innerText();
  REAL_TOKENS.forEach((t) =>
    assert.ok(!body.includes(t), `real name survived a default sanitize: ${t}\n${body}`));
  assert.ok(counts.names >= 7, `expected at least 7 name replacements, got ${counts.names}`);
  assert.ok(/\w+\s\w+/.test(await page.locator('.who').innerText()),
    'the assignee chip should still read as a person, not as a redaction');
});

test('the assignee label is not eaten when the name next to it is masked', async (page) => {
  await page.setContent(NAME_SURFACES);
  await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.alabel').innerText(), 'Assigned Brand Representative');
});

test('a masked email no longer carries the real name in its local part', async (page) => {
  await page.setContent(NAME_SURFACES);
  await page.evaluate(sanitize, {});
  const mail = await page.locator('.mail').innerText();
  assert.ok(!/maeser/i.test(mail), `the local part still carries the real surname: ${mail}`);
  assert.ok(!/\bmax\b/i.test(mail), `the local part still carries the real first name: ${mail}`);
  assert.ok(/^[a-z0-9._-]+@example\.com$/.test(mail), `not a plausible masked address: ${mail}`);
});

test('one person maps to one synthetic identity across name and email', async (page) => {
  await page.setContent(`<div>
      <div class="row"><p class="n">Max Maeser</p>
      <p class="e">max.maeser@franchisesystems.ai</p></div>
      <p class="e2">creed.smith@franchisesystems.ai</p>
    </div>`);
  await page.evaluate(sanitize, {});
  const name = await page.locator('.n').innerText();
  const mail = await page.locator('.e').innerText();
  const mail2 = await page.locator('.e2').innerText();
  const local = mail.slice(0, mail.indexOf('@')).split(/[._-]/);
  assert.ok(name.toLowerCase().includes(local[0]) && name.toLowerCase().includes(local[1]),
    `the masked name ${name} and the masked address ${mail} are different people`);
  assert.notStrictEqual(mail2, mail, 'different real addresses must get different identities');
});

test('a name split across sibling text nodes is masked', async (page) => {
  await page.setContent(SPLIT_VALUES);
  await page.evaluate(sanitize, {});
  const r1 = await page.locator('.r1').innerText();
  const r2 = await page.locator('.r2').innerText();
  const r3 = await page.locator('.r3').innerText();
  assert.ok(!r1.includes('Creed Smith'), `split sibling name survived: ${r1}`);
  assert.ok(!r2.includes('Monkhirst'), `name split across inline elements survived: ${r2}`);
  assert.ok(!r3.includes('Maeser'), `name split across inline elements survived: ${r3}`);
});

test('an email split across sibling text nodes is masked', async (page) => {
  await page.setContent(SPLIT_VALUES);
  const counts = await page.evaluate(sanitize, {});
  const se = await page.locator('.se').innerText();
  assert.ok(!se.includes('franchisesystems.ai'), `split email survived: ${se}`);
  assert.ok(!/maeser/i.test(se), `split email kept the real identity: ${se}`);
  assert.ok(counts.emails >= 1, `split email was not counted: ${counts.emails}`);
});

test('a phone split across sibling text nodes is masked', async (page) => {
  await page.setContent(SPLIT_VALUES);
  const counts = await page.evaluate(sanitize, {});
  const sp = await page.locator('.sp').innerText();
  assert.ok(!sp.includes('303'), `split phone survived: ${sp}`);
  assert.ok(!sp.includes('555-1212'), `split phone survived: ${sp}`);
  assert.strictEqual(counts.phones, 1, `split phone was not counted once: ${counts.phones}`);
});

test('a custom replacement matches across sibling text nodes', async (page) => {
  await page.setContent(SPLIT_VALUES);
  const counts = await page.evaluate(sanitize, {
    replacements: [{ find: 'Lumon Fresh', replace: 'Acme Foods' }],
  });
  const sc = await page.locator('.sc').innerText();
  assert.ok(sc.includes('Acme Foods'), `split custom value not replaced: ${sc}`);
  assert.ok(!sc.includes('Lumon'), `split custom value survived: ${sc}`);
  assert.strictEqual(counts.custom, 1);
});

test('a label in its own element is never joined into the value next to it', async (page) => {
  await page.setContent(LABEL_VALUE);
  await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.lab').innerText(), 'Email',
    'the label was swallowed into the email local part');
  const val = await page.locator('.val').innerText();
  assert.ok(!val.includes('realcorp.com'), `email not sanitized: ${val}`);
  assert.ok(!/^Email/.test(val), `the label leaked into the masked value: ${val}`);
});

test('adjacent table cells are not joined, but a distinctive first name still masks', async (page) => {
  await page.setContent(CELL_SPLIT);
  await page.evaluate(sanitize, {});
  assert.notStrictEqual(await page.locator('.c1').innerText(), 'Creed',
    'a roster first name standing alone should still be masked');
  assert.strictEqual(await page.locator('.c2').innerText(), 'Smith',
    'Smith is too common to mask on its own - joining across a <td> is a documented miss');
});

test('ordinary product copy and numeric data survive name masking', async (page) => {
  await page.setContent(PRODUCT_NOUNS);
  const counts = await page.evaluate(sanitize, {});
  const body = await page.locator('body').innerText();
  [
    'Max file size is 25 MB',
    'Grant access to the vendor portal',
    'Bill of materials',
    'Billing and invoices',
    'Smith and Sons Plumbing is an approved vendor',
    'Order number 4059283746152',
    'Created 1755691200',
    '550e8400-e29b-41d4-a716-446655440000',
    'Brand Standards',
    'Claude Code integration',
    'Franchise Systems AI',
  ].forEach((s) => assert.ok(body.includes(s), `product copy was corrupted, lost: ${s}\n${body}`));
  assert.strictEqual(counts.names, 0, 'nothing on this page is a real name');
  assert.strictEqual(counts.phonesBare, 0);
});

test('names: false disables name masking', async (page) => {
  await page.setContent(NAME_SURFACES);
  const counts = await page.evaluate(sanitize, { names: false });
  const body = await page.locator('body').innerText();
  assert.ok(body.includes('Max Maeser'), 'names: false should have left the page alone');
  assert.strictEqual(counts.names, 0);
});

test('a real name the roster does not know is NOT masked - the roster is a list, not a detector', async (page) => {
  await page.setContent(`<li class="u">Priya Ramaswamy commented on the task</li>`);
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.u').innerText(), 'Priya Ramaswamy commented on the task',
    'this documents the limit: an unknown name in seeded data reaches the frame');
  assert.strictEqual(counts.names, 0);
});

test('replacements is the escape hatch for a name the roster does not know', async (page) => {
  await page.setContent(`<li class="u">Priya Ramaswamy commented on the task</li>`);
  const counts = await page.evaluate(sanitize, {
    replacements: [{ find: 'Priya Ramaswamy', replace: 'Robin Ellis' }],
  });
  assert.strictEqual(await page.locator('.u').innerText(), 'Robin Ellis commented on the task');
  assert.strictEqual(counts.custom, 1);
});

test('avatar initials are masked when the person is named on the same page', async (page) => {
  await page.setContent(`<div><span class="av">MM</span><span class="nm">Max Maeser</span></div>`);
  await page.evaluate(sanitize, {});
  const av = await page.locator('.av').innerText();
  const nm = await page.locator('.nm').innerText();
  assert.notStrictEqual(av, 'MM', 'the avatar still carries the real initials');
  assert.strictEqual(av, nm.split(/\s+/).map((w) => w[0]).join(''),
    `initials ${av} do not match the masked name ${nm}`);
});

test('a two-letter cell is left alone when nobody on the page is named', async (page) => {
  await page.setContent(`<table><tr><td class="unit">MM</td><td>Depth</td></tr></table>`);
  await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.unit').innerText(), 'MM',
    'initials are only masked for an identity actually found on the page');
});

test('an address already at example.com is left exactly as it is', async (page) => {
  await page.setContent(`<p class="safe">team@example.com</p>`);
  await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.safe').innerText(), 'team@example.com',
    'a reserved-domain address is already safe and must not churn');
});


test('a bare ambiguous first name is masked when it is the whole node', async (page) => {
  await page.setContent(`<div class="team">
      <div class="m1">Creed</div><div class="m2">Max</div><div class="m3">Bill</div>
    </div>`);
  const counts = await page.evaluate(sanitize, {});
  assert.notStrictEqual(await page.locator('.m2').innerText(), 'Max',
    'a team card renders members as bare first names - masking one and not the next is a leak');
  assert.notStrictEqual(await page.locator('.m3').innerText(), 'Bill');
  assert.notStrictEqual(await page.locator('.m1').innerText(), 'Creed');
  assert.strictEqual(counts.names, 3);
});

test('an ambiguous first name inside a sentence still survives', async (page) => {
  await page.setContent(`<div>
      <p class="s1">Max file size is 25 MB</p>
      <p class="s2">Bill of materials</p>
      <p class="s3">Claude Code integration</p>
      <p class="s4">Grant access to the vendor portal</p>
    </div>`);
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.s1').innerText(), 'Max file size is 25 MB');
  assert.strictEqual(await page.locator('.s2').innerText(), 'Bill of materials');
  assert.strictEqual(await page.locator('.s3').innerText(), 'Claude Code integration');
  assert.strictEqual(await page.locator('.s4').innerText(), 'Grant access to the vendor portal');
  assert.strictEqual(counts.names, 0);
});

test('a bare Josh is masked - it is a real handle in this data, not a verb', async (page) => {
  await page.setContent(`<p class="c">Any word on that Josh?</p>`);
  const counts = await page.evaluate(sanitize, {});
  const t = await page.locator('.c').innerText();
  assert.ok(!/Josh/.test(t), `real handle survived in a chat bubble: ${t}`);
  assert.strictEqual(counts.names, 1);
});


test('an umlaut spelling of a roster surname is masked', async (page) => {
  await page.setContent(`<div>
      <p class="a">Maximilian M\u00e4ser -- Demo</p>
      <p class="b">M\u00e4ser -- Demo</p>
    </div>`);
  await page.evaluate(sanitize, {});
  const a = await page.locator('.a').innerText();
  const b = await page.locator('.b').innerText();
  assert.ok(!/M\u00e4ser/.test(a), `half-masked: first name gone, surname intact: ${a}`);
  assert.ok(!/M\u00e4ser/.test(b), `bare umlaut surname survived: ${b}`);
});

test('a QA account with its last letter held down is still the same person', async (page) => {
  await page.setContent(`<ul>
      <li class="n">Nathannn Test QAaaa</li>
      <li class="j">Joshuaaaaaa Radin-Grant</li>
    </ul>`);
  await page.evaluate(sanitize, {});
  const n = await page.locator('.n').innerText();
  const j = await page.locator('.j').innerText();
  assert.ok(!/Nathan/.test(n), `stuttered first name survived: ${n}`);
  assert.ok(!/Joshua|Radin/.test(j), `stuttered first name survived: ${j}`);
});

test('the stutter rule does not eat an ordinary word', async (page) => {
  await page.setContent(`<div>
      <p class="p1">Nathan Hale Elementary</p>
      <p class="p2">Creedence</p>
      <p class="p3">Joshua Tree National Park</p>
    </div>`);
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.p2').innerText(), 'Creedence',
    'a longer word that merely starts with a roster name must survive');
  assert.ok(counts.names >= 2, 'the two real first names should still be masked');
});


test('a profile URL that glues the first name to the surname is masked', async (page) => {
  await page.setContent(`<div>
      <p class="u">https://www.linkedin.com/in/maxmaeser/</p>
      <input class="f" value="https://www.linkedin.com/in/maxmaeser/" />
      <p class="h">@claudemaeser</p>
    </div>`);
  await page.evaluate(sanitize, {});
  const u = await page.locator('.u').innerText();
  const f = await page.locator('.f').inputValue();
  const h = await page.locator('.h').innerText();
  assert.ok(!/maeser/i.test(u), `a real profile URL survived in text: ${u}`);
  assert.ok(!/maeser/i.test(f), `a real profile URL survived in a field value: ${f}`);
  assert.ok(!/maeser/i.test(h), `a real handle survived: ${h}`);
  assert.ok(/linkedin\.com\/in\//.test(u), `the URL should still read as a profile URL: ${u}`);
});

test('gluing does not invent a match out of ordinary text', async (page) => {
  await page.setContent(`<div>
      <p class="p1">Maximise your billable hours</p>
      <p class="p2">Grantham Road</p>
      <p class="p3">Maserati dealership</p>
    </div>`);
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.p1').innerText(), 'Maximise your billable hours');
  assert.strictEqual(await page.locator('.p2').innerText(), 'Grantham Road');
  assert.strictEqual(await page.locator('.p3').innerText(), 'Maserati dealership');
  assert.strictEqual(counts.names, 0);
});


test('a surname with its last letter held down is masked too', async (page) => {
  await page.setContent(`<ul>
      <li class="a">Joshuaaaaaa Raidinnn</li>
      <li class="b">Raidinnn</li>
      <li class="c">Maeserr</li>
    </ul>`);
  await page.evaluate(sanitize, {});
  const a = await page.locator('.a').innerText();
  assert.ok(!/Raidin/i.test(a), `half-masked - first name replaced, real surname left: ${a}`);
  assert.ok(!/Raidin/i.test(await page.locator('.b').innerText()));
  assert.ok(!/Maeser/i.test(await page.locator('.c').innerText()));
});


test('a same-origin iframe is sanitized too', async (page) => {
  await page.setContent(`<div>
      <h3 class="subj">Maximilian welcome to our Fast-Track Program</h3>
      <iframe class="prev" srcdoc="&lt;p id=body&gt;Hi Maximilian, Max Maeser will be in touch. max.maeser@franchisesystems.ai&lt;/p&gt;"></iframe>
    </div>`);
  await page.waitForTimeout(300);
  const counts = await page.evaluate(sanitize, {});
  const subj = await page.locator('.subj').innerText();
  const body = await page.frameLocator('.prev').locator('#body').innerText();
  assert.ok(!/Maximilian/.test(subj), `subject not masked: ${subj}`);
  assert.ok(!/Maximilian/.test(body),
    `an email preview renders in an iframe - the walker used to stop at the frame boundary: ${body}`);
  assert.ok(!/Maeser/i.test(body), `real name survived inside the frame: ${body}`);
  assert.ok(!/franchisesystems/i.test(body), `real address survived inside the frame: ${body}`);
  assert.ok(counts.names >= 2, `frame replacements should be counted: ${counts.names}`);
});

test('a cross-origin frame is skipped without throwing', async (page) => {
  await page.setContent(`<div>
      <p class="t">Max Maeser</p>
      <iframe class="x" src="https://example.com/"></iframe>
    </div>`);
  await page.waitForTimeout(500);
  const counts = await page.evaluate(sanitize, {});
  assert.ok(!/Maeser/.test(await page.locator('.t').innerText()),
    'the top document must still be sanitized when a frame is unreachable');
  assert.ok(counts.names >= 1);
});


test('the three real accounts found in the 2026-08-26 reshoot are masked', async (page) => {
  await page.setContent(`<ul>
      <li class="a">Erin Hooper</li>
      <li class="b">Jake Skousen</li>
      <li class="c">Billy Smith</li>
      <li class="d">Bill Smith</li>
      <li class="e">erin@franchisesystems.ai</li>
      <li class="f">Hooper</li>
    </ul>`);
  const counts = await page.evaluate(sanitize, {});
  const body = await page.locator('body').innerText();
  ['Hooper', 'Skousen', 'Billy Smith', 'Bill Smith', 'franchisesystems']
    .forEach((s) => assert.ok(!body.includes(s), `real account survived: ${s}\n${body}`));
  assert.ok(counts.names >= 5);
});

test('a split name cell cannot leave a real surname beside a synthetic first name', async (page) => {
  // An avatar cell renders the two halves as separate table cells, which the
  // run-joiner deliberately will not join. The first half masks on its own, and
  // without this rule the result reads "Riley Smith" - synthetic first name,
  // real surname, and a frame that looks handled.
  await page.setContent(`<table><tr><td class="f">Bill</td><td class="l">Smith</td></tr></table>
    <p class="j">Riley Smith</p>`);
  await page.evaluate(sanitize, {});
  assert.ok(!/Smith/.test(await page.locator('.j').innerText()),
    'the hybrid must not survive');
});

// 2026-10-11 Sales capture regressions.
test('Sanad Mashgari shares one roster identity across the lead list and panel', async (page) => {
  await page.setContent(`<table><thead><tr><th>Name</th><th>Email</th></tr></thead><tbody>
    <tr><td class="list">Sanad Mashgari</td><td class="email">lead@realcorp.com</td></tr>
    </tbody></table><h2 data-testid="lead-title" class="panel">Sanad Mashgari</h2>`);
  await page.evaluate(sanitize, {});
  const name = await page.locator('.list').innerText();
  assert.strictEqual(name, 'Jordan Avery');
  assert.strictEqual(await page.locator('.panel').innerText(), name);
  assertPair({ name, email: await page.locator('.email').innerText() });
  assert.deepStrictEqual(await assertClean(page, {}), []);
});

test('Max Zeno and unknown names in person fields use distinct roster identities', async (page) => {
  await page.setContent(`<div role="grid"><div role="row"><span role="columnheader">Lead</span></div>
    <div role="row"><span role="gridcell" class="max">Max<!-- --> Zeno</span></div></div>
    <h2 data-testid="lead-title" class="title">Max Zeno</h2>
    <span data-slot="avatar-label" class="other">Priya Ramaswamy</span>
    <span data-testid="account-name" class="account">Aisha Okafor</span>`);
  await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.max').innerText(), 'Jordan Avery');
  assert.strictEqual(await page.locator('.title').innerText(), 'Jordan Avery');
  assert.strictEqual(await page.locator('.other').innerText(), 'Riley Chen');
  assert.strictEqual(await page.locator('.account').innerText(), 'Taylor Morgan');
});

test('ellipsis gari in a blurred name cell reuses the full lead identity', async (page) => {
  await page.setContent(`<div style="filter:blur(3px)"><table><thead><tr><th>Name</th></tr></thead>
    <tbody><tr><td class="fragment">...gari</td></tr></tbody></table></div>
    <div role="dialog"><h2 data-testid="lead-title" class="full">Sanad Mashgari</h2></div>`);
  await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.full').innerText(), 'Jordan Avery');
  assert.strictEqual(await page.locator('.fragment').innerText(), 'avery');
  assert.ok(!/gari/i.test(await page.locator('body').innerText()));
});

test('known names and ellipsis surname fragments mask without DOM labels', async (page) => {
  await page.setContent('<p>...gari</p><p>Sanad Mashgari</p><p>Max Zeno</p>');
  await page.evaluate(sanitize, {});
  assert.deepStrictEqual(await page.locator('p').allInnerTexts(), ['avery', 'Jordan Avery', 'Riley Chen']);
});

test('Claude Maeser and a bare Maeser in the account menu are masked', async (page) => {
  await page.setContent(`<div role="menu"><p class="full">Claude<!-- --> <span>Maeser</span></p>
    <p class="last">Maeser</p><button>Account Settings</button></div>`);
  await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.full').innerText(), 'Jordan Avery');
  assert.strictEqual(await page.locator('.last').innerText(), 'Avery');
  assert.strictEqual(await page.locator('button').innerText(), 'Account Settings');
});

test('status labels brands headers and buttons survive person context detection', async (page) => {
  const html = `<table><thead><tr><th>Name</th><th>Status</th><th>Brand</th></tr></thead><tbody>
    <tr><td><span role="status">In Progress</span><button>Send Invites</button></td>
    <td>Qualified</td><td>Lumon Cafe</td></tr><tr><td>Lumon Cafe</td><td>Active</td><td>Lumon Cafe</td></tr>
    </tbody></table><div role="dialog"><h2>Brand Standards</h2></div>`;
  await page.setContent(html);
  const before = await page.locator('body').innerText();
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('body').innerText(), before);
  assert.strictEqual(counts.names, 0);
});

test('all roster names including numbered identities survive repeated contextual masking', async (page) => {
  const names = ['Jordan Avery', 'Riley Chen', 'Taylor Morgan', 'Casey Brooks', 'Devon Pratt',
    'Sam Rivera', 'Morgan Ellis', 'Emery Vance', 'Quinn Delaney', 'Jordan Avery2'];
  await page.setContent(names.map((name) => `<p data-field="name">${name}</p>`).join('') +
    '<h2 data-testid="lead-title">Max Zeno</h2>');
  await page.evaluate(sanitize, {});
  assert.deepStrictEqual(await page.locator('p').allInnerTexts(), names);
  const once = await page.locator('body').innerText();
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('body').innerText(), once);
  assert.strictEqual(counts.names, 0);
});

test('assertClean rejects an unknown person field before masking', async (page) => {
  await page.setContent('<h2 data-testid="lead-title">Priya Ramaswamy</h2>');
  await assert.rejects(() => assertClean(page, {}), /pre-shutter assertion failed/);
  await page.evaluate(sanitize, {});
  assert.deepStrictEqual(await assertClean(page, {}), []);
});

// Person identity regressions: the row email wins over address/name tokens.
function memberRow(name, email) {
  return `<div class="row"><span class="name">${name}</span><span class="email">${email}</span></div>`;
}
async function readPeople(page) {
  return page.locator('.row').evaluateAll((rows) => rows.map((row) => ({
    name: row.querySelector('.name').textContent,
    email: row.querySelector('.email').textContent,
  })));
}
function assertPair(person) {
  assert.strictEqual(person.email, person.name.toLowerCase().replace(/\s+/g, '.') + '@example.com');
}

test('row name and email match even when the address suggests a different roster person', async (page) => {
  await page.setContent(memberRow('Dennis Teser', 'bill.schmit@realcorp.com'));
  await page.evaluate(sanitize, {});
  const [person] = await readPeople(page);
  assertPair(person);
  assert.strictEqual(person.name, 'Jordan Avery', 'first person gets first roster entry');
});

test('different real people formerly sharing a roster entry get distinct names', async (page) => {
  await page.setContent(memberRow('Max Maeser', 'max@realcorp.com') +
    memberRow('Dunder Mifflin', 'dunder@realcorp.com') + memberRow('Creed Bratton', 'creed@realcorp.com'));
  await page.evaluate(sanitize, {});
  const people = await readPeople(page);
  people.forEach(assertPair);
  assert.strictEqual(new Set(people.map((p) => p.name)).size, 3);
});

test('repeated person reuses its identity including a name-only mention before the row', async (page) => {
  await page.setContent('<p class="mention">Dennis Teser</p>' +
    memberRow('Dennis Teser', 'opaque.account@realcorp.com') +
    memberRow('Dennis Teser', 'OPAQUE.ACCOUNT@realcorp.com'));
  await page.evaluate(sanitize, {});
  const people = await readPeople(page);
  assert.deepStrictEqual(people[0], people[1]);
  assertPair(people[0]);
  assert.strictEqual(await page.locator('.mention').innerText(), people[0].name);
});

test('pool exhaustion numbers both names and matching emails without collisions', async (page) => {
  await page.setContent(Array.from({ length: 24 }, (_, i) =>
    memberRow('Person Maeser', `account${i}@realcorp.com`)).join(''));
  await page.evaluate(sanitize, {});
  const people = await readPeople(page);
  people.forEach(assertPair);
  assert.strictEqual(new Set(people.map((p) => p.name)).size, 24);
  assert.strictEqual(new Set(people.map((p) => p.email)).size, 24);
  assert.strictEqual(people[9].name, 'Jordan Avery2');
});

test('without nearby email distinct full names remain distinct and repeated names agree', async (page) => {
  await page.setContent('<ul><li>Max Maeser</li><li>Claude Maeser</li><li>Max Maeser</li><li>Creed Bratton</li></ul>');
  await page.evaluate(sanitize, {});
  const names = await page.locator('li').allInnerTexts();
  assert.strictEqual(names[0], names[2]);
  assert.strictEqual(new Set(names).size, 3);
});

test('table rows and split text names pair with email input values', async (page) => {
  await page.setContent(`<table><tr><td class="name">Dennis<!-- --> <!-- -->Teser</td>
    <td><input value="bill.schmit@realcorp.com"></td></tr>
    <tr><td class="name">Max Maeser</td><td><input value="someone@realcorp.com"></td></tr></table>`);
  await page.evaluate(sanitize, {});
  const names = await page.locator('.name').allInnerTexts();
  const emails = await page.locator('input').evaluateAll((els) => els.map((el) => el.value));
  names.forEach((name, i) => assertPair({ name, email: emails[i] }));
  assert.notStrictEqual(names[0], names[1]);
});

test('an email-less row does not borrow the adjacent row email', async (page) => {
  await page.setContent(memberRow('Max Maeser', '') + memberRow('Creed Bratton', 'creed@realcorp.com'));
  await page.evaluate(sanitize, {});
  const people = await readPeople(page);
  assert.notStrictEqual(people[0].name, people[1].name);
  assertPair(people[1]);
});

test('an already masked identity is reserved when another person is added', async (page) => {
  await page.setContent(memberRow('Dennis Teser', 'one@realcorp.com'));
  await page.evaluate(sanitize, {});
  const [before] = await readPeople(page);
  await page.locator('body').evaluate((el, html) => el.insertAdjacentHTML('beforeend', html),
    memberRow('Max Maeser', 'two@realcorp.com'));
  await page.evaluate(sanitize, {});
  const people = await readPeople(page);
  assert.deepStrictEqual(people[0], before);
  assert.notStrictEqual(people[0].name, people[1].name);
  people.forEach(assertPair);
});

test('different displayed names with the same email share one identity', async (page) => {
  await page.setContent(memberRow('Bill Smith', 'person@realcorp.com') +
    memberRow('William Schmit', 'person@realcorp.com'));
  await page.evaluate(sanitize, {});
  const people = await readPeople(page);
  assert.deepStrictEqual(people[0], people[1]);
  assertPair(people[0]);
});

test('avatar initials follow their own row when real initials are identical', async (page) => {
  await page.setContent(`<div class="row"><span class="avatar">MM</span>
    <span class="name">Max Maeser</span><span class="email">one@realcorp.com</span></div>
    <div class="row"><span class="avatar">MM</span>
    <span class="name">Max Mifflin</span><span class="email">two@realcorp.com</span></div>`);
  await page.evaluate(sanitize, {});
  const people = await readPeople(page);
  const initials = await page.locator('.avatar').allInnerTexts();
  people.forEach((person, i) => {
    assertPair(person);
    assert.strictEqual(initials[i], person.name.split(' ').map((s) => s[0]).join(''));
  });
});

// ---- IP addresses and browser builds (audit N7, 2026-10-11) ----------------
// Fixture F: Settings > Profile > Security, "Active sessions". The 2026-10-11
// efficiency audit captured this card with the capture machine's public IP and
// its headless browser build still in it after sanitize. The values below are
// shaped like that capture (a real-looking public IPv4, a headless build), not
// copied from it.
const ACTIVE_SESSIONS = `
  <section class="sessions">
    <h3>Active sessions</h3>
    <p>Where your account is signed in right now.</p>
    <div class="session s1">
      <p class="device">Chrome Headless 141.0.7390.37 &middot; Linux</p>
      <p class="tag">This device</p>
      <p class="where">84.17.46.122 &middot; Signed in 11/10/2026, 07:40:57</p>
    </div>
    <div class="session s2">
      <p class="device">Firefox 128.0 &middot; macOS</p>
      <p class="where">2a02:8109:9a40:1f00:5d2e:61ff:fe3c:4b11 &middot; Signed in 10/10/2026, 18:02:11</p>
    </div>
    <div class="session s3">
      <p class="where">fe80::1c2b:3aff:fe4d:5e6f &middot; Signed in 09/10/2026, 09:15:00</p>
    </div>
    <input class="ua" value="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36" />
  </section>`;

test('an IPv4 address is replaced with the RFC 5737 documentation address', async (page) => {
  await page.setContent(ACTIVE_SESSIONS);
  const counts = await page.evaluate(sanitize, {});
  const where = await page.locator('.s1 .where').innerText();
  assert.ok(!where.includes('84.17.46.122'), `IPv4 survived: ${where}`);
  assert.ok(where.startsWith('203.0.113.10 '), `IPv4 not replaced with 203.0.113.10: ${where}`);
  assert.ok(where.includes('07:40:57'), `clock time was eaten: ${where}`);
  assert.ok(counts.ips >= 1, `ips count: ${counts.ips}`);
});

test('full and compressed IPv6 addresses are replaced with 2001:db8::1', async (page) => {
  await page.setContent(ACTIVE_SESSIONS);
  const counts = await page.evaluate(sanitize, {});
  const s2 = await page.locator('.s2 .where').innerText();
  const s3 = await page.locator('.s3 .where').innerText();
  assert.ok(s2.startsWith('2001:db8::1 '), `full IPv6 not replaced: ${s2}`);
  assert.ok(s3.startsWith('2001:db8::1 '), `compressed IPv6 not replaced: ${s3}`);
  assert.ok(s2.includes('18:02:11') && s3.includes('09:15:00'), 'clock times must survive');
  assert.strictEqual(counts.ips, 3, `expected 1 IPv4 + 2 IPv6, got ${counts.ips}`);
});

test('a browser build and a user-agent string are replaced with Chrome 131', async (page) => {
  await page.setContent(ACTIVE_SESSIONS);
  const counts = await page.evaluate(sanitize, {});
  const d1 = await page.locator('.s1 .device').innerText();
  const d2 = await page.locator('.s2 .device').innerText();
  const ua = await page.locator('.ua').inputValue();
  assert.strictEqual(d1, 'Chrome 131 · Linux', `headless build survived: ${d1}`);
  assert.strictEqual(d2, 'Chrome 131 · macOS', `dotted build survived: ${d2}`);
  assert.ok(!/Headless|141\./.test(ua), `user agent survived: ${ua}`);
  assert.ok(/Chrome\/131\.0\.0\.0/.test(ua), `user agent not replaced with the Chrome 131 UA: ${ua}`);
  assert.strictEqual(counts.browsers, 3);
});

test('IP and browser masking is idempotent and counts only real rewrites', async (page) => {
  await page.setContent(ACTIVE_SESSIONS);
  await page.evaluate(sanitize, {});
  const before = await page.locator('body').innerHTML();
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(counts.ips, 0, `second pass rewrote IPs: ${counts.ips}`);
  assert.strictEqual(counts.browsers, 0, `second pass rewrote builds: ${counts.browsers}`);
  assert.strictEqual(await page.locator('body').innerHTML(), before);
});

test('version numbers, clock times and product copy are not IPs or builds', async (page) => {
  await page.setContent(`
    <p class="a">Release 1.24.3 shipped. Build 141.0.7390.37 is out.</p>
    <p class="b">Meeting at 07:40:57, ratio 3:2, see std::vector.</p>
    <p class="c">Works best in Safari 17 or Chrome 120.</p>
    <p class="d">Order 1234567890 and version v1.2.3.4</p>`);
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.a').innerText(), 'Release 1.24.3 shipped. Build 141.0.7390.37 is out.');
  assert.strictEqual(await page.locator('.b').innerText(), 'Meeting at 07:40:57, ratio 3:2, see std::vector.');
  assert.strictEqual(await page.locator('.c').innerText(), 'Works best in Safari 17 or Chrome 120.');
  assert.strictEqual(await page.locator('.d').innerText(), 'Order 1234567890 and version v1.2.3.4');
  assert.strictEqual(counts.ips, 0);
  assert.strictEqual(counts.browsers, 0);
});

test('an IP in a sentence and a phone-labelled row is not claimed as a phone', async (page) => {
  await page.setContent(`<div class="row"><span>Phone</span> <span class="v">192.168.100.123</span></div>
    <p class="s">Last login from 10.0.0.12.</p>
    <p class="u">Webhook: http://84.17.46.122:8080/hook</p>`);
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.v').innerText(), '203.0.113.10');
  assert.strictEqual(await page.locator('.s').innerText(), 'Last login from 203.0.113.10.');
  assert.strictEqual(await page.locator('.u').innerText(), 'Webhook: http://203.0.113.10:8080/hook');
  assert.strictEqual(counts.phonesBare, 0, 'the IP must not be counted as a phone');
});

test('ips: false and browsers: false disable the new passes', async (page) => {
  await page.setContent(ACTIVE_SESSIONS);
  const counts = await page.evaluate(sanitize, { ips: false, browsers: false });
  const body = await page.locator('body').innerText();
  assert.ok(body.includes('84.17.46.122') && body.includes('Chrome Headless 141.0.7390.37'));
  assert.strictEqual(counts.ips, 0);
  assert.strictEqual(counts.browsers, 0);
});

// ---------------------------------------------------------------------------
// one-time codes, secrets, and the pre-shutter assertion   (added 2026-09-17)
// ---------------------------------------------------------------------------
// Four PII values reached live images in the 2026-09-06 sweep and the sanitizer
// caught none of them. One was a one-time code shown in the UI; nothing in this
// file could see a credential of any kind; and nothing anywhere verified that a
// mask had actually taken before the shutter fired. These tests pin all three.
//
// The negatives matter as much as the positives here, and there are more of them
// on purpose: a code this branch misses costs one reshoot, a masked order number
// corrupts every future capture that shows a table.

// ---- one-time codes: positives --------------------------------------------

test('a verification code in a dialog is masked', async (page) => {
  await page.setContent(`<div role="dialog">
      <h2>Check your email</h2>
      <p>Enter the verification code we sent to you.</p>
      <div class="code">903472</div>
    </div>`);
  const counts = await page.evaluate(sanitize, {});
  assert.ok(!/903472/.test(await page.locator('body').innerText()),
    'a 2FA code in a verification dialog must not reach the frame');
  assert.strictEqual(counts.codes, 1);
});

test('an input the platform declares as a one-time code is masked', async (page) => {
  await page.setContent(`<form><input id="otp" autocomplete="one-time-code" value="558214" /></form>`);
  await page.evaluate(sanitize, {});
  assert.notStrictEqual(await page.locator('#otp').inputValue(), '558214',
    'autocomplete="one-time-code" is the platform\'s own declaration and needs no other label');
});

test('a code in a toast is masked', async (page) => {
  await page.setContent(`<div role="status" class="toast">Your code is 274819. It expires in 10 minutes.</div>`);
  await page.evaluate(sanitize, {});
  const t = await page.locator('.toast').innerText();
  assert.ok(!/274819/.test(t), `code survived in a toast: ${t}`);
  assert.ok(/expires in 10 minutes/.test(t), `the copy around the code must survive: ${t}`);
});

test('an 8-digit one-time passcode is masked and keeps its length', async (page) => {
  await page.setContent(`<div class="row"><span>One-time passcode</span><span class="v">40592837</span></div>`);
  await page.evaluate(sanitize, {});
  const v = await page.locator('.v').innerText();
  assert.ok(!/40592837/.test(v), `8-digit code survived: ${v}`);
  assert.strictEqual(v.length, 8, `the replacement must keep the frame's layout: ${v}`);
});

test('a 2FA field labelled by aria-label is masked', async (page) => {
  await page.setContent(`<input class="c" aria-label="Two-factor code" value="661903" />`);
  await page.evaluate(sanitize, {});
  assert.notStrictEqual(await page.locator('.c').inputValue(), '661903');
});

test('a code split across sibling nodes in a labelled row is still masked', async (page) => {
  await page.setContent(`<div class="row"><label>Security code</label><span class="v">88<!-- -->2914</span></div>`);
  await page.evaluate(sanitize, {});
  const v = await page.locator('.v').innerText();
  assert.ok(!/882914/.test(v), `a split code survived: ${v}`);
});

// ---- one-time codes: the false positives that must NOT be masked ----------

test('a postal code is not masked', async (page) => {
  await page.setContent(`<div class="row"><span>Postal code</span><span class="v">1234567</span></div>`);
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.v').innerText(), '1234567',
    'a negative label vetoes the code branch outright');
  assert.strictEqual(counts.codes, 0);
  assert.ok(counts.codesSkipped >= 1, 'a declined candidate must still be counted');
});

test('an order number and an order total are not masked', async (page) => {
  await page.setContent(`<ul>
      <li class="a">Order number 4059283</li>
      <li class="b">Total $123,456.00</li>
      <li class="c">Invoice no. 8812340</li>
    </ul>`);
  const counts = await page.evaluate(sanitize, {});
  assert.ok(/4059283/.test(await page.locator('.a').innerText()), 'an order number is not a credential');
  assert.ok(/123,456\.00/.test(await page.locator('.b').innerText()), 'a total is not a credential');
  assert.ok(/8812340/.test(await page.locator('.c').innerText()), 'an invoice number is not a credential');
  assert.strictEqual(counts.codes, 0);
});

test('an id column in a table is not masked', async (page) => {
  await page.setContent(`<table>
      <thead><tr><th>Member ID</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td class="a">903472</td><td>Active</td></tr>
        <tr><td class="b">903473</td><td>Active</td></tr>
      </tbody>
    </table>`);
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.a').innerText(), '903472');
  assert.strictEqual(await page.locator('.b').innerText(), '903473');
  assert.strictEqual(counts.codes, 0);
});

test('the bare word "code" does not vouch for a number', async (page) => {
  await page.setContent(`<ul>
      <li class="a">Location code 220419</li>
      <li class="b">Promo code 771820</li>
      <li class="c">Product code 4429107</li>
    </ul>`);
  const counts = await page.evaluate(sanitize, {});
  assert.ok(/220419/.test(await page.locator('.a').innerText()), 'a location code is product data');
  assert.ok(/771820/.test(await page.locator('.b').innerText()), 'a promo code is product data');
  assert.ok(/4429107/.test(await page.locator('.c').innerText()), 'a product code is product data');
  assert.strictEqual(counts.codes, 0);
});

test('a code label in one table row cannot vouch for the row beside it', async (page) => {
  // The candidate-count guard: as soon as an ancestor is wide enough to hold a
  // second code-shaped run, a label inside it belongs to a neighbour.
  await page.setContent(`<table><tbody>
      <tr><td>Verification code</td><td class="a">903472</td></tr>
      <tr><td>Seats purchased</td><td class="b">551203</td></tr>
    </tbody></table>`);
  await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.b').innerText(), '551203',
    'the header of another row must not mask this value');
});

test('a phone number is not taken by the code branch', async (page) => {
  await page.setContent(`<div class="row"><span>Phone</span><span class="v">(303) 555-1212</span></div>`);
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(counts.codes, 0, 'the phone branch owns phone-shaped values');
  assert.ok(!/555-1212/.test(await page.locator('.v').innerText()));
});

// ---- secrets: positives ----------------------------------------------------

test('a prefixed API key is masked and keeps its prefix and its length', async (page) => {
  await page.setContent(`<code class="k">${FAKE_SK}</code>`);
  const counts = await page.evaluate(sanitize, {});
  const k = await page.locator('.k').innerText();
  assert.ok(!/51H8xQ2KZvNmLpQr7TdYw3Xc9/.test(k), `a live secret key survived: ${k}`);
  assert.ok(/^sk_live_/.test(k), `the prefix tells the reader what it is and must survive: ${k}`);
  assert.strictEqual(k.length, FAKE_SK.length, 'the frame must not reflow');
  assert.ok(counts.secrets >= 1);
});

test('a JWT, a bearer header and a long hex digest are masked', async (page) => {
  await page.setContent(`<ul>
      <li class="a">eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dBjftJeZ4CVPmB92K27uhbUJU1p1r_wW1gFWFOEjXk</li>
      <li class="b">Authorization: Bearer ya29.a0AfH6SMBx7Qk3Lp9RtVw2Zm</li>
      <li class="c">da39a3ee5e6b4b0d3255bfef95601890afd80709</li>
    </ul>`);
  await page.evaluate(sanitize, {});
  const body = await page.locator('body').innerText();
  assert.ok(!/dBjftJeZ4CVPmB92K27uhbUJU1p1r_wW1gFWFOEjXk/.test(body), `JWT survived:\n${body}`);
  assert.ok(!/ya29\.a0AfH6SMBx7Qk3Lp9RtVw2Zm/.test(body), `bearer token survived:\n${body}`);
  assert.ok(!/da39a3ee5e6b4b0d3255bfef95601890afd80709/.test(body), `hex digest survived:\n${body}`);
  assert.ok(/^Bearer /.test((await page.locator('.b').innerText()).replace('Authorization: ', '')),
    'the "Bearer " prefix survives so the reader still sees what the value is');
});

test('a token in a query string is masked and the parameter name survives', async (page) => {
  await page.setContent(`<a class="u" href="#">https://app.fsai.test/accept?token=9fj20dkSl3mQz8xR1vBn4P</a>`);
  await page.evaluate(sanitize, {});
  const u = await page.locator('.u').innerText();
  assert.ok(!/9fj20dkSl3mQz8xR1vBn4P/.test(u), `a query-string token survived: ${u}`);
  assert.ok(/\?token=/.test(u), `the parameter name must survive: ${u}`);
});

test('a Slack webhook URL is masked', async (page) => {
  await page.setContent(`<div class="w">https://hooks.slack.com/services/T024BE7LD/B0GKR2PQ8/G8xN1mQ7vZpL4kRs2Wd9Yb</div>`);
  await page.evaluate(sanitize, {});
  const w = await page.locator('.w').innerText();
  assert.ok(!/G8xN1mQ7vZpL4kRs2Wd9Yb/.test(w), `a webhook secret survived: ${w}`);
  assert.ok(/hooks\.slack\.com\/services\//.test(w), `the host must survive so the shot still reads: ${w}`);
});

test('an invite URL with an embedded token is masked', async (page) => {
  await page.setContent(`<p class="i">Send them https://portal.fsai.test/invite/7Kd2Xm9Qp4Rt6Vw8Zb1Nc3 to join.</p>`);
  await page.evaluate(sanitize, {});
  const i = await page.locator('.i').innerText();
  assert.ok(!/7Kd2Xm9Qp4Rt6Vw8Zb1Nc3/.test(i), `an invite token survived: ${i}`);
  assert.ok(/\/invite\//.test(i), `the path must survive: ${i}`);
});

test('an unprefixed key under an API-key label is masked', async (page) => {
  // The about-organization-api-keys shape: the key carries no recognizable
  // prefix at all, so only the label can vouch for it.
  await page.setContent(`<div class="row"><span class="label">API key</span><span class="v">a83f9c2e7b14d05f6a9b2c3d</span></div>`);
  const counts = await page.evaluate(sanitize, {});
  assert.ok(!/a83f9c2e7b14d05f6a9b2c3d/.test(await page.locator('.v').innerText()),
    'an organization API key must not reach the frame');
  assert.ok(counts.secrets >= 1);
});

// ---- secrets: the false positives that must NOT be masked -----------------

test('a dashed UUID is not masked, even under a Key label', async (page) => {
  await page.setContent(`<div class="row"><span>Key</span><span class="v">550e8400-e29b-41d4-a716-446655440000</span></div>`);
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.v').innerText(), '550e8400-e29b-41d4-a716-446655440000',
    'this product renders UUIDs as ordinary record ids');
  assert.strictEqual(counts.secrets, 0);
});

test('a 32-character hex run is not masked - that is a UUID with its dashes stripped', async (page) => {
  await page.setContent(`<div class="v">550e8400e29b41d4a716446655440000</div>`);
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.v').innerText(), '550e8400e29b41d4a716446655440000');
  assert.strictEqual(counts.secrets, 0);
});

test('prose about bearer authentication is not masked', async (page) => {
  await page.setContent(`<p class="p">Bearer authentication is required for every request.</p>`);
  const counts = await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('.p').innerText(),
    'Bearer authentication is required for every request.');
  assert.strictEqual(counts.secrets, 0);
});

test('a word-slug URL and an ordinary query parameter are not masked', async (page) => {
  await page.setContent(`<ul>
      <li class="a">https://app.fsai.test/verify/email-address-change-request</li>
      <li class="b">https://app.fsai.test/leads?sortKey=createdAt&amp;barcode=90210554</li>
    </ul>`);
  const counts = await page.evaluate(sanitize, {});
  assert.ok(/email-address-change-request/.test(await page.locator('.a').innerText()),
    'a hyphenated word slug is not a token - it carries no digit');
  assert.ok(/sortKey=createdAt/.test(await page.locator('.b').innerText()),
    'the [?&] guard keeps "sortKey" out of the "key=" rule');
  assert.strictEqual(counts.secrets, 0);
});

test('masking a page twice changes nothing the second time', async (page) => {
  await page.setContent(`<ul>
      <li class="a">${FAKE_SK}</li>
      <li class="b">Your code is 274819</li>
      <li class="c">Max Maeser</li>
    </ul>`);
  await page.evaluate(sanitize, {});
  const once = await page.locator('body').innerText();
  await page.evaluate(sanitize, {});
  assert.strictEqual(await page.locator('body').innerText(), once,
    'the capture runner sanitizes twice on purpose; the second pass must be a no-op');
});

// ---- the pre-shutter assertion --------------------------------------------

test('assertClean passes on a page that is actually clean', async (page) => {
  await page.setContent(`<div>
      <p>Jordan Avery</p>
      <p>jordan.avery@example.com</p>
      <p>(720) 555-0142</p>
      <p>Invites are valid for 7 days.</p>
    </div>`);
  const findings = await assertClean(page, {});
  assert.deepStrictEqual(findings, [], `a clean page must not produce findings: ${JSON.stringify(findings)}`);
});

test('assertClean throws on a real name the mask did not take', async (page) => {
  await page.setContent(`<div class="wrap"><p class="who">Max Maeser</p></div>`);
  let err = null;
  try { await assertClean(page, {}); } catch (e) { err = e; }
  assert.ok(err, 'a roster surname on the page must abort the capture');
  assert.ok(/pre-shutter assertion failed/.test(err.message), err.message);
  assert.ok(/name/.test(err.message), `the rule that matched must be named: ${err.message}`);
  assert.ok(/p\.who/.test(err.message), `the selector path must be in the message: ${err.message}`);
  assert.ok(!/Maeser/.test(err.message),
    `a leak report that quotes the leak is itself a leak: ${err.message}`);
  assert.ok(err.findings && err.findings.length >= 1, 'findings must also come back structured');
});

test('assertClean throws on an unmasked address, code and secret', async (page) => {
  await page.setContent(`<div>
      <p class="e">real.person@franchisesystems.ai</p>
      <p class="c">Your verification code is 903472</p>
      <p class="k">${FAKE_SK}</p>
    </div>`);
  let err = null;
  try { await assertClean(page, {}); } catch (e) { err = e; }
  assert.ok(err, 'three live values must abort the capture');
  const rules = err.findings.map((f) => f.rule);
  assert.ok(rules.includes('email'), `email not reported: ${rules}`);
  assert.ok(rules.includes('code'), `code not reported: ${rules}`);
  assert.ok(rules.some((r) => r.indexOf('secret:') === 0), `secret not reported: ${rules}`);
});

test('assertClean does NOT fire on a value the sanitizer deliberately declined', async (page) => {
  // This is the whole design. An assertion that fires on a documented decline
  // gets switched off within a week, and then it is not there on the day it
  // matters. None of these four is a finding.
  await page.setContent(`<div>
      <p>Order number 4059283</p>
      <p>Max file size is 25 MB</p>
      <p>team@example.com</p>
      <p>Reference 07717325656 in the audit log</p>
    </div>`);
  const findings = await assertClean(page, {});
  assert.deepStrictEqual(findings, [],
    `declines must not be findings: ${JSON.stringify(findings)}`);
});

test('assertClean passes immediately after sanitize on a page that held everything', async (page) => {
  await page.setContent(`<div>
      <p>Max Maeser</p>
      <p>max.maeser@franchisesystems.ai</p>
      <p>(303) 555-1212</p>
      <div class="row"><span>Verification code</span><span>903472</span></div>
      <p>${FAKE_SK}</p>
      <p>https://hooks.slack.com/services/T024BE7LD/B0GKR2PQ8/G8xN1mQ7vZpL4kRs2Wd9Yb</p>
    </div>`);
  await page.evaluate(sanitize, {});
  const findings = await assertClean(page, {});
  assert.deepStrictEqual(findings, [],
    `the masker and the assertion must agree: ${JSON.stringify(findings)}`);
});

test('assertClean sees a node mounted outside <body>, which the masker cannot', async (page) => {
  // A portal can mount its dialog outside <body>. The masking passes are
  // body-rooted and walk straight past one; the assertion walks documentElement
  // precisely so that gap cannot ship.
  await page.setContent(`<p>nothing to see</p>`);
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.id = 'portal';
    d.textContent = 'Max Maeser';
    document.documentElement.appendChild(d);
  });
  await page.evaluate(sanitize, {});
  let err = null;
  try { await assertClean(page, {}); } catch (e) { err = e; }
  assert.ok(err, 'a value outside <body> must still abort the capture');
  assert.ok(/#portal/.test(err.message), `the selector must point at the portal: ${err.message}`);
});

test('assertClean does not report an inlined script bundle as a leak', async (page) => {
  await page.setContent(`<p>clean</p><script>var user = { name: "Max Maeser" };</script>`);
  const findings = await assertClean(page, {});
  assert.deepStrictEqual(findings, [],
    `<script> text never reaches the frame and must not fire the assertion: ${JSON.stringify(findings)}`);
});

test('assertClean honors the config: a family switched off is not asserted', async (page) => {
  await page.setContent(`<p class="who">Max Maeser</p>`);
  const findings = await assertClean(page, { names: false });
  assert.deepStrictEqual(findings, [],
    'a shot that turned names off has said it does not want them masked or asserted');
});

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let failed = 0;
  for (const t of tests) {
    try {
      await t.fn(page);
      console.log(`  ok   ${t.name}`);
    } catch (e) {
      failed++;
      console.log(`  FAIL ${t.name}\n       ${e.message}`);
    }
  }
  await browser.close();
  console.log(`\n${tests.length - failed}/${tests.length} passed`);
  process.exit(failed ? 1 : 0);
})();
