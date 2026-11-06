import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots/auto-and-manual-assignment';
mkdirSync(`${BASE}/raw`, { recursive: true });

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

async function snap(clip, filename) {
  const path = `${BASE}/raw/${filename}`;
  await page.screenshot({ path, clip, scale: 'device' });
  console.log(`  ${filename}: ${clip.width * 2}x${clip.height * 2}px`);
}

// Navigate to leads table
console.log('Navigating to Sales Pipeline...');
await page.goto('https://staging.app.franchisesystems.ai/sales');
await page.waitForTimeout(6000);
await prep();

// Click Leads tab
const leadsTab = page.getByRole('tab', { name: 'Leads' });
await leadsTab.click();
await page.waitForTimeout(3000);
await prep();

// Take a reference screenshot to see the layout
await page.screenshot({ path: `${BASE}/raw/_ref_leads.png`, scale: 'device' });

// Find the table and its structure
const table = page.locator('table').first();
const tableBox = await table.boundingBox();
console.log(`Table: ${JSON.stringify(tableBox)}`);

// Get column headers
const ths = await page.locator('table thead th').all();
for (let i = 0; i < ths.length; i++) {
  const text = await ths[i].textContent();
  const box = await ths[i].boundingBox();
  console.log(`  Col ${i}: "${text?.trim()}" at x=${box?.x?.toFixed(0)}, w=${box?.width?.toFixed(0)}`);
}

// Find rows
const rows = await page.locator('table tbody tr').all();
console.log(`Row count: ${rows.length}`);
if (rows.length > 0) {
  const r1 = await rows[0].boundingBox();
  console.log(`  Row 0: y=${r1?.y?.toFixed(0)}, h=${r1?.height?.toFixed(0)}`);
  if (rows.length > 1) {
    const r2 = await rows[1].boundingBox();
    console.log(`  Row 1: y=${r2?.y?.toFixed(0)}, h=${r2?.height?.toFixed(0)}`);
  }
}

// Find the "Assigned To" column index
let assignedColIdx = -1;
for (let i = 0; i < ths.length; i++) {
  const text = await ths[i].textContent();
  if (text?.trim().includes('Assigned')) {
    assignedColIdx = i;
    break;
  }
}
console.log(`Assigned To column index: ${assignedColIdx}`);

if (assignedColIdx === -1) {
  console.log('ERROR: Could not find Assigned To column');
  await browser.close();
  process.exit(1);
}

// Click an "Assigned To" cell to open the dropdown (try row 4-5 so dropdown is mid-frame)
// First, let's find a row with an assigned value to click
let targetRow = 3; // 0-indexed, try row 4
if (rows.length <= targetRow) targetRow = rows.length - 1;

const targetCells = await rows[targetRow].locator('td').all();
console.log(`Target row ${targetRow} has ${targetCells.length} cells`);

// Click the Assigned To cell
const assignedCell = targetCells[assignedColIdx];
const cellBox = await assignedCell.boundingBox();
console.log(`Assigned To cell: ${JSON.stringify(cellBox)}`);

await assignedCell.click();
await page.waitForTimeout(1000);

// Check if dropdown opened
const dropdown = page.locator('[class*="dropdown"], [class*="popover"], [class*="menu"], [role="listbox"], [role="menu"]').first();
const dropdownVisible = await dropdown.isVisible().catch(() => false);
console.log(`Dropdown visible: ${dropdownVisible}`);

// Take reference after click
await page.screenshot({ path: `${BASE}/raw/_ref_dropdown.png`, scale: 'device' });

// Calculate clip: we want the table area without sidebar
// Table-only clip: starts at table's x, captures Name + Assigned To columns
// Max height: 440 CSS px
const tableStartX = tableBox?.x ?? 220;
const clipX = Math.max(0, tableStartX - 10);  // Small padding before table
const clipY = tableBox?.y ? tableBox.y - 5 : 150;  // Start just above table header
const clipW = 840;  // Standard width
const clipH = 440;  // Max height for <1000px final

console.log(`Clip: x=${clipX}, y=${clipY}, w=${clipW}, h=${clipH}`);
await snap({ x: clipX, y: clipY, width: clipW, height: clipH }, 'assignment-manual-dropdown-raw.png');

await browser.close();
console.log('\nDone. Check raw files.');
