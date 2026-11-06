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

// Navigate to Settings
await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

// Click Brand > Scheduling Events (y > 400 to skip Profile's)
const allSE = await page.locator('a:has-text("Scheduling Events")').all();
for (const el of allSE) {
  const b = await el.boundingBox();
  if (b && b.y > 400) { await el.click(); break; }
}
await page.waitForTimeout(4000);
await prep();

// === Image 1: Nav - Calendar Events header + Create Event button ===
console.log('\n--- 1. group-scheduling-nav ---');
const calHeader = await bbox(page.locator('text=Calendar Events').first(), 'Cal Events header');
const createBtn = await bbox(page.locator('text=Create Event').first(), 'Create Event btn');

if (calHeader) {
  // Show sidebar context + Calendar Events section
  await snap('group-scheduling-nav-raw', {
    x: 0,
    y: Math.max(0, calHeader.y - 60),
    width: 840,
    height: 180,
  });
}

// === Open Create Event panel ===
console.log('\n--- Opening create panel ---');
await page.locator('text=Create Event').first().click();
await page.waitForTimeout(3000);
await prep();
await ref('panel-open');

// The panel slides in from the right. Form fields are inside the HeadlessUI dialog.
// Find form fields by their label text
const attendeesLabel = await bbox(page.locator('text=Attendees').first(), 'Attendees');
const subjectLabel = await bbox(page.locator('text=Subject').first(), 'Subject label');
const descLabel = await bbox(page.locator('text=Description').first(), 'Description label');
const durationLabel = await bbox(page.locator('text=Duration (Minutes)').first(), 'Duration label');
const meetingLabel = await bbox(page.locator('text=Add Online Meeting Link').first(), 'Meeting label');
const tzLabel = await bbox(page.locator('text=Operating timezone').first(), 'Timezone label');

// === Image 2: Create form (Subject through Meeting Link toggle) ===
console.log('\n--- 2. group-scheduling-create ---');
if (subjectLabel && meetingLabel) {
  await snap('group-scheduling-create-raw', {
    x: Math.max(0, subjectLabel.x - 20),
    y: Math.max(0, attendeesLabel ? attendeesLabel.y - 15 : subjectLabel.y - 40),
    width: Math.min(840, 1280 - subjectLabel.x + 30),
    height: Math.min(430, meetingLabel.y + 50 - (attendeesLabel ? attendeesLabel.y - 15 : subjectLabel.y - 40)),
  });
}

// === Image 3: Availability schedule (timezone + day grid) ===
console.log('\n--- 3. group-scheduling-availability ---');
const monBox = await bbox(page.locator('text=Monday').first(), 'Monday');
const sunBox = await bbox(page.locator('text=Sunday').first(), 'Sunday');

if (tzLabel && monBox) {
  const schedTop = tzLabel.y - 10;
  const schedBottom = sunBox ? sunBox.y + sunBox.height + 30 : monBox.y + 400;
  await snap('group-scheduling-availability-raw', {
    x: Math.max(0, monBox.x - 30),
    y: Math.max(0, schedTop),
    width: Math.min(840, 1280 - monBox.x + 50),
    height: Math.min(430, schedBottom - schedTop),
  });
}

// Fill in Subject so we can save
console.log('\n--- Filling form to save ---');
const subjectInput = page.locator('input[name*="ubject"], input').first();
// Find the input field near the Subject label
if (subjectLabel) {
  const inputs = await page.locator('input').all();
  for (const inp of inputs) {
    const b = await inp.boundingBox();
    if (b && Math.abs(b.y - subjectLabel.y) < 50 && b.x > subjectLabel.x - 10) {
      console.log(`  Found subject input at x=${b.x.toFixed(0)} y=${b.y.toFixed(0)}`);
      await inp.fill('Discovery Call with {{name}}');
      break;
    }
  }
}

// Fill duration
if (durationLabel) {
  const inputs = await page.locator('input').all();
  for (const inp of inputs) {
    const b = await inp.boundingBox();
    if (b && Math.abs(b.y - durationLabel.y) < 50 && b.x > durationLabel.x - 10) {
      console.log(`  Found duration input at x=${b.x.toFixed(0)} y=${b.y.toFixed(0)}`);
      await inp.fill('30');
      break;
    }
  }
}

await page.waitForTimeout(500);

// Try to save
const saveBtn = page.locator('button:has-text("Save")').first();
const svBox = await bbox(saveBtn, 'Save btn');
const isDisabled = await saveBtn.isDisabled();
console.log(`  Save button disabled: ${isDisabled}`);

if (!isDisabled) {
  await saveBtn.click();
  await page.waitForTimeout(3000);
  await prep();
  console.log('  Event saved!');
  await ref('after-save');

  // === Image 4: Edit event to show Members selector ===
  console.log('\n--- 4. group-scheduling-members ---');
  // Find the newly created event and click its edit button
  const eventTitle = page.locator('text=Discovery Call').first();
  const etBox = await bbox(eventTitle, 'Event title');

  if (etBox) {
    // Find edit (pencil) icon on the same row
    const btns = await page.locator('button:has(svg)').all();
    let editBtn = null;
    for (const btn of btns) {
      const b = await btn.boundingBox();
      if (b && Math.abs(b.y - etBox.y) < 20 && b.x > etBox.x + etBox.width) {
        editBtn = { el: btn, box: b };
      }
    }

    if (editBtn) {
      await editBtn.el.click();
      await page.waitForTimeout(2000);
      await prep();
      await ref('edit-panel');

      // Find Members/Attendees area
      const attendees = page.locator('text=Attendees').first();
      const atBox = await bbox(attendees, 'Attendees');

      if (atBox) {
        // Click the attendees area to open dropdown
        await page.mouse.click(atBox.x + atBox.width + 50, atBox.y + atBox.height / 2);
        await page.waitForTimeout(1500);
        await prep();
        await ref('members-open');

        // Find the dropdown
        const dropdown = page.locator('[data-radix-popper-content-wrapper], [role="listbox"], [class*="popover"]:visible').first();
        const ddBox = await bbox(dropdown, 'Dropdown');

        if (ddBox) {
          await snap('group-scheduling-members-raw', {
            x: Math.max(0, Math.min(atBox.x, ddBox.x) - 20),
            y: Math.max(0, Math.min(atBox.y, ddBox.y) - 15),
            width: Math.min(840, Math.max(atBox.x + 200, ddBox.x + ddBox.width) - Math.min(atBox.x, ddBox.x) + 40),
            height: Math.min(430, ddBox.y + ddBox.height - Math.min(atBox.y, ddBox.y) + 30),
          });
        } else {
          // Try broader capture of the panel top
          await snap('group-scheduling-members-raw', {
            x: Math.max(0, atBox.x - 20),
            y: Math.max(0, atBox.y - 15),
            width: Math.min(840, 600),
            height: 300,
          });
        }
      }

      // Close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      await prep();
    }
  }

  // === Image 5: Event row with link icon ===
  console.log('\n--- 5. group-scheduling-link ---');
  await ref('final-list');

  const et2 = page.locator('text=Discovery Call').first();
  const et2Box = await bbox(et2, 'Event title (final)');
  if (et2Box) {
    // Capture the event card with action icons
    await snap('group-scheduling-link-raw', {
      x: Math.max(0, et2Box.x - 30),
      y: Math.max(0, et2Box.y - 25),
      width: Math.min(840, 1280 - et2Box.x + 50),
      height: 90,
    });
  }

} else {
  console.log('  Save still disabled, capturing what we have');
  // Close panel
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
}

await browser.close();
console.log('\n' + '═'.repeat(60));
console.log('CAPTURE COMPLETE');
console.log('═'.repeat(60));
