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

const PLAYWRIGHT_PATH = process.env.PLAYWRIGHT_PATH || '/home/max/.dev-browser/node_modules/playwright';
const { chromium } = require(PLAYWRIGHT_PATH);
const { sanitize } = require(path.join(__dirname, 'dom-sanitize.js'));

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
      <p class="n">Max Maeser</p>
      <p class="e">max.maeser@franchisesystems.ai</p>
      <p class="e2">creed.smith@franchisesystems.ai</p>
    </div>`);
  await page.evaluate(sanitize, {});
  const name = await page.locator('.n').innerText();
  const mail = await page.locator('.e').innerText();
  const mail2 = await page.locator('.e2').innerText();
  const local = mail.slice(0, mail.indexOf('@')).split(/[._-]/);
  assert.ok(name.toLowerCase().includes(local[0]) && name.toLowerCase().includes(local[1]),
    `the masked name ${name} and the masked address ${mail} are different people`);
  assert.strictEqual(mail2, mail, 'the same person under two seed names got two identities');
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
