import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';
const ART = 'how-to-set-up-group-scheduling';
mkdirSync(`${ROOT}/${ART}/raw`, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: '/tmp/pw-storage-state.json',
  viewport: { width: 1280, height: 1400 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

async function prep() {
  await page.addStyleTag({ content: '* { outline: none !important; }' });
  await page.evaluate(() => {
    const fb = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Feedback'));
    if (fb) fb.style.display = 'none';
  });
}

async function snap(name, clip) {
  const path = `${ROOT}/${ART}/raw/${name}.png`;
  await page.screenshot({ path, clip, scale: 'device' });
  const w2 = Math.round(clip.width * 2), h2 = Math.round(clip.height * 2);
  const finalH = h2 - 16 + 120;
  console.log(`  SNAP ${name} (${Math.round(clip.width)}x${Math.round(clip.height)} CSS -> ${w2}x${h2} px, final ~${finalH}px)`);
  if (finalH > 1000) console.log(`  ⚠️  OVER 1000px limit!`);
}

// Navigate to Brand Settings
console.log('Navigating to Brand settings...');
await page.goto(`${STAGING}/settings/brands#brand-scheduling-events`);
await page.waitForTimeout(5000);
await prep();

// Check if event exists, if not create one
const hasEvent = await page.evaluate(() => {
  return [...document.querySelectorAll('h3')].some(h => h.textContent.includes('Discovery Call'));
});

if (!hasEvent) {
  console.log('Creating event first...');
  // Scroll to Calendar Events
  await page.evaluate(() => {
    const allH2 = [...document.querySelectorAll('h2')];
    const calH2 = allH2.find(h => h.textContent.trim() === 'Calendar Events');
    if (calH2) calH2.closest('div').parentElement.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(500);

  const createBtn = page.locator('button:has-text("Create Event")').first();
  await createBtn.click();
  await page.waitForTimeout(1000);

  await page.locator('input[name="subject"]').fill('Discovery Call with {{name}}');
  await page.locator('input[name="description"]').fill('Initial discovery call to learn about your franchise goals');
  await page.getByRole('spinbutton').fill('30');
  await page.locator('[role="switch"]').click();
  await page.waitForTimeout(300);

  // Enable Monday
  await page.locator('[role="checkbox"]').first().click();
  await page.waitForTimeout(300);

  // Enable Tuesday
  const checkboxes = page.locator('[role="checkbox"]');
  await checkboxes.nth(1).click();
  await page.waitForTimeout(300);

  // ── IMAGE 1: Create form (wider capture) ──
  console.log('\n── Image 1: Create form (wider) ──');
  const formM = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const dialogRect = dialog ? dialog.getBoundingClientRect() : null;

    // Get the panel content area
    const attLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Attendees:');
    const attRect = attLabel ? attLabel.getBoundingClientRect() : null;

    const mlToggle = document.querySelector('[role="switch"]');
    const mlRect = mlToggle ? mlToggle.getBoundingClientRect() : null;

    // Get the "Operating timezone" as the boundary
    const tzLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Operating timezone');
    const tzRect = tzLabel ? tzLabel.getBoundingClientRect() : null;

    return { att: attRect, mlToggle: mlRect, tz: tzRect, dialog: dialogRect };
  });

  // Wider clip: include full panel width
  const formTop = formM.att ? formM.att.top - 14 : 75;
  const formBottom = formM.tz ? formM.tz.top - 10 : 490;
  const formLeft = formM.dialog ? formM.dialog.left + 10 : 400;
  const formRight = formM.dialog ? formM.dialog.right - 10 : 1240;

  await snap('group-create-form-raw', {
    x: formLeft,
    y: formTop,
    width: Math.min(formRight - formLeft, 840),
    height: Math.min(formBottom - formTop, 448) // max ~1000px final
  });

  // ── IMAGE 2: Availability (with Monday + Tuesday enabled) ──
  console.log('\n── Image 2: Availability (Mon+Tue enabled) ──');
  const availM = await page.evaluate(() => {
    const tzLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Operating timezone');
    const tzRect = tzLabel ? tzLabel.getBoundingClientRect() : null;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const rects = {};
    for (const day of days) {
      const h = [...document.querySelectorAll('h5')].find(h => h.textContent.trim() === day);
      const row = h ? h.closest('div').parentElement : null;
      rects[day] = row ? row.getBoundingClientRect() : null;
    }

    return { tz: tzRect, days: rects };
  });

  // Include timezone through Saturday (skip Sunday to stay under height)
  const availTop = availM.tz ? availM.tz.top - 10 : 485;
  const availBottom = availM.days.saturday ? availM.days.saturday.bottom + 8 : 940;
  const availHeight = Math.min(availBottom - availTop, 448);

  await snap('group-availability-raw', {
    x: formLeft,
    y: availTop,
    width: Math.min(formRight - formLeft, 840),
    height: availHeight
  });

  // Save the event
  console.log('\nSaving event...');
  const saveBtn = page.locator('[role="dialog"] button:has-text("Save")');
  await saveBtn.click();
  await page.waitForTimeout(2000);

} else {
  console.log('Event exists, opening edit panel...');

  // Scroll to Calendar Events
  await page.evaluate(() => {
    const allH2 = [...document.querySelectorAll('h2')];
    const calH2 = allH2.find(h => h.textContent.trim() === 'Calendar Events');
    if (calH2) calH2.closest('div').parentElement.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(500);

  // Click pencil to edit
  await page.evaluate(() => {
    const eventTitle = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Discovery Call'));
    const eventRow = eventTitle.closest('div').parentElement.parentElement;
    const btns = [...eventRow.querySelectorAll('button')];
    btns[btns.length - 1].click(); // last button = edit
  });
  await page.waitForTimeout(1000);
  await prep();

  // Make sure Monday is enabled
  const mondayChecked = await page.evaluate(() => {
    const cb = document.querySelectorAll('[role="checkbox"]');
    return cb[0] ? cb[0].getAttribute('aria-checked') === 'true' || cb[0].dataset.headlessuiState?.includes('checked') : false;
  });

  // Enable Tuesday if not already
  const tuesdayChecked = await page.evaluate(() => {
    const cbs = document.querySelectorAll('[role="checkbox"]');
    return cbs[1] ? cbs[1].getAttribute('aria-checked') === 'true' || cbs[1].dataset.headlessuiState?.includes('checked') : false;
  });

  if (!tuesdayChecked) {
    console.log('Enabling Tuesday...');
    await page.locator('[role="checkbox"]').nth(1).click();
    await page.waitForTimeout(500);
  }

  // ── IMAGE 1: Create form ──
  console.log('\n── Image 1: Create form (wider) ──');
  const formM = await page.evaluate(() => {
    const attLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Attendees:');
    const attRect = attLabel ? attLabel.getBoundingClientRect() : null;
    const tzLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Operating timezone');
    const tzRect = tzLabel ? tzLabel.getBoundingClientRect() : null;
    // Get full panel width
    const panel = attLabel?.closest('[role="dialog"]') || attLabel?.closest('div')?.parentElement?.parentElement?.parentElement;
    const panelRect = panel ? panel.getBoundingClientRect() : null;
    return { att: attRect, tz: tzRect, panel: panelRect };
  });

  const formTop = formM.att ? formM.att.top - 14 : 75;
  const formBottom = formM.tz ? formM.tz.top - 10 : 490;
  const formLeft = formM.panel ? formM.panel.left + 20 : 400;
  const formRight = formM.panel ? formM.panel.right - 20 : 1240;

  await snap('group-create-form-raw', {
    x: formLeft,
    y: formTop,
    width: Math.min(formRight - formLeft, 840),
    height: Math.min(formBottom - formTop, 448)
  });

  // ── IMAGE 2: Availability ──
  console.log('\n── Image 2: Availability (Mon+Tue) ──');
  const availM = await page.evaluate(() => {
    const tzLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Operating timezone');
    const tzRect = tzLabel ? tzLabel.getBoundingClientRect() : null;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const rects = {};
    for (const day of days) {
      const h = [...document.querySelectorAll('h5')].find(h => h.textContent.trim() === day);
      const row = h ? h.closest('div').parentElement : null;
      rects[day] = row ? row.getBoundingClientRect() : null;
    }
    return { tz: tzRect, days: rects };
  });

  const availTop = availM.tz ? availM.tz.top - 10 : 485;
  const lastDay = availM.days.saturday || availM.days.friday;
  const availBottom = lastDay ? lastDay.bottom + 8 : 940;

  await snap('group-availability-raw', {
    x: formLeft,
    y: availTop,
    width: Math.min(formRight - formLeft, 840),
    height: Math.min(availBottom - availTop, 448)
  });

  // Close panel
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

console.log('\n✓ Recaptures done');
await browser.close();
