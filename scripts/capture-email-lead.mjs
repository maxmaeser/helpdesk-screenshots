import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const ARTICLE = 'how-to-email-a-lead-directly';
const RAW = `${ROOT}/${ARTICLE}/raw`;
mkdirSync(RAW, { recursive: true });

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
  const path = `${RAW}/${name}`;
  await page.screenshot({ path, clip, scale: 'device' });
  console.log(`  SNAP ${name} (${Math.round(clip.width)}x${Math.round(clip.height)} CSS → ${Math.round(clip.width * 2)}x${Math.round(clip.height * 2)} raw)`);
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

async function openLeadDetail() {
  await page.goto(`${STAGING}/sales`, { timeout: 60000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await prep();
  await page.getByText('Joshua Raidin', { exact: false }).first().click();
  await page.waitForTimeout(3000);
  await prep();
}

async function clickThreeDotMenu() {
  const btnPos = await page.evaluate(() => {
    let best = null;
    document.querySelectorAll('button').forEach(btn => {
      const rect = btn.getBoundingClientRect();
      const hasSvg = btn.querySelector('svg') !== null;
      const isEmpty = btn.textContent?.trim() === '';
      if (hasSvg && isEmpty && rect.y > 60 && rect.y < 130 && rect.x > 1000 && rect.width < 50) {
        if (!best || rect.x > best.x) {
          best = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        }
      }
    });
    return best;
  });
  if (!btnPos) throw new Error('Three-dot menu not found');
  await page.mouse.click(btnPos.x, btnPos.y);
  await page.waitForTimeout(1000);
  await prep();
  return btnPos;
}

async function openSendEmailModal() {
  await clickThreeDotMenu();
  const sendEmail = page.getByText('Send Email').first();
  await sendEmail.waitFor({ state: 'visible', timeout: 3000 });
  await sendEmail.click();
  await page.waitForTimeout(3000);
  await prep();
}

// ══════════════════════════════════════════════════════════════
// IMAGE 1: email-lead-menu
// ══════════════════════════════════════════════════════════════
console.log('\n═══ IMAGE 1: email-lead-menu ═══');
await openLeadDetail();
await clickThreeDotMenu();

// Get dropdown menu items only (the ones inside the popover: Log Activity, Send FDD, Send Email, Lock Portal, Download PDF)
const dropdownItems = await page.evaluate(() => {
  const items = [];
  const known = ['Log Activity', 'Send FDD for signature', 'Send Email', 'Lock Portal', 'Download PDF'];
  document.querySelectorAll('button, a, [role="menuitem"]').forEach(el => {
    const text = el.textContent?.trim();
    if (known.some(k => text?.includes(k))) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        items.push({ text, x: rect.x, y: rect.y, w: rect.width, h: rect.height });
      }
    }
  });
  return items;
});
console.log('  Dropdown items:');
dropdownItems.forEach(d => console.log(`    "${d.text}" x=${d.x.toFixed(0)} y=${d.y.toFixed(0)} w=${d.w.toFixed(0)} h=${d.h.toFixed(0)}`));

// Hover "Send Email" for highlight
await page.getByText('Send Email').first().hover();
await page.waitForTimeout(300);

if (dropdownItems.length > 0) {
  const minX = Math.min(...dropdownItems.map(d => d.x));
  const minY = Math.min(...dropdownItems.map(d => d.y));
  const maxX = Math.max(...dropdownItems.map(d => d.x + d.w));
  const maxY = Math.max(...dropdownItems.map(d => d.y + d.h));

  // Include: lead name header (starts around y=80) + three-dot button area + dropdown
  // Detail panel starts around x=400 (after sidebar)
  // Lead name "Joshua Raidin" is around x=430
  const clipX = 400; // include lead name
  const clipY = 75;  // panel header
  const clipRight = maxX + 20;
  const clipBottom = maxY + 20;

  await snap('email-lead-menu-raw.png', {
    x: clipX,
    y: clipY,
    width: clipRight - clipX,
    height: clipBottom - clipY,
  });
}

// ══════════════════════════════════════════════════════════════
// IMAGE 2: email-lead-template
// ══════════════════════════════════════════════════════════════
console.log('\n═══ IMAGE 2: email-lead-template ═══');

// Click Send Email
await page.getByText('Send Email').first().click();
await page.waitForTimeout(3000);
await prep();

// Click Use Template
await page.getByText('Use Template').first().click();
await page.waitForTimeout(3000);
await prep();

// Click "Fast Track Email" template to show preview
await page.getByText('Fast Track Email').first().click();
await page.waitForTimeout(2000);
await prep();
await ref('img2-with-preview');

// The template picker is a full-screen overlay (0-1280 x ~112-787)
// Template list is on the left (~0-240), preview on the right
// Capture from x=0 with 840px width to get list + preview
// Also, capture the header area
const tpHeader = page.getByText('Send Email').first();
const tpBox = await bbox(tpHeader, 'Template header');
const headerY = tpBox ? Math.max(0, tpBox.y - 20) : 90;

await snap('email-lead-template-raw.png', {
  x: 0,
  y: headerY,
  width: 840,
  height: 500,
});

// ══════════════════════════════════════════════════════════════
// IMAGE 3: email-lead-compose
// ══════════════════════════════════════════════════════════════
console.log('\n═══ IMAGE 3: email-lead-compose ═══');

// Navigate fresh
await openLeadDetail();
await openSendEmailModal();

// Click Compose Email
await page.getByText('Compose Email').first().click();
await page.waitForTimeout(3000);
await prep();
await ref('img3-compose');

// Compose editor is also a full-screen overlay
// Editor on left, blocks panel on right
const ceHeader = page.getByText('Send Email').first();
const ceBox = await bbox(ceHeader, 'Compose header');
const ceHeaderY = ceBox ? Math.max(0, ceBox.y - 20) : 90;

await snap('email-lead-compose-raw.png', {
  x: 0,
  y: ceHeaderY,
  width: 840,
  height: 500,
});

// ══════════════════════════════════════════════════════════════
// IMAGE 4: email-lead-send-details
// ══════════════════════════════════════════════════════════════
console.log('\n═══ IMAGE 4: email-lead-send-details ═══');

// Type subject and body so Next button is enabled
const subjectInput = page.locator('input').first();
const sjBox = await bbox(subjectInput, 'Subject input');
if (sjBox) {
  // Find the actual subject input in the compose editor (near the top of the editor)
  const inputs = await page.evaluate(() => {
    return [...document.querySelectorAll('input[type="text"], input:not([type])')].map(el => {
      const rect = el.getBoundingClientRect();
      return {
        placeholder: el.placeholder,
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.width),
      };
    }).filter(el => el.w > 100 && el.y > 100);
  });
  console.log('  Inputs:', inputs);
}

// Type in editor
const editor = page.locator('.ProseMirror, [contenteditable="true"]').first();
const edBox = await bbox(editor, 'Editor');
if (edBox) {
  await editor.click();
  await page.keyboard.type('Hello Joshua, thank you for your interest in our franchise opportunity.');
  await page.waitForTimeout(500);
}

// Click Continue/Next
const continueBtn = page.getByRole('button', { name: /continue|next/i }).first();
const cbBox = await bbox(continueBtn, 'Continue button');
if (cbBox) {
  await continueBtn.click();
  await page.waitForTimeout(3000);
  await prep();
  await ref('img4-send-details');

  // The send details is a smaller centered dialog
  // Measure it via the Purpose label
  const purposeLabel = page.getByText('Purpose').first();
  const pBox = await bbox(purposeLabel, 'Purpose label');

  // Find the dialog container
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
  console.log('  Dialog bounds:', dialogBounds);

  if (dialogBounds) {
    // Add some padding around the dialog
    const pad = 16;
    await snap('email-lead-send-details-raw.png', {
      x: Math.max(0, dialogBounds.x - pad),
      y: Math.max(0, dialogBounds.y - pad),
      width: dialogBounds.w + pad * 2,
      height: dialogBounds.h + pad * 2,
    });
  }
} else {
  console.log('  WARN: Continue button not found');
  await ref('img4-debug');
}

await browser.close();
console.log('\n✓ All captures complete.');
