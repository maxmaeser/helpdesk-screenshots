/**
 * Take spec: lead-assignment  (Settings > Brand > Team & Access, then Sales > Pipeline)
 *
 *   node record.js takes/lead-assignment.js --dry   # stops before setting Elara Merrivet to Automatic
 *   node record.js takes/lead-assignment.js
 *
 * Opens on Home, goes to Settings through the profile menu, sets Elara Merrivet
 * to Automatic and Brennan Oswick to Manual (both @example.com staging
 * members), then bulk-assigns the three walkthrough leads
 * (walkthrough+lead1..3@example.com, created by the lead-import take) to Elara.
 * Restore afterwards: both members back to Off, the three leads Unassigned
 * (tools/clip/lead-assignment/RESTORE.md).
 *
 * Settings has no main sidebar, and "Back to Dashboard" lands on the undressed
 * Home, so step 7 reaches Sales by URL inside a logged wait (cut by the converter).
 */
const { dressHome } = require('../dress-home.js');
const SEARCH = { css: 'input[placeholder="Search Leads..."]' };
const PROFILE = { css: 'button[aria-haspopup="menu"][data-menu-trigger][aria-label]' }; // profile picture, bottom of the sidebar
const seg = (member, opt) => ({ css: `div.flex.items-center.justify-between:has(span:text-is("${member}")):has(button[aria-label="Automatic"]) button[aria-label="${opt}"]` });
const row = (member) => ({ css: `div.flex.items-center.justify-between:has(span:text-is("${member}")):has(button[aria-label="Automatic"])` });

module.exports = {
  id: 'lead-assignment',
  article: 'auto-and-manual-assignment',
  surface: 'brand',
  brand: 'Lumon Cafe',
  // Opens on Home: the brand chip check needs a brand page, so the take starts
  // on Settings Profile and prepare() moves to Home off camera.
  start: (r) => r.resolve('SETTINGS_ACCOUNT'),
  ready: 'text=Profile',
  prepare: async (page) => {
    await page.goto(new URL('/', page.url()).href, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Your upcoming meetings', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await dressHome(page); // private inbox and calendar hidden, fictional busy copy on top
  },
  steps: [
    { step: 1, label: 'Click your profile picture', action: async (rec) => {
      await rec.hold(1500); // pre-roll: the template needs ~3.3 s before the first click
      await rec.click(PROFILE);
      await rec.wait('[role=menuitem] >> text=Settings', 'profile menu open');
      await rec.hold(600);
    } },
    { step: 2, label: 'Select Settings', action: async (rec) => {
      await rec.click({ role: 'menuitem', name: 'Settings', exact: true }, { transition: 'page' });
      await rec.wait('a[href="/settings/brands?section=brand-team"]', 'settings load');
    } },
    { step: 3, label: 'Open Team & Access', action: async (rec) => {
      await rec.click({ role: 'link', name: 'Team & Access', exact: true }, { transition: 'page' });
      await rec.wait('text=Sales assignability', 'team page load');
      await rec.hold(1000);
    } },
    { step: 4, label: 'Scroll to Sales assignability', action: async (rec, page) => {
      // The heading sits below the fold; box() scrolls it into view (logged as a scroll).
      await rec.click(page.getByText('Sales assignability', { exact: true }), { cursor: 'default' });
      await rec.result(row('Elara Merrivet')); // every member, with Automatic, Manual and Off
    } },
    { step: 5, label: 'Set Elara Merrivet to Automatic', action: async (rec) => {
      await rec.click(seg('Elara Merrivet', 'Automatic'), { write: true });
      await rec.hold(800);
    } },
    { step: 6, label: 'Set Brennan Oswick to Manual', action: async (rec) => {
      await rec.click(seg('Brennan Oswick', 'Manual'), { write: true });
      await rec.hold(800);
      await rec.result(row('Brennan Oswick')); // saved on click, no Save button
    } },
    { step: 7, label: 'Open Pipeline', action: async (rec, page) => {
      // Never pass through Home: jump to a Sales page by URL (a logged page transition).
      await rec.wait(async () => { await page.goto('https://staging.app.franchisesystems.ai/sales/analytics', { waitUntil: 'domcontentloaded' }); await page.waitForSelector('nav a[href="/sales"] >> text=Pipeline'); await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {}); }, 'page load');
      await rec.click({ role: 'link', name: 'Pipeline', exact: true, within: 'nav' }, { transition: 'page' });
      await rec.wait('text=Total Leads', 'pipeline load');
      await rec.hold(1000);
    } },
    { step: 8, label: 'Search for the imported leads', action: async (rec, page) => {
      await rec.type(SEARCH, 'walkthrough+lead', { click: true });
      await rec.wait(() => page.waitForFunction(() => {
        const rows = [...document.querySelectorAll('tbody tr')].filter((r) => (r.innerText || '').trim());
        return rows.length === 3 && rows.every((r) => /walkthrough\+lead/.test(r.innerText));
      }, null, { timeout: 15000 }), 'search results');
      await rec.result({ css: 'tbody td:has-text("walkthrough+lead") >> nth=0' }); // was 'tbody', wider than the viewport
    } },
    { step: 9, label: 'Select all leads', action: async (rec) => {
      await rec.click({ css: 'thead [role=checkbox]' });
      await rec.wait('text=Assign To Agent', 'selection bar');
      await rec.result('text=/All\\s+\\d+\\s+Leads\\s+selected/'); // the bar renders Leads&nbsp;selected
    } },
    { step: 10, label: 'Click Assign To Agent', action: async (rec) => {
      await rec.click({ role: 'button', name: 'Assign To Agent', exact: true });
      await rec.wait('text=Assign to all Leads', 'assign popover');
      await rec.hold(1000);
    } },
    { step: 11, label: 'Choose Elara Merrivet', action: async (rec) => {
      await rec.select({ css: 'div.cursor-pointer:has(span:text-is("Elara Merrivet"))' });
      await rec.hold(800);
    } },
    { step: 12, label: 'Click Assign to all Leads', action: async (rec, page) => {
      await rec.click({ role: 'button', name: /Assign to all Leads/ }, { write: true });
      await rec.hold(2500);
      // The Assigned To column is off to the right; result() scrolls the table to it.
      await rec.result(page.locator('th', { hasText: 'Assigned To' }), { hold: 3000 });
    } },
  ],
  outro: async (rec) => { await rec.hold(2500); },
};
