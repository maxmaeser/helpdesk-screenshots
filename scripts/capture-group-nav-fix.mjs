import { chromium } from 'playwright';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';
const ART = 'how-to-set-up-group-scheduling';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: '/tmp/pw-storage-state.json',
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

// Navigate fresh to brand settings
console.log('Navigating...');
await page.goto(`${STAGING}/settings/brands#brand-scheduling-events`);
await page.waitForTimeout(5000);
await page.addStyleTag({ content: '* { outline: none !important; }' });
await page.evaluate(() => {
  const fb = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Feedback'));
  if (fb) fb.style.display = 'none';
});

// Scroll to Calendar Events
await page.evaluate(() => {
  const allH2 = [...document.querySelectorAll('h2')];
  const calH2 = allH2.find(h => h.textContent.trim() === 'Calendar Events');
  if (calH2) calH2.closest('div').parentElement.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(1000);

// Check if there's still an event
const hasEvent = await page.evaluate(() => {
  return [...document.querySelectorAll('h3')].some(h => h.textContent.includes('Discovery Call'));
});
console.log('Has event:', hasEvent);

if (hasEvent) {
  // Need to delete it first
  console.log('Deleting event...');
  const eventRow = page.locator('h3:has-text("Discovery Call")').locator('xpath=ancestor::div[3]');
  const editBtn = eventRow.locator('button').last();
  await editBtn.click();
  await page.waitForTimeout(1000);

  const deleteBtn = page.locator('[role="dialog"] button:has-text("Delete")');
  await deleteBtn.click();
  await page.waitForTimeout(1000);

  // Handle "Yes, delete" confirmation dialog
  const yesDeleteBtn = page.locator('button:has-text("Yes, delete")');
  if (await yesDeleteBtn.count() > 0) {
    await yesDeleteBtn.click();
    await page.waitForTimeout(1000);
  }

  // Wait and reload
  await page.waitForTimeout(2000);
  await page.goto(`${STAGING}/settings/brands#brand-scheduling-events`);
  await page.waitForTimeout(5000);
  await page.addStyleTag({ content: '* { outline: none !important; }' });
  await page.evaluate(() => {
    const fb = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Feedback'));
    if (fb) fb.style.display = 'none';
  });

  await page.evaluate(() => {
    const allH2 = [...document.querySelectorAll('h2')];
    const calH2 = allH2.find(h => h.textContent.trim() === 'Calendar Events');
    if (calH2) calH2.closest('div').parentElement.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(1000);
}

// Measure and capture empty state
const section = await page.evaluate(() => {
  const allH2 = [...document.querySelectorAll('h2')];
  const calH2 = allH2.find(h => h.textContent.trim() === 'Calendar Events');
  const sec = calH2.closest('div').parentElement;
  const rect = sec.getBoundingClientRect();
  // Also check for empty state text
  const emptyP = [...document.querySelectorAll('p')].find(p => p.textContent.includes('You have not created'));
  const emptyRect = emptyP ? emptyP.getBoundingClientRect() : null;
  return { section: rect, emptyText: emptyRect };
});

console.log('Section:', JSON.stringify(section));

const top = section.section.top - 10;
const bottom = section.emptyText ? section.emptyText.bottom + 20 : section.section.bottom + 20;

const path = `${ROOT}/${ART}/raw/group-nav-create-raw.png`;
await page.screenshot({
  path,
  clip: { x: 290, y: top, width: 940, height: bottom - top },
  scale: 'device'
});
console.log(`SNAP group-nav-create-raw (${940}x${Math.round(bottom - top)} CSS -> ${940*2}x${Math.round((bottom - top)*2)} px)`);

await browser.close();
