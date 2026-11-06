/**
 * Take spec: funnel-build-publish  (brand dashboard, Studio > Funnel)
 *
 *   node record.js takes/funnel-build-publish.js --dry   # stops before Publish now
 *   node record.js takes/funnel-build-publish.js         # films and SAVES
 *
 * Lumon Cafe is a funnel-surface brand and has exactly one funnel (the builder
 * has no "new funnel" action), so this take edits that funnel: it picks a new
 * accent swatch, stages Publish now and saves. The funnel was unpublished
 * before filming (site.published=false, recon 2026-10-18); restore it after
 * by unpublishing and resetting the accent (#B08D57) if the demo state matters.
 */
const { dressHome } = require('../dress-home.js');
const DLG = '[role=dialog]';
const ACCENT = '#2e7a55';
/** The live preview card on the right of the builder (recon 2026-10-19). */
const PREVIEW = { css: 'div[class*="@container"][class*="h-[100cqh]"]' };

module.exports = {
  id: 'funnel-build-publish',
  article: 'about-the-funnel-builder',
  surface: 'brand',
  brand: 'Lumon Cafe',
  // Opens on Home. The brand chip check needs a brand page, so the take starts
  // on Sales Analytics and prepare() moves to Home off camera. Home's inbox and
  // calendar event list show private meetings and internal tasks, so prepare()
  // hides both and dressHome() lays a fictional, busy copy over them.
  start: (r) => r.resolve('SALES_ANALYTICS'),
  ready: 'nav >> text=Studio',
  prepare: async (page) => {
    await page.goto(new URL('/', page.url()).href, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Your upcoming meetings', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await dressHome(page); // private inbox and calendar hidden, fictional busy copy on top
  },
  steps: [
    {
      step: 1, label: 'Open Studio',
      action: async (rec) => {
        await rec.hold(1500); // pre-roll: the template needs ~3.3 s before the first click
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
        await rec.result(PREVIEW); // the preview is what applicants see
      },
    },
    {
      step: 3, label: 'Open Theme',
      action: async (rec) => {
        await rec.click({ role: 'button', name: 'Theme', exact: true }, { transition: 'page' });
        await rec.wait(`${DLG} >> text=Accent`, 'theme panel open');
        await rec.hold(500);
      },
    },
    {
      step: 4, label: 'Pick an accent color',
      action: async (rec) => {
        await rec.click({ role: 'button', name: ACCENT, exact: true, within: DLG });
        await rec.hold(600);
      },
    },
    {
      step: 5, label: 'Close the Theme panel',
      action: async (rec, page) => {
        await rec.click(page.locator(`${DLG} button[aria-label="Close panel"]`), { transition: 'page' });
        await rec.wait(() => page.waitForSelector(`${DLG} >> text=Accent`, { state: 'detached', timeout: 10000 }), 'panel close');
        await rec.result(PREVIEW); // the preview now carries the new accent
      },
    },
    {
      step: 6, label: 'Click Publish',
      action: async (rec) => {
        await rec.click({ role: 'button', name: 'Publish', exact: true });
        await rec.wait('text=Publish now', 'publish popover open');
        await rec.hold(400);
      },
    },
    {
      step: 7, label: 'Click Publish now',
      action: async (rec) => {
        await rec.click({ role: 'button', name: 'Publish now', exact: true }, { write: true });
        await rec.result({ role: 'button', name: 'Save', exact: true }); // Save turns on: nothing is live until you save
      },
    },
    {
      step: 8, label: 'Click Save',
      action: async (rec) => {
        await rec.click({ role: 'button', name: 'Save', exact: true }, { transition: 'page', write: true });
        await rec.wait('text=All changes saved', 'funnel saved');
        await rec.result({ role: 'button', name: 'Published', exact: true }, { hold: 3000 });
      },
    },
  ],
  outro: async (rec) => { await rec.hold(2500); },
};
