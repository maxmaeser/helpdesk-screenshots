/**
 * Take spec: workflows-review-activate  (brand dashboard, Sales > Workflows)
 *
 *   node record.js takes/workflows-review-activate.js --dry
 *   node record.js takes/workflows-review-activate.js
 *
 * Reviews "Walkthrough - Funnel welcome", a Duplicate of the brand's
 * "Lumon Cafe W1 - Funnel welcome" funnel workflow made by the capture account
 * (the originals are view-only to it: only their creator or a brand admin can
 * edit, so they show no publish toggle). NO writes: nothing is saved and the
 * workflow is never published. Its trigger (Lead completes the funnel) can
 * reach any real lead, so the take ends hovering the Draft toggle, unclicked.
 *
 * Opens on Home (dressed), then Sales > Workflows from the sidebar.
 */
const { dressHome } = require('../dress-home.js');
const NAME = 'Walkthrough - Funnel welcome';
const node = (text) => ({ css: `.react-flow__node:has-text("${text}")` });
/** The side panel a canvas step or card opens (recon 2026-10-23). */
const panel = (text) => ({ css: `div.fixed[class*="z-panel"]:has-text("${text}")` });
const closePanel = async (rec, page) => {
  await rec.hold(300);
  await page.keyboard.press('Escape');
  await rec.wait(400, 'panel close');
};

module.exports = {
  id: 'workflows-review-activate',
  article: 'how-to-review-and-publish-workflows',
  surface: 'brand',
  brand: 'Lumon Cafe',
  // The brand chip check needs a brand page, so the take starts on Sales
  // Analytics and prepare() moves to Home off camera.
  start: (r) => r.resolve('SALES_ANALYTICS'),
  ready: 'nav >> text=Pipeline',
  prepare: async (page) => {
    await page.goto(new URL('/', page.url()).href, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Your upcoming meetings', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await dressHome(page); // private inbox and calendar hidden, fictional busy copy on top
  },
  steps: [
    {
      step: 1, label: 'Open Sales',
      action: async (rec) => {
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
        await rec.wait(`text=${NAME} >> visible=true`, 'workflow list load');
        // The row is wider than the viewport; ring its Status cell (reads Draft).
        await rec.result({ css: `tr:has-text("${NAME}") >> td:has-text("Draft")` });
      },
    },
    {
      step: 3, label: 'Open the workflow',
      action: async (rec) => {
        await rec.click({ css: `text=${NAME}` }, { transition: 'page' });
        await rec.wait('.react-flow__node:has-text("Trigger") >> visible=true', 'builder load');
        await rec.result({ css: '.react-flow' }, { hold: 2000 }); // the steps on the canvas
      },
    },
    {
      step: 4, label: 'Click the Trigger step',
      action: async (rec, page) => {
        await rec.click(node('Trigger'), { transition: 'page' });
        await rec.wait('text=Trigger Node', 'trigger panel open');
        await rec.result(panel('Trigger Node')); // When this happens: Lead completes the funnel
        await closePanel(rec, page);
      },
    },
    {
      step: 5, label: 'Click the first Send Email step',
      action: async (rec, page) => {
        await rec.click(node('Lumon Cafe W1 E1'), { transition: 'page' });
        await rec.wait('text=Send Email Node', 'email panel open');
        await rec.result(panel('Send Email Node')); // Email template and Send to
        await closePanel(rec, page);
      },
    },
    {
      step: 6, label: 'Click the Delay step',
      action: async (rec, page) => {
        await rec.click(node('2 days after E1'), { transition: 'page' });
        await rec.wait('text=Delay Node', 'delay panel open');
        await rec.result(panel('Delay Node')); // Wait for
        await closePanel(rec, page);
      },
    },
    {
      step: 7, label: 'Click Goal',
      action: async (rec, page) => {
        await rec.click({ css: 'button:has-text("Goal")' }, { transition: 'page' });
        await rec.wait('text=Count as a goal when', 'goal panel open');
        await rec.result(panel('Count as a goal when'));
        await closePanel(rec, page);
      },
    },
    {
      step: 8, label: 'Click Cancellation',
      action: async (rec, page) => {
        // The whole card is taller than the cursor cap allows; aim at its title.
        await rec.click({ css: 'button:has-text("Cancellation") >> text="Cancellation"' }, { transition: 'page' });
        await rec.wait('text=Cancellation Rules', 'cancellation panel open');
        await rec.result(panel('Cancellation Rules'));
        await closePanel(rec, page);
      },
    },
  ],
  outro: async (rec, page) => {
    // Hover (never click) the publish toggle: it reads Draft until published.
    const b = await page.locator('[role=switch] >> visible=true').first().boundingBox();
    await rec.move(b.x + b.width / 2, b.y + b.height / 2);
    await rec.hold(3500);
  },
};
