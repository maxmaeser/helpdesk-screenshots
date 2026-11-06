import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
mkdirSync(`${ROOT}/setting-up-your-profile/raw`, { recursive: true });

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
    if (!box) { console.log(`  WARN: ${label} no bbox`); return null; }
    console.log(`  ${label}: x=${box.x.toFixed(0)} y=${box.y.toFixed(0)} w=${box.width.toFixed(0)} h=${box.height.toFixed(0)}`);
    return box;
  } catch {
    console.log(`  WARN: ${label} not visible`);
    return null;
  }
}

await page.goto('https://staging.app.franchisesystems.ai/settings/account', { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

await page.locator('text=Agent Sales Assignability').first().click();
await page.waitForTimeout(3000);
await prep();

// Verify positions
const ahBox = await bbox(page.locator('text=Assignable To Applicant Portal Leads').first(), 'Header');
const auto0 = await bbox(page.locator('text=Automatic').first(), 'Automatic[0]');
const na0 = await bbox(page.locator('text=Not Assignable').first(), 'NotAssignable[0]');

if (ahBox && auto0 && na0) {
  // Content spans: header at x=317, Not Assignable ends at x≈1093+107≈1200
  // Best compromise: start at x=360 → width 840 → right edge at 1200
  // This shows most of the header "...ble To Applicant Portal Leads"
  // Shows partial brand names + brand logos
  // Shows ALL radio buttons including full "Not Assignable"
  const startX = Math.max(0, na0.x + na0.width - 840 + 20);
  console.log(`  Optimal startX: ${startX} (right edge: ${startX + 840})`);

  // Capture the header + first 3 brand rows
  await snap('setting-up-your-profile', 'profile-assignability-raw', {
    x: startX,
    y: Math.max(0, ahBox.y - 20),
    width: 840,
    height: 280,
  });
}

await browser.close();
console.log('DONE');
