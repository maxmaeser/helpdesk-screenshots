import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';

const articles = [
  'setting-up-your-profile',
  'how-to-invite-users',
  'how-to-connect-your-calendar',
  'how-to-import-audiences',
];
for (const a of articles) mkdirSync(`${ROOT}/${a}/raw`, { recursive: true });

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
  await page.screenshot({ path: `${ROOT}/${article}/raw/_ref_fix2_${name}.png`, scale: 'device' });
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
// FIX 1: profile-assignability - need the radio buttons visible
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 1: profile-assignability (need radio buttons)');
console.log('═'.repeat(60));

await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

// Click Agent Sales Assignability
const asaNav = page.locator('text=Agent Sales Assignability').first();
await asaNav.click();
await page.waitForTimeout(3000);
await prep();

// The content area shows brand cards with radio buttons to the right
// The issue is the content area starts at ~470px and extends to 1280px
// We need to capture just the content area (no sidebar) to fit the radio buttons
// Find the "Assignable To Applicant Portal Leads" header
const assignHeader = page.locator('text=Assignable To Applicant Portal Leads').first();
const ahBox = await bbox(assignHeader, 'Assignable header');

// Find first brand and its radio buttons
const stagingBrand = page.locator('text=Staging Test Brand').first();
const sbBox = await bbox(stagingBrand, 'Staging Test Brand');

// Find the radio buttons - they should be labeled Automatic, Manual, Not Assignable
// Look for the first "Automatic" text in the content area
const autoRadios = await page.locator('text=Automatic').all();
console.log(`  Found ${autoRadios.length} "Automatic" texts`);
for (let i = 0; i < autoRadios.length; i++) {
  const b = await autoRadios[i].boundingBox();
  if (b) console.log(`  Automatic[${i}]: x=${b.x.toFixed(0)} y=${b.y.toFixed(0)}`);
}

const notAssignRadios = await page.locator('text=Not Assignable').all();
console.log(`  Found ${notAssignRadios.length} "Not Assignable" texts`);
for (let i = 0; i < notAssignRadios.length; i++) {
  const b = await notAssignRadios[i].boundingBox();
  if (b) console.log(`  NotAssignable[${i}]: x=${b.x.toFixed(0)} y=${b.y.toFixed(0)}`);
}

await ref('setting-up-your-profile', 'assignability-content');

if (ahBox) {
  // Capture the full assignability content - header + 2-3 brands with radio buttons
  // Start from the header, extend right to include radio buttons
  // The radio buttons appear to the right of the brand cards
  // Need enough width to include everything
  const clipX = Math.max(0, ahBox.x - 20);
  await snap('setting-up-your-profile', 'profile-assignability-raw', {
    x: clipX,
    y: Math.max(0, ahBox.y - 20),
    width: Math.min(840, 1280 - clipX),
    height: 400,
  });
}


// ══════════════════════════════════════════════════════════════
// FIX 2: invite-nav-members - click "Team" not "Members"
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 2: invite-nav-members (Team page)');
console.log('═'.repeat(60));

// We're still on settings page from fix 1
// Look for Organization section in sidebar, then Team
const orgSection = page.locator('text=Organization').first();
const orgBox = await bbox(orgSection, 'Organization nav');

if (orgBox) {
  await orgSection.click();
  await page.waitForTimeout(2000);
  await prep();
}

// Now click "Team" under Organization
const teamNav = page.locator('text=Team').first();
const tnBox = await bbox(teamNav, 'Team nav');

if (tnBox) {
  await teamNav.click();
  await page.waitForTimeout(3000);
  await prep();
  await ref('how-to-invite-users', 'team-page');

  // Verify we see "Team Admins"
  const teamAdmins = page.locator('text=Team Admins').first();
  const taBox = await bbox(teamAdmins, 'Team Admins');

  // Look for "Invite Team Member" button
  const inviteBtn = page.locator('text=Invite Team Member').first();
  const ibBox = await bbox(inviteBtn, 'Invite Team Member');

  // Capture: settings sidebar + Team page content
  // Need to show: Team nav highlighted, Team Admins section, member cards, Invite button
  if (taBox) {
    // Capture from top to include some nav context
    await snap('how-to-invite-users', 'invite-nav-members-raw', {
      x: 0,
      y: Math.max(0, taBox.y - 80),
      width: 840,
      height: 450,
    });
  } else {
    // Fallback
    await snap('how-to-invite-users', 'invite-nav-members-raw', {
      x: 0, y: 0, width: 840, height: 500,
    });
  }
}


// ══════════════════════════════════════════════════════════════
// FIX 3: connected-calendar - wider to include full Disconnect button
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 3: connected-calendar (wider)');
console.log('═'.repeat(60));

// Navigate to Profile Details
const pdNav = page.locator('text=Profile Details').first();
await pdNav.click();
await page.waitForTimeout(2000);
await prep();

// Scroll down to Connected Calendar
await page.evaluate(() => {
  const main = document.querySelector('main') || document.documentElement;
  main.scrollTop = main.scrollHeight;
  window.scrollTo(0, document.body.scrollHeight);
});
await page.waitForTimeout(1500);
await prep();

const connCal = page.locator('text=Connected Calendar').first();
const ccBox = await bbox(connCal, 'Connected Calendar');
const disconnBtn = page.locator('button:has-text("Disconnect")').first();
const dcBox = await bbox(disconnBtn, 'Disconnect btn');

if (ccBox && dcBox) {
  // Include from Connected Calendar header to below the Disconnect button
  // Make sure Disconnect is not truncated
  const rightEdge = dcBox.x + dcBox.width + 30;
  const leftEdge = Math.max(0, ccBox.x - 30);
  await snap('how-to-connect-your-calendar', 'connected-calendar-raw', {
    x: leftEdge,
    y: Math.max(0, ccBox.y - 20),
    width: Math.min(840, rightEdge - leftEdge),
    height: Math.max(130, dcBox.y + dcBox.height - ccBox.y + 50),
  });
} else if (ccBox) {
  // Fallback: just capture wider from the header
  await snap('how-to-connect-your-calendar', 'connected-calendar-raw', {
    x: Math.max(0, ccBox.x - 30),
    y: Math.max(0, ccBox.y - 20),
    width: 840,
    height: 150,
  });
}


// ══════════════════════════════════════════════════════════════
// FIX 4: Import submenu + single prospect dialog
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 4: Import submenu expansion');
console.log('═'.repeat(60));

await page.goto(`${STAGING}/marketing`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

const audNav = page.locator('text=Audiences').first();
await audNav.click().catch(() => {});
await page.waitForTimeout(3000);
await prep();

// Click Actions
const actionsBtn = page.locator('button:has-text("Actions")').first();
const abBox = await bbox(actionsBtn, 'Actions button');

if (abBox) {
  await actionsBtn.click();
  await page.waitForTimeout(1500);
  await prep();

  // Find the "Import" item with the > arrow
  const importItem = page.locator('text=Import').first();
  const iiBox = await bbox(importItem, 'Import item');

  if (iiBox) {
    // Hover to open the submenu
    await importItem.hover();
    await page.waitForTimeout(1000);
    await prep();

    // Now move mouse slowly to the right to enter the submenu
    // The submenu appears to the left or right of the Import item
    await page.mouse.move(iiBox.x + iiBox.width + 20, iiBox.y + iiBox.height / 2, { steps: 5 });
    await page.waitForTimeout(1500);
    await prep();
    await ref('how-to-import-audiences', 'import-submenu-hover');

    // Check for submenu items
    const importSingle = page.locator('text=Import Single Prospect').first();
    const isBox = await bbox(importSingle, 'Import Single Prospect');
    const importCSV = page.locator('text=Import from CSV').first();
    const icBox = await bbox(importCSV, 'Import from CSV');

    if (!isBox && !icBox) {
      // Submenu might not have appeared - try clicking Import instead
      console.log('  Submenu not visible, trying click on Import');
      await importItem.click();
      await page.waitForTimeout(2000);
      await prep();
      await ref('how-to-import-audiences', 'import-clicked');

      // Check if a new page/dialog appeared
      const isBox2 = await bbox(importSingle, 'Import Single Prospect (after click)');
      const icBox2 = await bbox(importCSV, 'Import from CSV (after click)');

      if (isBox2 || icBox2) {
        console.log('  Submenu appeared after click!');
      }
    }

    // Re-check for submenu items
    const isFinal = await bbox(page.locator('text=Import Single Prospect').first(), 'Import Single (final)');
    const icFinal = await bbox(page.locator('text=Import from CSV').first(), 'Import CSV (final)');

    if (isFinal || icFinal) {
      // Great! Capture the full menu chain: Actions button + dropdown + submenu
      const allBoxes = [abBox, iiBox, isFinal, icFinal].filter(Boolean);
      const leftEdge = Math.min(...allBoxes.map(b => b.x));
      const rightEdge = Math.max(...allBoxes.map(b => b.x + b.width));
      const topEdge = Math.min(...allBoxes.map(b => b.y));
      const bottomEdge = Math.max(...allBoxes.map(b => b.y + b.height));

      await snap('how-to-import-audiences', 'import-menu-raw', {
        x: Math.max(0, leftEdge - 30),
        y: Math.max(0, topEdge - 30),
        width: Math.min(840, rightEdge - leftEdge + 60),
        height: Math.min(400, bottomEdge - topEdge + 60),
      });

      // Click Import Single Prospect
      if (isFinal) {
        const importSingleBtn = page.locator('text=Import Single Prospect').first();
        await importSingleBtn.click();
        await page.waitForTimeout(2500);
        await prep();
        await ref('how-to-import-audiences', 'single-prospect-dialog');

        // Look for dialog/drawer/modal
        const dialog = page.locator('[role="dialog"], [class*="modal"], [class*="Dialog"], [class*="drawer"], [class*="panel"]').first();
        const dBox = await bbox(dialog, 'Import dialog');

        if (!dBox) {
          // Maybe it's a side panel or form that appeared in the main content area
          console.log('  No dialog found, checking for inline form');
          await ref('how-to-import-audiences', 'no-dialog-found');

          // Look for form fields that would be in the import form
          const emailField = page.locator('text=Email, label:has-text("Email")').first();
          const efBox = await bbox(emailField, 'Email field');
          const firstNameField = page.locator('text=First Name, label:has-text("First Name")').first();
          const fnBox = await bbox(firstNameField, 'First Name field');

          if (efBox || fnBox) {
            const formTop = Math.min(efBox?.y ?? 9999, fnBox?.y ?? 9999);
            await snap('how-to-import-audiences', 'import-single-prospect-raw', {
              x: Math.max(0, (efBox?.x ?? fnBox?.x ?? 300) - 40),
              y: Math.max(0, formTop - 60),
              width: 840,
              height: 500,
            });
          } else {
            // Last resort: capture center of page
            await snap('how-to-import-audiences', 'import-single-prospect-raw', {
              x: 200, y: 100, width: 840, height: 500,
            });
          }
        } else {
          const pad = 25;
          await snap('how-to-import-audiences', 'import-single-prospect-raw', {
            x: Math.max(0, dBox.x - pad),
            y: Math.max(0, dBox.y - pad),
            width: Math.min(840, dBox.width + pad * 2),
            height: Math.min(500, dBox.height + pad * 2),
          });
        }

        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('  FAILED: Could not expand Import submenu');
      // Capture what we have - the Actions > Import/Export dropdown is still useful
      const exportItem = page.locator('text=Export').first();
      const exBox = await bbox(exportItem, 'Export item');
      const allBoxes = [abBox, iiBox, exBox].filter(Boolean);
      const leftEdge = Math.min(...allBoxes.map(b => b.x));
      const rightEdge = Math.max(...allBoxes.map(b => b.x + b.width));
      const bottomEdge = Math.max(...allBoxes.map(b => b.y + b.height));

      await snap('how-to-import-audiences', 'import-menu-raw', {
        x: Math.max(0, leftEdge - 30),
        y: Math.max(0, abBox.y - 20),
        width: Math.min(840, rightEdge - leftEdge + 60),
        height: Math.min(400, bottomEdge - abBox.y + 40),
      });
    }
  }
}


await browser.close();
console.log('\n' + '═'.repeat(60));
console.log('ALL FIX2 COMPLETE');
console.log('═'.repeat(60));
