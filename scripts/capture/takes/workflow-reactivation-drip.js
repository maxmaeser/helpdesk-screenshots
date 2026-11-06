/**
 * Take spec: workflow-reactivation-drip  (brand dashboard, Sales > Workflows > Campaign Builder)
 *
 *   node record.js takes/workflow-reactivation-drip.js --dry   # stops before Create Campaign
 *   node record.js takes/workflow-reactivation-drip.js         # creates the DRAFT workflow
 *
 * Builds "Walkthrough - Reactivation drip" with the Campaign Builder: two
 * existing Lumon Cafe emails, 3 days apart, triggered on Lead imported.
 * Create Campaign saves it as a DRAFT workflow. It is never published: its
 * trigger can reach any lead imported into Lumon Cafe, not only example.com.
 *
 * Cosmetic DOM fix (prod parity): the sms flag is on for the Lumon org on
 * staging but off for customers, so the take hides SMS templates in the
 * template picker and uses the flag-off copy ("email templates", "Emails").
 * Source: CampaignBuilderFlow.steps.tsx on fsai-codebase origin/prod.
 *
 * Opens on Home (dressed), then Sales > Workflows from the sidebar. One step
 * per numbered article step (Spacing Per Step is optional and not filmed).
 */
const { dressHome } = require('../dress-home.js');
const D = '[role=dialog]';
const NAME = 'Walkthrough - Reactivation drip';
const ADD = { css: 'button[aria-haspopup="listbox"]:has-text("Add a template")', within: D };
const SEARCH = 'input[placeholder="Search"]';

function hideSms() {
  if (window.__wtSmsHidden) return;
  window.__wtSmsHidden = true;
  const fix = () => {
    for (const el of document.querySelectorAll('p, span, label, div')) {
      if (el.childElementCount) continue;
      const t = (el.textContent || '').trim();
      const dlg = el.closest('[role=dialog]');
      if (dlg && t.includes('email and SMS templates')) el.textContent = el.textContent.replace('email and SMS templates', 'email templates');
      if (dlg && t === 'Steps' && /Choose your content/.test(dlg.textContent)) el.textContent = 'Emails';
      if (t === 'SMS' || /\bby SMS$/.test(t)) {
        // Hide (not remove) so React keeps owning the node.
        const row = el.closest('[role=option]');
        if (row && row.style.display !== 'none') row.style.display = 'none';
      }
    }
  };
  new MutationObserver(fix).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  fix();
}

/** The Campaign preview card on the right of the builder (recon 2026-10-23). */
const PREVIEW = { css: 'aside:has-text("Campaign preview")', within: D };
const addEmail = async (rec, page, name) => {
  await rec.click(ADD);
  await rec.wait(`${SEARCH} >> visible=true`, 'template picker open');
  await page.locator(`${SEARCH} >> visible=true`).press('Control+A');
  await rec.type(SEARCH, name);
  await rec.select(`text="${name}"`);
  await rec.hold(600);
  await rec.result(PREVIEW, { hold: 2000 }); // the preview draws the drip
};

module.exports = {
  id: 'workflow-reactivation-drip',
  article: 'how-to-build-a-reactivation-drip-workflow',
  surface: 'brand',
  brand: 'Lumon Cafe',
  // The brand chip check needs a brand page, so the take starts on Sales
  // Analytics and prepare() moves to Home off camera.
  start: (r) => r.resolve('SALES_ANALYTICS'),
  ready: 'nav >> text=Pipeline',
  prepare: async (page) => {
    await page.evaluate(hideSms);
    await page.goto(new URL('/', page.url()).href, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Your upcoming meetings', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await dressHome(page); // private inbox and calendar hidden, fictional busy copy on top
  },
  steps: [
    {
      step: 1, label: 'Open Sales',
      action: async (rec, page) => {
        await page.evaluate(hideSms);
        await rec.hold(1500); // pre-roll: the template needs ~3.3 s before the first click
        await rec.click({ role: 'button', name: 'Sales', exact: true, within: 'nav' });
        await rec.wait('nav a[href="/sales/campaigns"]', 'sales menu open');
      },
    },
    {
      step: 2, label: 'Click Workflows',
      action: async (rec) => {
        // Marketing and Operations have a Workflows item too: aim at the Sales one.
        await rec.click({ css: 'a[href="/sales/campaigns"]', within: 'nav' }, { transition: 'page' });
        await rec.wait('button:has-text("Create Workflow") >> visible=true', 'workflow list load');
      },
    },
    {
      step: 3, label: 'Click Create Workflow',
      action: async (rec) => {
        await rec.click({ css: 'button:has-text("Create Workflow")' }, { transition: 'page' });
        await rec.wait('text=Campaign Builder', 'create modal open');
        await rec.result(D, { hold: 2000 }); // the ways to start a workflow
      },
    },
    {
      step: 4, label: 'Click Campaign Builder',
      action: async (rec) => {
        // The card is taller than the cursor cap allows; aim at its title.
        await rec.click({ css: 'button:has-text("Campaign Builder") >> text="Campaign Builder"', within: D }, { transition: 'page' });
        await rec.wait('text=Choose your content', 'campaign builder open');
        await rec.result(ADD, { hold: 1500 }); // start by adding your emails
      },
    },
    { step: 5, label: 'Add the first email', action: (rec, page) => addEmail(rec, page, 'Lumon Cafe W8 E1') },
    { step: 6, label: 'Add the second email', action: (rec, page) => addEmail(rec, page, 'Lumon Cafe W9 E2') },
    {
      step: 7, label: 'Click Continue',
      action: async (rec) => {
        await rec.click({ role: 'button', name: 'Continue', exact: true, within: D }, { transition: 'page' });
        await rec.wait('text=Set the timing', 'timing step');
        await rec.hold(800);
      },
    },
    {
      step: 8, label: 'Set the Default Spacing',
      action: async (rec) => {
        await rec.click({ css: 'button[aria-haspopup="listbox"]:has-text("1 day")', within: D });
        await rec.wait('[role=option] >> visible=true', 'spacing menu open');
        await rec.select({ role: 'option', name: '3 days', exact: true });
        await rec.hold(600);
        await rec.result(PREVIEW, { hold: 2000 }); // Wait 3 days between the emails
      },
    },
    {
      step: 9, label: 'Click Continue',
      action: async (rec) => {
        await rec.click({ role: 'button', name: 'Continue', exact: true, within: D }, { transition: 'page' });
        await rec.wait('text=How should this campaign start?', 'launch step');
        await rec.hold(800);
      },
    },
    {
      step: 10, label: 'Choose Trigger on an event',
      action: async (rec) => {
        await rec.click({ css: 'button:has-text("Trigger on an event")', within: D });
        await rec.wait('text=Trigger Event', 'trigger picker shown');
        await rec.result({ css: 'button[aria-haspopup="listbox"]:has-text("Select an event")', within: D }, { hold: 1500 }); // Trigger Event appears
      },
    },
    {
      step: 11, label: 'Pick Lead imported',
      action: async (rec) => {
        await rec.click({ css: 'button[aria-haspopup="listbox"]:has-text("Select an event")', within: D });
        await rec.wait('[role=option] >> visible=true', 'event picker open');
        await rec.select({ role: 'option', name: 'Lead imported', exact: true });
        await rec.wait('text=Stop sending when', 'goal and stop rules shown');
        await rec.hold(400);
        await rec.result({ css: 'button[aria-haspopup="listbox"]:has-text("Lead imported")', within: D }); // every import starts it
      },
    },
    {
      step: 12, label: 'Click Continue',
      action: async (rec) => {
        await rec.click({ role: 'button', name: 'Continue', exact: true, within: D }, { transition: 'page' });
        await rec.wait('text=Name your campaign', 'review step');
      },
    },
    {
      step: 13, label: 'Name the campaign',
      action: async (rec, page) => {
        const b = await page.locator(`${D} >> input[placeholder="Campaign name..."]`).boundingBox();
        await rec.move(b.x + b.width / 2, b.y + b.height / 2);
        // The field is prefilled from the trigger ("Lead imported campaign"): replace it.
        await page.locator(`${D} >> input[placeholder="Campaign name..."]`).press('Control+A');
        await rec.type({ css: 'input[placeholder="Campaign name..."]', within: D }, NAME);
      },
    },
    {
      step: 14, label: 'Click Create Campaign',
      action: async (rec, page) => {
        await rec.click({ role: 'button', name: 'Create Campaign', exact: true, within: D }, { transition: 'page', write: true });
        await rec.wait(() => page.waitForURL(/\/workflow\/(?!new)[0-9a-f-]{36}/, { timeout: 30000 }), 'draft workflow created');
        await rec.wait('.react-flow__node >> visible=true', 'builder load');
        await rec.result({ css: '[role=switch]' }, { hold: 3000 }); // the toggle reads Draft: nothing sends yet
      },
    },
  ],
  outro: async (rec) => { await rec.hold(2500); },
};
