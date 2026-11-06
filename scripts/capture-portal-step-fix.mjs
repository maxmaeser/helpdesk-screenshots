import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
mkdirSync(`${BASE}/how-to-edit-your-portal/raw`, { recursive: true });

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

console.log('=== PORTAL ADD STEP (height fix) ===');
await page.goto('https://staging.app.franchisesystems.ai/studio/applicant-portal', {
  timeout: 60000, waitUntil: 'domcontentloaded'
});
await page.waitForTimeout(6000);
await prep();

// Scroll to show Add Step
await page.evaluate(() => {
  const scrollable = document.querySelector('main') || document.querySelector('[class*="scroll"]');
  if (scrollable) scrollable.scrollTop = 250;
  else window.scrollBy(0, 250);
});
await page.waitForTimeout(1000);

// Click first visible Add Step
const addStepBtns = page.locator('button:has-text("Add Step")');
for (let i = 0; i < await addStepBtns.count(); i++) {
  if (await addStepBtns.nth(i).isVisible()) {
    await addStepBtns.nth(i).click();
    console.log(`  Clicked Add Step ${i}`);
    break;
  }
}
await page.waitForTimeout(2000);
await prep();

// Click Step Action "Select" dropdown
const selectBtn = page.locator('text=Select').last();
const saBox = await selectBtn.boundingBox().catch(() => null);
if (saBox && saBox.x > 400) {
  await selectBtn.click();
  await page.waitForTimeout(1000);
}

// Use same x position but height 440 instead of 480
const stepLabel = page.locator('text=Step Action').first();
const slBox = await stepLabel.boundingBox().catch(() => null);
console.log(`  "Step Action": x=${slBox?.x?.toFixed(0)}, y=${slBox?.y?.toFixed(0)}`);

if (slBox) {
  const panelStartX = slBox.x - 30;
  const clipX = Math.max(0, panelStartX - 500);
  const clipW = Math.min(840, 1280 - clipX);
  const clipY = Math.max(0, slBox.y - 80); // Start a bit higher
  const clipH = 440; // Reduced from 480 to stay under 1000px final

  console.log(`  Clip: x=${clipX}, y=${clipY}, w=${clipW}, h=${clipH}`);
  await page.screenshot({
    path: `${BASE}/how-to-edit-your-portal/raw/portal-add-step-wide-raw.png`,
    clip: { x: clipX, y: clipY, width: clipW, height: clipH },
    scale: 'device',
  });
  console.log(`  SNAP: ${clipW * 2}x${clipH * 2}px @2x`);
}

await browser.close();
console.log('Done');
