import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';
const ART = 'how-to-set-up-group-scheduling';
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
  // Hide feedback button
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

// ── Navigate to Brand Settings → Calendar Events ──
console.log('Navigating to Brand settings...');
await page.goto(`${STAGING}/settings/brands#brand-scheduling-events`);
await page.waitForTimeout(5000);
await prep();

// Scroll to Calendar Events section
await page.evaluate(() => {
  const allH2 = [...document.querySelectorAll('h2')];
  const calH2 = allH2.find(h => h.textContent.trim() === 'Calendar Events');
  if (calH2) calH2.closest('div').parentElement.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(1000);

// ── Check if event already exists ──
const hasEvent = await page.evaluate(() => {
  return [...document.querySelectorAll('h3')].some(h => h.textContent.includes('Discovery Call'));
});

if (!hasEvent) {
  console.log('No event found, creating one...');
  // Click Create Event
  const createBtn = page.locator('button:has-text("Create Event")').first();
  await createBtn.click();
  await page.waitForTimeout(1000);

  // Fill form
  await page.locator('input[name="subject"]').fill('Discovery Call with {{name}}');
  await page.locator('input[name="description"]').fill('Initial discovery call to learn about your franchise goals');
  await page.getByRole('spinbutton').fill('30');

  // Toggle meeting link
  const toggle = page.locator('[role="switch"]');
  await toggle.click();

  // Enable Monday
  const mondayCheckbox = page.locator('[role="checkbox"]').first();
  await mondayCheckbox.click();
  await page.waitForTimeout(500);

  // ── IMAGE 2: Create form (before saving) ──
  console.log('\n── Image 2: Create form ──');
  const formArea = await page.evaluate(() => {
    const attLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Attendees:');
    const attRect = attLabel ? attLabel.getBoundingClientRect() : null;
    const mlLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Add Online Meeting Link?');
    const mlRect = mlLabel ? mlLabel.getBoundingClientRect() : null;
    return { top: attRect?.top || 89, bottom: mlRect?.bottom || 479 };
  });
  await snap('group-create-form-raw', {
    x: 410, y: formArea.top - 14,
    width: 830, height: formArea.bottom - formArea.top + 28
  });

  // ── IMAGE 3: Availability schedule ──
  console.log('\n── Image 3: Availability ──');
  const avail = await page.evaluate(() => {
    const tzLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Operating timezone');
    const tzRect = tzLabel ? tzLabel.getBoundingClientRect() : null;
    const fridayH = [...document.querySelectorAll('h5')].find(h => h.textContent.trim() === 'friday');
    const fridayRow = fridayH ? fridayH.closest('div').parentElement : null;
    const fridayRect = fridayRow ? fridayRow.getBoundingClientRect() : null;
    return { top: tzRect?.top || 495, bottom: fridayRect?.bottom || 881 };
  });
  await snap('group-availability-raw', {
    x: 410, y: avail.top - 10,
    width: 830, height: avail.bottom - avail.top + 20
  });

  // Save the event
  console.log('Saving event...');
  const saveBtn = page.locator('[role="dialog"] button:has-text("Save")');
  await saveBtn.click();
  await page.waitForTimeout(2000);
} else {
  console.log('Event already exists, capturing form/availability from edit panel...');

  // Open edit panel
  const editBtns = page.locator('button').filter({ hasText: '' });
  // Find the pencil icon button next to the event
  const eventRow = page.locator('h3:has-text("Discovery Call")').locator('..').locator('..').locator('..');
  const pencilBtn = eventRow.locator('button').last();
  await pencilBtn.click();
  await page.waitForTimeout(1000);
  await prep();

  // ── IMAGE 2: Create form ──
  console.log('\n── Image 2: Create form ──');
  const formArea = await page.evaluate(() => {
    const attLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Attendees:');
    const attRect = attLabel ? attLabel.getBoundingClientRect() : null;
    const mlLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Add Online Meeting Link?');
    const mlRect = mlLabel ? mlLabel.getBoundingClientRect() : null;
    return { top: attRect?.top || 89, bottom: mlRect?.bottom || 479 };
  });
  await snap('group-create-form-raw', {
    x: 410, y: formArea.top - 14,
    width: 830, height: formArea.bottom - formArea.top + 28
  });

  // ── IMAGE 3: Availability schedule ──
  console.log('\n── Image 3: Availability ──');
  const avail = await page.evaluate(() => {
    const tzLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Operating timezone');
    const tzRect = tzLabel ? tzLabel.getBoundingClientRect() : null;
    const fridayH = [...document.querySelectorAll('h5')].find(h => h.textContent.trim() === 'friday');
    const fridayRow = fridayH ? fridayH.closest('div').parentElement : null;
    const fridayRect = fridayRow ? fridayRow.getBoundingClientRect() : null;
    return { top: tzRect?.top || 495, bottom: fridayRect?.bottom || 881 };
  });
  await snap('group-availability-raw', {
    x: 410, y: avail.top - 10,
    width: 830, height: avail.bottom - avail.top + 20
  });

  // ── IMAGE 4: Members dropdown ──
  console.log('\n── Image 4: Members dropdown ──');

  // Click the attendees listbox button to open dropdown
  const listboxButton = page.locator('[role="dialog"] button[aria-haspopup="listbox"]');
  const btnCount = await listboxButton.count();
  if (btnCount > 0) {
    await listboxButton.first().click();
  } else {
    // Fallback: find and click via evaluate
    await page.evaluate(() => {
      const attLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Attendees:');
      const container = attLabel.closest('div');
      const btns = container.querySelectorAll('button');
      for (const btn of btns) { btn.click(); break; }
    });
  }
  await page.waitForTimeout(1000);

  // Wait for listbox to appear, then hover Joshua
  await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
  const joshuaOption = page.getByRole('option', { name: 'Joshua Radin-Grant' });
  await joshuaOption.hover();
  await page.waitForTimeout(300);

  // Measure dropdown area
  const dropdownArea = await page.evaluate(() => {
    const listbox = document.querySelector('[role="listbox"]');
    const listboxRect = listbox ? listbox.getBoundingClientRect() : null;
    const attLabel = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Attendees:');
    const attRect = attLabel ? attLabel.getBoundingClientRect() : null;
    return {
      top: Math.min(attRect?.top || 89, listboxRect?.top || 89) - 14,
      bottom: listboxRect?.bottom || 281,
      listboxRight: listboxRect?.right || 724
    };
  });
  await snap('group-members-dropdown-raw', {
    x: 410, y: dropdownArea.top,
    width: 830, height: dropdownArea.bottom - dropdownArea.top + 14
  });

  // Close dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  // Close edit panel
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

// ── IMAGE 1: Nav (empty state) ──
// We need to delete the event to show empty state, capture, then recreate
// Actually, let's capture the event row first, then handle empty state

// Scroll to Calendar Events
await page.evaluate(() => {
  const allH2 = [...document.querySelectorAll('h2')];
  const calH2 = allH2.find(h => h.textContent.trim() === 'Calendar Events');
  if (calH2) calH2.closest('div').parentElement.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(500);
await prep();

// ── IMAGE 5: Event row ──
console.log('\n── Image 5: Event row ──');
const eventMeasure = await page.evaluate(() => {
  const allH2 = [...document.querySelectorAll('h2')];
  const calH2 = allH2.find(h => h.textContent.trim() === 'Calendar Events');
  const section = calH2.closest('div').parentElement;
  const sectionRect = section.getBoundingClientRect();
  const eventTitle = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Discovery Call'));
  const eventRow = eventTitle ? eventTitle.closest('div').parentElement.parentElement : null;
  const eventRect = eventRow ? eventRow.getBoundingClientRect() : null;
  const btns = eventRow ? [...eventRow.querySelectorAll('button')] : [];
  const linkBtn = btns[0]?.getBoundingClientRect();
  return {
    top: sectionRect.top,
    bottom: eventRect?.bottom || 558,
    linkBtnCenter: linkBtn ? { x: linkBtn.x + linkBtn.width/2, y: linkBtn.y + linkBtn.height/2 } : null
  };
});
await snap('group-event-row-raw', {
  x: 290, y: eventMeasure.top - 14,
  width: 940, height: eventMeasure.bottom - eventMeasure.top + 28
});

// ── IMAGE 1: Delete event to get empty state, capture, then recreate ──
console.log('\n── Image 1: Empty state (deleting event temporarily) ──');

// Open edit panel and delete
const editBtn2 = await page.evaluate(() => {
  const eventTitle = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('Discovery Call'));
  const eventRow = eventTitle.closest('div').parentElement.parentElement;
  const btns = [...eventRow.querySelectorAll('button')];
  const editB = btns[btns.length - 1]; // last button = edit
  editB.click();
  return true;
});
await page.waitForTimeout(1000);

// Click Delete
const deleteBtn = page.locator('[role="dialog"] button:has-text("Delete")');
await deleteBtn.click();
await page.waitForTimeout(2000);
await prep();

// Scroll to Calendar Events
await page.evaluate(() => {
  const allH2 = [...document.querySelectorAll('h2')];
  const calH2 = allH2.find(h => h.textContent.trim() === 'Calendar Events');
  if (calH2) calH2.closest('div').parentElement.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(500);

const emptySection = await page.evaluate(() => {
  const allH2 = [...document.querySelectorAll('h2')];
  const calH2 = allH2.find(h => h.textContent.trim() === 'Calendar Events');
  const section = calH2.closest('div').parentElement;
  return section.getBoundingClientRect();
});
await snap('group-nav-create-raw', {
  x: 290, y: emptySection.top - 10,
  width: 940, height: emptySection.height + 40
});

console.log('\n✓ All 5 images captured at 2x');
await browser.close();
