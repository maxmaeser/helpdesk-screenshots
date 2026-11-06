import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';
mkdirSync(`${ROOT}/how-to-import-audiences/raw`, { recursive: true });

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

await page.goto(`${STAGING}/marketing`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();
await page.locator('text=Audiences').first().click().catch(() => {});
await page.waitForTimeout(3000);
await prep();

// Open Actions > Import > Import Single Prospect
const actionsBtn = page.locator('button:has-text("Actions")').first();
const abBox = await actionsBtn.boundingBox();
await actionsBtn.click();
await page.waitForTimeout(1500);

const allImports = await page.locator('text=Import').all();
let dropdownImport = null;
let minDist = Infinity;
for (const imp of allImports) {
  const b = await imp.boundingBox();
  if (b) {
    const dist = Math.abs(b.x - abBox.x) + Math.abs(b.y - abBox.y);
    if (dist < minDist) { minDist = dist; dropdownImport = imp; }
  }
}
await dropdownImport.click();
await page.waitForTimeout(2000);
await page.locator('text=Import Single Prospect').first().click();
await page.waitForTimeout(3000);
await prep();

// Find dialog bounds by content
const titleEl = page.locator('text=Import Prospect').first();
const tBox = await titleEl.boundingBox();
const importBtn = page.locator('button:has-text("Import")').last();
const impBox = await importBtn.boundingBox();
const cancelBtn = page.locator('button:has-text("Cancel")').first();
const cbBox = await cancelBtn.boundingBox();

console.log(`Title: x=${tBox.x} y=${tBox.y} w=${tBox.width}`);
console.log(`Import btn: x=${impBox.x} y=${impBox.y} w=${impBox.width}`);
console.log(`Cancel btn: x=${cbBox.x} y=${cbBox.y} w=${cbBox.width}`);

// Build bounds: from title icon (left) to Import button (right)
// Title icon is ~40px left of title text
const leftEdge = tBox.x - 60;
const rightEdge = impBox.x + impBox.width + 20;
const topEdge = tBox.y - 25;
const bottomEdge = impBox.y + impBox.height + 25;

const path = `${ROOT}/how-to-import-audiences/raw/import-single-prospect-raw.png`;
await page.screenshot({
  path,
  clip: {
    x: Math.max(0, leftEdge),
    y: Math.max(0, topEdge),
    width: Math.min(840, rightEdge - leftEdge),
    height: Math.min(430, bottomEdge - topEdge),
  },
  scale: 'device',
});
console.log(`SNAP import-single-prospect-raw.png (${Math.round(rightEdge - leftEdge)}x${Math.round(bottomEdge - topEdge)} CSS)`);

await browser.close();
console.log('DONE');
