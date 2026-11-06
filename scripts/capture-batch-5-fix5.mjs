import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';

for (const a of ['setting-up-your-profile', 'how-to-invite-users', 'how-to-import-audiences'])
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

async function ref(article, name) {
  await page.screenshot({ path: `${ROOT}/${article}/raw/_ref_fix5_${name}.png`, scale: 'device' });
  console.log(`  ref: ${name}`);
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


// ══════════════════════════════════════════════════════════════
// FIX 1: profile-assignability - show brand names + radio buttons
// Strategy: include sidebar for nav context, show the header and
// enough brands with radio buttons visible. "Not Assignable" will
// be slightly clipped but that's acceptable.
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 1: profile-assignability');
console.log('═'.repeat(60));

await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

await page.locator('text=Agent Sales Assignability').first().click();
await page.waitForTimeout(3000);
await prep();

// Capture full page from top - this is what worked in fix2 (840x480 from 0,0)
await snap('setting-up-your-profile', 'profile-assignability-raw', {
  x: 0, y: 0, width: 840, height: 480,
});


// ══════════════════════════════════════════════════════════════
// FIX 2: invite-button - content-only capture showing the button
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 2: invite-button (content only)');
console.log('═'.repeat(60));

const orgSection = page.locator('text=Organization').first();
await orgSection.click();
await page.waitForTimeout(1500);
const membersNav = page.locator('a:has-text("Members")').first();
await membersNav.click();
await page.waitForTimeout(3000);
await prep();

const taBox = await bbox(page.locator('text=Team Admins').first(), 'Team Admins');
const ibBox = await bbox(page.locator('text=Invite Team Member').first(), 'Invite btn');

if (taBox && ibBox) {
  // Content-only: start just before Team Admins, extend to include Invite button
  // ibBox ends at x=1046+173=1219. Start at max(297, 1219-840)=max(297,379)=379
  const startX = ibBox.x + ibBox.width - 840 + 20; // = 1219-840+20 = 399
  await snap('how-to-invite-users', 'invite-button-raw', {
    x: Math.max(0, startX),
    y: Math.max(0, taBox.y - 15),
    width: 840,
    height: 55,
  });
}


// ══════════════════════════════════════════════════════════════
// FIX 3: import-single-prospect - find dialog by backdrop/overlay
// The ref showed a centered modal with dark backdrop overlay.
// The dialog selector failed, so try: find the modal by its
// title text "Import Prospect" and its cancel/import buttons.
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 3: import-single-prospect dialog');
console.log('═'.repeat(60));

await page.goto(`${STAGING}/marketing`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

await page.locator('text=Audiences').first().click().catch(() => {});
await page.waitForTimeout(3000);
await prep();

const actionsBtn = page.locator('button:has-text("Actions")').first();
await actionsBtn.click();
await page.waitForTimeout(1500);

// Find Import in dropdown (closest to Actions button)
const allImports = await page.locator('text=Import').all();
let dropdownImport = null;
let minDist = Infinity;
const abBox = await actionsBtn.boundingBox();
for (const imp of allImports) {
  const b = await imp.boundingBox();
  if (b) {
    const dist = Math.abs(b.x - abBox.x) + Math.abs(b.y - abBox.y);
    if (dist < minDist) { minDist = dist; dropdownImport = imp; }
  }
}

// Click Import to expand submenu
await dropdownImport.click();
await page.waitForTimeout(2000);

// Click Import Single Prospect
const importSingle = page.locator('text=Import Single Prospect').first();
const isBox = await bbox(importSingle, 'Import Single Prospect');
if (isBox) {
  await importSingle.click();
  await page.waitForTimeout(3000);
  await prep();
  await ref('how-to-import-audiences', 'dialog-open');

  // Try many selectors for the dialog
  const selectors = [
    '[role="dialog"]',
    '[class*="modal"]',
    '[class*="Modal"]',
    '[class*="Dialog"]',
    '[class*="overlay"] > div',
    '[class*="Overlay"] > div',
    '[class*="backdrop"] + div',
    'div[class*="fixed"] > div[class*="bg-white"]',
    'div[class*="z-50"]',
  ];

  let dialogBox = null;
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    const b = await bbox(el, `Dialog (${sel})`, 1000);
    if (b && b.width > 200 && b.width < 800 && b.height > 200) {
      dialogBox = b;
      console.log(`  Found dialog with selector: ${sel}`);
      break;
    }
  }

  if (!dialogBox) {
    // Strategy: find dialog by its content
    // The dialog contains "Import Prospect" title and "Cancel" + "Import" buttons
    const titleEl = page.locator('text=Import Prospect').first();
    const tBox = await bbox(titleEl, 'Import Prospect title');
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    const cbBox = await bbox(cancelBtn, 'Cancel button');
    const importBtn = page.locator('button:has-text("Import")').last();
    const impBtnBox = await bbox(importBtn, 'Import button');

    if (tBox && (cbBox || impBtnBox)) {
      // Build dialog bounds from title to buttons
      const bottomBtn = impBtnBox || cbBox;
      const dialogTop = tBox.y - 30;
      const dialogBottom = bottomBtn.y + bottomBtn.height + 30;
      // The dialog is centered, so estimate its width from the form fields
      // From ref: dialog appears about 250px wide in the 640px screenshot,
      // so roughly 500px wide in 1280px viewport
      const dialogCenterX = tBox.x + tBox.width / 2;
      const dialogLeft = dialogCenterX - 250;
      const dialogRight = dialogCenterX + 250;

      dialogBox = {
        x: dialogLeft,
        y: dialogTop,
        width: dialogRight - dialogLeft,
        height: dialogBottom - dialogTop,
      };
      console.log(`  Built dialog bounds from content: ${JSON.stringify(dialogBox)}`);
    }
  }

  if (dialogBox) {
    const pad = 15;
    await snap('how-to-import-audiences', 'import-single-prospect-raw', {
      x: Math.max(0, dialogBox.x - pad),
      y: Math.max(0, dialogBox.y - pad),
      width: Math.min(840, dialogBox.width + pad * 2),
      height: Math.min(500, dialogBox.height + pad * 2),
    });
  } else {
    console.log('  FAILED to find dialog, capturing center of page');
    // From the ref, the dialog appears roughly centered
    await snap('how-to-import-audiences', 'import-single-prospect-raw', {
      x: 250, y: 150, width: 500, height: 400,
    });
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
}


await browser.close();
console.log('\n' + '═'.repeat(60));
console.log('ALL FIX5 COMPLETE');
console.log('═'.repeat(60));
