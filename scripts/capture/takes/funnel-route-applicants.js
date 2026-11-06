/**
 * Take spec: funnel-route-applicants  (brand dashboard, Studio > Funnel > Logic)
 *
 *   node record.js takes/funnel-route-applicants.js --dry   # stops before Save
 *   node record.js takes/funnel-route-applicants.js         # films and SAVES
 *
 * Lumon Cafe has one funnel (no "new funnel" action exists), so this take edits
 * it: raises the pre-qualify liquid capital minimum from 75000 to 100000 and
 * sets Book A Call routing to Both paths, then saves. FDD auto-qualifiers are
 * already empty on Cafe (every FDD request holds for a rep). Restore with the
 * same panel: 75000 and Book A Call = Qualified only.
 *
 * The routing control is a native <select>: headless Chromium draws no popup
 * for it, so the take clicks it (logged) and sets the value with selectOption.
 */
const { dressHome } = require('../dress-home.js');
const DLG = '[role=dialog]';
/** The live preview card on the right of the builder (same as funnel-build-publish). */
const PREVIEW = { css: 'div[class*="@container"][class*="h-[100cqh]"]' };

module.exports = {
  id: 'funnel-route-applicants',
  article: 'how-to-route-funnel-applicants',
  surface: 'brand',
  brand: 'Lumon Cafe',
  start: (r) => r.resolve('SALES_ANALYTICS'),
  ready: 'nav >> text=Studio',
  // Opens on Home, dressed with fictional content (same pattern as funnel-build-publish).
  prepare: async (page) => {
    await page.goto(new URL('/', page.url()).href, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Your upcoming meetings', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await dressHome(page);
  },
  steps: [
    {
      step: 1, label: 'Open Studio',
      action: async (rec) => {
        await rec.hold(1500); // pre-roll for the template intro
        await rec.click({ role: 'button', name: 'Studio', exact: true, within: 'nav' });
        await rec.wait('nav a[href="/studio/funnel"]', 'studio menu open');
      },
    },
    {
      step: 2, label: 'Click Funnel',
      action: async (rec) => {
        await rec.click({ role: 'link', name: 'Funnel', exact: true, within: 'nav' }, { transition: 'page' });
        await rec.wait('text=Structure', 'funnel builder load');
        await rec.wait('[data-guide-target="add-question"]', 'funnel preview load');
        await rec.result(PREVIEW); // the builder opens on your funnel
      },
    },
    {
      step: 3, label: 'Open Logic',
      action: async (rec) => {
        await rec.click({ role: 'button', name: 'Logic', exact: true }, { transition: 'page' });
        await rec.wait(`${DLG} >> text=Branch routing`, 'logic panel open');
        await rec.result(DLG); // the Logic panel: qualification rules and routing
      },
    },
    {
      step: 4, label: 'Click the liquid capital minimum',
      action: async (rec, page) => {
        await rec.click(page.locator(`${DLG} input[aria-label="Value"]`).first(), { cursor: 'text' });
        await page.keyboard.press('Control+A');
      },
    },
    {
      step: 5, label: 'Type the new minimum',
      action: async (rec, page) => {
        await rec.type(page.locator(`${DLG} input[aria-label="Value"]`).first(), '100000');
        await rec.result(page.locator(`${DLG} input[aria-label="Value"]`).first()); // the new minimum
      },
    },
    {
      step: 6, label: 'Set Book A Call to Both paths',
      action: async (rec, page) => {
        const sel = page.locator(`${DLG} select[aria-label="Book A Call routing"]`);
        await rec.click(sel);
        await page.keyboard.press('Escape');
        await sel.selectOption('always');
        await rec.wait(() => page.locator(DLG).getByText('Book A Call', { exact: true }).nth(2).waitFor({ timeout: 10000 }), 'needs review path updates');
        // The Qualified path and Needs review path rows: Book A Call now on both.
        await rec.result(page.locator(`${DLG} div`)
          .filter({ has: page.getByText('Qualified path', { exact: true }) })
          .filter({ has: page.getByText('Needs review path', { exact: true }) }).last());
      },
    },
    {
      step: 7, label: 'Click Save',
      action: async (rec) => {
        await rec.click({ role: 'button', name: 'Save', exact: true }, { transition: 'page', write: true });
        await rec.wait('text=All changes saved', 'funnel saved');
        await rec.result('text=All changes saved', { hold: 3000 });
      },
    },
  ],
  outro: async (rec) => { await rec.hold(3000); },
};
