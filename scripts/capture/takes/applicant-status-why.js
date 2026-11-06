/**
 * Take spec: applicant-status-why  (Lumon Cafe, funnel surface)
 *   node record.js takes/applicant-status-why.js [--dry]
 * No staging writes. Opens on Home, goes to Sales > Pipeline, opens a lead with
 * a Not Qualified status and its Activity tab (one Imported entry: this lead
 * never went through the funnel), then Studio > Funnel and the Logic panel
 * where the Qualified / Needs review rules live.
 *
 * 2026-10-23: the Preview / Needs review steps of the 2026-10-18 take were
 * dropped so the take matches the article's three numbered steps.
 */
const { dressHome } = require('../dress-home.js');
const LEAD_PANEL = '[role=dialog]:has-text("Contact Information")';
const LOGIC_PANEL = '[role=dialog]:has-text("The rules that decide which applicants qualify.")';

module.exports = {
  id: 'applicant-status-why',
  article: 'how-to-track-funnel-progress-on-a-lead',
  surface: 'brand',
  brand: 'Lumon Cafe',
  // Opens on Home: the brand chip check needs a brand page, so the take starts
  // on Sales Workflows and prepare() moves to Home off camera.
  start: (r) => r.resolve('SALES_WORKFLOWS'),
  ready: 'text=Studio >> visible=true',
  prepare: async (page) => {
    await page.goto(new URL('/', page.url()).href, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Your upcoming meetings', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await dressHome(page); // private inbox and calendar hidden, fictional busy copy on top
  },
  steps: [
    { step: 1, label: 'Open Sales', action: async (rec) => {
      await rec.hold(1500); // pre-roll: the template needs ~3.3 s before the first click
      await rec.click({ role: 'button', name: 'Sales', exact: true, within: 'nav' });
      await rec.wait('nav a[href="/sales"] >> text=Pipeline', 'sales menu open');
    } },
    { step: 2, label: 'Click Pipeline', action: async (rec) => {
      await rec.click({ role: 'link', name: 'Pipeline', exact: true, within: 'nav' }, { transition: 'page' });
      await rec.wait('text=Total Leads', 'pipeline load');
    } },
    { step: 3, label: 'Open Zev Hollivar', action: async (rec, page) => {
      await rec.wait('text=Zev Hollivar', 'lead rows');
      await rec.click(page.locator('tr:has-text("zev.hollivar@example.com") span:text-is("Zev Hollivar")').first(), { transition: 'page' });
      await rec.wait(LEAD_PANEL, 'lead panel open');
      await rec.hold(500);
      await rec.result(page.locator(LEAD_PANEL).getByText('Not Qualified', { exact: true })); // a status label, not the funnel's decision
    } },
    { step: 4, label: 'Open the Activity tab', action: async (rec, page) => {
      await rec.click({ role: 'tab', name: 'Activity' }, { transition: 'local' });
      await rec.wait('text=Log Activity', 'activity load');
      // "Imported" is also the header badge; the activity entry comes after it in the DOM.
      await rec.result(page.locator('[role=dialog]').getByText('Imported', { exact: true }).last()); // only an Imported entry: no funnel lane
    } },
    { step: 5, label: 'Open Studio', action: async (rec) => {
      await rec.click({ role: 'button', name: 'Studio', exact: true, within: 'nav' }, { transition: 'local' });
      await rec.wait('nav a[href="/studio/funnel"]', 'studio menu open');
    } },
    { step: 6, label: 'Click Funnel', action: async (rec) => {
      await rec.click({ role: 'link', name: 'Funnel', exact: true, within: 'nav' }, { transition: 'page' });
      await rec.wait('text=Structure', 'funnel builder load');
      await rec.wait('[data-guide-target="add-question"]', 'funnel preview load');
      await rec.hold(800);
    } },
    { step: 7, label: 'Click Logic', action: async (rec) => {
      await rec.click({ role: 'button', name: 'Logic', exact: true }, { transition: 'page' });
      await rec.wait(LOGIC_PANEL, 'logic panel');
      await rec.hold(500); // let the panel animation finish before measuring
      await rec.result(LOGIC_PANEL, { hold: 3500 }); // Pre-qualify and Application-qualify rules
    } },
  ],
  outro: async (rec) => { await rec.hold(2500); },
};
