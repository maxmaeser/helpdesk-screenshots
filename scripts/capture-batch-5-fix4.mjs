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
  await page.screenshot({ path: `${ROOT}/${article}/raw/_ref_fix4_${name}.png`, scale: 'device' });
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
// FIX 1: profile-assignability - sidebar version with full brand names
// The best balance: sidebar + brand logos/names + radio buttons
// "Not Assignable" will show as "Not A..." but that's readable in context
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 1: profile-assignability (sidebar version, 3 brands)');
console.log('═'.repeat(60));

await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

await page.locator('text=Agent Sales Assignability').first().click();
await page.waitForTimeout(3000);
await prep();

// Capture with sidebar (x=0) + header + 3 brand rows
// Content spans from ~300 (brand names) to ~1200 (Not Assignable end)
// With sidebar at x=0, width=840 → reaches x=840
// Radio buttons start at x≈887, so "Automatic" fits, "Manual" at x≈1000 fits partially,
// "Not Assignable" at x≈1093 is clipped to "Not A..."
// This is the BEST balance: brand context + sidebar nav + partial radio labels
const ahBox = await bbox(page.locator('text=Assignable To Applicant Portal Leads').first(), 'Header');
if (ahBox) {
  await snap('setting-up-your-profile', 'profile-assignability-raw', {
    x: 0,
    y: Math.max(0, ahBox.y - 30),
    width: 840,
    height: 320,
  });
}


// ══════════════════════════════════════════════════════════════
// FIX 2: invite-nav-members - need "Invite Team Member +" visible
// Capture content area only (skip sidebar) to fit the button
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 2: invite-nav-members (with Invite button)');
console.log('═'.repeat(60));

// Navigate to Organization > Members
const orgSection = page.locator('text=Organization').first();
await orgSection.click();
await page.waitForTimeout(1500);

const membersNav = page.locator('a:has-text("Members")').first();
await membersNav.click();
await page.waitForTimeout(3000);
await prep();
await ref('how-to-invite-users', 'members-page');

const taBox = await bbox(page.locator('text=Team Admins').first(), 'Team Admins');
const ibBox = await bbox(page.locator('text=Invite Team Member').first(), 'Invite btn');

if (taBox && ibBox) {
  // Include partial sidebar for nav context + full content with Invite button
  // taBox.x ≈ 317, ibBox ends at ≈1046+173=1219
  // For 840px width: start at x = 1219 - 840 = 379 (content only)
  // But we want SOME sidebar context. Start at x=200 → reaches 1040. Button at 1046 barely fits.
  // Start at x=150 → reaches 990. Button at 1046 does NOT fit.
  // Compromise: start at 0 with sidebar, button will be off-screen right,
  // BUT capture a second image for just the top bar with the button

  // Image A: nav context + member cards (sidebar + Team Admins + members)
  await snap('how-to-invite-users', 'invite-nav-members-raw', {
    x: 0,
    y: Math.max(0, taBox.y - 80),
    width: 840,
    height: 400,
  });

  // Image B: Team Admins header + Invite button (content area, shows the button)
  await snap('how-to-invite-users', 'invite-button-raw', {
    x: Math.max(0, taBox.x - 20),
    y: Math.max(0, taBox.y - 20),
    width: Math.min(840, ibBox.x + ibBox.width - taBox.x + 60),
    height: 60,
  });
}


// ══════════════════════════════════════════════════════════════
// FIX 3: import-single-prospect dialog
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

// Open Actions > Import > Import Single Prospect
const actionsBtn = page.locator('button:has-text("Actions")').first();
const abBox = await bbox(actionsBtn, 'Actions button');

if (abBox) {
  await actionsBtn.click();
  await page.waitForTimeout(1500);

  // Find the Import item closest to Actions button
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

  if (dropdownImport) {
    // Click Import to expand submenu
    await dropdownImport.click();
    await page.waitForTimeout(2000);
    await prep();

    const importSingle = page.locator('text=Import Single Prospect').first();
    const isBox = await bbox(importSingle, 'Import Single Prospect');

    if (isBox) {
      await importSingle.click();
      await page.waitForTimeout(3000);
      await prep();
      await ref('how-to-import-audiences', 'single-prospect-dialog');

      // Look for dialog/modal/drawer
      const dialog = page.locator('[role="dialog"], [class*="modal"], [class*="Dialog"], [class*="drawer"], [class*="Drawer"]').first();
      const dBox = await bbox(dialog, 'Import dialog');

      if (dBox) {
        const pad = 25;
        await snap('how-to-import-audiences', 'import-single-prospect-raw', {
          x: Math.max(0, dBox.x - pad),
          y: Math.max(0, dBox.y - pad),
          width: Math.min(840, dBox.width + pad * 2),
          height: Math.min(600, dBox.height + pad * 2),
        });
      } else {
        // Check if it opened as a slide-out panel or inline form
        console.log('  No dialog element found, looking for form content');

        // Look for typical import form fields
        const firstNameField = page.locator('label:has-text("First Name"), text=First Name').first();
        const fnBox = await bbox(firstNameField, 'First Name in form');
        const emailField = page.locator('label:has-text("Email"), text=Email Address').first();
        const efBox = await bbox(emailField, 'Email in form');

        // Also check for a panel/sheet that slid in from the right
        const panel = page.locator('[class*="panel"], [class*="sheet"], [class*="sidebar"]:visible').last();
        const pBox = await bbox(panel, 'Panel');

        if (pBox) {
          const pad = 20;
          await snap('how-to-import-audiences', 'import-single-prospect-raw', {
            x: Math.max(0, pBox.x - pad),
            y: Math.max(0, pBox.y - pad),
            width: Math.min(840, pBox.width + pad * 2),
            height: Math.min(600, pBox.height + pad * 2),
          });
        } else if (fnBox || efBox) {
          const topField = fnBox || efBox;
          await snap('how-to-import-audiences', 'import-single-prospect-raw', {
            x: Math.max(0, topField.x - 40),
            y: Math.max(0, topField.y - 60),
            width: 840,
            height: 500,
          });
        } else {
          // Last resort: take a full-page reference
          console.log('  Could not find import form, taking full page ref');
          await ref('how-to-import-audiences', 'import-form-missing');
          // Capture center of page
          await snap('how-to-import-audiences', 'import-single-prospect-raw', {
            x: 200, y: 80, width: 840, height: 600,
          });
        }
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    } else {
      console.log('  WARN: Import Single Prospect not found after click');
    }
  }
}


await browser.close();
console.log('\n' + '═'.repeat(60));
console.log('ALL FIX4 COMPLETE');
console.log('═'.repeat(60));
