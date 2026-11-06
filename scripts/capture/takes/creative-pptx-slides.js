/**
 * Take spec: creative-pptx-slides  (brand dashboard, Library > Assets)
 *
 *   node record.js takes/creative-pptx-slides.js --dry   # stops before Convert
 *   node record.js takes/creative-pptx-slides.js         # converts the deck (WRITES)
 *
 * Follows "Edit a PowerPoint, including Canva designs" in the article
 * how-to-edit-files-in-the-creative-editor: open the .pptx in the Library,
 * click Convert to slides, keep Copy Sharing Settings on, turn Move Original
 * File To The Trash off (so the source deck stays for later takes), Convert.
 * Uses "Lumon Cafe Training Deck.pptx", uploaded to the Lumon Cafe Library by
 * another lane on 2026-10-20. FLAGGED per org (creative_editor).
 *
 * Gallery view selects a card on a single click, so the take opens the file
 * from the card's More actions menu (Preview), like a user without a
 * double-click would. Recon 2026-10-23.
 */
const { dressHome } = require('../dress-home.js');
const FILE = 'Lumon Cafe Training Deck.pptx';
// The file viewer is a dialog too: aim at the innermost dialog, the Convert to slides one.
const DLG = '[role=dialog]:has-text("Copy Sharing Settings"):not(:has([role=dialog]))';
const card = (page) => page.locator(`text=${FILE} >> visible=true`).first()
  .locator('xpath=ancestor::*[.//button[@aria-label="More actions"]][1]');

module.exports = {
  id: 'creative-pptx-slides',
  article: 'how-to-edit-files-in-the-creative-editor',
  surface: 'brand',
  brand: 'Lumon Cafe',
  // Opens on Home. The brand chip check needs a brand page, so the take starts
  // on Sales Analytics and prepare() moves to Home off camera.
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
    { step: 1, label: 'Open Library', action: async (rec) => {
      await rec.hold(1500); // pre-roll: the template needs ~3.3 s before the first click
      await rec.click({ role: 'button', name: 'Library', exact: true, within: 'nav' });
      await rec.wait('nav a[href="/library"]', 'library menu open');
    } },
    { step: 2, label: 'Click Assets', action: async (rec) => {
      await rec.click({ css: 'a[href="/library"]', within: 'nav' }, { transition: 'page' });
      await rec.wait(`text=${FILE} >> visible=true`, 'assets load');
      await rec.hold(600);
    } },
    { step: 3, label: 'Open the file menu', action: async (rec, page) => {
      await card(page).hover();
      await rec.click(card(page).getByRole('button', { name: 'More actions' }));
      await rec.wait('[role=menuitem] >> text=Preview', 'file menu open');
    } },
    { step: 4, label: 'Click Preview', action: async (rec, page) => {
      await rec.click({ role: 'menuitem', name: 'Preview', exact: true }, { transition: 'page' });
      await rec.wait(() => page.getByRole('button', { name: 'Convert to slides' }).waitFor({ state: 'visible', timeout: 30000 }), 'file opens');
      await rec.hold(1200);
    } },
    { step: 5, label: 'Click Convert to slides', action: async (rec) => {
      await rec.click({ role: 'button', name: 'Convert to slides', exact: true }, { transition: 'page' });
      await rec.wait(DLG, 'convert dialog open');
      await rec.result(DLG); // both options are on by default
    } },
    { step: 6, label: 'Turn off Move Original File To The Trash', action: async (rec) => {
      await rec.click({ role: 'switch', name: 'Move original file to the Trash', within: DLG });
      await rec.wait(`${DLG} >> [role=switch][aria-label="Move original file to the Trash"][aria-checked="false"]`, 'switch off');
      await rec.result({ role: 'switch', name: 'Move original file to the Trash', within: DLG }, { hold: 1500 }); // the .pptx stays in the Library
    } },
    { step: 7, label: 'Click Convert', action: async (rec, page) => {
      await rec.click({ role: 'button', name: 'Convert', exact: true, within: DLG }, { transition: 'page', write: true });
      // Converts in the browser: allow a minute for the deck to be created.
      await rec.wait(() => page.waitForSelector(DLG, { state: 'detached', timeout: 60000 }), 'deck created');
      await rec.hold(1200);
      // Best effort: ring the confirmation toast if one shows. Post-write UI was
      // not seen in a dry run; check the real take's frames.
      const toast = page.locator('[data-sonner-toast] >> visible=true');
      if (await toast.count() === 1) await rec.result(toast, { hold: 3000 });
      else await rec.hold(3000);
    } },
  ],
  outro: async (rec) => { await rec.hold(2500); },
};
