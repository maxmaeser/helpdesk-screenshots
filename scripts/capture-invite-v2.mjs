import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';
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

async function snap(name, clip) {
  const path = `${ROOT}/how-to-invite-users/raw/${name}.png`;
  await page.screenshot({ path, clip, scale: 'device' });
  console.log(`  SNAP ${name}.png (${Math.round(clip.width)}x${Math.round(clip.height)} CSS)`);
}

async function ref(name) {
  await page.screenshot({ path: `${ROOT}/how-to-invite-users/raw/_ref_v2_${name}.png`, scale: 'device' });
  console.log(`  ref: ${name}`);
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

// Navigate to Organization > Members
await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

await page.locator('text=Organization').first().click();
await page.waitForTimeout(1500);
await page.locator('a:has-text("Members")').first().click();
await page.waitForTimeout(3000);
await prep();
await ref('members-full');

const taBox = await bbox(page.locator('text=Team Admins').first(), 'Team Admins');
const ibBox = await bbox(page.locator('text=Invite Team Member').first(), 'Invite btn');

// === Image 1: invite-nav-members ===
// Content-only view: Team Admins header + member cards + Invite button visible
// Skip sidebar to fit the Invite button within 840px
console.log('\n--- invite-nav-members ---');
if (taBox && ibBox) {
  // Start from content area, include Team Admins through to Invite button
  // taBox.x ≈ 317, ibBox ends at ≈ 1219
  // Content card starts at ~300. From 300, width 840 → reaches 1140. Button at 1046 fits!
  // But button text ends at 1219... need to start at ~380 for width 840 → 1220
  const startX = ibBox.x + ibBox.width - 840 + 15; // right-align to include full button
  await snap('invite-nav-members-raw', {
    x: Math.max(0, startX),
    y: Math.max(0, taBox.y - 25),
    width: 840,
    height: Math.min(430, 900 - taBox.y + 50), // max ~430 CSS for height limit
  });
}

// === Image 2: invite-modal ===
// Open the invite dialog and capture it fully
console.log('\n--- invite-modal ---');
if (ibBox) {
  await page.locator('text=Invite Team Member').first().click();
  await page.waitForTimeout(2000);
  await prep();
  await ref('invite-dialog');

  // Find dialog bounds by content
  const titleEl = page.locator('text=Invite to').first();
  const tBox = await bbox(titleEl, 'Title');
  const closeX = page.locator('button:near(:text("Invite to")):has(svg)').first();
  const cxBox = await bbox(closeX, 'Close X');
  const existingInvites = page.locator('text=Existing Invites').first();
  const eiBox = await bbox(existingInvites, 'Existing Invites');
  const inviteSendBtn = page.locator('button:has-text("Invite")').last();
  const isBox = await bbox(inviteSendBtn, 'Invite send btn');

  if (tBox) {
    // Full dialog: title to Existing Invites, include close X on right
    const dialogLeft = tBox.x - 20;
    const dialogRight = cxBox ? cxBox.x + cxBox.width + 20 : (isBox ? isBox.x + isBox.width + 30 : tBox.x + 520);
    const dialogTop = tBox.y - 20;
    const dialogBottom = eiBox ? eiBox.y + eiBox.height + 20 : (isBox ? isBox.y + isBox.height + 50 : tBox.y + 400);
    const clipW = dialogRight - dialogLeft;
    const clipH = dialogBottom - dialogTop;

    console.log(`  Dialog bounds: ${Math.round(clipW)}x${Math.round(clipH)} CSS`);

    await snap('invite-modal-raw', {
      x: Math.max(0, dialogLeft),
      y: Math.max(0, dialogTop),
      width: Math.min(840, clipW),
      height: Math.min(430, clipH),
    });
  }

  // Close dialog
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
}

// === Image 3: invite-pending ===
// Scroll down to see the Invited/pending section
console.log('\n--- invite-pending ---');
await prep();

// Scroll the content area to find Invited section
await page.evaluate(() => {
  const main = document.querySelector('main') || document.documentElement;
  main.scrollTop = main.scrollHeight;
  window.scrollTo(0, document.body.scrollHeight);
});
await page.waitForTimeout(1500);
await prep();
await ref('scrolled');

const invitedHeader = page.locator('text=Invited').first();
const ihBox = await bbox(invitedHeader, 'Invited header');

if (ihBox) {
  // Capture the Invited section showing pending invites
  await snap('invite-pending-raw', {
    x: Math.max(0, ihBox.x - 30),
    y: Math.max(0, ihBox.y - 20),
    width: Math.min(840, 1280 - ihBox.x + 50),
    height: Math.min(300, 900 - ihBox.y + 30),
  });
} else {
  console.log('  No "Invited" section found, trying alternate text');
  const pendingText = page.locator('text=Pending, text=Existing Invites, text=pending').first();
  const ptBox = await bbox(pendingText, 'Pending text');
  if (ptBox) {
    await snap('invite-pending-raw', {
      x: Math.max(0, ptBox.x - 30),
      y: Math.max(0, ptBox.y - 20),
      width: Math.min(840, 1280 - ptBox.x + 50),
      height: Math.min(300, 900 - ptBox.y + 30),
    });
  } else {
    console.log('  WARN: No pending invites section found');
    await ref('no-pending');
  }
}

await browser.close();
console.log('\nDONE');
