import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';
const ART = 'how-to-filter-and-sort';
mkdirSync(`${ROOT}/${ART}/raw`, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: '/tmp/pw-storage-state.json',
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

async function prep() {
  await page.addStyleTag({ content: '* { outline: none !important; }' });
  await page.evaluate(() => {
    const fb = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Feedback'));
    if (fb) fb.style.display = 'none';
  });
}

async function snap(name, clip) {
  const path = `${ROOT}/${ART}/raw/${name}.png`;
  await page.screenshot({ path, clip, scale: 'device' });
  console.log(`  SNAP ${name} (${Math.round(clip.width)}x${Math.round(clip.height)} CSS -> ${Math.round(clip.width*2)}x${Math.round(clip.height*2)} px)`);
}

// ── Navigate to Leads ──
console.log('Navigating to Leads...');
await page.goto(`${STAGING}/sales`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);
await prep();

// Wait for table
await page.waitForSelector('table', { timeout: 15000 });
await page.waitForTimeout(2000);

// ── IMAGE 1: Leads toolbar ──
console.log('\n── Image 1: Leads toolbar ──');
const toolbarM = await page.evaluate(() => {
  const search = document.querySelector('input[placeholder*="Search"]');
  const searchRect = search?.getBoundingClientRect();
  const tabs = document.querySelector('[role="tablist"]');
  const tabsRect = tabs?.getBoundingClientRect();
  const table = document.querySelector('table');
  const tableRect = table?.getBoundingClientRect();
  // Third row for context
  const rows = [...document.querySelectorAll('tr')];
  const row3 = rows[3]?.getBoundingClientRect();
  // Toolbar row container (search + buttons + total leads)
  const toolbarContainer = search?.closest('div')?.parentElement?.parentElement;
  const toolbarRect = toolbarContainer?.getBoundingClientRect();
  return { search: searchRect, tabs: tabsRect, table: tableRect, row3, toolbar: toolbarRect };
});
console.log('Toolbar:', JSON.stringify(toolbarM));

// Capture: tabs + toolbar + table header + first 2 data rows
{
  const top = toolbarM.tabs.top - 6;
  const bottom = toolbarM.row3 ? toolbarM.row3.bottom + 8 : toolbarM.table.top + 200;
  // Content area starts after sidebar
  const left = toolbarM.tabs.left - 8;
  await snap('leads-toolbar-raw', {
    x: left, y: top,
    width: 840, height: bottom - top
  });
}

// ── IMAGE 2: Filter panel ──
console.log('\n── Image 2: Filter panel ──');

// Click the filter icon button (first icon button after search)
const filterBtn = page.locator('input[placeholder*="Search"]').locator('..').locator('..').locator('button').first();
await filterBtn.click();
await page.waitForTimeout(1000);

// Measure the filter dropdown
const filterM = await page.evaluate(() => {
  // Look for the field selector dropdown (contains field names like First Name, Status, etc.)
  const allOptions = document.querySelectorAll('[role="option"], [role="menuitem"]');
  if (allOptions.length > 0) {
    const first = allOptions[0].getBoundingClientRect();
    const last = allOptions[allOptions.length - 1].getBoundingClientRect();
    const container = allOptions[0].closest('[role="listbox"], [role="menu"]')?.parentElement;
    const containerRect = container?.getBoundingClientRect();
    return { options: { first, last, count: allOptions.length }, container: containerRect };
  }

  // Fallback: look for a dropdown-like element with field names
  const divs = [...document.querySelectorAll('div')];
  const filterPanel = divs.find(d => {
    const rect = d.getBoundingClientRect();
    const text = d.textContent;
    return rect.width > 100 && rect.width < 350 && rect.height > 100 && rect.height < 500 &&
      (text.includes('First Name') && text.includes('Status'));
  });
  return { panel: filterPanel?.getBoundingClientRect() };
});
console.log('Filter:', JSON.stringify(filterM));

if (filterM.container || filterM.panel) {
  const panel = filterM.container || filterM.panel;
  // Include the toolbar buttons above the panel for context
  const searchRect = await page.evaluate(() => {
    const s = document.querySelector('input[placeholder*="Search"]');
    return s?.closest('div')?.parentElement?.getBoundingClientRect();
  });
  const top = searchRect ? searchRect.top - 8 : panel.top - 60;
  const bottom = panel.bottom + 8;
  const left = searchRect ? searchRect.left - 8 : panel.left - 30;
  // Wide enough to show toolbar context + dropdown
  const width = Math.max(panel.right - left + 100, 500);

  await snap('filter-panel-raw', {
    x: left, y: top,
    width: Math.min(width, 840),
    height: bottom - top
  });
} else if (filterM.options) {
  // Use option bounds
  const top = filterM.options.first.top - 80; // Include toolbar above
  const bottom = filterM.options.last.bottom + 8;
  const left = filterM.options.first.left - 30;
  const width = Math.max(filterM.options.first.width + 200, 500);
  await snap('filter-panel-raw', {
    x: left, y: top,
    width: Math.min(width, 840),
    height: bottom - top
  });
}

// Close filter
await page.keyboard.press('Escape');
await page.waitForTimeout(500);

// ── IMAGE 3: Sort panel ──
console.log('\n── Image 3: Sort panel ──');

// Click sort button (second icon button after search)
const sortBtn = page.locator('input[placeholder*="Search"]').locator('..').locator('..').locator('button').nth(1);
await sortBtn.click();
await page.waitForTimeout(1000);

// Measure sort panel
const sortM = await page.evaluate(() => {
  const divs = [...document.querySelectorAll('div')];
  const panel = divs.find(d => {
    const text = d.textContent;
    const rect = d.getBoundingClientRect();
    return rect.width > 200 && rect.height > 80 && rect.height < 300 &&
      (text.includes('Apply Sorting') || text.includes('Add Sorting'));
  });
  const panelRect = panel?.getBoundingClientRect();

  // Get the sort button tooltip
  const tooltip = [...document.querySelectorAll('div')].find(d => {
    const text = d.textContent.trim();
    const rect = d.getBoundingClientRect();
    return text.match(/^Sort/) && rect.height < 40 && rect.width < 100;
  });
  const tooltipRect = tooltip?.getBoundingClientRect();

  // Get the sort toolbar button
  const search = document.querySelector('input[placeholder*="Search"]');
  const toolbarRow = search?.closest('div')?.parentElement;
  const toolbarRect = toolbarRow?.getBoundingClientRect();

  return { panel: panelRect, tooltip: tooltipRect, toolbar: toolbarRect };
});
console.log('Sort:', JSON.stringify(sortM));

if (sortM.panel) {
  const panel = sortM.panel;
  // Include tooltip and toolbar button above
  const top = sortM.tooltip ? sortM.tooltip.top - 8 : (sortM.toolbar ? sortM.toolbar.top - 8 : panel.top - 60);
  const bottom = panel.bottom + 8;
  const left = Math.max(panel.left - 30, sortM.toolbar?.left || 0);
  const right = Math.max(panel.right + 20, sortM.toolbar?.right || 0);
  const width = Math.max(right - left, 500);

  await snap('sort-panel-raw', {
    x: left, y: top,
    width: Math.min(width, 840),
    height: bottom - top
  });
}

console.log('\n✓ Done');
await browser.close();
