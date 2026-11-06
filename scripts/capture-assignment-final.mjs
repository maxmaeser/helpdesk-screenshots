import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
mkdirSync(`${BASE}/auto-and-manual-assignment/raw`, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  storageState: '/tmp/pw-storage-state.json',
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

async function prep() {
  await page.addStyleTag({ content: '* { outline: none !important; }' });
}
async function ref(name) {
  await page.screenshot({ path: `${BASE}/_ref_${name}.png`, scale: 'device' });
  console.log(`  ref: ${name}`);
}

console.log('=== ASSIGNMENT MANUAL DROPDOWN ===');
await page.goto('https://staging.app.franchisesystems.ai/sales', {
  timeout: 60000, waitUntil: 'domcontentloaded'
});
await page.waitForTimeout(8000);
await prep();

await page.getByRole('tab', { name: 'Leads' }).click();
await page.waitForTimeout(4000);
try {
  await page.locator('text=Joshua Raidin').first().waitFor({ timeout: 15000 });
} catch { await page.waitForTimeout(8000); }
await page.waitForTimeout(2000);
await prep();

// Hide Status, Date Added, and Segments columns
await page.addStyleTag({ content: `
  table th:nth-child(3), table td:nth-child(3),
  table th:nth-child(4), table td:nth-child(4),
  table th:nth-child(5), table td:nth-child(5) {
    display: none !important;
  }
` });
await page.waitForTimeout(500);

// Find first Unassigned and its position
const unassigned = page.locator('text=Unassigned');
const firstUnassigned = unassigned.first();
const uBox = await firstUnassigned.boundingBox();
console.log(`  First Unassigned: x=${uBox?.x?.toFixed(0)}, y=${uBox?.y?.toFixed(0)}`);

// Scroll the table so the Unassigned row is near the top
// We want ~1 row above the Unassigned row visible (for context)
// Each row is about 56px. We want to scroll so Unassigned is at ~header + 1 row
const tableHeader = page.locator('th').first();
const thBox = await tableHeader.boundingBox();
const headerY = thBox.y;
const rowHeight = 56; // approximate
const targetY = headerY + rowHeight * 2; // 2 rows below header
const scrollAmount = uBox.y - targetY;
console.log(`  Header at y=${headerY?.toFixed(0)}, scrolling table by ${scrollAmount?.toFixed(0)}px`);

// Scroll the table container
const tableContainer = page.locator('table').first().locator('..');
await tableContainer.evaluate((el, scroll) => {
  // Find the scrollable parent
  let parent = el;
  while (parent && parent !== document.body) {
    if (parent.scrollHeight > parent.clientHeight) {
      parent.scrollTop += scroll;
      console.log('scrolled', parent.tagName, parent.scrollTop);
      return;
    }
    parent = parent.parentElement;
  }
  // Fallback: scroll the table wrapper
  el.scrollTop += scroll;
}, scrollAmount);
await page.waitForTimeout(500);
await prep();
await ref('v6-scrolled');

// Re-find Unassigned position after scroll
const uBox2 = await firstUnassigned.boundingBox();
console.log(`  Unassigned after scroll: y=${uBox2?.y?.toFixed(0)}`);

// Click Unassigned to open dropdown
await firstUnassigned.click();
await page.waitForTimeout(1500);
await ref('v6-dropdown');

// Get dropdown position
const dd = page.locator('[role="listbox"], [role="menu"], [class*="popover"], [data-radix-popper-content-wrapper]');
let ddBox = null;
for (let j = 0; j < await dd.count(); j++) {
  if (await dd.nth(j).isVisible().catch(() => false)) {
    ddBox = await dd.nth(j).boundingBox();
    console.log(`  Dropdown: x=${ddBox?.x?.toFixed(0)}, y=${ddBox?.y?.toFixed(0)}, w=${ddBox?.width?.toFixed(0)}, h=${ddBox?.height?.toFixed(0)}`);
  }
}

// Get updated column positions
const ths = await page.locator('th:visible').all();
let assignedEndX = 0;
for (const th of ths) {
  const text = await th.textContent();
  const box = await th.boundingBox();
  if (text?.trim().includes('Assigned') && box) {
    assignedEndX = box.x + box.width;
  }
}

// Calculate clip:
// - Start just above the table header (or 1 row before Unassigned)
// - Width: just past Assigned To column + dropdown
// - Height: enough for header + ~3 rows + dropdown items
const uBoxFinal = await firstUnassigned.boundingBox();
const thBoxFinal = await page.locator('th').first().boundingBox();

// Start from 1 row above the Unassigned row, include header if visible
const clipStartY = Math.max(thBoxFinal.y - 5, uBoxFinal.y - rowHeight * 2);
// End at bottom of dropdown + some padding
const ddBottom = ddBox ? ddBox.y + ddBox.height : uBoxFinal.y + 200;
const clipEndY = ddBottom + 20;
const clipH = Math.min(clipEndY - clipStartY, 340); // Max ~340px for fewer rows

// Width: trim to just past the content
const contentRightEdge = ddBox ? Math.max(assignedEndX, ddBox.x + ddBox.width) : assignedEndX;
const clipStartX = thBoxFinal.x - 5;
const clipW = contentRightEdge - clipStartX + 30; // 30px padding

console.log(`  Clip: x=${clipStartY.toFixed(0)}, y=${clipStartY.toFixed(0)}, w=${clipW.toFixed(0)}, h=${clipH.toFixed(0)}`);
console.log(`  Content: assignedEnd=${assignedEndX.toFixed(0)}, ddRight=${ddBox ? (ddBox.x + ddBox.width).toFixed(0) : 'n/a'}`);

await page.screenshot({
  path: `${BASE}/auto-and-manual-assignment/raw/assignment-manual-dropdown-raw.png`,
  clip: { x: clipStartX, y: clipStartY, width: clipW, height: clipH },
  scale: 'device',
});
console.log(`  SNAP: clip ${clipW.toFixed(0)}x${clipH.toFixed(0)} -> ${(clipW*2).toFixed(0)}x${(clipH*2).toFixed(0)}px @2x`);

await browser.close();
console.log('Done');
