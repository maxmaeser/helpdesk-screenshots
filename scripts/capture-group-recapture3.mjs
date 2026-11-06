import { chromium } from 'playwright';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';
const ART = 'how-to-set-up-group-scheduling';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: '/tmp/pw-storage-state.json',
  viewport: { width: 1280, height: 1600 },
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
  const finalH = h2 - 16 + 120;
  console.log(`  SNAP ${name} (${Math.round(clip.width)}x${Math.round(clip.height)} CSS -> ${w2}x${h2} px, final ~${finalH}px)`);
}

console.log('Navigating...');
await page.goto(`${STAGING}/settings/brands#brand-scheduling-events`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);
await prep();

// Scroll to Calendar Events
await page.evaluate(() => {
  const calH2 = [...document.querySelectorAll('h2')].find(h => h.textContent.trim() === 'Calendar Events');
  if (calH2) calH2.closest('div').parentElement.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(500);

// Check if event exists
const hasEvent = await page.evaluate(() => {
  return [...document.querySelectorAll('h3')].some(h => h.textContent.includes('Discovery Call'));
});

if (hasEvent) {
  // Open edit panel
  await page.evaluate(() => {
    const t = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Discovery Call'));
    const row = t.closest('div').parentElement.parentElement;
    [...row.querySelectorAll('button')].pop().click();
  });
  await page.waitForTimeout(1000);
} else {
  // Create the event
  console.log('No event found, creating...');
  const createBtn = page.locator('button:has-text("Create Event")').first();
  await createBtn.click();
  await page.waitForTimeout(1000);
  await page.locator('input[name="subject"]').fill('Discovery Call with {{name}}');
  await page.locator('input[name="description"]').fill('Initial discovery call to learn about your franchise goals');
  await page.getByRole('spinbutton').fill('30');
  await page.locator('[role="switch"]').click();
  await page.waitForTimeout(300);
  // Enable Monday + Tuesday
  await page.locator('[role="checkbox"]').first().click();
  await page.waitForTimeout(300);
  await page.locator('[role="checkbox"]').nth(1).click();
  await page.waitForTimeout(300);
}
await prep();

// Measure the FULL panel
const m = await page.evaluate(() => {
  const title = [...document.querySelectorAll('h2')].find(h => h.textContent.includes('Discovery Call'));
  const titleRect = title ? title.getBoundingClientRect() : null;

  // Save/Delete buttons row
  const saveBtn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Save');
  const saveRect = saveBtn ? saveBtn.getBoundingClientRect() : null;

  const toggle = document.querySelector('[role="switch"]');
  const toggleRect = toggle ? toggle.getBoundingClientRect() : null;

  const tzLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Operating timezone');
  const tzRect = tzLabel ? tzLabel.getBoundingClientRect() : null;

  const subject = document.querySelector('input[name="subject"]');
  const subjectRect = subject ? subject.getBoundingClientRect() : null;

  // The panel header (title + save/delete row)
  const headerRow = title ? title.parentElement : null;
  const headerRect = headerRow ? headerRow.getBoundingClientRect() : null;

  return { title: titleRect, save: saveRect, toggle: toggleRect, tz: tzRect, subject: subjectRect, header: headerRect };
});

console.log('Title:', JSON.stringify(m.title));
console.log('Header row:', JSON.stringify(m.header));
console.log('Toggle:', JSON.stringify(m.toggle));
console.log('Tz:', JSON.stringify(m.tz));

// Capture from panel title through Meeting Link toggle
// Include the full width of the panel
const top = m.header ? m.header.top - 16 : m.title.top - 16;
const bottom = m.toggle ? m.toggle.bottom + 20 : 500;
const left = m.subject ? m.subject.left - 20 : 400;
const right = m.subject ? m.subject.right + 20 : 1240;

console.log(`\nClip: x=${Math.round(left)}, y=${Math.round(top)}, w=${Math.round(right-left)}, h=${Math.round(bottom-top)}`);

await snap('group-create-form-raw', {
  x: left, y: top,
  width: Math.min(right - left + 40, 860),
  height: bottom - top
});

console.log('\n✓ Done');
await browser.close();
