/**
 * Take spec: form-qualifier  (brand dashboard, Studio > Forms)
 *
 *   node record.js takes/form-qualifier.js --dry   # stops before Create
 *   node record.js takes/form-qualifier.js         # films and WRITES a form
 *
 * Creates the form "Walkthrough - Qualifier form" and one required Currency
 * field "Walkthrough - Liquid capital" on Lumon Cafe staging (staging writes
 * approved). No email is typed or sent. The funnel is not touched.
 */
const FORM = 'Walkthrough - Qualifier form';
const FIELD = 'Walkthrough - Liquid capital';
const QUESTION = 'Liquid capital available?';
const ACCOUNT = 'Claude Maeser';
const { dressHome } = require('../dress-home.js');

module.exports = {
  id: 'form-qualifier',
  article: 'how-to-build-a-form',
  surface: 'brand',
  // The default name rule rewrites form names such as "Personal Information Form" into
  // fake people, so names are off and the capture account's own name is replaced explicitly.
  sanitize: { emails: '{first}.{last}@example.com', phones: '(720) 555-0142', freshenDates: false, names: false, replacements: [{ find: ACCOUNT, replace: 'Jordan Avery' }] },
  brand: 'Lumon Cafe',
  start: (r) => r.resolve('STUDIO_EMAIL_TEMPLATES'),
  ready: 'text=Email Templates',
  // Opens on Home, dressed with fictional content (same pattern as funnel-build-publish).
  prepare: async (page) => {
    await page.goto(new URL('/', page.url()).href, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Your upcoming meetings', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    // The start page leaves Studio expanded in the sidebar; collapse it so step 1 opens it on camera.
    if (await page.locator('nav a[href="/studio/forms"]').isVisible()) {
      await page.locator('nav').getByRole('button', { name: 'Studio', exact: true }).click();
      await page.waitForSelector('nav a[href="/studio/forms"]', { state: 'hidden', timeout: 10000 });
    }
    await page.waitForTimeout(4000);
    await dressHome(page);
  },
  steps: [
    { step: 1, label: 'Open Studio', action: async (rec) => {
        await rec.hold(1500); // pre-roll: the template needs ~3.3 s before the first click
        await rec.click({ role: 'button', name: 'Studio', exact: true, within: 'nav' });
        await rec.wait('nav a[href="/studio/forms"]', 'studio menu open');
    } },
    { step: 2, label: 'Click Forms', action: async (rec, page) => {
        await rec.click({ role: 'link', name: 'Forms', exact: true, within: 'nav' }, { transition: 'page' });
        await rec.wait('text=Total Forms', 'forms list load');
        await rec.wait('table >> text=Personal Information Form >> visible=true', 'forms rows load');
        // The list (the page also holds an invisible measuring copy of the table). Name, Type, Display Group, Created At.
        await rec.result({ css: 'div.overflow-auto > table' });
    } },
    { step: 3, label: 'Open the Actions menu', action: async (rec) => {
        await rec.click({ role: 'button', name: 'Actions' });
        await rec.wait('[role=menuitem]', 'menu open');
    } },
    { step: 4, label: 'Click Create New Form', action: async (rec) => {
        await rec.click({ role: 'menuitem', name: 'Create New Form' }, { transition: 'page' });
        await rec.wait('text=Who Is This Form For?', 'dialog open');
        await rec.result('[role=dialog]', { hold: 1200 }); // the new form dialog
    } },
    { step: 5, label: 'Type the form name', action: async (rec) => {
        await rec.type('[placeholder="Personal Information Form"]', FORM);
    } },
    { step: 6, label: 'Choose who the form is for', action: async (rec) => {
        await rec.click('[role=dialog] button[aria-haspopup="listbox"]');
        await rec.wait('[role=option]', 'audience menu open');
        await rec.select({ role: 'option', name: 'Applicants/Franchisees' });
        await rec.hold(400);
        await rec.result('[role=dialog] button[aria-haspopup="listbox"]'); // Applicants/Franchisees chosen
    } },
    { step: 7, label: 'Click Create', action: async (rec, page) => {
        await rec.click({ role: 'button', name: 'Create', exact: true }, { transition: 'page', write: true });
        await rec.wait('text=Create First Page', 'builder load');
        await rec.hold(500);
    } },
    { step: 8, label: 'Click Create First Page', action: async (rec) => {
        await rec.click({ role: 'button', name: 'Create First Page' }, { transition: 'local' });
        await rec.wait('text=Drop fields here', 'page created');
        await rec.result('text=Drop fields here'); // the new, empty page
    } },
    { step: 9, label: 'Click Create New Field', action: async (rec) => {
        await rec.click({ role: 'button', name: 'Create New Field' }, { transition: 'page' });
        await rec.wait('[placeholder="Enter field name"]', 'field dialog open');
        await rec.hold(500);
    } },
    { step: 10, label: 'Type the field name', action: async (rec) => {
        await rec.type('[placeholder="Enter field name"]', FIELD);
        await rec.hold(400);
    } },
    { step: 11, label: 'Type the field question', action: async (rec) => {
        await rec.type('[placeholder="Enter field question"]', QUESTION);
        await rec.hold(400);
    } },
    { step: 12, label: 'Choose the Currency type', action: async (rec, page) => {
        await rec.click(page.locator('button[aria-haspopup="listbox"]').filter({ hasText: /^\s*Single Select\s*$/ }));
        await rec.wait('[role=option]', 'type menu open');
        await rec.select({ role: 'option', name: 'Currency' });
        await rec.hold(400);
    } },
    { step: 13, label: 'Set Required Field to Yes', action: async (rec, page) => {
        await rec.click(page.locator('button[aria-haspopup="listbox"]').filter({ hasText: /^\s*No\s*$/ }));
        await rec.wait('[role=option]', 'required menu open');
        await rec.select({ role: 'option', name: 'Yes' });
        await rec.hold(400);
    } },
    { step: 14, label: 'Click Save Field', action: async (rec, page) => {
        await rec.click({ role: 'button', name: /Save Field/ }, { transition: 'page', write: true });
        await rec.wait('text=Field Created', 'field saved');
        await rec.result('text=Field Created', { hold: 1500 });
    } },
    { step: 15, label: 'Drag the field onto the page', action: async (rec, page) => {
        // Search the Fields Library (the stepped event), then drag the field onto the page.
        await rec.type('[placeholder="Search for a field by name"]', 'Walkthrough');
        await rec.hold(800);
        const src = await page.locator(`text=${FIELD}`).first().boundingBox();
        const dst = await page.locator('text=Drop fields here').first().boundingBox();
        await rec.move(src.x + 10, src.y + 10);
        await page.mouse.down();
        await rec.move(dst.x + 40, dst.y + 10, { ms: 1400 });
        await rec.hold(300);
        await page.mouse.up();
        await rec.wait(`text=${QUESTION}`, 'field placed');
        await rec.result(page.getByText(QUESTION).first(), { hold: 3000 }); // required: asterisk after the question
    } },
  ],
  outro: async (rec) => { await rec.hold(2500); },
};
