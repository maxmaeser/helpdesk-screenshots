/**
 * Take spec: email-template-reuse  (Sales > Content, email builder)
 *
 *   node ../record.js takes/email-template-reuse.js --dry   # stops before Duplicate
 *   node ../record.js takes/email-template-reuse.js         # films it
 *
 * Reuses the already styled seed email "Cafe format introduction" on Lumon Cafe:
 * duplicate it from the Content list, open the copy, change subject and headline,
 * Save and Exit. Never sends or deploys.
 * The copy is "Cafe format introduction (Copy)"; rename it off camera afterwards
 * (typing into the Internal Title field is masked by the sanitizer as a person name).
 * Delete earlier copies before re-filming or step 4 matches several rows.
 */
const SRC = 'Cafe format introduction';
const SUBJECT = 'Welcome to Lumon Cafe';
const HEADLINE = 'Welcome to Lumon Cafe';
const HEADING = '.fsai-prose[contenteditable="true"] h2';
const SUBJ = '[contenteditable][placeholder="Email Subject..."]';
const DATA_ROW = (page, text) => page.locator('tr[data-index]').filter({ has: page.getByText(text, { exact: true }) });

const { dressHome } = require('../dress-home.js');

module.exports = {
  id: 'email-template-reuse',
  article: 'how-to-build-an-email',
  surface: 'brand',
  brand: 'Lumon Cafe',
  start: (r) => r.resolve('SALES_WORKFLOWS'),
  ready: 'a[href="/sales/content"]',
  // Results ring the name cell: the rows are wider than the viewport.
  // Opens on Home, dressed with fictional content (same pattern as funnel-build-publish).
  prepare: async (page) => {
    await page.goto(new URL('/', page.url()).href, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Your upcoming meetings', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    // The start page leaves Sales expanded in the sidebar; collapse it so step 1 opens it on camera.
    if (await page.locator('nav a[href="/sales/content"]').isVisible()) {
      await page.locator('nav').getByRole('button', { name: 'Sales', exact: true }).click();
      await page.waitForSelector('nav a[href="/sales/content"]', { state: 'hidden', timeout: 10000 });
    }
    await page.waitForTimeout(4000);
    await dressHome(page);
  },
  // Follows the article's five reuse steps. Theme and Preview (filmed in the
  // 2026-10-18 take) are left out: they are not steps of the reuse procedure.
  steps: [
    { step: 1, label: 'Open Sales', action: async (rec) => {
        await rec.hold(1500); // pre-roll: the template needs ~3.3 s before the first click
        await rec.click({ role: 'button', name: 'Sales', exact: true, within: 'nav' });
        await rec.wait('nav a[href="/sales/content"]', 'sales menu open');
    } },
    { step: 2, label: 'Click Content', action: async (rec, page) => {
        await rec.click({ role: 'link', name: 'Content', exact: true, within: 'nav' }, { transition: 'page' });
        await rec.wait('input[placeholder^="Search Templates"]', 'content list load');
        await rec.wait(() => DATA_ROW(page, SRC).first().waitFor({ state: 'visible' }), 'rows load');
        await rec.result(DATA_ROW(page, SRC).getByText(SRC, { exact: true })); // your styled email in the list
    } },
    { step: 3, label: 'Right-click your styled email', action: async (rec, page) => {
        await rightClick(rec, page, DATA_ROW(page, SRC).getByText(SRC, { exact: true }));
        await rec.wait('[role=menuitem]', 'row menu open');
    } },
    { step: 4, label: 'Choose Duplicate', action: async (rec, page) => {
        await rec.click({ role: 'menuitem', name: 'Duplicate', exact: true }, { write: true });
        await rec.wait(() => DATA_ROW(page, `${SRC} (Copy)`).first().waitFor({ state: 'visible' }), 'copy listed');
        await rec.result(DATA_ROW(page, `${SRC} (Copy)`).getByText(`${SRC} (Copy)`, { exact: true })); // the copy, right below the original
    } },
    { step: 5, label: 'Open the copy', action: async (rec, page) => {
        await rec.click(DATA_ROW(page, `${SRC} (Copy)`).getByText(`${SRC} (Copy)`, { exact: true }), { transition: "page" });
        await rec.wait(SUBJ, 'email builder load');
        await rec.hold(900);
    } },
    { step: 6, label: 'Write the subject', action: async (rec, page) => {
        await rec.click({ css: SUBJ }, { cursor: 'text' });
        await page.keyboard.press('Control+A');
        await rec.type({ css: SUBJ }, SUBJECT);
    } },
    { step: 7, label: 'Write the headline', action: async (rec, page) => {
        await rec.click({ css: HEADING }, { cursor: 'text' });
        await page.keyboard.press('Home');
        await page.keyboard.press('Shift+End');
        await typeKeys(rec, page, { css: HEADING }, HEADLINE);
        await rec.result({ css: HEADING }); // new subject and headline, the styling carried over
    } },
    { step: 8, label: 'Click Save and Exit', action: async (rec, page) => {
        await rec.click({ role: 'button', name: 'Save and Exit', exact: true }, { transition: 'page', write: true });
        await rec.wait('input[placeholder^="Search Templates"]', 'content list load');
        await rec.wait(() => DATA_ROW(page, `${SRC} (Copy)`).first().waitFor({ state: 'visible' }), 'rows load');
        await rec.result(DATA_ROW(page, `${SRC} (Copy)`).getByText(`${SRC} (Copy)`, { exact: true }), { hold: 3000 }); // the saved copy in the list
    } },
  ],
  outro: async (rec) => { await rec.hold(2500); },
};

/** Right-click: the recorder has no verb for it, so move, dwell, log the step event, click. */
async function rightClick(rec, page, loc) {
  const { b } = await rec.box(loc, 'right-click');
  const x = b.x + b.width / 2, y = b.y + b.height / 2;
  await rec.move(x, y);
  await rec.hold(1200);
  rec.log({ kind: 'click', ...rec.tag(), rect: rec.rect({ x: b.x - 16, y: b.y - 12, width: b.width + 32, height: b.height + 24 }), target: 'row (right-click)', transition: 'local', cursor: 'pointer' });
  rec.lastTransition = 'local';
  await page.mouse.click(x, y, { button: 'right' });
}

/** rec.type focuses the locator first, which drops the selection inside the rich-text
 *  heading and the text never lands. Type at the live caret instead, same timing and log. */
async function typeKeys(rec, page, target, text) {
  const { b } = await rec.box(target, 'type');
  await new Promise((r) => setTimeout(r, 1800)); // same dwell as rec.type
  const t = rec.now();
  await page.keyboard.type(text, { delay: 70 });
  await new Promise((r) => setTimeout(r, 300));
  const after = (await page.locator(target.css).first().boundingBox()) || b;
  rec.log({ kind: 'type', ...rec.tag(), rect: rec.rect(after), target: target.css, text, until: rec.now(), transition: 'local', cursor: 'text' }, t);
  rec.lastTransition = 'local';
}
