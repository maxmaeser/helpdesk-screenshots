import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';

for (const a of ['setting-up-your-profile', 'how-to-connect-your-calendar', 'how-to-import-audiences'])
  mkdirSync(`${ROOT}/${a}/raw`, { recursive: true });

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

async function snap(article, name, clip) {
  const path = `${ROOT}/${article}/raw/${name}.png`;
  await page.screenshot({ path, clip, scale: 'device' });
  console.log(`  SNAP ${article}/${name}.png (${Math.round(clip.width)}x${Math.round(clip.height)} CSS)`);
}

async function bbox(locator, label, timeout = 5000) {
  try {
    await locator.waitFor({ state: 'visible', timeout });
    const box = await locator.boundingBox();
    if (!box) return null;
    console.log(`  ${label}: x=${box.x.toFixed(0)} y=${box.y.toFixed(0)} w=${box.width.toFixed(0)} h=${box.height.toFixed(0)}`);
    return box;
  } catch { return null; }
}

// 1. profile-nav-settings: was 450 CSS → 1004px. Reduce to 400 CSS → ~904px
console.log('\n--- profile-nav-settings (height fix) ---');
await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();
await page.locator('text=Profile Details').first().click().catch(() => {});
await page.waitForTimeout(2000);
await prep();

// Show sidebar + Details header + avatar area. Cut before First Name field.
await snap('setting-up-your-profile', 'profile-nav-settings-raw', {
  x: 0, y: 0, width: 640, height: 380,
});


// 2. scheduling-events: was 480 CSS → 1064px. Reduce to 400 CSS → ~904px
// Cut out "Associated Organizations" section at bottom
console.log('\n--- scheduling-events (height fix) ---');
await page.locator('text=Scheduling Events').first().click();
await page.waitForTimeout(3000);
await prep();

// From prior captures: the content area has Connected Calendar + Scheduling Events + Create Event
// Cut before "Associated Organizations" at bottom
const connCalHeader = page.locator('text=Connected Calendar').first();
const ccBox = await bbox(connCalHeader, 'Connected Calendar');
if (ccBox) {
  await snap('how-to-connect-your-calendar', 'scheduling-events-raw', {
    x: 0,
    y: Math.max(0, ccBox.y - 40),
    width: 840,
    height: 380,
  });
}


// 3. import-single-prospect: was ~468 CSS → 1040px. Reduce to ~420 CSS
// Tighten padding around dialog
console.log('\n--- import-single-prospect (height fix) ---');
await page.goto(`${STAGING}/marketing`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();
await page.locator('text=Audiences').first().click().catch(() => {});
await page.waitForTimeout(3000);
await prep();

const actionsBtn = page.locator('button:has-text("Actions")').first();
await actionsBtn.click();
await page.waitForTimeout(1500);

// Find Import in dropdown (closest to Actions)
const abBox = await actionsBtn.boundingBox();
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
const importSingle = page.locator('text=Import Single Prospect').first();
await importSingle.click();
await page.waitForTimeout(3000);
await prep();

// Find dialog content bounds
const titleEl = page.locator('text=Import Prospect').first();
const tBox = await bbox(titleEl, 'Title');
const importBtn = page.locator('button:has-text("Import")').last();
const impBox = await bbox(importBtn, 'Import btn');

if (tBox && impBox) {
  const dialogCenterX = tBox.x + tBox.width / 2;
  // Tighter bounds - just the dialog, less padding
  await snap('how-to-import-audiences', 'import-single-prospect-raw', {
    x: Math.max(0, dialogCenterX - 240),
    y: Math.max(0, tBox.y - 20),
    width: 480,
    height: Math.min(420, impBox.y + impBox.height - tBox.y + 40),
  });
}

await browser.close();
console.log('\nDONE');
