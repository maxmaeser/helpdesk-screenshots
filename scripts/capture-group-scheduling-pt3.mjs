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

// === Image 1 (fix): Nav with Calendar Events + Create Event button visible ===
console.log('\n--- 1. group-scheduling-nav (fix) ---');
const calHeader = await bbox(page.locator('text=Calendar Events').first(), 'Cal header');
const createEvt = await bbox(page.locator('text=Create Event').first(), 'Create Event');

if (calHeader && createEvt) {
  // Splice approach: show sidebar Brand section + Calendar Events header + Create Event button
  // Use content-only view to fit the button
  await snap('group-scheduling-nav-raw', {
    x: Math.max(0, calHeader.x - 20),
    y: Math.max(0, calHeader.y - 15),
    width: Math.min(840, createEvt.x + createEvt.width - calHeader.x + 40),
    height: 120,
  });
}

// === Open Create, fill form, save ===
console.log('\n--- Creating event ---');
await page.locator('text=Create Event').first().click();
await page.waitForTimeout(3000);
await prep();

// Fill Subject - target inputs INSIDE the HeadlessUI dialog panel
const dialogPanel = page.locator('[data-headlessui-state="open"]').last();
const dialogInputs = dialogPanel.locator('input:not([type="file"]):not([type="hidden"])');
const inputCount = await dialogInputs.count();
console.log(`  Dialog inputs: ${inputCount}`);

// First visible text input should be Subject
if (inputCount > 0) {
  await dialogInputs.first().click({ force: true });
  await page.waitForTimeout(200);
  await page.keyboard.type('Discovery Call with {{name}}');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);

  // Tab lands on Description textarea
  await page.keyboard.type('Initial discovery call to learn about your franchise goals');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);

  // Tab lands on Duration input
  await page.keyboard.type('30');
  await page.keyboard.press('Tab'); // defocus to trigger validation
}

await page.waitForTimeout(1000);
await prep();
await ref('form-filled');

// Check save state
let saveDisabled = await page.locator('button:has-text("Save")').first().isDisabled();
console.log(`  Save disabled after tab: ${saveDisabled}`);

// If still disabled, try clicking the Description area to blur everything
if (saveDisabled) {
  await page.locator('text=Description').first().click();
  await page.waitForTimeout(500);
  saveDisabled = await page.locator('button:has-text("Save")').first().isDisabled();
  console.log(`  Save disabled after click: ${saveDisabled}`);
}

// === Image 2 (fix): Create form with filled fields ===
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

// === Image 3 (fix): Availability with full left text ===
console.log('\n--- 3. group-scheduling-availability (fix) ---');
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

// Save the event
if (!saveDisabled) {
  console.log('\n--- Saving event ---');
  await page.locator('button:has-text("Save")').first().click();
  await page.waitForTimeout(3000);
  await prep();
  await ref('saved');
  console.log('  Event saved!');
} else {
  // Force click
  console.log('\n--- Force saving ---');
  await page.locator('button:has-text("Save")').first().click({ force: true });
  await page.waitForTimeout(3000);
  await prep();
  await ref('force-saved');
}

// Reload to see the event in the list
await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

// Navigate back to Brand > Scheduling Events
const allSE2 = await page.locator('a:has-text("Scheduling Events")').all();
for (const el of allSE2) {
  const b = await el.boundingBox();
  if (b && b.y > 400) { await el.click(); break; }
}
await page.waitForTimeout(4000);
await prep();
await ref('list-after-save');

// === Image 5: Event row with link + edit icons ===
console.log('\n--- 5. group-scheduling-link ---');
const eventTitle = page.locator('text=Discovery Call').first();
const etBox = await bbox(eventTitle, 'Discovery Call');

if (etBox) {
  await snap('group-scheduling-link-raw', {
    x: Math.max(0, etBox.x - 20),
    y: Math.max(0, etBox.y - 25),
    width: Math.min(840, 1280 - etBox.x + 30),
    height: 80,
  });

  // === Image 4: Edit event, show Members/Attendees ===
  console.log('\n--- 4. group-scheduling-members ---');
  // Find the edit (pencil) icon on the event row
  const rowBtns = await page.locator('button:has(svg)').all();
  let editBtn = null;
  for (const btn of rowBtns) {
    const b = await btn.boundingBox();
    if (b && Math.abs(b.y - etBox.y) < 25 && b.x > etBox.x + 50) {
      editBtn = { el: btn, box: b };
    }
  }

  if (editBtn) {
    await editBtn.el.click();
    await page.waitForTimeout(2000);
    await prep();
    await ref('edit-open');

    // Click the Attendees avatar/+ area
    const atLabel2 = await bbox(page.locator('text=Attendees').first(), 'Attendees (edit)');
    if (atLabel2) {
      // Click the "+" icon next to the avatar
      await page.mouse.click(atLabel2.x + atLabel2.width + 80, atLabel2.y + 15);
      await page.waitForTimeout(1500);
      await prep();
      await ref('attendees-clicked');

      // Look for agent list/dropdown
      const popover = page.locator('[data-radix-popper-content-wrapper], [role="listbox"], [class*="popover"]:visible, [class*="dropdown"]:visible').first();
      const pvBox = await bbox(popover, 'Agent dropdown');

      if (pvBox) {
        const top = Math.min(atLabel2.y, pvBox.y);
        const bottom = pvBox.y + pvBox.height;
        const left = Math.min(atLabel2.x, pvBox.x);
        const right = Math.max(atLabel2.x + 250, pvBox.x + pvBox.width);

        await snap('group-scheduling-members-raw', {
          x: Math.max(0, left - 20),
          y: Math.max(0, top - 15),
          width: Math.min(840, right - left + 40),
          height: Math.min(430, bottom - top + 30),
        });
      } else {
        // Capture the panel header area showing Attendees
        await snap('group-scheduling-members-raw', {
          x: Math.max(0, atLabel2.x - 15),
          y: Math.max(0, atLabel2.y - 10),
          width: Math.min(840, 500),
          height: 300,
        });
      }
    }
  }
} else {
  console.log('  Event not found in list after save');
}

await browser.close();
console.log('\n' + '═'.repeat(60));
console.log('CAPTURE COMPLETE');
console.log('═'.repeat(60));
