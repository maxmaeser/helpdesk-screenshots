import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
mkdirSync(`${BASE}/auto-and-manual-assignment/raw`, { recursive: true });
mkdirSync(`${BASE}/how-to-build-a-form/raw`, { recursive: true });

const browser = await chromium.launch({ headless: true });

// ══════════════════════════════════════════════════════
// 1. ASSIGNMENT MANUAL DROPDOWN (#7)
// Use wide viewport to fit all columns, then clip
// ══════════════════════════════════════════════════════
console.log('\n=== 1. ASSIGNMENT MANUAL DROPDOWN ===');
{
  // Use a very wide viewport so all table columns fit
  const ctx = await browser.newContext({
    storageState: '/tmp/pw-storage-state.json',
    viewport: { width: 1600, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  await page.goto('https://staging.app.franchisesystems.ai/sales', {
    timeout: 60000, waitUntil: 'domcontentloaded'
  });
  await page.waitForTimeout(8000);
  await page.addStyleTag({ content: '* { outline: none !important; }' });

  await page.getByRole('tab', { name: 'Leads' }).click();
  await page.waitForTimeout(4000);
  try {
    await page.locator('text=Joshua Raidin').first().waitFor({ timeout: 15000 });
  } catch { await page.waitForTimeout(8000); }
  await page.waitForTimeout(2000);
  await page.addStyleTag({ content: '* { outline: none !important; }' });

  await page.screenshot({ path: `${BASE}/_ref_v4-leads.png`, scale: 'device' });

  // Log column positions at 1600px viewport
  const ths = await page.locator('th').all();
  for (let i = 0; i < ths.length; i++) {
    const text = await ths[i].textContent();
    const box = await ths[i].boundingBox();
    console.log(`  Col ${i}: "${text?.trim()}" x=${box?.x?.toFixed(0)} w=${box?.width?.toFixed(0)} end=${(box?.x + box?.width)?.toFixed(0)}`);
  }

  // Click Unassigned in the Assigned To column
  const unassigned = page.locator('text=Unassigned');
  const unCount = await unassigned.count();
  console.log(`  Unassigned count: ${unCount}`);

  for (let i = 0; i < unCount; i++) {
    const box = await unassigned.nth(i).boundingBox();
    const vis = await unassigned.nth(i).isVisible();
    if (vis && box && box.x > 800) {
      console.log(`  Clicking Unassigned ${i} at x=${box.x.toFixed(0)}, y=${box.y.toFixed(0)}`);
      await unassigned.nth(i).click();
      await page.waitForTimeout(1500);
      break;
    }
  }

  await page.screenshot({ path: `${BASE}/_ref_v4-dropdown.png`, scale: 'device' });

  // Check dropdown
  const dd = page.locator('[role="listbox"], [role="menu"], [class*="popover"], [data-radix-popper-content-wrapper]');
  for (let j = 0; j < await dd.count(); j++) {
    const vis = await dd.nth(j).isVisible().catch(() => false);
    if (vis) {
      const box = await dd.nth(j).boundingBox();
      console.log(`  Dropdown: x=${box?.x?.toFixed(0)}, y=${box?.y?.toFixed(0)}, w=${box?.width?.toFixed(0)}, h=${box?.height?.toFixed(0)}`);
    }
  }

  // Table position
  const table = await page.locator('table').first().boundingBox();
  console.log(`  Table: x=${table?.x?.toFixed(0)}, y=${table?.y?.toFixed(0)}, w=${table?.width?.toFixed(0)}`);

  // Clip: skip sidebar, include Name through Assigned To + dropdown
  // We want to show: checkbox, Name, (skip middle cols), City, Assigned To + dropdown
  // Start after sidebar (~130px), capture 840px
  // With 1600px viewport, Assigned To should be further right but still visible

  // Find the Name header and Assigned To header
  let nameX = 0, assignedEndX = 0;
  for (const th of ths) {
    const text = await th.textContent();
    const box = await th.boundingBox();
    if (text?.trim() === 'Name') nameX = box.x;
    if (text?.trim().includes('Assigned')) assignedEndX = box.x + box.width;
  }
  console.log(`  Name col starts: x=${nameX}`);
  console.log(`  Assigned To col ends: x=${assignedEndX}`);

  // Calculate clip that covers Name through Assigned To (+ some padding for dropdown)
  const totalWidth = assignedEndX - nameX + 50; // Add padding for dropdown
  console.log(`  Total columns width: ${totalWidth}`);

  if (totalWidth <= 840) {
    // Everything fits in 840px clip!
    const clipX = Math.max(0, nameX - 60); // Include checkbox
    const clipY = Math.max(0, table.y - 5);
    console.log(`  Clip: x=${clipX}, y=${clipY}, w=840, h=440`);
    await page.screenshot({
      path: `${BASE}/auto-and-manual-assignment/raw/assignment-manual-dropdown-raw.png`,
      clip: { x: clipX, y: clipY, width: 840, height: 440 },
      scale: 'device',
    });
    console.log('  SNAP assignment-manual-dropdown-raw.png');
  } else {
    // Too wide, need to skip some middle columns
    // Clip centered on Assigned To column with dropdown, including some Name column
    const clipX = assignedEndX - 840 + 50; // Right-align to show Assigned To + dropdown
    const clipY = Math.max(0, table.y - 5);
    console.log(`  Clip (right-aligned): x=${clipX.toFixed(0)}, y=${clipY}, w=840, h=440`);
    await page.screenshot({
      path: `${BASE}/auto-and-manual-assignment/raw/assignment-manual-dropdown-raw.png`,
      clip: { x: clipX, y: clipY, width: 840, height: 440 },
      scale: 'device',
    });
    console.log('  SNAP assignment-manual-dropdown-raw.png');
  }

  await ctx.close();
}

// ══════════════════════════════════════════════════════
// 2. FORM FIELDS LIBRARY (#10)
// Clip right portion: form canvas + Fields Library
// ══════════════════════════════════════════════════════
console.log('\n=== 2. FORM FIELDS LIBRARY ===');
{
  const ctx = await browser.newContext({
    storageState: '/tmp/pw-storage-state.json',
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  await page.goto('https://staging.app.franchisesystems.ai/studio/forms', {
    timeout: 60000, waitUntil: 'domcontentloaded'
  });
  await page.waitForTimeout(5000);
  await page.addStyleTag({ content: '* { outline: none !important; }' });

  const formName = page.locator('text=Severance 1').first();
  if (await formName.isVisible().catch(() => false)) {
    await formName.click();
  }
  await page.waitForTimeout(4000);
  await page.addStyleTag({ content: '* { outline: none !important; }' });

  // Log positions
  const flTitle = page.locator('text=Fields Library').first();
  const flBox = await flTitle.boundingBox().catch(() => null);
  console.log(`  "Fields Library": x=${flBox?.x?.toFixed(0)}`);

  const allFields = page.locator('text=All Fields').first();
  const afBox = await allFields.boundingBox().catch(() => null);
  console.log(`  "All Fields" tab: x=${afBox?.x?.toFixed(0)}`);

  // Clip: show form canvas right side + entire Fields Library panel
  // Fields Library starts at x≈913. We want to show some form canvas context.
  // Clip from x=440 captures form canvas (x=440-910) + Fields Library (x=910-1280)
  const clipX = 440;
  const clipW = 840;
  console.log(`  Clip: x=${clipX}, w=${clipW} → covers to ${clipX + clipW}`);

  await page.screenshot({
    path: `${BASE}/how-to-build-a-form/raw/form-fields-library-wide-raw.png`,
    clip: { x: clipX, y: 55, width: clipW, height: 440 },
    scale: 'device',
  });
  console.log('  SNAP form-fields-library-wide-raw.png');

  await page.screenshot({ path: `${BASE}/_ref_v4-fields-lib.png`, scale: 'device' });
  await ctx.close();
}

await browser.close();
console.log('\n=== Done ===');
