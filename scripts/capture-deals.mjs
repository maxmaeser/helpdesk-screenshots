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

// Helper: kill focus rings after every navigation
async function prep() {
  await page.addStyleTag({ content: '* { outline: none !important; }' });
}

async function snap(clip, filename) {
  const path = `${RAW}/${filename}`;
  await page.screenshot({ path, clip, scale: 'device' });
  console.log(`  ${filename}: ${clip.width * 2}x${clip.height * 2}px`);
}

// ──────────────────────────────────────────────────
// 1. deals-nav-pipeline: sidebar + Deals tab hover
// ──────────────────────────────────────────────────
console.log('1. deals-nav-pipeline');
await page.goto('https://staging.app.franchisesystems.ai/sales');
await page.waitForTimeout(5000);
await prep();

const dealsTab = page.getByRole('tab', { name: 'Deals' });
await dealsTab.hover();
await page.waitForTimeout(300);
const tabRect = await dealsTab.boundingBox();

await snap({ x: 0, y: 50, width: 840, height: 310 }, 'deals-nav-pipeline-raw.png');
console.log(`   Deals tab at: ${JSON.stringify(tabRect)}`);

// ──────────────────────────────────────────────────
// 2. Navigate to Deals tab, then open Deal #20
// ──────────────────────────────────────────────────
console.log('2. Switching to Deals tab');
await dealsTab.click();
await page.waitForTimeout(3000);

// Find and click Deal #20
const dealRow = page.locator('table tbody tr').filter({ hasText: '#20' }).first();
const hasDeal20 = await dealRow.count();
if (hasDeal20 === 0) {
  // Try finding by row with "20" in ID column - look at all rows
  console.log('   Deal #20 not found by text, looking for it...');
  const rows = await page.locator('table tbody tr[cursor]').all();
  console.log(`   Found ${rows.length} rows in Deals table`);
  // Click first deal to see the detail view structure
  const firstRow = page.locator('table tbody tr').nth(1);
  const firstText = await firstRow.textContent();
  console.log(`   First row text: ${firstText?.substring(0, 80)}`);
}

// Take a snapshot of the deals table to find Deal #20
const dealsTableText = await page.locator('table').textContent();
console.log(`   Deals table content (first 500 chars): ${dealsTableText?.substring(0, 500)}`);

await browser.close();
console.log('\nDone - phase 1. Check raw files and table content.');
