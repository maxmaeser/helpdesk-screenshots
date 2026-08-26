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
