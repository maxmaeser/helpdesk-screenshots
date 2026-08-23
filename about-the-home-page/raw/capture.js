const path = require('path');
const ROOT = '/home/max/work/fsai/fsai-helpdesksuite/screenshots';
const { getContext, closeAll } = require(path.join(ROOT, 'scripts/capture/session.js'));
const { resolve } = require(path.join(ROOT, 'scripts/capture/routes.js'));
const { sanitize } = require(path.join(ROOT, 'scripts/dom-sanitize.js'));

const OUT = path.join(ROOT, 'about-the-home-page/raw');

const NO_OUTLINE = `* { outline: none !important; }`;

async function injectNoOutline(page) {
  await page.addStyleTag({ content: NO_OUTLINE });
}

async function dismissTour(page) {
  const overlays = await page.locator('[class*="tour-"]').all();
  for (const el of overlays) {
    try {
      const closeBtn = el.locator(
        'button:has-text("Maybe Later"), button:has-text("Close"), button:has-text("Skip"), button[aria-label="Close"]'
      );
      if (await closeBtn.count()) {
        await closeBtn.first().click({ timeout: 2000 }).catch(() => {});
      }
    } catch (e) {}
  }
}

async function sanitizeShot(page) {
  const counts1 = await page.evaluate(sanitize, {});
  await page.waitForTimeout(150);
  const counts2 = await page.evaluate(sanitize, {});
  return { counts1, counts2 };
}

(async () => {
  const { page } = await getContext('brand');

  const url = resolve('BASE');
  console.log('Navigating to', url);
  await page.goto(url, { waitUntil: 'networkidle' });
  await injectNoOutline(page);
  await dismissTour(page);
  await page.waitForTimeout(800);

  console.log('Page title:', await page.title());
  console.log('URL after nav:', page.url());

  // ---- Click Tasks tab ----
  const tasksTab = page.locator('button:has-text("Tasks"), [role="tab"]:has-text("Tasks")').first();
  await tasksTab.click({ timeout: 5000 });
  await page.waitForTimeout(800);
  await injectNoOutline(page);
  await dismissTour(page);
  await page.waitForTimeout(500);

  // ---- Shot 1: Create Quick Task modal ----
  const createBtn = page.locator('button:has-text("Create Task")').first();
  await createBtn.waitFor({ state: 'visible', timeout: 10000 });
  await createBtn.click({ timeout: 5000 });
  await page.waitForTimeout(800);
  await injectNoOutline(page);

  // Fill Task Name for a fuller look
  const nameField = page.locator('input[placeholder*="Task Name" i], input[name*="name" i]').first();
  if (await nameField.count()) {
    await nameField.fill('Follow up with new franchisee lead').catch(() => {});
  }
  await page.waitForTimeout(300);

  await sanitizeShot(page);
  await page.waitForTimeout(150);
  await sanitizeShot(page);

  // Locate the modal for a bounding box
  let modal = page.locator('[role="dialog"]').first();
  if (!(await modal.count())) {
    modal = page.locator('.modal, [class*="Modal"]').first();
  }
  let box1 = await modal.boundingBox();
  console.log('Modal 1 box:', box1);
  if (box1) {
    const pad = 12;
    const clip1 = {
      x: Math.max(0, box1.x - pad),
      y: Math.max(0, box1.y - pad),
      width: box1.width + pad * 2,
      height: box1.height + pad * 2,
    };
    await page.screenshot({ path: path.join(OUT, 'home-create-quick-task.png'), clip: clip1 });
    console.log('Saved home-create-quick-task.png', clip1);
  } else {
    await page.screenshot({ path: path.join(OUT, '_debug-quick-task-full.png'), fullPage: true });
    console.log('Modal not found for shot 1 — saved debug full page instead.');
  }

  // ---- Shot 2: Turn into work task -> Pick a task type ----
  const turnIntoBtn = page.locator('button:has-text("Turn into work task")').first();
  await turnIntoBtn.waitFor({ state: 'visible', timeout: 5000 });
  await turnIntoBtn.click({ timeout: 5000 });
  await page.waitForTimeout(900);
  await injectNoOutline(page);

  await sanitizeShot(page);
  await page.waitForTimeout(150);
  await sanitizeShot(page);

  await page.mouse.move(20, 20); // clear any stray hover tooltip
  await page.waitForTimeout(200);

  let modal2 = page.locator('[role="dialog"]').first();
  if (!(await modal2.count())) {
    modal2 = page.locator('.modal, [class*="Modal"]').first();
  }

  // The dialog itself is capped at max-height:640px with overflow:auto, and
  // the 7-card grid inside is a second, independently-scrolling div — both
  // clip already-rendered real content (not fabricating anything). The spec
  // wants all 7 cards in one shot, so unclip both rather than scrolling.
  await modal2.evaluate((dialogEl) => {
    const unclip = (el) => {
      el.style.overflow = 'visible';
      el.style.maxHeight = 'none';
      el.style.height = 'auto';
    };
    unclip(dialogEl);
    dialogEl.querySelectorAll('*').forEach((el) => {
      if (el.scrollHeight - el.clientHeight > 5) unclip(el);
    });
  });
  await page.waitForTimeout(200);
  // Second pass: unclipping the root can reveal fresh overflow lower down.
  await modal2.evaluate((dialogEl) => {
    dialogEl.querySelectorAll('*').forEach((el) => {
      if (el.scrollHeight - el.clientHeight > 5) {
        el.style.overflow = 'visible';
        el.style.maxHeight = 'none';
        el.style.height = 'auto';
      }
    });
  });
  await page.waitForTimeout(200);

  let box2 = await modal2.boundingBox();
  console.log('Modal 2 box:', box2);
  if (box2) {
    const pad = 12;
    const clip2 = {
      x: Math.max(0, box2.x - pad),
      y: Math.max(0, box2.y - pad),
      width: box2.width + pad * 2,
      height: box2.height + pad * 2,
    };
    await page.screenshot({ path: path.join(OUT, 'home-work-task-type-picker.png'), clip: clip2 });
    console.log('Saved home-work-task-type-picker.png', clip2);
  } else {
    await page.screenshot({ path: path.join(OUT, '_debug-type-picker-full.png'), fullPage: true });
    console.log('Modal not found for shot 2 — saved debug full page instead.');
  }

  await closeAll();
})().catch(async (e) => {
  console.error('FATAL', e);
  process.exit(1);
});
