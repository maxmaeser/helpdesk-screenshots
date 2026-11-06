import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
mkdirSync(`${BASE}/auto-and-manual-assignment/raw`, { recursive: true });
mkdirSync(`${BASE}/how-to-build-a-form/raw`, { recursive: true });
mkdirSync(`${BASE}/how-to-edit-your-portal/raw`, { recursive: true });

// Use 1280 viewport for more compact layout (panels closer together)
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: '/tmp/pw-storage-state.json',
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

async function prep() {
  await page.addStyleTag({ content: '* { outline: none !important; }' });
}
async function snap(clip, path) {
  await page.screenshot({ path, clip, scale: 'device' });
  console.log(`  SNAP ${path.split('/').pop()}: clip ${clip.width}x${clip.height} -> ${clip.width * 2}x${clip.height * 2}px @2x`);
}
async function ref(name) {
  await page.screenshot({ path: `${BASE}/_ref_${name}.png`, scale: 'device' });
  console.log(`  ref: ${name}`);
}

// ══════════════════════════════════════════════════════
// 1. ASSIGNMENT MANUAL DROPDOWN (#7)
// Click "Unassigned" badge in table to get assignment dropdown
// ══════════════════════════════════════════════════════
console.log('\n=== 1. ASSIGNMENT MANUAL DROPDOWN ===');
await page.goto('https://staging.app.franchisesystems.ai/sales', {
  timeout: 60000, waitUntil: 'domcontentloaded'
});
await page.waitForTimeout(8000);
await prep();

// Click Leads tab
await page.getByRole('tab', { name: 'Leads' }).click();
await page.waitForTimeout(4000);
await prep();

// Wait for data
try {
  await page.locator('text=Joshua Raidin').first().waitFor({ timeout: 15000 });
} catch {
  await page.waitForTimeout(8000);
}
await page.waitForTimeout(2000);
await prep();
await ref('v2-leads-table');

// Find "Assigned To" column position from the header
const ths = await page.locator('th').all();
let assignedColX = 0;
let assignedColW = 0;
for (let i = 0; i < ths.length; i++) {
  const text = await ths[i].textContent();
  const box = await ths[i].boundingBox();
  console.log(`  Col ${i}: "${text?.trim()}" x=${box?.x?.toFixed(0)} w=${box?.width?.toFixed(0)}`);
  if (text?.trim().includes('Assigned')) {
    assignedColX = box.x;
    assignedColW = box.width;
  }
}
console.log(`  Assigned To column: x=${assignedColX}, w=${assignedColW}`);

// Find "Unassigned" text elements - they should be in the Assigned To column
const unassignedEls = page.locator('text=Unassigned');
const unCount = await unassignedEls.count();
console.log(`  "Unassigned" elements: ${unCount}`);

for (let i = 0; i < Math.min(5, unCount); i++) {
  const box = await unassignedEls.nth(i).boundingBox();
  const vis = await unassignedEls.nth(i).isVisible();
  console.log(`    ${i}: vis=${vis} x=${box?.x?.toFixed(0)} y=${box?.y?.toFixed(0)}`);
}

// Click the first visible "Unassigned" element that's in the Assigned To column area
let dropdownOpened = false;
for (let i = 0; i < unCount; i++) {
  const box = await unassignedEls.nth(i).boundingBox();
  const vis = await unassignedEls.nth(i).isVisible();
  if (!vis || !box) continue;

  // Check if it's in the Assigned To column area (right side of table)
  if (box.x >= assignedColX - 20) {
    console.log(`  Clicking "Unassigned" ${i} at x=${box.x.toFixed(0)}, y=${box.y.toFixed(0)}`);
    await unassignedEls.nth(i).click();
    await page.waitForTimeout(1500);
    await ref('v2-assign-clicked');

    // Check for dropdown/popover
    const dropdown = page.locator('[role="listbox"], [role="menu"], [class*="popover"], [class*="dropdown"], [data-radix-popper-content-wrapper]');
    const ddCount = await dropdown.count();
    console.log(`  Dropdown elements: ${ddCount}`);
    for (let j = 0; j < ddCount; j++) {
      const dVis = await dropdown.nth(j).isVisible().catch(() => false);
      if (dVis) {
        const dBox = await dropdown.nth(j).boundingBox();
        const dText = await dropdown.nth(j).textContent();
        console.log(`    DD ${j}: vis at x=${dBox?.x?.toFixed(0)}, y=${dBox?.y?.toFixed(0)}, w=${dBox?.width?.toFixed(0)}, text="${dText?.trim().substring(0, 80)}"`);
        dropdownOpened = true;
      }
    }

    if (dropdownOpened) break;

    // If a detail panel opened instead, close it
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }
}

if (!dropdownOpened) {
  console.log('  Trying alternative: click at Assigned To column coordinates in each row');
  // Get y-positions of visible rows
  const nameEls = ['Bill Smith', 'Amanda Reghabi', 'Frank Burt'];
  for (const name of nameEls) {
    const nameEl = page.locator(`text=${name}`).first();
    const nameVis = await nameEl.isVisible().catch(() => false);
    if (!nameVis) continue;
    const nameBox = await nameEl.boundingBox();
    // Click at the Assigned To column x, same y as this name
    const clickX = assignedColX + assignedColW / 2;
    const clickY = nameBox.y + nameBox.height / 2;
    console.log(`  Clicking at assigned col for "${name}": x=${clickX.toFixed(0)}, y=${clickY.toFixed(0)}`);
    await page.mouse.click(clickX, clickY);
    await page.waitForTimeout(1500);
    await ref(`v2-assign-${name.replace(/\s/g, '-')}`);

    const dropdown = page.locator('[role="listbox"], [role="menu"], [class*="popover"], [data-radix-popper-content-wrapper]');
    for (let j = 0; j < await dropdown.count(); j++) {
      if (await dropdown.nth(j).isVisible().catch(() => false)) {
        dropdownOpened = true;
        console.log('  Dropdown opened!');
        break;
      }
    }
    if (dropdownOpened) break;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
}

// Capture clip centered on the table area showing the dropdown
const tableEl = page.locator('table').first();
const tBox = await tableEl.boundingBox();
if (tBox) {
  // Clip: start slightly before table, show Name + City + Assigned To columns + dropdown
  // Skip sidebar and some left columns - focus on right side with Assigned To
  const clipX = Math.max(0, tBox.x - 5);
  const clipY = Math.max(0, tBox.y - 5);
  const clipW = Math.min(840, 1280 - clipX);
  const clipH = Math.min(440, 900 - clipY);
  console.log(`  Clip: x=${clipX}, y=${clipY}, w=${clipW}, h=${clipH}`);
  await snap(
    { x: clipX, y: clipY, width: clipW, height: clipH },
    `${BASE}/auto-and-manual-assignment/raw/assignment-manual-dropdown-raw.png`
  );
}

await page.keyboard.press('Escape');
await page.waitForTimeout(500);

// ══════════════════════════════════════════════════════
// 2. FORM FIELDS LIBRARY (#10) - wider clip
// ══════════════════════════════════════════════════════
console.log('\n=== 2. FORM FIELDS LIBRARY ===');
await page.goto('https://staging.app.franchisesystems.ai/studio/forms', {
  timeout: 60000, waitUntil: 'domcontentloaded'
});
await page.waitForTimeout(5000);
await prep();

// Click into a form
const formName = page.locator('text=Severance 1').first();
if (await formName.isVisible().catch(() => false)) {
  await formName.click();
} else {
  // Click first link/row
  const firstForm = page.locator('a[href*="form"]').first();
  if (await firstForm.isVisible().catch(() => false)) {
    await firstForm.click();
  }
}
await page.waitForTimeout(4000);
await prep();
await ref('v2-form-builder');

// The Fields Library should auto-open (it was visible in previous capture)
// Log layout coordinates
const fieldsLibTitle = page.locator('text=Fields Library').first();
const flBox = await fieldsLibTitle.boundingBox().catch(() => null);
console.log(`  "Fields Library" at: x=${flBox?.x?.toFixed(0)}, y=${flBox?.y?.toFixed(0)}`);

// Find "Pages" panel
const pagesLabel = page.locator('text=Pages').first();
const pgBox = await pagesLabel.boundingBox().catch(() => null);
console.log(`  "Pages" at: x=${pgBox?.x?.toFixed(0)}, y=${pgBox?.y?.toFixed(0)}`);

// Calculate clip to show Pages + Form Canvas + Fields Library
// Need from about Pages left edge to Fields Library right edge
if (flBox && pgBox) {
  const clipX = Math.max(0, pgBox.x - 10);
  const clipW = Math.min(840, 1280 - clipX);
  console.log(`  Clip: x=${clipX}, w=${clipW} (covers Pages at ${pgBox.x?.toFixed(0)} to Fields Library at ${flBox.x?.toFixed(0)}+)`);
  await snap(
    { x: clipX, y: 55, width: clipW, height: 440 },
    `${BASE}/how-to-build-a-form/raw/form-fields-library-wide-raw.png`
  );
} else {
  // Fallback: just capture the right half
  await snap(
    { x: 440, y: 55, width: 840, height: 440 },
    `${BASE}/how-to-build-a-form/raw/form-fields-library-wide-raw.png`
  );
}

// ══════════════════════════════════════════════════════
// 3. PORTAL ADD STEP (#15) - wider with Step Action dropdown
// ══════════════════════════════════════════════════════
console.log('\n=== 3. PORTAL ADD STEP ===');
await page.goto('https://staging.app.franchisesystems.ai/studio/applicant-portal', {
  timeout: 60000, waitUntil: 'domcontentloaded'
});
await page.waitForTimeout(6000);
await prep();

// Scroll down to find Add Step
await page.evaluate(() => {
  const scrollable = document.querySelector('main') || document.querySelector('[class*="scroll"]');
  if (scrollable) scrollable.scrollTop = 250;
  else window.scrollBy(0, 250);
});
await page.waitForTimeout(1000);

// Click first visible Add Step button
const addStepBtns = page.locator('button:has-text("Add Step")');
const asbCount = await addStepBtns.count();
console.log(`  Add Step buttons: ${asbCount}`);

for (let i = 0; i < asbCount; i++) {
  const vis = await addStepBtns.nth(i).isVisible();
  if (vis) {
    const box = await addStepBtns.nth(i).boundingBox();
    console.log(`  Clicking Add Step ${i} at y=${box?.y?.toFixed(0)}`);

    // First scroll to make sure it and the step panel will be visible
    if (box && box.y > 600) {
      await addStepBtns.nth(i).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }

    await addStepBtns.nth(i).click();
    break;
  }
}
await page.waitForTimeout(2000);
await prep();
await ref('v2-step-panel');

// Find and click the Step Action "Select" dropdown
const stepActionSelect = page.locator('text=Select').last();
const saBox = await stepActionSelect.boundingBox().catch(() => null);
console.log(`  "Select" button: x=${saBox?.x?.toFixed(0)}, y=${saBox?.y?.toFixed(0)}, w=${saBox?.width?.toFixed(0)}`);

if (saBox && saBox.x > 400) { // Right side panel
  await stepActionSelect.click();
  await page.waitForTimeout(1000);
  await ref('v2-step-action-open');
}

// Log Step panel location
const stepLabel = page.locator('text=Step Action').first();
const slBox = await stepLabel.boundingBox().catch(() => null);
console.log(`  "Step Action" label: x=${slBox?.x?.toFixed(0)}, y=${slBox?.y?.toFixed(0)}`);

// Calculate clip to show portal steps on left + step panel on right
// The step panel is on the right side
if (slBox) {
  // Include the portal preview + step panel
  // Portal preview center is around x=300-400, step panel starts around x=slBox.x - 30
  const panelStartX = slBox.x - 30;
  const clipX = Math.max(0, panelStartX - 500); // Go 500px left of panel to show portal
  const clipW = Math.min(840, 1280 - clipX);
  const clipY = Math.max(0, slBox.y - 100); // Start above Step Action
  const clipH = Math.min(480, 900 - clipY);
  console.log(`  Clip: x=${clipX}, y=${clipY}, w=${clipW}, h=${clipH}`);
  await snap(
    { x: clipX, y: clipY, width: clipW, height: clipH },
    `${BASE}/how-to-edit-your-portal/raw/portal-add-step-wide-raw.png`
  );
} else {
  // Fallback
  await snap(
    { x: 440, y: 30, width: 840, height: 480 },
    `${BASE}/how-to-edit-your-portal/raw/portal-add-step-wide-raw.png`
  );
}

await browser.close();
console.log('\n=== Done ===');
