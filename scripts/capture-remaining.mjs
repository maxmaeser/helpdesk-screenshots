import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
for (const d of ['auto-and-manual-assignment/raw', 'how-to-create-custom-statuses/raw',
  'how-to-build-a-form/raw', 'how-to-edit-your-portal/raw']) {
  mkdirSync(`${BASE}/${d}`, { recursive: true });
}

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
  console.log(`  ${path.split('/').pop()}: ${clip.width * 2}x${clip.height * 2}px`);
}
async function ref(name) {
  await page.screenshot({ path: `${BASE}/_ref_${name}.png`, scale: 'device' });
}
async function waitForData() {
  try {
    await page.locator('text=Joshua Raidin').first().waitFor({ timeout: 20000 });
  } catch {
    await page.waitForTimeout(10000);
  }
  await page.waitForTimeout(2000);
}

// ══════════════════════════════════════════════════════
// PAGE 1: LEADS TABLE (#4 create-form, #7 assignment-dropdown)
// ══════════════════════════════════════════════════════
console.log('=== PAGE 1: LEADS TABLE ===');
await page.goto('https://staging.app.franchisesystems.ai/sales', {
  timeout: 60000, waitUntil: 'domcontentloaded'
});
await page.waitForTimeout(8000);
await prep();
await page.getByRole('tab', { name: 'Leads' }).click();
await page.waitForTimeout(3000);
await waitForData();
await prep();
await ref('p1-loaded');

// --- #7: assignment-manual-dropdown ---
console.log('\n--- #7: assignment-manual-dropdown ---');
// Need to click the actual assignment badge, not the row
// Look for "Unassigned" text or assignment avatar badges
const assignedHeader = page.locator('th:has-text("Assigned To")');
const ahBox = await assignedHeader.boundingBox();
console.log(`Assigned To header: x=${ahBox?.x} w=${ahBox?.width}`);

// Try clicking on an "Unassigned" cell - these should trigger a dropdown
const unassignedCells = page.locator('table tbody td:last-child:has-text("Unassigned")');
const unCount = await unassignedCells.count();
console.log(`Unassigned cells: ${unCount}`);

// Also look for assigned badges with avatar initials
const assignedCells = page.locator('table tbody td:last-child');
for (let i = 0; i < Math.min(8, await assignedCells.count()); i++) {
  const text = await assignedCells.nth(i).textContent();
  const box = await assignedCells.nth(i).boundingBox();
  console.log(`  Row ${i}: "${text?.trim().substring(0,30)}" y=${box?.y?.toFixed(0)}`);
}

// Try clicking an assigned cell - look for the clickable badge/button inside
let dropdownOpened = false;
for (let i = 0; i < Math.min(8, await assignedCells.count()); i++) {
  const cell = assignedCells.nth(i);
  const text = await cell.textContent();
  if (!text?.trim()) continue;

  // Try to find a button or clickable element inside the cell
  const clickable = cell.locator('button, [role="button"], span[class*="badge"], div[class*="assign"]').first();
  const clickableExists = await clickable.count() > 0;

  if (clickableExists) {
    console.log(`  Found clickable in row ${i}`);
    await clickable.click();
  } else {
    // Direct click on the cell content
    const box = await cell.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  }

  await page.waitForTimeout(1000);
  await ref(`p1-assign-click-${i}`);

  // Check if a dropdown/popover appeared
  const dropdown = page.locator('[role="listbox"], [role="menu"], [class*="popover"], [class*="dropdown-menu"]');
  if (await dropdown.count() > 0 && await dropdown.first().isVisible()) {
    console.log(`  Dropdown opened on row ${i}!`);
    dropdownOpened = true;

    // Take the clip
    const tableBox = await page.locator('table').first().boundingBox();
    const clipX = Math.max(0, tableBox.x - 5);
    const clipY = Math.max(0, tableBox.y - 5);
    const clipH = 440;
    // Include the full table width
    const clipW = Math.min(840, 1280 - clipX);
    await snap(
      { x: clipX, y: clipY, width: clipW, height: clipH },
      `${BASE}/auto-and-manual-assignment/raw/assignment-manual-dropdown-raw.png`
    );
    break;
  }

  // Check if detail panel opened instead
  const closeBtn = page.locator('[class*="detail"] button:has-text("×"), button[aria-label="Close"]');
  if (await closeBtn.count() > 0) {
    console.log(`  Detail panel opened instead, closing...`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  } else {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
}

if (!dropdownOpened) {
  console.log('  Could not open assignment dropdown - taking table-only snap');
  const tableBox = await page.locator('table').first().boundingBox();
  await snap(
    { x: tableBox.x - 5, y: tableBox.y - 5, width: 840, height: 440 },
    `${BASE}/auto-and-manual-assignment/raw/assignment-manual-dropdown-raw.png`
  );
}

// Close any open panels
await page.keyboard.press('Escape');
await page.waitForTimeout(500);

// --- #4: statuses-create-form ---
console.log('\n--- #4: statuses-create-form ---');
// Click Qualified badge to open status dropdown
const qualBadge = page.locator('table tbody').locator('text=Qualified').first();
if (await qualBadge.isVisible()) {
  await qualBadge.click();
  await page.waitForTimeout(1000);
  await ref('p1-status-dropdown');

  const createBtn = page.locator('text=Create New Status').first();
  if (await createBtn.isVisible()) {
    await createBtn.click();
    await page.waitForTimeout(1500);
    await ref('p1-create-form');

    // Capture the inline create form
    const formTitle = page.locator('text=Create New Status').first();
    const ftBox = await formTitle.boundingBox();
    if (ftBox) {
      // Clip around the form area
      const formClipX = Math.max(0, ftBox.x - 30);
      const formClipY = Math.max(0, ftBox.y - 20);
      await snap(
        { x: formClipX, y: formClipY, width: 400, height: 200 },
        `${BASE}/how-to-create-custom-statuses/raw/statuses-create-form-new.png`
      );
    }
  }
}
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
await page.keyboard.press('Escape');
await page.waitForTimeout(500);

// ══════════════════════════════════════════════════════
// PAGE 2: FORMS (#10 fields-library wider)
// ══════════════════════════════════════════════════════
console.log('\n=== PAGE 2: FORMS ===');
// Navigate to Studio > Forms
await page.goto('https://staging.app.franchisesystems.ai/studio', {
  timeout: 60000, waitUntil: 'domcontentloaded'
});
await page.waitForTimeout(5000);
await prep();

// Click Forms in sidebar
const formsLink = page.locator('a:has-text("Forms"), [href*="forms"]').first();
if (await formsLink.isVisible()) {
  await formsLink.click();
  await page.waitForTimeout(3000);
  await prep();
}
await ref('p2-forms');

// Click into a form to open the builder
const formRows = page.locator('table tbody tr, [class*="form-row"], [class*="card"]');
const formCount = await formRows.count();
console.log(`Form items: ${formCount}`);

if (formCount > 0) {
  await formRows.first().click();
  await page.waitForTimeout(3000);
  await prep();
  await ref('p2-form-builder');

  // Look for Fields Library button/tab
  const fieldsLib = page.locator('text=Fields Library, text=Field Library, button:has-text("Fields")').first();
  if (await fieldsLib.isVisible()) {
    await fieldsLib.click();
    await page.waitForTimeout(1000);
    await ref('p2-fields-library');
  }

  // --- #10: form-fields-library (wider) ---
  console.log('\n--- #10: form-fields-library ---');
  // Take a wide clip showing form builder + fields library panel
  await snap(
    { x: 220, y: 50, width: 840, height: 440 },
    `${BASE}/how-to-build-a-form/raw/form-fields-library-wide.png`
  );
}

// ══════════════════════════════════════════════════════
// PAGE 3: PORTAL EDITOR (#15 add-step wider)
// ══════════════════════════════════════════════════════
console.log('\n=== PAGE 3: PORTAL EDITOR ===');
await page.goto('https://staging.app.franchisesystems.ai/studio/applicant-portal', {
  timeout: 60000, waitUntil: 'domcontentloaded'
});
await page.waitForTimeout(5000);
await prep();
await ref('p3-portal');

// --- #15: portal-add-step (wider) ---
console.log('\n--- #15: portal-add-step ---');
// Look for Add Step button
const addStepBtn = page.locator('button:has-text("Add Step"), text=Add Step, button:has-text("add step")').first();
const addStepVisible = await addStepBtn.isVisible().catch(() => false);
console.log(`Add Step button visible: ${addStepVisible}`);

if (addStepVisible) {
  await addStepBtn.click();
  await page.waitForTimeout(1500);
  await ref('p3-add-step');

  // Click the Step Action dropdown
  const actionDropdown = page.locator('text=Step Action, label:has-text("Step Action")').first();
  if (await actionDropdown.isVisible()) {
    // Find the select/dropdown near it
    const select = page.locator('select, [class*="select"], [role="combobox"]').first();
    if (await select.isVisible()) {
      await select.click();
      await page.waitForTimeout(500);
    }
  }
  await ref('p3-step-action-dropdown');

  // Take wider clip of portal preview + step panel
  // Include portal preview on left + step panel on right
  await snap(
    { x: 100, y: 50, width: 840, height: 440 },
    `${BASE}/how-to-edit-your-portal/raw/portal-add-step-wide.png`
  );
}

await browser.close();
console.log('\n=== Done ===');
