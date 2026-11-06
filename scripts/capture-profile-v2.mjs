import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';
mkdirSync(`${ROOT}/setting-up-your-profile/raw`, { recursive: true });
mkdirSync(`${ROOT}/how-to-invite-users/raw`, { recursive: true });

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

await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();
await page.locator('text=Profile Details').first().click().catch(() => {});
await page.waitForTimeout(2000);
await prep();

// === FIX 1: profile-nav-settings with HAND cursor, positioned inside "Profile Details" ===
console.log('\n--- profile-nav-settings (hand cursor, inside text) ---');
const pdBox = await bbox(page.locator('text=Profile Details').first(), 'Profile Details');
await snap('setting-up-your-profile', 'profile-nav-settings-raw', { x: 0, y: 0, width: 640, height: 380 });
if (pdBox) {
  // Cursor slightly inside the right edge of the highlighted row (not at text end)
  const cursorX = Math.round((pdBox.x + pdBox.width - 30) * 2);
  const cursorY = Math.round((pdBox.y + pdBox.height / 2) * 2);
  console.log(`  Hand cursor at (2x): ${cursorX}, ${cursorY}`);
}

// === FIX 2: profile-assignability - capture FULL width for compositing ===
console.log('\n--- profile-assignability (full width for splice) ---');
await page.locator('text=Agent Sales Assignability').first().click();
await page.waitForTimeout(3000);
await prep();

const header = await bbox(page.locator('text=Assignable To Applicant Portal Leads').first(), 'Header');
const na0 = await bbox(page.locator('text=Not Assignable').first(), 'NotAssignable[0]');

if (header && na0) {
  // Capture from card left edge to beyond "Not Assignable" right edge
  const clipX = header.x - 22;
  const clipRight = na0.x + na0.width + 15;
  const clipWidth = clipRight - clipX;
  console.log(`  Full content: x=${clipX.toFixed(0)}, width=${clipWidth.toFixed(0)} CSS`);

  await snap('setting-up-your-profile', 'profile-assignability-wide-raw', {
    x: clipX,
    y: Math.max(0, header.y - 20),
    width: clipWidth,
    height: 280,
  });
}

// === FIX 3: invite-modal - tighter crop, no grey space ===
console.log('\n--- invite-modal (tighter) ---');
// Navigate to Organization > Members
await page.locator('text=Organization').first().click();
await page.waitForTimeout(1500);
await page.locator('a:has-text("Members")').first().click();
await page.waitForTimeout(3000);
await prep();

// Also recapture invite-nav-members with better framing
const taBox = await bbox(page.locator('text=Team Admins').first(), 'Team Admins');
const ibBox = await bbox(page.locator('text=Invite Team Member').first(), 'Invite btn');

if (taBox) {
  // Capture members page with sidebar context - wider and with better framing
  await snap('how-to-invite-users', 'invite-nav-members-raw', {
    x: 0,
    y: Math.max(0, taBox.y - 80),
    width: 840,
    height: 400,
  });
}

// Click Invite to open modal
if (ibBox) {
  await page.locator('text=Invite Team Member').first().click();
  await page.waitForTimeout(2000);
  await prep();

  // Find dialog content bounds tightly
  const titleEl = page.locator('text=Invite to').first();
  const tBox = await bbox(titleEl, 'Invite dialog title');
  const closeX = page.locator('button:has(svg):near(:text("Invite to"))').first();
  const cxBox = await bbox(closeX, 'Close X');
  const existingInvites = page.locator('text=Existing Invites').first();
  const eiBox = await bbox(existingInvites, 'Existing Invites');
  const inviteSendBtn = page.locator('button:has-text("Invite")').last();
  const isBox = await bbox(inviteSendBtn, 'Invite send btn');

  if (tBox) {
    // Tight crop around just the dialog - title to Existing Invites
    const dialogLeft = tBox.x - 15;
    const dialogRight = cxBox ? cxBox.x + cxBox.width + 15 : tBox.x + 480;
    const dialogTop = tBox.y - 15;
    const dialogBottom = eiBox ? eiBox.y + eiBox.height + 15 : (isBox ? isBox.y + isBox.height + 40 : tBox.y + 400);

    await snap('how-to-invite-users', 'invite-modal-raw', {
      x: Math.max(0, dialogLeft),
      y: Math.max(0, dialogTop),
      width: Math.min(840, dialogRight - dialogLeft),
      height: Math.min(430, dialogBottom - dialogTop),
    });
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
}


await browser.close();
console.log('\nDONE');
