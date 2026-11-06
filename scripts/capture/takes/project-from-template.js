/**
 * Take spec: project-from-template  (brand dashboard, Projects)
 *
 *   node record.js takes/project-from-template.js --dry   # stops before Launch project
 *   node record.js takes/project-from-template.js         # films and creates a DRAFT project
 *
 * Follows the five numbered steps of "Creating a project from a template"
 * (article about-projects): Projects, Create Project, Browse templates, pick
 * the shared "Franchisee Onboarding" template, Continue, name it
 * "Walkthrough - Opening project" and click Launch project. The take ends on
 * the first setup step (Pick a configuration). Launch project creates a draft
 * project; see tools/clip/project-from-template/RESTORE.md.
 */
const { dressHome } = require('../dress-home.js');
const NAME = 'Walkthrough - Opening project';
const DLG = '[role=dialog]';

module.exports = {
  id: 'project-from-template',
  article: 'about-projects',
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
    { step: 1, label: 'Open Projects', action: async (rec, page) => {
      await rec.hold(1500); // pre-roll: the template needs ~3.3 s before the first click
      await rec.click({ role: 'link', name: 'Projects', exact: true, within: 'nav' }, { transition: 'page' });
      await rec.wait('text=Create Project', 'projects load');
      // The first-visit "Welcome to Projects" tour sometimes opens; dismiss it if so.
      await page.waitForTimeout(2500);
      const later = page.getByRole('button', { name: 'Maybe Later' });
      if (await later.count()) { await later.click(); await page.waitForTimeout(800); }
    } },
    { step: 2, label: 'Click Create Project', action: async (rec) => {
      await rec.click({ role: 'button', name: 'Create Project', exact: true }, { transition: 'page' });
      await rec.wait('[role=dialog] >> text=Browse templates', 'chooser open');
      await rec.result(DLG); // How do you want to start?
    } },
    { step: 3, label: 'Click Browse templates', action: async (rec, page) => {
      await rec.click('[role=dialog] >> text=Browse templates', { transition: 'page' });
      await rec.wait('[role=dialog] >> text=Franchisee Onboarding', 'template list');
      // The Templates column of the Launch a project window.
      const list = page.locator(DLG).locator('div').filter({ hasText: /^Templates/ }).filter({ hasText: 'Franchisee Onboa' }).last();
      await rec.result(list, { hold: 2000 });
    } },
    { step: 4, label: 'Choose Franchisee Onboarding', action: async (rec, page) => {
      await rec.click({ css: 'text=Franchisee Onboarding', within: DLG });
      await rec.wait('[role=dialog] >> text=3 phases', 'template preview');
      // The preview pane: phases, task count, timing and the description.
      const preview = page.locator(DLG).locator('div').filter({ hasText: /3 phases/ }).filter({ hasText: 'Get Set Up' }).filter({ hasText: 'before location launch' }).last();
      await rec.result(preview);
    } },
    { step: 5, label: 'Click Continue', action: async (rec) => {
      await rec.click({ role: 'button', name: 'Continue', exact: true, within: DLG }, { transition: 'page' });
      await rec.wait('text=Project Name', 'name step');
      await rec.result({ role: 'textbox', within: DLG }, { hold: 2000 }); // the Project Name field
    } },
    { step: 6, label: 'Type the project name', action: async (rec, page) => {
      // The field is prefilled with the template name; select it off-log so only NAME is typed.
      await page.locator(DLG).getByRole('textbox').click();
      await page.keyboard.press('Control+A');
      await rec.type({ role: 'textbox', within: DLG }, NAME);
    } },
    { step: 7, label: 'Click Launch project', action: async (rec) => {
      await rec.click({ role: 'button', name: 'Launch project', exact: true, within: DLG }, { transition: 'page', write: true });
      await rec.wait('text=Pick a configuration', 'configuration step');
      await rec.result(DLG, { hold: 3000 }); // the setup steps start: Pick a configuration
    } },
  ],
  outro: async (rec) => { await rec.hold(2500); },
};
