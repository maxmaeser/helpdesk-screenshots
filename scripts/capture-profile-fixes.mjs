import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';
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

async function snap(name, clip) {
  const path = `${ROOT}/setting-up-your-profile/raw/${name}.png`;
  await page.screenshot({ path, clip, scale: 'device' });
  console.log(`  SNAP ${name}.png (${Math.round(clip.width)}x${Math.round(clip.height)} CSS)`);
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

await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();
await page.locator('text=Profile Details').first().click().catch(() => {});
await page.waitForTimeout(2000);
await prep();

// === FIX 1: profile-nav-settings with cursor on "Profile Details" ===
console.log('\n--- profile-nav-settings (with cursor) ---');
const pdText = page.locator('text=Profile Details').first();
const pdBox = await bbox(pdText, 'Profile Details');

// Capture the same clip as before
await snap('profile-nav-settings-raw', { x: 0, y: 0, width: 640, height: 380 });

if (pdBox) {
  // Cursor position: right end of "Profile Details" text, vertically centered
  // These are absolute page coordinates. The clip starts at (0,0), so cursor coords
  // relative to the clip = same as absolute coords.
  // At 2x: multiply by 2 for the pixel coords in the raw PNG
  const cursorX = Math.round((pdBox.x + pdBox.width - 5) * 2);
  const cursorY = Math.round((pdBox.y + pdBox.height / 2) * 2);
  console.log(`  Cursor position (2x pixels): ${cursorX}, ${cursorY}`);
}


// === FIX 2: profile-assignability - show full brand cards + radio buttons ===
console.log('\n--- profile-assignability (wider, no left crop) ---');
await page.locator('text=Agent Sales Assignability').first().click();
await page.waitForTimeout(3000);
await prep();

const header = await bbox(page.locator('text=Assignable To Applicant Portal Leads').first(), 'Header');
const stb = await bbox(page.locator('text=Staging Test Brand').first(), 'Staging Test Brand');
const auto0 = await bbox(page.locator('text=Automatic').first(), 'Automatic[0]');
const na0 = await bbox(page.locator('text=Not Assignable').first(), 'NotAssignable[0]');

if (header && stb && na0) {
  // Include full header + brand names + all radio buttons
  // Content card left border ≈ header.x - 20 ≈ 297
  // "Not Assignable" right edge ≈ 1093 + 109 = 1202
  // Total width needed: 1202 - 297 = 905px. Over 840 limit by 65px.
  //
  // Compromise: start from card left edge, use full 840 width
  // This shows full header, full brand names, and clips "Not Assignable" to "Not Assign..."
  const cardLeft = header.x - 22;
  await snap('profile-assignability-raw', {
    x: cardLeft,
    y: Math.max(0, header.y - 20),
    width: 840,
    height: 280,
  });
  console.log(`  Right edge at: ${cardLeft + 840} (Not Assignable ends at: ${na0.x + na0.width})`);
}

await browser.close();
console.log('\nDONE');
