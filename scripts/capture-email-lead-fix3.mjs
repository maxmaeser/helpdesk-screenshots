import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const ARTICLE = 'how-to-email-a-lead-directly';
const RAW = `${ROOT}/${ARTICLE}/raw`;

const STAGING = 'https://staging.app.franchisesystems.ai';

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

async function snap(name, clip) {
  clip.x = Math.max(0, Math.round(clip.x));
  clip.y = Math.max(0, Math.round(clip.y));
  clip.width = Math.round(Math.min(clip.width, 1280 - clip.x));
  clip.height = Math.round(Math.min(clip.height, 900 - clip.y));
  const path = `${RAW}/${name}`;
  await page.screenshot({ path, clip, scale: 'device' });
  console.log(`  SNAP ${name} (${clip.width}x${clip.height} CSS → ${clip.width * 2}x${clip.height * 2} raw)`);
}

async function ref(name) {
  await page.screenshot({ path: `${RAW}/_ref_${name}.png`, scale: 'device' });
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

// ═══ Fix template + compose top margin (14px) ═══

async function openLeadAndSendEmail() {
  await page.goto(`${STAGING}/sales`, { timeout: 60000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await prep();
  await page.getByText('Joshua Raidin', { exact: false }).first().click();
  await page.waitForTimeout(3000);
  await prep();
  const btnPos = await page.evaluate(() => {
    let best = null;
    document.querySelectorAll('button').forEach(btn => {
      const rect = btn.getBoundingClientRect();
      const hasSvg = btn.querySelector('svg') !== null;
      const isEmpty = btn.textContent?.trim() === '';
      if (hasSvg && isEmpty && rect.y > 60 && rect.y < 130 && rect.x > 1000 && rect.width < 50) {
        if (!best || rect.x > best.x) best = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      }
    });
    return best;
  });
  await page.mouse.click(btnPos.x, btnPos.y);
  await page.waitForTimeout(1000);
  await page.getByText('Send Email').first().click();
  await page.waitForTimeout(3000);
  await prep();
}

async function findOverlayTop() {
  return await page.evaluate(() => {
    const headers = [...document.querySelectorAll('h2, h3, [class*="font-semibold"], [class*="font-bold"], span')]
      .filter(el => el.textContent?.trim() === 'Send Email' && el.getBoundingClientRect().y > 50);
    let topY = 9999;
    for (const h of headers) {
      topY = Math.min(topY, h.getBoundingClientRect().y);
    }
    return topY < 9999 ? topY : null;
  });
}

console.log('\n═══ IMAGE 2: email-lead-template ═══');
await openLeadAndSendEmail();
await page.getByText('Use Template').first().click();
await page.waitForTimeout(3000);
await prep();
await page.getByText('Fast Track Email').first().click();
await page.waitForTimeout(2000);
await prep();
const tmplTop = await findOverlayTop();
await snap('email-lead-template-raw.png', { x: 0, y: Math.max(0, (tmplTop || 120) - 14), width: 1050, height: 500 });

console.log('\n═══ IMAGE 3: email-lead-compose ═══');
await openLeadAndSendEmail();
await page.getByText('Compose Email').first().click();
await page.waitForTimeout(3000);
await prep();
const compTop = await findOverlayTop();
await snap('email-lead-compose-raw.png', { x: 0, y: Math.max(0, (compTop || 120) - 14), width: 1050, height: 500 });

// ═══ IMAGE 4b: send details with purpose dropdown open + Send Immediately off ═══

console.log('\n═══ IMAGE 4b: email-lead-send-details-v2 ═══');

// Need to fill in subject + body to get past validation, then click Continue
// Type in the subject field
const subjectLabel = page.getByText('Subject').first();
const slBox = await bbox(subjectLabel, 'Subject label');

// Find the subject input - it's near the top, has red validation border from ref
const subjectInput = page.locator('input[class*="border-red"], input[required]').first();
let siBox = await bbox(subjectInput, 'Subject input (required)');

if (!siBox) {
  // Try by placeholder or position - it's near the "Subject*" label
  const inputs = await page.evaluate(() => {
    return [...document.querySelectorAll('input')].map(el => {
      const rect = el.getBoundingClientRect();
      return { placeholder: el.placeholder, x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), name: el.name, type: el.type };
    }).filter(el => el.w > 200 && el.y > 50 && el.y < 200);
  });
  console.log('  Inputs near top:', inputs);
}

// Click the subject area and type
if (siBox) {
  await subjectInput.fill('Follow-up on your franchise inquiry');
} else {
  // Try clicking near the Subject label and typing
  if (slBox) {
    await page.mouse.click(slBox.x + 200, slBox.y + 30);
    await page.waitForTimeout(200);
    await page.keyboard.type('Follow-up on your franchise inquiry');
  }
}
await page.waitForTimeout(500);

// Type in the editor body
const editor = page.locator('.ProseMirror, [contenteditable="true"]').first();
const edBox = await bbox(editor, 'Editor');
if (edBox) {
  await editor.click();
  await page.keyboard.type('Hello Joshua, thank you for your interest.');
  await page.waitForTimeout(500);
}

await ref('send-details-v2-content-filled');

// Click Continue
const continueBtn = page.getByRole('button', { name: /continue/i }).first();
const cbBox = await bbox(continueBtn, 'Continue button');
if (cbBox) {
  await continueBtn.click();
  await page.waitForTimeout(3000);
  await prep();
  await ref('send-details-v2-page');

  // Now on the send details page - toggle off "Send Immediately"
  // Find the toggle switch (it's enabled/blue by default)
  const toggleSwitch = page.locator('[role="switch"]').first();
  const tsBox = await bbox(toggleSwitch, 'Toggle switch');
  if (tsBox) {
    await toggleSwitch.click();
    await page.waitForTimeout(500);
    await prep();
    console.log('  Toggled off Send Immediately');
  } else {
    // Try finding toggle by looking for a blue button near "Send Immediately" text
    const togglePos = await page.evaluate(() => {
      const si = [...document.querySelectorAll('span, div, label')]
        .find(el => el.textContent?.trim() === 'Send Immediately');
      if (!si) return null;
      const parent = si.closest('div');
      const toggle = parent?.querySelector('button') || parent?.parentElement?.querySelector('button');
      if (toggle) {
        const rect = toggle.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      }
      return null;
    });
    console.log('  Toggle by eval:', togglePos);
    if (togglePos) {
      await page.mouse.click(togglePos.x, togglePos.y);
      await page.waitForTimeout(500);
      await prep();
    }
  }

  await ref('send-details-v2-toggled');

  // Open the Purpose dropdown
  // The dropdown has "Select" placeholder text inside the dialog
  // Use force click to bypass HeadlessUI overlay
  const purposeSelect = await page.evaluate(() => {
    // Find the "Select" text inside the send details dialog (near "Purpose" label)
    const purpose = [...document.querySelectorAll('span, div, label')]
      .find(el => el.textContent?.trim() === 'Purpose');
    if (!purpose) return null;
    // The dropdown/select is a sibling or child of the same container
    const container = purpose.closest('div')?.parentElement;
    const select = container?.querySelector('select, [role="combobox"], button');
    if (select) {
      const rect = select.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, w: rect.width, h: rect.height };
    }
    // Try the element right after Purpose label
    const next = purpose.parentElement?.nextElementSibling;
    if (next) {
      const rect = next.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, w: rect.width, h: rect.height };
    }
    return null;
  });
  console.log('  Purpose select:', purposeSelect);

  if (purposeSelect) {
    await page.mouse.click(purposeSelect.x, purposeSelect.y);
    await page.waitForTimeout(1000);
    await prep();
  }

  await ref('send-details-v2-dropdown-open');

  // Capture the dialog + any open dropdown
  const dialogBounds = await page.evaluate(() => {
    const purpose = [...document.querySelectorAll('label, span, div')]
      .find(el => el.textContent?.trim() === 'Purpose');
    if (!purpose) return null;
    let container = purpose;
    for (let i = 0; i < 15; i++) {
      container = container.parentElement;
      if (!container) break;
      const rect = container.getBoundingClientRect();
      const bg = window.getComputedStyle(container).backgroundColor;
      if (rect.width > 400 && rect.height > 200 && bg.includes('255')) {
        return { x: rect.x, y: rect.y, w: rect.width, h: rect.height };
      }
    }
    return null;
  });

  // Check for floating dropdown options
  const dropdownMenu = await page.evaluate(() => {
    const options = document.querySelectorAll('[role="option"], [role="listbox"] li');
    if (options.length === 0) return null;
    let minY = 9999, maxY = 0, minX = 9999, maxX = 0;
    options.forEach(o => {
      const rect = o.getBoundingClientRect();
      if (rect.width > 50) {
        minY = Math.min(minY, rect.y);
        maxY = Math.max(maxY, rect.y + rect.height);
        minX = Math.min(minX, rect.x);
        maxX = Math.max(maxX, rect.x + rect.width);
      }
    });
    return minY < 9999 ? { x: minX, y: minY, w: maxX - minX, h: maxY - minY } : null;
  });
  console.log('  Dialog:', dialogBounds);
  console.log('  Dropdown options:', dropdownMenu);

  if (dialogBounds) {
    const pad = 16;
    let clipTop = dialogBounds.y - pad;
    let clipBottom = dialogBounds.y + dialogBounds.h + pad;
    let clipLeft = dialogBounds.x - pad;
    let clipRight = dialogBounds.x + dialogBounds.w + pad;

    if (dropdownMenu) {
      clipBottom = Math.max(clipBottom, dropdownMenu.y + dropdownMenu.h + pad);
      clipLeft = Math.min(clipLeft, dropdownMenu.x - pad);
      clipRight = Math.max(clipRight, dropdownMenu.x + dropdownMenu.w + pad);
    }

    await snap('email-lead-send-details-v2-raw.png', {
      x: clipLeft,
      y: clipTop,
      width: clipRight - clipLeft,
      height: clipBottom - clipTop,
    });
  }
} else {
  console.log('  ERROR: Continue button not found');
}

await browser.close();
console.log('\n✓ Done.');
