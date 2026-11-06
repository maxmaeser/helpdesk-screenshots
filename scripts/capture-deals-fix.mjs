import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots/about-deals';
const RAW = `${BASE}/raw`;
mkdirSync(RAW, { recursive: true });

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
async function ref(name) {
  await page.screenshot({ path: `${RAW}/_ref_${name}.png`, scale: 'device' });
  console.log(`  ref: ${name}`);
}

// Navigate to a deal
console.log('Navigating to deals...');
await page.goto('https://staging.app.franchisesystems.ai/sales', {
  timeout: 60000, waitUntil: 'domcontentloaded'
});
await page.waitForTimeout(8000);
await prep();

// Click Deals tab
await page.getByRole('tab', { name: 'Deals' }).click();
await page.waitForTimeout(3000);
await prep();
await ref('deals-table');

// Navigate directly to a deal URL
await page.goto('https://staging.app.franchisesystems.ai/sales/deals', {
  timeout: 60000, waitUntil: 'domcontentloaded'
});
await page.waitForTimeout(5000);
await prep();
await ref('deals-list');

// Click on "Deal 20" link in the table (click the Name cell, not the text)
const dealLink = page.locator('a:has-text("Deal 20"), [href*="deal"]').first();
if (await dealLink.isVisible().catch(() => false)) {
  await dealLink.click();
} else {
  // Click on the row's name cell
  const nameCell = page.locator('td:has-text("Deal 20"), td:has-text("Deal 1")').first();
  await nameCell.click();
}
await page.waitForTimeout(4000);
await prep();
await ref('deal-detail');

// ══════════════════════════════════════════════════════
// 1. deals-overview: wider clip with more padding
// ══════════════════════════════════════════════════════
console.log('\n=== 1. deals-overview (wider padding) ===');

// Find the deal detail panel boundaries
const dealTitle = page.locator('text=Deal 20').first();
const dtBox = await dealTitle.boundingBox();
console.log(`  Deal title: x=${dtBox?.x?.toFixed(0)}, y=${dtBox?.y?.toFixed(0)}`);

// Find the Overview section
const overviewTab = page.locator('text=Overview').first();
const otBox = await overviewTab.boundingBox();
console.log(`  Overview tab: x=${otBox?.x?.toFixed(0)}, y=${otBox?.y?.toFixed(0)}`);

// Find the deal detail container - it's the main content area after sidebar
// We want to capture: Deal title + badges + Overview section with Deal Overview fields
// Need enough left padding so the deal icon isn't clipped, and right padding for badges

// Get the rightmost badge position
const inReviewBadge = page.locator('text=In Review').first();
const irBox = await inReviewBadge.boundingBox();
console.log(`  In Review badge: x=${irBox?.x?.toFixed(0)}, w=${irBox?.width?.toFixed(0)}, right=${(irBox?.x + irBox?.width)?.toFixed(0)}`);

// Find Multi Unit Development badge
const mudBadge = page.locator('text=Multi Unit Development').first();
const mudVis = await mudBadge.isVisible().catch(() => false);
let rightEdge = irBox.x + irBox.width + 20;
if (mudVis) {
  const mudBox = await mudBadge.boundingBox();
  console.log(`  MUD badge: x=${mudBox?.x?.toFixed(0)}, w=${mudBox?.width?.toFixed(0)}, right=${(mudBox?.x + mudBox?.width)?.toFixed(0)}`);
  rightEdge = mudBox.x + mudBox.width + 20;
}

// Calculate clip with good padding
const clipX = Math.max(0, dtBox.x - 40); // 40px left padding from deal title
const clipW = Math.min(840, rightEdge - clipX + 20); // Include all badges + padding
const clipY = Math.max(0, dtBox.y - 20);
const clipH = 420; // Enough for Deal Overview fields

console.log(`  Clip: x=${clipX.toFixed(0)}, y=${clipY.toFixed(0)}, w=${clipW.toFixed(0)}, h=${clipH}`);

await page.screenshot({
  path: `${RAW}/deals-overview-raw.png`,
  clip: { x: clipX, y: clipY, width: clipW, height: clipH },
  scale: 'device',
});
console.log(`  SNAP deals-overview-raw.png: ${(clipW*2).toFixed(0)}x${clipH*2}px`);

// ══════════════════════════════════════════════════════
// 2. deals-status-dropdown: click Status badge, capture with dropdown
// ══════════════════════════════════════════════════════
console.log('\n=== 2. deals-status-dropdown (cursor on In Review) ===');

// Find the Status field and click the "In Review" badge to open dropdown
// The Status field is in the Deal Overview section
const statusLabel = page.locator('text=Status').first();
const slBox = await statusLabel.boundingBox();
console.log(`  Status label: x=${slBox?.x?.toFixed(0)}, y=${slBox?.y?.toFixed(0)}`);

// Click the In Review badge in the Status field (not the one in the header)
// The status badge in the overview section should be below the Status label
const statusBadges = page.locator('text=In Review');
const sbCount = await statusBadges.count();
console.log(`  "In Review" count: ${sbCount}`);

// Click the one that's near the Status label (lower y)
for (let i = 0; i < sbCount; i++) {
  const box = await statusBadges.nth(i).boundingBox();
  if (box && box.y > slBox.y) { // Below the Status label
    console.log(`  Clicking In Review ${i} at y=${box.y.toFixed(0)}`);
    await statusBadges.nth(i).click();
    await page.waitForTimeout(1500);
    break;
  }
}
await ref('status-dropdown');

// Check dropdown opened
const dropdown = page.locator('[class*="popover"], [role="listbox"], [data-radix-popper-content-wrapper]');
let ddBox = null;
for (let j = 0; j < await dropdown.count(); j++) {
  if (await dropdown.nth(j).isVisible().catch(() => false)) {
    ddBox = await dropdown.nth(j).boundingBox();
    console.log(`  Dropdown: x=${ddBox?.x?.toFixed(0)}, y=${ddBox?.y?.toFixed(0)}, w=${ddBox?.width?.toFixed(0)}, h=${ddBox?.height?.toFixed(0)}`);
  }
}

// Capture: Status field area + dropdown
// Include some context above (Date Created row) and below (Documents section)
if (ddBox) {
  const statusClipX = Math.max(0, slBox.x - 60);
  const statusClipY = Math.max(0, slBox.y - 80); // Show Date Created for context
  const ddRight = ddBox.x + ddBox.width;
  const ddBottom = ddBox.y + ddBox.height;
  const statusClipW = Math.min(840, ddRight - statusClipX + 30);
  const statusClipH = Math.min(440, ddBottom - statusClipY + 40);

  console.log(`  Clip: x=${statusClipX.toFixed(0)}, y=${statusClipY.toFixed(0)}, w=${statusClipW.toFixed(0)}, h=${statusClipH.toFixed(0)}`);

  await page.screenshot({
    path: `${RAW}/deals-status-dropdown-raw.png`,
    clip: { x: statusClipX, y: statusClipY, width: statusClipW, height: statusClipH },
    scale: 'device',
  });
  console.log(`  SNAP deals-status-dropdown-raw.png`);
}

await browser.close();
console.log('\nDone');
