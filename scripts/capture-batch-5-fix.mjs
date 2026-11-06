import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';

const articles = [
  'setting-up-your-profile',
  'how-to-invite-users',
  'how-to-connect-your-calendar',
  'how-to-import-audiences',
  'how-to-filter-and-sort',
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
  await page.screenshot({ path: `${ROOT}/${article}/raw/_ref_fix_${name}.png`, scale: 'device' });
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
// FIX 1: profile-assignability (needs section header + more context)
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 1: profile-assignability');
console.log('═'.repeat(60));

await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

// Click "Agent Sales Assignability" in the settings sidebar
const agentAssignNav = page.locator('text=Agent Sales Assignability').first();
await agentAssignNav.click();
await page.waitForTimeout(3000);
await prep();
await ref('setting-up-your-profile', 'assignability');

// The content area should now show the assignability section
// We need the section header + description + radio buttons for each portal type
// Capture: settings sidebar (left) + full assignability content
// Use a wide clip starting from left edge to capture nav context too
await snap('setting-up-your-profile', 'profile-assignability-raw', {
  x: 0, y: 0, width: 840, height: 480,
});


// ══════════════════════════════════════════════════════════════
// FIX 2: invite-nav-members (needs full context with Invite button)
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 2: invite-nav-members');
console.log('═'.repeat(60));

// Navigate to Organization > Members in settings
// First click "Members" in the sidebar - we're already on settings page
const membersNav = page.locator('text=Members').first();
const mnVis = await membersNav.isVisible().catch(() => false);
if (mnVis) {
  await membersNav.click();
  await page.waitForTimeout(3000);
  await prep();
} else {
  // Try clicking Team first
  const teamNav = page.locator('text=Team').first();
  await teamNav.click().catch(() => {});
  await page.waitForTimeout(2000);
  await prep();
  // Then Members if it appeared
  const membersNav2 = page.locator('text=Members').first();
  await membersNav2.click().catch(() => {});
  await page.waitForTimeout(2000);
  await prep();
}
await ref('how-to-invite-users', 'members-full');

// Capture full width: settings sidebar + Members page with Team Admins + Invite button
// The ref showed: Team Admins header, member cards, and "Invite Team Member +" button
await snap('how-to-invite-users', 'invite-nav-members-raw', {
  x: 0, y: 0, width: 840, height: 500,
});


// ══════════════════════════════════════════════════════════════
// FIX 3: Calendar images (settings-based approach)
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 3: Calendar images');
console.log('═'.repeat(60));

// Go to settings > Profile Details to capture Connected Calendar
await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

// Click Profile Details
const pdNav = page.locator('text=Profile Details').first();
await pdNav.click().catch(() => {});
await page.waitForTimeout(2000);
await prep();

// Scroll down to find Connected Calendar section
// The content area is the right panel - scroll it
await page.evaluate(() => {
  const scrollable = document.querySelector('main') || document.querySelector('[class*="content"]');
  if (scrollable) scrollable.scrollTop = scrollable.scrollHeight;
  window.scrollTo(0, document.body.scrollHeight);
});
await page.waitForTimeout(1500);
await prep();
await ref('how-to-connect-your-calendar', 'profile-scrolled');

// Find Connected Calendar
const connCal = page.locator('text=Connected Calendar').first();
const ccBox = await bbox(connCal, 'Connected Calendar');

if (ccBox) {
  // Also look for Disconnect button and the email shown
  const disconnectBtn = page.locator('text=Disconnect').first();
  const dcBox = await bbox(disconnectBtn, 'Disconnect button');

  // Capture wider to include the full Disconnect button
  const rightEdge = dcBox ? dcBox.x + dcBox.width + 30 : ccBox.x + 700;
  await snap('how-to-connect-your-calendar', 'connected-calendar-raw', {
    x: Math.max(0, ccBox.x - 40),
    y: Math.max(0, ccBox.y - 25),
    width: Math.min(840, rightEdge - ccBox.x + 60),
    height: 150,
  });
}

// Now capture Scheduling Events
console.log('\n--- Scheduling Events ---');
const seNav = page.locator('a:has-text("Scheduling Events"), [href*="scheduling"]').first();
let seNavBox = await bbox(seNav, 'Scheduling Events nav link');

if (!seNavBox) {
  // Scroll back to top and try clicking from sidebar
  await page.evaluate(() => { window.scrollTo(0, 0); });
  await page.waitForTimeout(500);
  // Find it in the sidebar text
  const seText = page.locator('text=Scheduling Events').first();
  seNavBox = await bbox(seText, 'Scheduling Events text');
  if (seNavBox) {
    await seText.click();
    await page.waitForTimeout(3000);
    await prep();
  }
} else {
  await seNav.click();
  await page.waitForTimeout(3000);
  await prep();
}

await ref('how-to-connect-your-calendar', 'scheduling-page');

// Verify we're actually on scheduling events page, not associated orgs
const pageContent = await page.textContent('main').catch(() => '');
console.log(`  Page contains "Scheduling": ${pageContent.includes('Scheduling')}`);
console.log(`  Page contains "Organisation": ${pageContent.includes('Organisation')}`);
console.log(`  Page contains "Untitled Event": ${pageContent.includes('Untitled Event')}`);

// Capture the scheduling events content
// Look for the content header and event cards
const schedulingHeader = page.locator('h1:has-text("Scheduling"), h2:has-text("Scheduling"), text=Scheduling Events >> nth=1').first();
const shBox = await bbox(schedulingHeader, 'Scheduling header (content)');

if (shBox) {
  await snap('how-to-connect-your-calendar', 'scheduling-events-raw', {
    x: Math.max(0, shBox.x - 30),
    y: Math.max(0, shBox.y - 25),
    width: Math.min(840, 1280 - shBox.x + 50),
    height: 350,
  });
} else {
  // Fallback: capture full content area
  await snap('how-to-connect-your-calendar', 'scheduling-events-raw', {
    x: 0, y: 0, width: 840, height: 480,
  });
}


// ══════════════════════════════════════════════════════════════
// FIX 4: Import menu (expand Import submenu) + single prospect
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 4: Import menu + single prospect');
console.log('═'.repeat(60));

await page.goto(`${STAGING}/marketing`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

// Click Audiences
const audNav = page.locator('text=Audiences').first();
await audNav.click().catch(() => {});
await page.waitForTimeout(3000);
await prep();

// Click Actions button
const actionsBtn = page.locator('button:has-text("Actions")').first();
const abBox = await bbox(actionsBtn, 'Actions button');

if (abBox) {
  await actionsBtn.click();
  await page.waitForTimeout(1500);
  await prep();

  // The ref shows Actions dropdown with "Import >" and "Export"
  // "Import" has a submenu arrow - hover it to expand
  const importMenuItem = page.locator('text=Import').first();
  const imBox = await bbox(importMenuItem, 'Import menu item');

  if (imBox) {
    // Hover Import to expand its submenu
    await importMenuItem.hover();
    await page.waitForTimeout(1500);
    await prep();
    await ref('how-to-import-audiences', 'import-submenu');

    // Now look for the expanded submenu items
    const importSingle = page.locator('text=Import Single Prospect').first();
    const isBox = await bbox(importSingle, 'Import Single Prospect');
    const importCSV = page.locator('text=Import from CSV').first();
    const icBox = await bbox(importCSV, 'Import from CSV');

    // Capture the full Actions + Import submenu
    // Include the Actions button, the first dropdown, and the submenu
    const allMenuItems = [abBox, imBox, isBox, icBox].filter(Boolean);
    const leftEdge = Math.min(...allMenuItems.map(b => b.x));
    const rightEdge = Math.max(...allMenuItems.map(b => b.x + b.width));
    const bottomEdge = Math.max(...allMenuItems.map(b => b.y + b.height));

    await snap('how-to-import-audiences', 'import-menu-raw', {
      x: Math.max(0, leftEdge - 30),
      y: Math.max(0, abBox.y - 20),
      width: Math.min(840, rightEdge - leftEdge + 60),
      height: Math.min(400, bottomEdge - abBox.y + 40),
    });

    // Click Import Single Prospect to open the form
    if (isBox) {
      await importSingle.click();
      await page.waitForTimeout(2500);
      await prep();
      await ref('how-to-import-audiences', 'single-prospect-form');

      // Find the dialog/modal
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
        // Fallback: capture center of screen where dialog would be
        await snap('how-to-import-audiences', 'import-single-prospect-raw', {
          x: 200, y: 100, width: 840, height: 500,
        });
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  }
}


// ══════════════════════════════════════════════════════════════
// FIX 5: Filter panel + Sort panel
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('FIX 5: Filter + Sort panels');
console.log('═'.repeat(60));

await page.goto(`${STAGING}/sales`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

// From the ref screenshots, the filter/sort icons are small buttons in the toolbar
// The ref shows a "Filter" tooltip appearing above the funnel icon
// The toolbar layout: [Search Leads...] [funnel] [sort arrows] [eye] [Views] [bookmark]

// Strategy: find the search input, then find the next icon buttons by position
const searchInput = page.locator('input[placeholder*="Search"]').first();
const siBox = await bbox(searchInput, 'Search input');

if (siBox) {
  // From the ref screenshot, the toolbar icons are right after the search bar
  // Let's enumerate all elements in the toolbar row to find the exact positions
  const toolbarY = siBox.y;
  const toolbarH = siBox.height;

  // Find all clickable elements in the toolbar row (between y of search and y+height)
  const buttons = await page.locator('button, [role="button"]').all();
  const toolbarBtns = [];
  for (const btn of buttons) {
    const b = await btn.boundingBox();
    if (b && Math.abs(b.y + b.height/2 - (toolbarY + toolbarH/2)) < 15 && b.x > siBox.x + siBox.width - 10) {
      const text = await btn.textContent().catch(() => '');
      const ariaLabel = await btn.getAttribute('aria-label').catch(() => '');
      toolbarBtns.push({ el: btn, box: b, text: text?.trim(), ariaLabel });
      console.log(`  Toolbar btn: x=${b.x.toFixed(0)} w=${b.width.toFixed(0)} text="${text?.trim()}" aria="${ariaLabel}"`);
    }
  }

  // Sort by x position
  toolbarBtns.sort((a, b) => a.box.x - b.box.x);
  console.log(`  Found ${toolbarBtns.length} toolbar buttons after search`);

  // The order should be: filter (funnel), sort (arrows), visibility (eye), Views, bookmark
  // Filter is first small icon, Sort is second small icon
  const filterButton = toolbarBtns[0];
  const sortButton = toolbarBtns[1];

  // --- Filter Panel ---
  if (filterButton) {
    console.log(`\n--- 5b. filter-panel (clicking btn at x=${filterButton.box.x.toFixed(0)}) ---`);
    await filterButton.el.click();
    await page.waitForTimeout(2000);
    await prep();
    await ref('how-to-filter-and-sort', 'filter-open');

    // The filter dropdown from the ref shows a vertical list of field names
    // Try multiple selectors for the dropdown
    let filterDD = page.locator('[data-radix-popper-content-wrapper]').first();
    let fdBox = await bbox(filterDD, 'Filter DD (radix)', 2000);

    if (!fdBox) {
      filterDD = page.locator('[role="menu"]').first();
      fdBox = await bbox(filterDD, 'Filter DD (menu)', 2000);
    }
    if (!fdBox) {
      filterDD = page.locator('[role="listbox"]').first();
      fdBox = await bbox(filterDD, 'Filter DD (listbox)', 2000);
    }
    if (!fdBox) {
      // Look for the dropdown by finding text that should be in it
      const statusText = page.locator('text=Status').first();
      const stBox = await bbox(statusText, 'Status in dropdown', 2000);
      if (stBox) {
        // The dropdown is around where Status is
        fdBox = { x: stBox.x - 20, y: stBox.y - 80, width: 200, height: 300 };
        console.log(`  Inferred filter DD from Status text position`);
      }
    }

    if (fdBox) {
      const fb = filterButton.box;
      const leftEdge = Math.min(fb.x, fdBox.x);
      const rightEdge = Math.max(fb.x + fb.width, fdBox.x + fdBox.width);
      const bottomEdge = fdBox.y + fdBox.height;

      await snap('how-to-filter-and-sort', 'filter-panel-raw', {
        x: Math.max(0, leftEdge - 25),
        y: Math.max(0, fb.y - 20),
        width: Math.min(840, rightEdge - leftEdge + 50),
        height: Math.min(500, bottomEdge - fb.y + 40),
      });
    } else {
      console.log('  FAILED: Could not find filter dropdown');
      // Capture the toolbar area as fallback - the dropdown might be there
      await snap('how-to-filter-and-sort', 'filter-panel-raw', {
        x: Math.max(0, filterButton.box.x - 30),
        y: Math.max(0, siBox.y - 10),
        width: 400,
        height: 400,
      });
    }

    // Close filter
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  }

  // --- Sort Panel ---
  if (sortButton) {
    console.log(`\n--- 5c. sort-panel (clicking btn at x=${sortButton.box.x.toFixed(0)}) ---`);
    await sortButton.el.click();
    await page.waitForTimeout(2000);
    await prep();
    await ref('how-to-filter-and-sort', 'sort-open');

    // The sort panel from ref shows: [Created At v] [Descending v] [x] / [+ Add Sorting] [Apply Sorting]
    let sortDD = page.locator('[data-radix-popper-content-wrapper]').first();
    let sdBox = await bbox(sortDD, 'Sort DD (radix)', 2000);

    if (!sdBox) {
      sortDD = page.locator('[role="menu"]').first();
      sdBox = await bbox(sortDD, 'Sort DD (menu)', 2000);
    }
    if (!sdBox) {
      // Look for Apply Sorting button which should be in the sort panel
      const applySort = page.locator('text=Apply Sorting').first();
      const asBox = await bbox(applySort, 'Apply Sorting', 2000);
      if (asBox) {
        // Build approximate box from the Apply Sorting button
        sdBox = { x: asBox.x - 150, y: asBox.y - 60, width: asBox.x + asBox.width - (asBox.x - 150) + 20, height: 100 };
        console.log(`  Inferred sort DD from Apply Sorting position`);
      }
    }

    if (sdBox) {
      const sb = sortButton.box;
      const leftEdge = Math.min(sb.x, sdBox.x);
      const rightEdge = Math.max(sb.x + sb.width, sdBox.x + sdBox.width);
      const bottomEdge = sdBox.y + sdBox.height;

      await snap('how-to-filter-and-sort', 'sort-panel-raw', {
        x: Math.max(0, leftEdge - 25),
        y: Math.max(0, sb.y - 20),
        width: Math.min(840, rightEdge - leftEdge + 50),
        height: Math.min(500, bottomEdge - sb.y + 40),
      });
    } else {
      console.log('  FAILED: Could not find sort panel');
      await snap('how-to-filter-and-sort', 'sort-panel-raw', {
        x: Math.max(0, sortButton.box.x - 30),
        y: Math.max(0, siBox.y - 10),
        width: 500,
        height: 250,
      });
    }
  }
}


await browser.close();
console.log('\n' + '═'.repeat(60));
console.log('ALL FIXES COMPLETE');
console.log('═'.repeat(60));
