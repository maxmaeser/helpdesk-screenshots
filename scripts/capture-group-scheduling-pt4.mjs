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
}

async function snap(name, clip) {
  const path = `${ROOT}/${ART}/raw/${name}.png`;
  await page.screenshot({ path, clip, scale: 'device' });
  console.log(`  SNAP ${name} (${Math.round(clip.width)}x${Math.round(clip.height)} CSS)`);
}

async function ref(name) {
  await page.screenshot({ path: `${ROOT}/${ART}/raw/_ref_${name}.png`, scale: 'device' });
  console.log(`  ref: ${name}`);
}

async function bbox(locator, label, timeout = 5000) {
  try {
    await locator.waitFor({ state: 'visible', timeout });
    const box = await locator.boundingBox();
    if (!box) { console.log(`  WARN: ${label} no bbox`); return null; }
    console.log(`  ${label}: x=${box.x.toFixed(0)} y=${box.y.toFixed(0)} w=${box.width.toFixed(0)} h=${box.height.toFixed(0)}`);
    return box;
  } catch {
    console.log(`  WARN: ${label} not visible`);
    return null;
  }
}

// Navigate to Brand > Scheduling Events
await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

const allSE = await page.locator('a:has-text("Scheduling Events")').all();
for (const el of allSE) {
  const b = await el.boundingBox();
  if (b && b.y > 400) { await el.click(); break; }
}
await page.waitForTimeout(4000);
await prep();

// Open Create Event panel
await page.locator('text=Create Event').first().click();
await page.waitForTimeout(3000);
await prep();

// Fill form using dialog-scoped inputs
const dialogPanel = page.locator('[data-headlessui-state="open"]').last();
const dialogInputs = dialogPanel.locator('input:not([type="file"]):not([type="hidden"])');

await dialogInputs.first().click({ force: true });
await page.waitForTimeout(200);
await page.keyboard.type('Discovery Call with {{name}}');
await page.keyboard.press('Tab');
await page.waitForTimeout(300);
await page.keyboard.type('Initial discovery call');
await page.keyboard.press('Tab');
await page.waitForTimeout(300);
await page.keyboard.type('30');
await page.keyboard.press('Tab');
await page.waitForTimeout(1000);

// Enable Monday availability by clicking the checkbox/toggle
const monText = page.locator('text=Monday').first();
const monBox = await bbox(monText, 'Monday');
if (monBox) {
  // The checkbox/toggle is likely to the left of "Monday"
  // HeadlessUI uses role="checkbox"
  const monCheckbox = page.locator('[role="checkbox"]:near(:text("Monday")), [role="switch"]:near(:text("Monday"))').first();
  const mcBox = await bbox(monCheckbox, 'Monday checkbox');
  if (mcBox) {
    await monCheckbox.click({ force: true });
  } else {
    // Click just left of Monday text where the toggle would be
    await page.mouse.click(monBox.x - 20, monBox.y + monBox.height / 2);
  }
  await page.waitForTimeout(1000);
}

// Also enable Tuesday
const tueText = page.locator('text=Tuesday').first();
const tueBox = await bbox(tueText, 'Tuesday');
if (tueBox) {
  await page.mouse.click(tueBox.x - 20, tueBox.y + tueBox.height / 2);
  await page.waitForTimeout(500);
}

await prep();
await ref('days-enabled');

// Check save
let saveDisabled = await page.locator('button:has-text("Save")').first().isDisabled();
console.log(`Save disabled: ${saveDisabled}`);

if (!saveDisabled) {
  // === Capture the filled create form BEFORE saving ===
  console.log('\n--- 2. group-scheduling-create (filled) ---');
  const atLabel = await bbox(page.locator('text=Attendees').first(), 'Attendees');
  const mlLabel = await bbox(page.locator('text=Add Online Meeting Link').first(), 'Meeting link');
  if (atLabel && mlLabel) {
    await snap('group-scheduling-create-raw', {
      x: Math.max(0, atLabel.x - 15),
      y: Math.max(0, atLabel.y - 10),
      width: Math.min(840, 1280 - atLabel.x + 25),
      height: Math.min(430, mlLabel.y + 55 - atLabel.y + 10),
    });
  }

  // === Capture availability with Monday/Tuesday enabled ===
  console.log('\n--- 3. group-scheduling-availability (with days enabled) ---');
  const opTz = await bbox(page.locator('text=Operating timezone').first(), 'Op timezone');
  const sunText = await bbox(page.locator('text=Sunday').first(), 'Sunday');
  if (opTz && sunText) {
    await snap('group-scheduling-availability-raw', {
      x: Math.max(0, opTz.x - 15),
      y: Math.max(0, opTz.y - 10),
      width: Math.min(840, 1280 - opTz.x + 25),
      height: Math.min(430, sunText.y + sunText.height - opTz.y + 30),
    });
  }

  // SAVE
  console.log('\n--- Saving ---');
  await page.locator('button:has-text("Save")').first().click();
  await page.waitForTimeout(4000);
  await prep();
  await ref('saved');
  console.log('  Saved!');

  // Reload to see the event
  await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await prep();
  const allSE2 = await page.locator('a:has-text("Scheduling Events")').all();
  for (const el of allSE2) {
    const b = await el.boundingBox();
    if (b && b.y > 400) { await el.click(); break; }
  }
  await page.waitForTimeout(4000);
  await prep();
  await ref('list-with-event');

  // === Image 5: Event row with link + edit icons ===
  console.log('\n--- 5. group-scheduling-link ---');
  const evTitle = page.locator('text=Discovery Call').first();
  const evBox = await bbox(evTitle, 'Discovery Call');
  if (evBox) {
    await snap('group-scheduling-link-raw', {
      x: Math.max(0, evBox.x - 20),
      y: Math.max(0, evBox.y - 20),
      width: Math.min(840, 1280 - evBox.x + 30),
      height: 80,
    });

    // === Image 4: Edit event, show Members/Attendees ===
    console.log('\n--- 4. group-scheduling-members ---');
    const rowBtns = await page.locator('button:has(svg)').all();
    let editBtn = null;
    for (const btn of rowBtns) {
      const b = await btn.boundingBox();
      if (b && Math.abs(b.y - evBox.y) < 25 && b.x > evBox.x + 50) {
        editBtn = { el: btn, box: b };
      }
    }
    if (editBtn) {
      await editBtn.el.click();
      await page.waitForTimeout(2000);
      await prep();
      await ref('edit-open');

      // Click the Attendees "+" area
      const at2 = await bbox(page.locator('text=Attendees').first(), 'Attendees');
      if (at2) {
        await page.mouse.click(at2.x + at2.width + 80, at2.y + 15);
        await page.waitForTimeout(1500);
        await prep();
        await ref('attendees-clicked');

        const popover = page.locator('[data-radix-popper-content-wrapper], [role="listbox"], [class*="popover"]:visible').first();
        const pvBox = await bbox(popover, 'Agent dropdown');
        if (pvBox) {
          const top = Math.min(at2.y, pvBox.y);
          const bottom = pvBox.y + pvBox.height;
          const left = Math.min(at2.x, pvBox.x);
          const right = Math.max(at2.x + 250, pvBox.x + pvBox.width);
          await snap('group-scheduling-members-raw', {
            x: Math.max(0, left - 20),
            y: Math.max(0, top - 15),
            width: Math.min(840, right - left + 40),
            height: Math.min(430, bottom - top + 30),
          });
        } else {
          await snap('group-scheduling-members-raw', {
            x: Math.max(0, at2.x - 15),
            y: Math.max(0, at2.y - 10),
            width: Math.min(840, 500),
            height: 300,
          });
        }
      }
    }
  }
} else {
  console.log('Save STILL disabled even after enabling days. Taking ref and stopping.');
  await ref('still-disabled');
}

await browser.close();
console.log('\n' + '═'.repeat(60));
console.log('DONE');
console.log('═'.repeat(60));
