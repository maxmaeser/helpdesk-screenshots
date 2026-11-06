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
  await page.screenshot({ path: `${ROOT}/${article}/raw/_ref_${name}.png`, scale: 'device' });
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
// ARTICLE 1: Setting Up Your Profile
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('ARTICLE 1: Setting Up Your Profile');
console.log('═'.repeat(60));

// Navigate to settings via URL (it redirected to /settings/account last time)
await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

// Click "Profile Details" in the settings sidebar
const profileDetailsNav = page.locator('text=Profile Details').first();
await profileDetailsNav.click().catch(() => console.log('  Already on Profile Details'));
await page.waitForTimeout(2000);
await prep();
await ref('setting-up-your-profile', 'profile-page');

// Image 1: profile-nav-settings
// Settings sidebar on left + "Details" section header + avatar/upload area + form fields start
console.log('\n--- 1a. profile-nav-settings ---');
// The settings sidebar is ~120px wide, content starts around x=120
// Capture from top-left: settings nav + profile header + first couple of fields
const detailsHeader = page.locator('text=Details').first();
const dhBox = await bbox(detailsHeader, 'Details header');
// Capture wide enough to show both settings nav + content
await snap('setting-up-your-profile', 'profile-nav-settings-raw', {
  x: 0, y: 0, width: 640, height: 450
});

// Image 2: profile-details - form fields (First Name, Last Name, Email, Phone, LinkedIn, Job Title)
console.log('\n--- 1b. profile-details ---');
const firstNameInput = page.locator('text=First Name').first();
const fnBox = await bbox(firstNameInput, 'First Name label');
if (fnBox) {
  // Capture the form fields area - from First Name to below Job Title
  const clipX = Math.max(0, fnBox.x - 20);
  const clipY = Math.max(0, fnBox.y - 20);
  // Extend right to capture both columns
  await snap('setting-up-your-profile', 'profile-details-raw', {
    x: clipX, y: clipY,
    width: Math.min(840, 1280 - clipX - 20),
    height: 300,
  });
}

// Image 3: profile-assignability - scroll to "Agent Sales Assignability" section
console.log('\n--- 1c. profile-assignability ---');
const agentAssignNav = page.locator('text=Agent Sales Assignability').first();
const aanBox = await bbox(agentAssignNav, 'Agent Sales Assignability nav');

if (aanBox) {
  // Click it to navigate to that section
  await agentAssignNav.click();
  await page.waitForTimeout(2000);
  await prep();
  await ref('setting-up-your-profile', 'assignability-section');

  // Look for the radio buttons or section content
  const automaticRadio = page.locator('text=Automatic').first();
  const arBox = await bbox(automaticRadio, 'Automatic');
  const manualRadio = page.locator('text=Manual').first();
  const mrBox = await bbox(manualRadio, 'Manual');
  const notAssignable = page.locator('text=Not Assignable').first();
  const naBox = await bbox(notAssignable, 'Not Assignable');

  if (arBox) {
    // Capture the assignability section with all radio buttons
    const topY = arBox.y;
    const bottomY = naBox ? naBox.y + naBox.height : arBox.y + 200;
    const clipX = Math.max(0, arBox.x - 60);
    await snap('setting-up-your-profile', 'profile-assignability-raw', {
      x: clipX,
      y: Math.max(0, topY - 60),
      width: Math.min(840, 1280 - clipX - 20),
      height: Math.min(450, bottomY - topY + 120),
    });
  }
}


// ══════════════════════════════════════════════════════════════
// ARTICLE 2: How to Invite Users
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('ARTICLE 2: How to Invite Users');
console.log('═'.repeat(60));

// Click Members in the settings sidebar (Organization > Members)
const membersNav = page.locator('text=Members').first();
const mnBox = await bbox(membersNav, 'Members nav');
if (mnBox) {
  await membersNav.click();
  await page.waitForTimeout(3000);
  await prep();
}
await ref('how-to-invite-users', 'members-page');

// Image 1: invite-nav-members - settings nav + Team Admins section
console.log('\n--- 2a. invite-nav-members ---');
// Show settings sidebar + Team Admins list + Invite Team Member button
const teamAdminsHeader = page.locator('text=Team Admins').first();
const taBox = await bbox(teamAdminsHeader, 'Team Admins');
const inviteBtn = page.locator('text=Invite Team Member').first();
const ibBox = await bbox(inviteBtn, 'Invite Team Member btn');

if (taBox && ibBox) {
  // Capture from top of Team Admins to include a couple team members
  await snap('how-to-invite-users', 'invite-nav-members-raw', {
    x: 0,
    y: Math.max(0, taBox.y - 30),
    width: Math.min(840, ibBox.x + ibBox.width + 40),
    height: 350,
  });
}

// Image 2: invite-modal - Click "Invite Team Member +"
console.log('\n--- 2b. invite-modal ---');
if (ibBox) {
  await inviteBtn.click();
  await page.waitForTimeout(2000);
  await prep();
  await ref('how-to-invite-users', 'invite-modal');

  // The invite dialog - "Invite to DevOpsLtd"
  const inviteDialog = page.locator('text=Invite to').first();
  const idBox = await bbox(inviteDialog, 'Invite dialog title');

  if (idBox) {
    // Find the dialog boundaries by looking for the close button or dialog container
    // The dialog appears as a floating card with Access Level, Has Billing Access, Email, Invite button
    const inviteSendBtn = page.locator('button:has-text("Invite")').last();
    const isbBox = await bbox(inviteSendBtn, 'Invite send button');

    // Also look for "Existing Invites" text which is at the bottom of the dialog
    const existingInvites = page.locator('text=Existing Invites').first();
    const eiBox = await bbox(existingInvites, 'Existing Invites');

    const dialogTop = idBox.y - 20;
    const dialogBottom = eiBox ? eiBox.y + eiBox.height + 20 : (isbBox ? isbBox.y + isbBox.height + 80 : idBox.y + 300);
    const dialogLeft = idBox.x - 20;
    const dialogRight = isbBox ? isbBox.x + isbBox.width + 20 : idBox.x + 400;

    await snap('how-to-invite-users', 'invite-modal-raw', {
      x: Math.max(0, dialogLeft),
      y: Math.max(0, dialogTop),
      width: Math.min(840, dialogRight - dialogLeft + 20),
      height: Math.min(500, dialogBottom - dialogTop),
    });
  }

  // Close the dialog
  const closeBtn = page.locator('[class*="close"], button:has(svg):near(:text("Invite to"))').first();
  await closeBtn.click().catch(async () => {
    await page.keyboard.press('Escape');
  });
  await page.waitForTimeout(1000);
}


// ══════════════════════════════════════════════════════════════
// ARTICLE 3: How to Connect Your Calendar
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('ARTICLE 3: How to Connect Your Calendar');
console.log('═'.repeat(60));

// Navigate to Home page
await page.goto(`${STAGING}/home`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();
await ref('how-to-connect-your-calendar', 'home-page');

// Look for calendar-related content on the Home page
// The Home page should have Overview and Calendar tabs
const calendarTabBtn = page.locator('button:has-text("Calendar"), [role="tab"]:has-text("Calendar"), a:has-text("Calendar")').first();
const ctBox = await bbox(calendarTabBtn, 'Calendar tab');

if (ctBox) {
  await calendarTabBtn.click();
  await page.waitForTimeout(4000);
  await prep();
  await ref('how-to-connect-your-calendar', 'calendar-tab');

  // Image 1: calendar-view
  console.log('\n--- 3a. calendar-view ---');
  // Capture the calendar content area (right of sidebar)
  // The sidebar is approximately 240px wide
  await snap('how-to-connect-your-calendar', 'calendar-view-raw', {
    x: 230, y: 50,
    width: 840, height: 500,
  });
} else {
  console.log('  No Calendar tab found on Home page');
  // Try the Overview tab - it has a calendar sidebar
  await ref('how-to-connect-your-calendar', 'no-calendar-tab');

  // Image 1: calendar from profile settings
  console.log('\n--- 3a. calendar from settings ---');
  // Go to settings and capture Connected Calendar section
  await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await prep();

  const connectedCal = page.locator('text=Connected Calendar').first();
  const ccBox = await bbox(connectedCal, 'Connected Calendar');
  if (ccBox) {
    await snap('how-to-connect-your-calendar', 'calendar-connected-raw', {
      x: Math.max(0, ccBox.x - 40),
      y: Math.max(0, ccBox.y - 20),
      width: Math.min(840, 1280 - ccBox.x + 60),
      height: 200,
    });
  }
}

// Image 2: calendar scheduling events from profile settings
console.log('\n--- 3b. scheduling-events ---');
await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
await prep();

const schedulingEventsNav = page.locator('text=Scheduling Events').first();
const seBox = await bbox(schedulingEventsNav, 'Scheduling Events nav');
if (seBox) {
  await schedulingEventsNav.click();
  await page.waitForTimeout(2000);
  await prep();
  await ref('how-to-connect-your-calendar', 'scheduling-events');

  // Capture the scheduling events section
  const schedulingHeader = page.locator('text=Scheduling Events').nth(1); // Second one is the content header
  const shBox = await bbox(schedulingHeader, 'Scheduling Events header');
  if (shBox) {
    await snap('how-to-connect-your-calendar', 'scheduling-events-raw', {
      x: Math.max(0, shBox.x - 20),
      y: Math.max(0, shBox.y - 20),
      width: Math.min(840, 1280 - shBox.x + 40),
      height: 250,
    });
  }
}

// Image 3: Connected Calendar section
console.log('\n--- 3c. connected-calendar ---');
const profileDetailsNav2 = page.locator('text=Profile Details').first();
await profileDetailsNav2.click().catch(() => {});
await page.waitForTimeout(2000);
await prep();

const connCal = page.locator('text=Connected Calendar').first();
const cc2Box = await bbox(connCal, 'Connected Calendar');
if (cc2Box) {
  await snap('how-to-connect-your-calendar', 'connected-calendar-raw', {
    x: Math.max(0, cc2Box.x - 30),
    y: Math.max(0, cc2Box.y - 20),
    width: Math.min(840, 1280 - cc2Box.x + 50),
    height: 120,
  });
}


// ══════════════════════════════════════════════════════════════
// ARTICLE 4: How to Import Audiences
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('ARTICLE 4: How to Import Audiences');
console.log('═'.repeat(60));

await page.goto(`${STAGING}/marketing`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

// Click Audiences in the sidebar
const audiencesNav = page.locator('text=Audiences').first();
await audiencesNav.click().catch(() => {});
await page.waitForTimeout(3000);
await prep();
await ref('how-to-import-audiences', 'audiences-page');

// Image 1: audiences-nav - sidebar with Marketing > Audiences selected + Prospects table header
console.log('\n--- 4a. audiences-nav ---');
await snap('how-to-import-audiences', 'audiences-nav-raw', {
  x: 0, y: 0, width: 840, height: 400,
});

// Image 2: import-menu - Click "Actions" dropdown to show import options
console.log('\n--- 4b. import-menu ---');
// The "Actions" button is in the toolbar
const actionsBtn = page.locator('button:has-text("Actions")').first();
const abBox = await bbox(actionsBtn, 'Actions button');
if (abBox) {
  await actionsBtn.click();
  await page.waitForTimeout(1500);
  await prep();
  await ref('how-to-import-audiences', 'actions-menu');

  // Find the dropdown
  const actionMenu = page.locator('[role="menu"], [data-radix-popper-content-wrapper], [class*="dropdown"]').first();
  const amBox = await bbox(actionMenu, 'Actions menu');

  if (amBox) {
    // Hover "Import Single Prospect" to highlight it
    const importSingle = page.locator('text=Import Single Prospect').first();
    const isSingleVis = await importSingle.isVisible().catch(() => false);
    if (isSingleVis) {
      await importSingle.hover();
      await page.waitForTimeout(500);
    }

    const leftEdge = Math.min(abBox.x, amBox.x);
    const rightEdge = Math.max(abBox.x + abBox.width, amBox.x + amBox.width);
    const bottomEdge = amBox.y + amBox.height;

    await snap('how-to-import-audiences', 'import-menu-raw', {
      x: Math.max(0, leftEdge - 40),
      y: Math.max(0, abBox.y - 20),
      width: Math.min(840, rightEdge - leftEdge + 80),
      height: Math.min(400, bottomEdge - abBox.y + 40),
    });

    // Now click Import Single Prospect
    if (isSingleVis) {
      await importSingle.click();
      await page.waitForTimeout(2000);
      await prep();
      await ref('how-to-import-audiences', 'single-prospect-form');

      // Image 3: import-single-prospect form
      console.log('\n--- 4c. import-single-prospect ---');
      const importDialog = page.locator('[role="dialog"], [class*="modal"], [class*="Dialog"]').first();
      const idBox = await bbox(importDialog, 'Import dialog');
      if (idBox) {
        const pad = 25;
        await snap('how-to-import-audiences', 'import-single-prospect-raw', {
          x: Math.max(0, idBox.x - pad),
          y: Math.max(0, idBox.y - pad),
          width: Math.min(840, idBox.width + pad * 2),
          height: Math.min(500, idBox.height + pad * 2),
        });
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  }
}


// ══════════════════════════════════════════════════════════════
// ARTICLE 5: How to Filter and Sort
// ══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('ARTICLE 5: How to Filter and Sort');
console.log('═'.repeat(60));

await page.goto(`${STAGING}/sales`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();
await ref('how-to-filter-and-sort', 'sales-page');

// Image 1: leads-toolbar - sidebar + leads table toolbar (search, filter, sort, views)
console.log('\n--- 5a. leads-toolbar ---');
await snap('how-to-filter-and-sort', 'leads-toolbar-raw', {
  x: 0, y: 0, width: 840, height: 420,
});

// Find the filter icon button - it's a small funnel icon in the toolbar
// The toolbar icons are small buttons between the search bar and "Views" text
console.log('\n--- 5b. filter-panel ---');
// Try clicking the funnel icon - it's likely a button with an SVG inside
// Look for toolbar buttons between search and Views
const toolbarButtons = page.locator('button:near(:text("Search Leads"))');
const tbCount = await toolbarButtons.count();
console.log(`  Toolbar buttons near search: ${tbCount}`);

// Try to find filter by aria-label or tooltip
const filterBtn = page.locator('button[aria-label*="ilter"], button[title*="ilter"], [data-tip*="ilter"]').first();
let filterBtnBox = await bbox(filterBtn, 'Filter button (aria)');

if (!filterBtnBox) {
  // Try the SVG icon approach - the funnel icon is usually the first icon button after search
  // Look for all small icon buttons in the toolbar area (y between ~90 and ~120)
  const allBtns = await page.locator('button').all();
  console.log(`  Total buttons: ${allBtns.length}`);
  for (let i = 0; i < allBtns.length; i++) {
    const b = await allBtns[i].boundingBox();
    if (b && b.y > 85 && b.y < 130 && b.width < 50 && b.width > 20) {
      const text = await allBtns[i].textContent();
      console.log(`  btn[${i}]: x=${b.x.toFixed(0)} y=${b.y.toFixed(0)} w=${b.width.toFixed(0)} h=${b.height.toFixed(0)} text="${text?.trim()}"`);
    }
  }
}

// Try SVG path approach for funnel icon
const funnelBtn = page.locator('button:has(svg path[d*="M"])').all();
const searchInput = page.locator('input[placeholder*="Search"]').first();
const siBox = await bbox(searchInput, 'Search input');

if (siBox) {
  // The filter and sort icons are right after the search bar
  // Try clicking at the position right after the search bar
  const iconY = siBox.y + siBox.height / 2;
  const filterIconX = siBox.x + siBox.width + 30; // First icon after search
  const sortIconX = siBox.x + siBox.width + 65; // Second icon after search

  console.log(`  Clicking filter icon at ${filterIconX}, ${iconY}`);
  await page.mouse.click(filterIconX, iconY);
  await page.waitForTimeout(2000);
  await prep();
  await ref('how-to-filter-and-sort', 'filter-clicked');

  // Check if a filter panel/popover opened
  const filterPopover = page.locator('[data-radix-popper-content-wrapper], [class*="popover"]:visible').first();
  const fpBox = await bbox(filterPopover, 'Filter popover');

  if (fpBox) {
    // Great! Capture the filter panel
    const triggerX = filterIconX;
    const leftEdge = Math.min(triggerX - 30, fpBox.x);
    const rightEdge = Math.max(triggerX + 30, fpBox.x + fpBox.width);
    const bottomEdge = fpBox.y + fpBox.height;

    await snap('how-to-filter-and-sort', 'filter-panel-raw', {
      x: Math.max(0, leftEdge - 20),
      y: Math.max(0, siBox.y - 15),
      width: Math.min(840, rightEdge - leftEdge + 40),
      height: Math.min(500, bottomEdge - siBox.y + 35),
    });

    // Close filter
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  }

  // Image 3: sort-panel
  console.log('\n--- 5c. sort-panel ---');
  console.log(`  Clicking sort icon at ${sortIconX}, ${iconY}`);
  await page.mouse.click(sortIconX, iconY);
  await page.waitForTimeout(2000);
  await prep();
  await ref('how-to-filter-and-sort', 'sort-clicked');

  const sortPopover = page.locator('[data-radix-popper-content-wrapper], [class*="popover"]:visible').first();
  const spBox = await bbox(sortPopover, 'Sort popover');

  if (spBox) {
    const triggerX = sortIconX;
    const leftEdge = Math.min(triggerX - 30, spBox.x);
    const rightEdge = Math.max(triggerX + 30, spBox.x + spBox.width);
    const bottomEdge = spBox.y + spBox.height;

    await snap('how-to-filter-and-sort', 'sort-panel-raw', {
      x: Math.max(0, leftEdge - 20),
      y: Math.max(0, siBox.y - 15),
      width: Math.min(840, rightEdge - leftEdge + 40),
      height: Math.min(500, bottomEdge - siBox.y + 35),
    });
  }
}


await browser.close();
console.log('\n' + '═'.repeat(60));
console.log('ALL CAPTURES COMPLETE');
console.log('═'.repeat(60));
