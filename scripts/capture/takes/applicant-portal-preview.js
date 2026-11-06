/**
 * Take spec: applicant-portal-preview  (Lumon Cafe, funnel surface)
 *   node ../record.js takes/applicant-portal-preview.js [--dry]
 * Film: Studio > Funnel > Preview as a candidate, then add a video to the
 * Resources end screen from the Library. NEVER saves: the video chosen is an
 * asset "Walkthrough - Welcome video.mp4" uploaded once off camera on 2026-10-18.
 * Lumon Health (portal surface) cannot be filmed: Generate on its Applicant
 * Portal editor returns 500 on staging.
 */
const { dressHome } = require('../dress-home.js');
/** The live preview card on the right of the builder (same as funnel-build-publish). */
const PREVIEW = { css: 'div[class*="@container"][class*="h-[100cqh]"]' };

module.exports = {
  id: 'applicant-portal-preview',
  article: 'how-to-preview-your-applicant-portal',
  surface: 'brand',
  brand: 'Lumon Cafe',
  start: (r) => r.resolve('SALES_WORKFLOWS'),
  ready: 'text=Studio >> visible=true',
  // Opens on Home, dressed with fictional content (same pattern as funnel-build-publish).
  prepare: async (page) => {
    await page.goto(new URL('/', page.url()).href, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Your upcoming meetings', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await dressHome(page);
  },
  steps: [
    { step: 1, label: 'Open Studio', action: async (rec) => {
      await rec.hold(1500); // pre-roll: the template needs ~3.3 s before the first click
      await rec.click({ role: 'button', name: 'Studio', exact: true, within: 'nav' }, { transition: 'local' });
      await rec.wait('nav a[href="/studio/funnel"]', 'studio menu');
    } },
    { step: 2, label: 'Open Funnel', action: async (rec) => {
      await rec.click({ role: 'link', name: 'Funnel', exact: true, within: 'nav' }, { transition: 'page' });
      await rec.wait('text=Pre-qualify', 'funnel builder load');
      await rec.wait('[data-guide-target="add-question"]', 'funnel preview load');
      await rec.result(PREVIEW); // the builder opens on your funnel
    } },
    { step: 3, label: 'Click Preview', action: async (rec, page) => {
      await rec.click({ role: 'button', name: 'Preview', exact: true }, { transition: 'page' });
      await rec.wait('text=Preview as', 'preview mode');
      await rec.result(page.getByText(/^\d+ \/ \d+$/)); // the step counter: how far through you are
    } },
    { step: 4, label: 'Click Needs review', action: async (rec) => {
      await rec.click({ role: 'button', name: 'Needs review', exact: true }, { transition: 'local' });
      await rec.hold(500);
      await rec.result({ role: 'button', name: 'Needs review', exact: true }); // previewing the Needs review path
    } },
    { step: 5, label: 'Click Edit', action: async (rec) => {
      await rec.click({ role: 'button', name: 'Edit', exact: true }, { transition: 'page' });
      await rec.wait('text=Structure', 'edit mode');
    } },
    { step: 6, label: 'Open Resources', action: async (rec) => {
      await rec.click({ css: 'text=Resources >> nth=-1' }, { transition: 'page' });
      await rec.wait('text=From Library', 'resources step');
      await rec.result('text=No resources yet'); // the Resources end screen, empty so far
    } },
    { step: 7, label: 'Click From Library', action: async (rec) => {
      await rec.click({ role: 'button', name: 'From Library', exact: true }, { transition: 'page' });
      await rec.wait('[role=dialog]', 'library dialog');
      await rec.hold(800);
    } },
    { step: 8, label: 'Select the video', action: async (rec) => {
      await rec.click({ css: '[role=dialog] >> text=Walkthrough - Welcome video.mp4' }, { transition: 'local' });
    } },
    { step: 9, label: 'Click Confirm Selection', action: async (rec, page) => {
      await rec.click({ role: 'button', name: 'Confirm Selection', exact: true }, { transition: 'page' });
      await rec.wait(() => page.waitForSelector('[role=dialog]', { state: 'detached', timeout: 20000 }), 'dialog closed');
      await rec.wait('input[aria-label="Resource 1 title"]', 'video card');
      // The video card on the end screen.
      await rec.result(page.locator('div').filter({ has: page.locator('input[aria-label="Resource 1 title"]') }).filter({ hasText: 'min' }).last(), { hold: 3000 });
    } },
  ],
  outro: async (rec) => { await rec.hold(2500); },
};
