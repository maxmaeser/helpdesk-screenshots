import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';
const ART = 'how-to-filter-and-sort';

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
  const w2 = Math.round(clip.width * 2), h2 = Math.round(clip.height * 2);
  // Calculate final processed height: (h2 - 16 inset) + 120 card padding
  const finalH = h2 - 16 + 120;
  console.log(`  SNAP ${name} (${Math.round(clip.width)}x${Math.round(clip.height)} CSS -> ${w2}x${h2} px, final ~${finalH}px)`);
}

// Navigate
console.log('Navigating to Leads...');
await page.goto(`${STAGING}/sales`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);
await prep();
await page.waitForSelector('table', { timeout: 15000 });
await page.waitForTimeout(2000);

// Click the filter button to open dropdown
const filterBtnLocator = page.locator('input[placeholder*="Search"]').locator('..').locator('..').locator('button').first();
await filterBtnLocator.click();
await page.waitForTimeout(1000);

// Now hover the filter button to trigger its tooltip while panel is open
await filterBtnLocator.hover();
await page.waitForTimeout(500);

// Measure everything
const m = await page.evaluate(() => {
  // Filter button
  const search = document.querySelector('input[placeholder*="Search"]');
  const toolbarRow = search?.closest('div')?.parentElement;
  const btns = toolbarRow ? [...toolbarRow.querySelectorAll('button')] : [];
  const filterBtn = btns[0]; // First button after search = filter
  const filterBtnRect = filterBtn?.getBoundingClientRect();

  // Tooltip - look for small floating elements near the button
  const tooltips = [...document.querySelectorAll('div, span')].filter(el => {
    const rect = el.getBoundingClientRect();
    const text = el.textContent.trim();
    return rect.height < 40 && rect.width < 120 && rect.width > 30 &&
      rect.top < (filterBtnRect?.top || 200) &&
      rect.bottom > (filterBtnRect?.top || 200) - 40 &&
      (text.includes('Filter') || text.includes('filter'));
  });
  const tooltipRects = tooltips.map(t => ({ text: t.textContent.trim(), rect: t.getBoundingClientRect() }));

  // Filter dropdown - the field list
  const options = [...document.querySelectorAll('[role="option"]')];
  let optionRects = options.map(o => ({ text: o.textContent.trim(), rect: o.getBoundingClientRect() }));

  // If no role="option", look for the dropdown by content
  if (optionRects.length === 0) {
    const divs = [...document.querySelectorAll('div')];
    const dropdown = divs.find(d => {
      const rect = d.getBoundingClientRect();
      const text = d.textContent;
      return rect.width > 100 && rect.width < 300 && rect.height > 200 &&
        text.includes('First Name') && text.includes('Source');
    });
    if (dropdown) {
      // Get individual items
      const items = [...dropdown.children].filter(c => {
        const r = c.getBoundingClientRect();
        return r.height > 20 && r.height < 50;
      });
      optionRects = items.map(i => ({ text: i.textContent.trim(), rect: i.getBoundingClientRect() }));
    }
  }

  // The toolbar row
  const toolbarRect = toolbarRow?.getBoundingClientRect();
  const searchRect = search?.getBoundingClientRect();

  // Find "Status" option for cursor placement
  const statusOption = optionRects.find(o => o.text === 'Status');

  return {
    filterBtn: filterBtnRect,
    tooltips: tooltipRects,
    options: optionRects,
    toolbar: toolbarRect,
    search: searchRect,
    statusOption: statusOption,
    firstOption: optionRects[0],
    lastOption: optionRects[optionRects.length - 1]
  };
});

console.log('Filter button:', JSON.stringify(m.filterBtn));
console.log('Tooltips found:', m.tooltips.length, JSON.stringify(m.tooltips));
console.log('Options found:', m.options.length);
console.log('First option:', JSON.stringify(m.firstOption));
console.log('Last option:', JSON.stringify(m.lastOption));
console.log('Status option:', JSON.stringify(m.statusOption));
console.log('Toolbar:', JSON.stringify(m.toolbar));

// Calculate clip
// We want: tooltip (if any) + filter button area + full dropdown
// Max raw height at 2x: (1000 - 120 + 16) = 896px at 2x = 448 CSS
const MAX_RAW_2X = 896;
const MAX_CSS_H = MAX_RAW_2X / 2; // 448

let topY;
if (m.tooltips.length > 0) {
  topY = Math.min(...m.tooltips.map(t => t.rect.top)) - 6;
} else {
  // No tooltip visible - capture from just above the toolbar
  topY = m.toolbar ? m.toolbar.top - 6 : m.filterBtn.top - 30;
}

const bottomY = m.lastOption ? m.lastOption.rect.bottom + 8 : m.filterBtn.bottom + 400;
let height = bottomY - topY;

// If too tall, trim from the bottom (fewer fields visible)
if (height > MAX_CSS_H) {
  console.log(`Height ${Math.round(height)} CSS exceeds max ${MAX_CSS_H}, trimming...`);
  height = MAX_CSS_H;
}

// Width: include search bar for context + dropdown
const leftX = m.search ? m.search.left - 8 : m.filterBtn.left - 100;
let rightX = m.lastOption ? m.lastOption.rect.right + 20 : m.filterBtn.right + 200;
// Also include the Views button area for wider context
rightX = Math.max(rightX, m.toolbar ? m.toolbar.right : rightX);
let width = rightX - leftX;
// Cap at 840 CSS
if (width > 840) width = 840;

console.log(`\nClip: x=${Math.round(leftX)}, y=${Math.round(topY)}, w=${Math.round(width)}, h=${Math.round(height)}`);

await snap('filter-panel-raw', { x: leftX, y: topY, width, height });

// Verify cursor position: "Status" field in the dropdown
if (m.statusOption) {
  const cursorX = Math.round((m.statusOption.rect.left + m.statusOption.rect.width / 2 - leftX) * 2);
  const cursorY = Math.round((m.statusOption.rect.top + m.statusOption.rect.height / 2 - topY) * 2);
  console.log(`\nCursor for "Status" field: --hand --cursor ${cursorX},${cursorY}`);
}

await browser.close();
