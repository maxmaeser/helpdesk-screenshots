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

// Navigate to lead detail
await page.goto(`${STAGING}/sales`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();
await page.getByText('Joshua Raidin', { exact: false }).first().click();
await page.waitForTimeout(3000);
await prep();

// Click three-dot menu → Send Email
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
await page.mouse.click(btnPos.x, btnPos.y);
await page.waitForTimeout(1000);
await page.getByText('Send Email').first().click();
await page.waitForTimeout(3000);
await prep();

// Find the full modal: from "Send Email" header to "Cancel" button
const modalBounds = await page.evaluate(() => {
  // Find the modal header icon (the blue email icon)
  const sendEmailHeaders = [...document.querySelectorAll('h2, h3, [class*="font-semibold"], [class*="font-bold"]')]
    .filter(el => el.textContent?.trim() === 'Send Email');

  // Find Cancel button
  const cancelBtn = [...document.querySelectorAll('button')]
    .find(b => b.textContent?.trim() === 'Cancel');

  // Find the X close button (near Cancel area)
  const closeBtn = [...document.querySelectorAll('button')]
    .find(b => {
      const rect = b.getBoundingClientRect();
      return b.querySelector('svg') && b.textContent?.trim() === '' && rect.y > 200 && rect.y < 400 && rect.x > 400;
    });

  let topY = 9999, bottomY = 0, leftX = 9999, rightX = 0;

  // Get header position
  for (const h of sendEmailHeaders) {
    const rect = h.getBoundingClientRect();
    if (rect.y > 200) { // the one in the modal, not the dropdown
      topY = Math.min(topY, rect.y);
      rightX = Math.max(rightX, rect.x + rect.width);
    }
  }

  // Get Cancel button position
  if (cancelBtn) {
    const rect = cancelBtn.getBoundingClientRect();
    bottomY = Math.max(bottomY, rect.y + rect.height);
    rightX = Math.max(rightX, rect.x + rect.width);
  }

  // Get close button position
  if (closeBtn) {
    const rect = closeBtn.getBoundingClientRect();
    rightX = Math.max(rightX, rect.x + rect.width);
  }

  // Now find the actual dialog container by walking up from a header
  for (const h of sendEmailHeaders) {
    const rect = h.getBoundingClientRect();
    if (rect.y > 200) {
      let container = h;
      for (let i = 0; i < 15; i++) {
        container = container.parentElement;
        if (!container) break;
        const cr = container.getBoundingClientRect();
        // Look for the white dialog box
        if (cr.width > 400 && cr.width < 700 && cr.height > 250) {
          return { x: cr.x, y: cr.y, w: cr.width, h: cr.height };
        }
      }
    }
  }

  // Fallback: use computed bounds
  if (topY < 9999 && bottomY > 0) {
    return { x: 280, y: topY - 30, w: 720, h: bottomY - topY + 60 };
  }
  return null;
});
console.log('  Modal bounds:', modalBounds);

if (modalBounds) {
  const pad = 12;
  await snap('email-lead-choice-raw.png', {
    x: modalBounds.x - pad,
    y: modalBounds.y - pad,
    width: modalBounds.w + pad * 2,
    height: modalBounds.h + pad * 2,
  });
}

await browser.close();
console.log('\n✓ Done.');
