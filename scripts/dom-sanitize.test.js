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
