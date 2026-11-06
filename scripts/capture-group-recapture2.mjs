import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';
const ART = 'how-to-set-up-group-scheduling';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: '/tmp/pw-storage-state.json',
  viewport: { width: 1280, height: 1400 },
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
await page.goto(`${STAGING}/settings/brands#brand-scheduling-events`);
await page.waitForTimeout(5000);
await prep();

// Scroll to Calendar Events and open edit
await page.evaluate(() => {
  const allH2 = [...document.querySelectorAll('h2')];
  const calH2 = allH2.find(h => h.textContent.trim() === 'Calendar Events');
  if (calH2) calH2.closest('div').parentElement.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(500);

// Click edit on the event
await page.evaluate(() => {
  const eventTitle = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Discovery Call'));
  if (!eventTitle) throw new Error('No event found');
  const eventRow = eventTitle.closest('div').parentElement.parentElement;
  const btns = [...eventRow.querySelectorAll('button')];
  btns[btns.length - 1].click();
});
await page.waitForTimeout(1000);
await prep();

// Enable Tuesday if not already
const tuesdayState = await page.evaluate(() => {
  const cbs = [...document.querySelectorAll('[role="checkbox"]')];
  if (cbs.length < 2) return 'not found';
  const isChecked = cbs[1].getAttribute('data-headlessui-state')?.includes('checked') ||
                    cbs[1].getAttribute('aria-checked') === 'true';
  return isChecked ? 'checked' : 'unchecked';
});
console.log('Tuesday:', tuesdayState);
if (tuesdayState === 'unchecked') {
  await page.locator('[role="checkbox"]').nth(1).click();
  await page.waitForTimeout(500);
}

// Measure the PANEL precisely (not the background page)
const m = await page.evaluate(() => {
  // The edit panel is inside a dialog
  const dialog = document.querySelector('[role="dialog"]');
  if (!dialog) return null;

  // Find the panel's content container
  const panelContent = dialog.querySelector('div');
  const panelRect = panelContent ? panelContent.getBoundingClientRect() : null;

  // Individual elements
  const attLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Attendees:');
  const attRow = attLabel ? attLabel.closest('div').parentElement : null;

  const subject = document.querySelector('input[name="subject"]');
  const subjectRect = subject ? subject.getBoundingClientRect() : null;

  const toggle = document.querySelector('[role="switch"]');
  const toggleRect = toggle ? toggle.getBoundingClientRect() : null;

  const tzLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Operating timezone');
  const tzRect = tzLabel ? tzLabel.getBoundingClientRect() : null;

  const days = {};
  for (const day of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']) {
    const h = [...document.querySelectorAll('h5')].find(h => h.textContent.trim() === day);
    const row = h ? h.closest('div').parentElement : null;
    days[day] = row ? row.getBoundingClientRect() : null;
  }

  // The panel's actual left/right edges (the form fields container)
  const formContainer = subject ? subject.closest('div').parentElement : null;
  const formRect = formContainer ? formContainer.getBoundingClientRect() : null;

  return {
    panel: panelRect,
    att: attRow ? attRow.getBoundingClientRect() : null,
    subject: subjectRect,
    toggle: toggleRect,
    tz: tzRect,
    days,
    form: formRect
  };
});

console.log('Panel left:', m.panel?.left, 'right:', m.panel?.right, 'width:', m.panel?.width);
console.log('Form left:', m.form?.left, 'right:', m.form?.right);
console.log('Subject left:', m.subject?.left, 'right:', m.subject?.right);

// Use the form field edges for precise clipping
const panelLeft = m.subject ? m.subject.left - 20 : 410;
const panelRight = m.subject ? m.subject.right + 20 : 1240;
const panelWidth = panelRight - panelLeft;

console.log(`\nPanel clip: x=${panelLeft}, width=${panelWidth}`);

// ── IMAGE 1: Create form ──
console.log('\n── Image 1: Create form ──');
const formTop = m.att ? m.att.top - 14 : 75;
const formBottom = m.tz ? m.tz.top - 10 : 490;
await snap('group-create-form-raw', {
  x: panelLeft,
  y: formTop,
  width: Math.min(panelWidth, 840),
  height: Math.min(formBottom - formTop, 448)
});

// ── IMAGE 2: Availability ──
console.log('\n── Image 2: Availability ──');
const availTop = m.tz ? m.tz.top - 10 : 485;
const lastDay = m.days.saturday || m.days.friday;
const availBottom = lastDay ? lastDay.bottom + 8 : 940;
await snap('group-availability-raw', {
  x: panelLeft,
  y: availTop,
  width: Math.min(panelWidth, 840),
  height: Math.min(availBottom - availTop, 448)
});

console.log('\n✓ Done');
await browser.close();
