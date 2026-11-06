import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';

for (const a of ['setting-up-your-profile', 'how-to-invite-users', 'how-to-connect-your-calendar', 'how-to-import-audiences'])
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
  await page.screenshot({ path: `${ROOT}/${article}/raw/_ref_fix3_${name}.png`, scale: 'device' });
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
// FIX 1: profile-assignability - clip starts after sidebar
// ══════════════════════════════════════════════════════════════
// "Not Assignable" ends at x=1093+~107=1200. Start at x=360 → 360+840=1200. Perfect.
console.log('\n' + '═'.repeat(60));
console.log('FIX 1: profile-assignability (skip sidebar)');
console.log('═'.repeat(60));

await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

await page.locator('text=Agent Sales Assignability').first().click();
await page.waitForTimeout(3000);
await prep();

// Content area starts after sidebar (~460px). Radio buttons end at ~1200px.
// Capture just the content: header + 3 brand rows with all radio buttons visible
await snap('setting-up-your-profile', 'profile-assignability-raw', {
  x: 440, y: 85, width: 840, height: 300,
});


// ══════════════════════════════════════════════════════════════
// FIX 2: invite-nav-members - Organization > Members (not Brand > Team)
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 2: invite-nav-members (Org > Members)');
console.log('═'.repeat(60));

// From the ref, the sidebar shows Organization section with Details, Brands, Members
// Need to find "Members" that is specifically under Organization
// First, scroll sidebar to make Organization > Members visible
// The sidebar items under Organization are: Details, Brands, Members
// Let's use the URL approach: /settings/organization/members or similar

// Try navigating to the Organization Details first
const orgDetails = page.locator('text=Organization').first();
await orgDetails.click();
await page.waitForTimeout(2000);
await prep();

// Now look for Members in the sidebar - it should be under Organization
// List all "Members" elements on the page to find the right one
const allMembers = await page.locator('text=Members').all();
console.log(`  Found ${allMembers.length} "Members" texts`);
for (let i = 0; i < allMembers.length; i++) {
  const b = await allMembers[i].boundingBox();
  const tag = await allMembers[i].evaluate(el => el.tagName);
  const parent = await allMembers[i].evaluate(el => el.parentElement?.textContent?.trim()?.substring(0, 50));
  if (b) console.log(`  Members[${i}]: x=${b.x.toFixed(0)} y=${b.y.toFixed(0)} tag=${tag} parent="${parent}"`);
}

// The sidebar nav items are typically at x < 200. Find the "Members" in the sidebar
// that is vertically near Organization (which should be above it)
let membersClicked = false;
for (let i = 0; i < allMembers.length; i++) {
  const b = await allMembers[i].boundingBox();
  if (b && b.x < 250 && b.x > 20) {
    console.log(`  Clicking Members[${i}] at x=${b.x.toFixed(0)} y=${b.y.toFixed(0)}`);
    await allMembers[i].click();
    membersClicked = true;
    break;
  }
}

if (!membersClicked) {
  console.log('  No sidebar Members found, trying direct nav');
  // Try URL-based navigation
  const currentUrl = page.url();
  console.log(`  Current URL: ${currentUrl}`);
  // Try clicking the Organization section to expand, then Members
  const orgSection = page.locator('text=Organization').first();
  await orgSection.click();
  await page.waitForTimeout(1000);
  const membersAgain = page.locator('text=Members').first();
  await membersAgain.click().catch(() => console.log('  Members click failed'));
}

await page.waitForTimeout(3000);
await prep();
await ref('how-to-invite-users', 'members-page');

// Verify we're on the right page
const teamAdmins = page.locator('text=Team Admins').first();
const taBox = await bbox(teamAdmins, 'Team Admins');
const inviteBtn = page.locator('text=Invite Team Member').first();
const ibBox = await bbox(inviteBtn, 'Invite Team Member');

if (taBox) {
  // Great! Capture with nav context
  await snap('how-to-invite-users', 'invite-nav-members-raw', {
    x: 0,
    y: Math.max(0, taBox.y - 80),
    width: 840,
    height: 400,
  });
} else {
  // Fallback - capture whatever page we're on
  console.log('  WARN: Not on Team Admins page');
  await snap('how-to-invite-users', 'invite-nav-members-raw', {
    x: 0, y: 0, width: 840, height: 500,
  });
}


// ══════════════════════════════════════════════════════════════
// FIX 3: connected-calendar - skip sidebar, capture content only
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 3: connected-calendar (content only)');
console.log('═'.repeat(60));

await page.locator('text=Profile Details').first().click();
await page.waitForTimeout(2000);
await prep();

// Scroll to bottom to find Connected Calendar
await page.evaluate(() => {
  const el = document.querySelector('main') || document.documentElement;
  el.scrollTop = el.scrollHeight;
  window.scrollTo(0, document.body.scrollHeight);
});
await page.waitForTimeout(1500);
await prep();

const ccText = page.locator('text=Connected Calendar').first();
const ccBox = await bbox(ccText, 'Connected Calendar');
const dcBtn = page.locator('button:has-text("Disconnect")').first();
const dcBox = await bbox(dcBtn, 'Disconnect btn');

if (ccBox && dcBox) {
  // Skip sidebar, start from content area
  // ccBox.x ≈ 317, dcBox ends at ≈1207
  // Start at ccBox.x - 15 to get card border, width to cover Disconnect
  const startX = ccBox.x - 15;
  const endX = dcBox.x + dcBox.width + 15;
  await snap('how-to-connect-your-calendar', 'connected-calendar-raw', {
    x: startX,
    y: Math.max(0, ccBox.y - 15),
    width: endX - startX,
    height: Math.max(120, dcBox.y + dcBox.height - ccBox.y + 40),
  });
}


// ══════════════════════════════════════════════════════════════
// FIX 4: Import submenu - scope locator to dropdown near Actions btn
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 4: Import submenu (scoped locator)');
console.log('═'.repeat(60));

await page.goto(`${STAGING}/marketing`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

await page.locator('text=Audiences').first().click().catch(() => {});
await page.waitForTimeout(3000);
await prep();

const actionsBtn = page.locator('button:has-text("Actions")').first();
const abBox = await bbox(actionsBtn, 'Actions button');

if (abBox) {
  await actionsBtn.click();
  await page.waitForTimeout(1500);
  await prep();

  // The dropdown appears near the Actions button (x≈1153, y≈200+)
  // Find all "Import" texts and pick the one closest to the Actions button
  const allImports = await page.locator('text=Import').all();
  console.log(`  Found ${allImports.length} "Import" texts`);

  let dropdownImport = null;
  let dropdownImportBox = null;
  for (let i = 0; i < allImports.length; i++) {
    const b = await allImports[i].boundingBox();
    if (b) {
      const dist = Math.abs(b.x - abBox.x) + Math.abs(b.y - abBox.y);
      console.log(`  Import[${i}]: x=${b.x.toFixed(0)} y=${b.y.toFixed(0)} dist=${dist.toFixed(0)}`);
      if (!dropdownImportBox || dist < (Math.abs(dropdownImportBox.x - abBox.x) + Math.abs(dropdownImportBox.y - abBox.y))) {
        dropdownImport = allImports[i];
        dropdownImportBox = b;
      }
    }
  }

  if (dropdownImport && dropdownImportBox) {
    console.log(`  Using Import at x=${dropdownImportBox.x.toFixed(0)} y=${dropdownImportBox.y.toFixed(0)}`);

    // Hover to expand submenu
    await dropdownImport.hover();
    await page.waitForTimeout(1200);

    // Move mouse right into the submenu area
    await page.mouse.move(
      dropdownImportBox.x + dropdownImportBox.width + 30,
      dropdownImportBox.y + dropdownImportBox.height / 2,
      { steps: 3 }
    );
    await page.waitForTimeout(1500);
    await prep();
    await ref('how-to-import-audiences', 'submenu-expanded');

    // Now look for submenu items
    const importSingle = page.locator('text=Import Single Prospect').first();
    const isBox = await bbox(importSingle, 'Import Single Prospect');
    const importCSV = page.locator('text=Import from CSV').first();
    const icBox = await bbox(importCSV, 'Import from CSV');

    if (isBox || icBox) {
      console.log('  Submenu successfully expanded!');

      // Capture: Actions button + dropdown + submenu
      const allBoxes = [abBox, dropdownImportBox, isBox, icBox].filter(Boolean);
      const leftEdge = Math.min(...allBoxes.map(b => b.x));
      const rightEdge = Math.max(...allBoxes.map(b => b.x + b.width));
      const topEdge = Math.min(abBox.y, ...allBoxes.map(b => b.y));
      const bottomEdge = Math.max(...allBoxes.map(b => b.y + b.height));

      await snap('how-to-import-audiences', 'import-menu-raw', {
        x: Math.max(0, leftEdge - 25),
        y: Math.max(0, topEdge - 15),
        width: Math.min(840, rightEdge - leftEdge + 50),
        height: Math.min(400, bottomEdge - topEdge + 30),
      });

      // Click Import Single Prospect
      if (isBox) {
        await importSingle.click();
        await page.waitForTimeout(2500);
        await prep();
        await ref('how-to-import-audiences', 'single-prospect-dialog');

        // Try to find dialog
        const dialog = page.locator('[role="dialog"], [class*="modal"], [class*="Dialog"], [class*="drawer"]').first();
        const dBox = await bbox(dialog, 'Import dialog');

        if (dBox) {
          const pad = 25;
          await snap('how-to-import-audiences', 'import-single-prospect-raw', {
            x: Math.max(0, dBox.x - pad),
            y: Math.max(0, dBox.y - pad),
            width: Math.min(840, dBox.width + pad * 2),
            height: Math.min(500, dBox.height + pad * 2),
          });
        } else {
          // Capture center area
          console.log('  No dialog found, capturing center');
          await snap('how-to-import-audiences', 'import-single-prospect-raw', {
            x: 200, y: 80, width: 840, height: 500,
          });
        }

        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('  Submenu did NOT expand');
      // The ref showed Import > with arrow. Maybe it's a nested dropdown that needs a click
      await dropdownImport.click();
      await page.waitForTimeout(2000);
      await prep();
      await ref('how-to-import-audiences', 'import-clicked-v2');

      // Check what happened
      const isBox2 = await bbox(page.locator('text=Import Single Prospect').first(), 'Import Single (after click)');
      if (isBox2) {
        console.log('  Got submenu after click!');
        const icBox2 = await bbox(page.locator('text=Import from CSV').first(), 'Import CSV (after click)');

        const allBoxes = [abBox, isBox2, icBox2].filter(Boolean);
        const leftEdge = Math.min(...allBoxes.map(b => b.x));
        const rightEdge = Math.max(...allBoxes.map(b => b.x + b.width));
        const bottomEdge = Math.max(...allBoxes.map(b => b.y + b.height));

        await snap('how-to-import-audiences', 'import-menu-raw', {
          x: Math.max(0, leftEdge - 25),
          y: Math.max(0, abBox.y - 15),
          width: Math.min(840, rightEdge - leftEdge + 50),
          height: Math.min(400, bottomEdge - abBox.y + 30),
        });
      }
    }
  }
}


await browser.close();
console.log('\n' + '═'.repeat(60));
console.log('ALL FIX3 COMPLETE');
console.log('═'.repeat(60));
