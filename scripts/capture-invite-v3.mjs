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
  await page.screenshot({ path: `${ROOT}/how-to-invite-users/raw/_ref_v3_${name}.png`, scale: 'device' });
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

await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

await page.locator('text=Organization').first().click();
await page.waitForTimeout(1500);
await page.locator('a:has-text("Members")').first().click();
await page.waitForTimeout(3000);
await prep();
await ref('members');

const taBox = await bbox(page.locator('text=Team Admins').first(), 'Team Admins');
const ibBox = await bbox(page.locator('text=Invite Team Member').first(), 'Invite btn');

// === invite-nav-members: capture FULL width for splice ===
// Content area: Team Admins at x=317, Invite button ends at x=1219
// Capture from content left edge to button right edge + padding
console.log('\n--- invite-nav-members (full width for splice) ---');
if (taBox && ibBox) {
  const clipX = taBox.x - 20; // ~297
  const clipRight = ibBox.x + ibBox.width + 20; // ~1239
  await snap('invite-nav-members-wide-raw', {
    x: clipX,
    y: Math.max(0, taBox.y - 20),
    width: clipRight - clipX,
    height: Math.min(400, 900 - taBox.y + 30),
  });

  // Log key element positions relative to clip for splice planning
  console.log(`\n  Positions relative to clip (x=${clipX.toFixed(0)}):`);
  console.log(`  Team Admins: ${((taBox.x - clipX) * 2).toFixed(0)}px at 2x`);
  console.log(`  Invite btn start: ${((ibBox.x - clipX) * 2).toFixed(0)}px at 2x`);
  console.log(`  Invite btn end: ${((ibBox.x + ibBox.width - clipX) * 2).toFixed(0)}px at 2x`);

  // Find member name positions
  const jrg = await bbox(page.locator('text=Joshua Radin-Grant').first(), 'Joshua');
  const lastAct = await bbox(page.locator('text=Last Activity').first(), 'Last Activity');
  if (jrg) console.log(`  Joshua name end: ${((jrg.x + jrg.width - clipX) * 2).toFixed(0)}px at 2x`);
  if (lastAct) console.log(`  Last Activity start: ${((lastAct.x - clipX) * 2).toFixed(0)}px at 2x`);
}

// === invite-modal: capture full dialog width for splice ===
console.log('\n--- invite-modal (full width) ---');
if (ibBox) {
  await page.locator('text=Invite Team Member').first().click();
  await page.waitForTimeout(2000);
  await prep();
  await ref('dialog');

  const titleEl = page.locator('text=Invite to').first();
  const tBox = await bbox(titleEl, 'Title');
  const closeX = page.locator('text=Invite to >> .. >> button').first();
  const cxBox = await bbox(closeX, 'Close X');
  const eiBox = await bbox(page.locator('text=Existing Invites').first(), 'Existing Invites');
  const inviteBtn = page.locator('button:has-text("Invite")').last();
  const isBox = await bbox(inviteBtn, 'Invite send btn');

  if (tBox) {
    // Capture the dialog with generous width - we'll splice out the empty middle
    const dialogLeft = tBox.x - 20;
    const dialogRight = cxBox ? cxBox.x + cxBox.width + 20 : tBox.x + 520;
    const dialogTop = tBox.y - 20;
    const dialogBottom = eiBox ? eiBox.y + eiBox.height + 20 : tBox.y + 400;

    await snap('invite-modal-wide-raw', {
      x: Math.max(0, dialogLeft),
      y: Math.max(0, dialogTop),
      width: Math.min(840, dialogRight - dialogLeft),
      height: Math.min(430, dialogBottom - dialogTop),
    });

    // Log positions for splice planning
    const clipX = dialogLeft;
    console.log(`\n  Positions relative to clip (x=${clipX.toFixed(0)}):`);
    if (isBox) {
      console.log(`  Invite btn start: ${((isBox.x - clipX) * 2).toFixed(0)}px at 2x`);
      console.log(`  Invite btn end: ${((isBox.x + isBox.width - clipX) * 2).toFixed(0)}px at 2x`);
    }
    if (cxBox) {
      console.log(`  Close X start: ${((cxBox.x - clipX) * 2).toFixed(0)}px at 2x`);
      console.log(`  Close X end: ${((cxBox.x + cxBox.width - clipX) * 2).toFixed(0)}px at 2x`);
    }
    // Find where the form fields end (right edge of input fields)
    const emailLabel = page.locator('text=Email').first();
    const elBox = await bbox(emailLabel, 'Email label');
    if (elBox) console.log(`  Email label: ${((elBox.x - clipX) * 2).toFixed(0)}px at 2x`);
    // The grey space is between the right edge of form content and the dialog right edge
    const billingToggle = page.locator('text=Has Billing Access').first();
    const btBox = await bbox(billingToggle, 'Billing toggle');
    if (btBox) console.log(`  Billing toggle end: ${((btBox.x + btBox.width - clipX) * 2).toFixed(0)}px at 2x`);
  }
}

await browser.close();
console.log('\nDONE');
