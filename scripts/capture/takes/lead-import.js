/**
 * Take spec: lead-import  (brand dashboard, Sales > Pipeline > Actions > Import from CSV)
 *
 *   node record.js takes/lead-import.js --dry   # stops before the CSV upload (the first write)
 *   node record.js takes/lead-import.js         # imports 3 leads on staging
 *
 * Imports research/builds-2026-10-18/walkthroughs/lead-import/walkthrough-leads.csv
 * (walkthrough+lead1..3@example.com). Starts no sequence or workflow.
 *
 * The upload itself creates a server-side import draft, so the upload click is
 * the first write: --dry stops before it and leaves nothing behind. A draft
 * left by an aborted real take blocks the next import; delete it from
 * Pipeline > Actions > Import > Imports in Progress > Delete Import.
 *
 * Before a real take, the three walkthrough leads from the 2026-10-18 take must
 * be gone, or duplicate handling skips every row (see tools/clip/lead-import/RESTORE.md).
 */
const path = require('path');
const { dressHome } = require('../dress-home.js');
const CSV = path.resolve(__dirname, '../../../../research/builds-2026-10-18/walkthroughs/lead-import/walkthrough-leads.csv');
const NEXT = { role: 'button', name: 'Next', exact: true };
const DLG = '[role=dialog]';

module.exports = {
  id: 'lead-import',
  article: 'how-to-import-audiences',
  surface: 'brand',
  brand: 'Lumon Cafe',
  // Opens on Home: the brand chip check needs a brand page, so the take starts
  // on Sales Analytics and prepare() moves to Home off camera.
  start: () => 'https://staging.app.franchisesystems.ai/sales/analytics',
  ready: 'text=Pipeline',
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
    { step: 2, label: 'Click Pipeline', action: async (rec, page) => {
      await rec.click({ role: 'link', name: 'Pipeline', exact: true, within: 'nav' }, { transition: 'page' });
      await rec.wait('text=Total Leads', 'pipeline load');
      await rec.wait('tbody tr >> visible=true', 'lead rows');
      await rec.result(page.getByText(/^Total Leads: \d+$/)); // the lead count over the table
    } },
    { step: 3, label: 'Click Actions', action: async (rec) => {
      await rec.click({ role: 'button', name: 'Actions', exact: true });
      await rec.wait('[role=menuitem]', 'actions menu open');
      await rec.hold(600);
    } },
    { step: 4, label: 'Click Import', action: async (rec) => {
      await rec.click({ role: 'menuitem', name: 'Import', exact: true });
      await rec.wait('text=Import from CSV', 'import submenu open');
      await rec.hold(600);
    } },
    { step: 5, label: 'Click Import from CSV', action: async (rec) => {
      await rec.click({ role: 'menuitem', name: 'Import from CSV', exact: true }, { transition: 'page' });
      await rec.wait(`${DLG} >> text=Start Import`, 'import dialog open');
      await rec.hold(500); // let the dialog animation finish before measuring
      await rec.result(DLG); // Import Leads: Brand reads Lumon Cafe
    } },
    { step: 6, label: 'Click Start Import', action: async (rec) => {
      await rec.click({ role: 'button', name: 'Start Import', exact: true, within: DLG }, { transition: 'page' });
      await rec.wait('text=Click to upload', 'import page load');
      await rec.result({ css: 'button[role=presentation]' }); // the upload area
    } },
    { step: 7, label: 'Upload your CSV file', action: async (rec, page) => {
      const chooser = page.waitForEvent('filechooser').catch(() => null); // no unhandled rejection when --dry stops at the click
      await rec.click({ css: 'button[role=presentation] span.text-blue-accent' }, { write: true }); // the upload creates an import draft
      const fc = await chooser;
      if (!fc) throw new Error('no file chooser opened');
      await fc.setFiles(CSV);
      await rec.wait('text=Map your fields', 'csv parsed');
      await rec.result('text=Map your fields');
    } },
    { step: 8, label: 'Click Next', action: async (rec) => {
      await rec.click(NEXT);
      await rec.wait('text=All Columns Mapped', 'custom fields step');
      await rec.result('text=All Columns Mapped');
    } },
    { step: 9, label: 'Click Next', action: async (rec) => {
      await rec.click(NEXT);
      await rec.wait('text=Review Mapped Data', 'review step');
      await rec.result('text=Review Mapped Data');
    } },
    { step: 10, label: 'Click Next', action: async (rec) => {
      await rec.click(NEXT);
      await rec.wait('text=Ready to import', 'import step');
      await rec.result('text="Ready to Import"'); // the step heading (unquoted text= also matches "Ready to import 3 rows")
    } },
    { step: 11, label: 'Click Start Import', action: async (rec) => {
      await rec.click({ role: 'button', name: 'Start Import', exact: true }, { write: true });
      await rec.wait('text=Total rows imported', 'import summary');
      await rec.result('text=Total rows imported');
    } },
    { step: 12, label: 'Click Done', action: async (rec) => {
      await rec.click({ role: 'button', name: 'Done', exact: true }, { transition: 'page' });
      await rec.wait('text=Total Leads', 'pipeline reload');
      await rec.wait('text=walkthrough+lead1', 'imported rows');
      await rec.result({ css: 'tbody tr:has-text("walkthrough+lead1") td:has-text("walkthrough+lead1")' }, { hold: 3000 }); // a new lead in the table (the email cell: the row is wider than the viewport)
    } },
  ],
  outro: async (rec) => { await rec.hold(2500); },
};
