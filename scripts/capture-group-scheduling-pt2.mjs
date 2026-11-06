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

// Navigate to Settings > Brand > Scheduling Events
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

// Fill Subject - click near the Subject label then type
const subjectLabel = await bbox(page.locator('text=Subject').first(), 'Subject');
if (subjectLabel) {
  // Click in the input field area (below the label)
  await page.mouse.click(subjectLabel.x + 200, subjectLabel.y + 35);
  await page.waitForTimeout(300);
  await page.keyboard.type('Discovery Call with {{name}}');
}

// Fill Duration - click near the Duration label then type
const durLabel = await bbox(page.locator('text=Duration (Minutes)').first(), 'Duration');
if (durLabel) {
  await page.mouse.click(durLabel.x + 200, durLabel.y + 35);
  await page.waitForTimeout(300);
  await page.keyboard.type('30');
}

await page.waitForTimeout(1000);
await prep();

// Save
const saveBtn = page.locator('button:has-text("Save")').first();
const isDisabled = await saveBtn.isDisabled();
console.log(`Save disabled: ${isDisabled}`);

if (!isDisabled) {
  await saveBtn.click();
  await page.waitForTimeout(3000);
  await prep();
  console.log('Event saved!');
  await ref('saved');
} else {
  console.log('Save still disabled, checking form state');
  await ref('save-disabled');
  // Try clicking Save anyway with force
  await saveBtn.click({ force: true }).catch(() => console.log('Force click failed'));
  await page.waitForTimeout(2000);
}

// === Image 4: Members selector ===
console.log('\n--- 4. group-scheduling-members ---');

// Find the created event
const eventTitle = page.locator('text=Discovery Call').first();
let etBox = await bbox(eventTitle, 'Discovery Call');

if (!etBox) {
  // Maybe it shows as "Untitled" or didn't save - check all event titles
  console.log('  No "Discovery Call" found, checking page...');
  await ref('no-event-found');
  // Try reloading
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
  await ref('reloaded');
  etBox = await bbox(page.locator('text=Discovery Call').first(), 'Discovery Call (retry)');
}

if (etBox) {
  // Find edit icon near the event title
  const allBtns = await page.locator('button:has(svg)').all();
  let editBtn = null;
  for (const btn of allBtns) {
    const b = await btn.boundingBox();
    if (b && Math.abs(b.y - etBox.y) < 25 && b.x > etBox.x + etBox.width - 20) {
      editBtn = { el: btn, box: b };
    }
  }

  if (editBtn) {
    console.log(`  Clicking edit at x=${editBtn.box.x.toFixed(0)}`);
    await editBtn.el.click();
    await page.waitForTimeout(2000);
    await prep();
    await ref('edit-open');

    // Click the Attendees avatar area to open the members dropdown
    const attendees = page.locator('text=Attendees').first();
    const atBox = await bbox(attendees, 'Attendees');

    if (atBox) {
      // Click just to the right of "Attendees:" text where avatars would be
      await page.mouse.click(atBox.x + atBox.width + 30, atBox.y + 10);
      await page.waitForTimeout(1500);
      await prep();
      await ref('attendees-clicked');

      // Check for a dropdown/popover
      const popover = page.locator('[data-radix-popper-content-wrapper], [class*="popover"]:visible, [role="listbox"]').first();
      const pvBox = await bbox(popover, 'Popover');

      if (pvBox) {
        await snap('group-scheduling-members-raw', {
          x: Math.max(0, Math.min(atBox.x, pvBox.x) - 20),
          y: Math.max(0, Math.min(atBox.y, pvBox.y) - 15),
          width: Math.min(840, Math.max(atBox.x + 250, pvBox.x + pvBox.width) - Math.min(atBox.x, pvBox.x) + 40),
          height: Math.min(430, pvBox.y + pvBox.height - Math.min(atBox.y, pvBox.y) + 30),
        });
      } else {
        // Maybe clicking the avatar area directly
        // Look for a "No Assignees" or avatar elements
        const noAssign = page.locator('text=No Assignees').first();
        const naBox = await bbox(noAssign, 'No Assignees');
        if (naBox) {
          await noAssign.click();
          await page.waitForTimeout(1500);
          await prep();
          await ref('no-assignees-clicked');
        }

        // Take a broader capture of the panel top
        await snap('group-scheduling-members-raw', {
          x: Math.max(0, atBox.x - 20),
          y: Math.max(0, atBox.y - 15),
          width: Math.min(840, 600),
          height: 350,
        });
      }
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    await prep();
  }
}

// === Image 5: Event row with link + edit icons ===
console.log('\n--- 5. group-scheduling-link ---');
await ref('list-final');

const et2 = page.locator('text=Discovery Call').first();
const et2Box = await bbox(et2, 'Event (final)');
if (et2Box) {
  await snap('group-scheduling-link-raw', {
    x: Math.max(0, et2Box.x - 30),
    y: Math.max(0, et2Box.y - 25),
    width: Math.min(840, 1280 - et2Box.x + 50),
    height: 90,
  });
}

await browser.close();
console.log('\n' + '═'.repeat(60));
console.log('PART 2 COMPLETE');
console.log('═'.repeat(60));
