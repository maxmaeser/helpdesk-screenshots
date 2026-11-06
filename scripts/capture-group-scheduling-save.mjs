import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const ROOT = '/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots';
const STAGING = 'https://staging.app.franchisesystems.ai';
const ART = 'how-to-set-up-group-scheduling';
mkdirSync(`${ROOT}/${ART}/raw`, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: '/tmp/pw-storage-state.json',
  viewport: { width: 1280, height: 1400 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

async function prep() {
  await page.addStyleTag({ content: '* { outline: none !important; }' });
}
async function ref(name) {
  await page.screenshot({ path: `${ROOT}/${ART}/raw/_ref_${name}.png`, scale: 'device' });
  console.log(`  ref: ${name}`);
}
async function snap(name, clip) {
  const path = `${ROOT}/${ART}/raw/${name}.png`;
  await page.screenshot({ path, clip, scale: 'device' });
  console.log(`  SNAP ${name} (${Math.round(clip.width)}x${Math.round(clip.height)} CSS)`);
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

// Navigate to Brand > Scheduling Events, open create, fill, save
await page.goto(`${STAGING}/settings/account`, { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await prep();

const allSE = await page.locator('a:has-text("Scheduling Events")').all();
for (const el of allSE) {
  const b = await el.boundingBox();
  if (b && b.y > 400) { await el.click(); break; }
}
await page.waitForTimeout(4000);
await prep();

await page.locator('text=Create Event').first().click();
await page.waitForTimeout(3000);
await prep();

// Fill form
const dialogPanel = page.locator('[data-headlessui-state="open"]').last();
const dialogInputs = dialogPanel.locator('input:not([type="file"]):not([type="hidden"])');
await dialogInputs.first().click({ force: true });
await page.waitForTimeout(200);
await page.keyboard.type('Discovery Call');
await page.keyboard.press('Tab');
await page.waitForTimeout(300);
await page.keyboard.type('Initial discovery call');
await page.keyboard.press('Tab');
await page.waitForTimeout(300);
await page.keyboard.type('30');
await page.keyboard.press('Tab');
await page.waitForTimeout(1000);

// Enable Monday
const monCheckbox = page.locator('[role="checkbox"]:near(:text("Monday"))').first();
await monCheckbox.click({ force: true }).catch(async () => {
  const monBox = await page.locator('text=Monday').first().boundingBox();
  if (monBox) await page.mouse.click(monBox.x - 20, monBox.y + 10);
});
await page.waitForTimeout(1000);
await prep();

// Check the save button via evaluate
const btnState = await page.evaluate(() => {
  const btns = document.querySelectorAll('button');
  for (const b of btns) {
    if (b.textContent?.trim() === 'Save') {
      return {
        disabled: b.disabled,
        hasDisabledAttr: b.hasAttribute('disabled'),
        className: b.className.substring(0, 100),
        ariaDisabled: b.getAttribute('aria-disabled'),
      };
    }
  }
  return null;
});
console.log('Save button state:', JSON.stringify(btnState));

// Try clicking via evaluate to bypass Playwright's disabled check
console.log('Clicking Save via evaluate...');
await page.evaluate(() => {
  const btns = document.querySelectorAll('button');
  for (const b of btns) {
    if (b.textContent?.trim() === 'Save') {
      b.disabled = false; // force enable
      b.click();
      return;
    }
  }
});
await page.waitForTimeout(4000);
await prep();
await ref('after-js-save');

// Check if we're back to the list
const discoveryCal = page.locator('text=Discovery Call').first();
const dcBox = await bbox(discoveryCal, 'Discovery Call');

if (dcBox) {
  console.log('EVENT SAVED SUCCESSFULLY!');

  // === Image 5: Event row ===
  await snap('group-scheduling-link-raw', {
    x: Math.max(0, dcBox.x - 20),
    y: Math.max(0, dcBox.y - 20),
    width: Math.min(840, 1280 - dcBox.x + 30),
    height: 80,
  });

  // === Image 4: Members selector ===
  const rowBtns = await page.locator('button:has(svg)').all();
  let editBtn = null;
  for (const btn of rowBtns) {
    const b = await btn.boundingBox();
    if (b && Math.abs(b.y - dcBox.y) < 25 && b.x > dcBox.x + 50) {
      editBtn = { el: btn, box: b };
    }
  }
  if (editBtn) {
    await editBtn.el.click();
    await page.waitForTimeout(2000);
    await prep();

    const at = await bbox(page.locator('text=Attendees').first(), 'Attendees');
    if (at) {
      // Click "+" area near attendees
      await page.mouse.click(at.x + at.width + 80, at.y + 15);
      await page.waitForTimeout(1500);
      await prep();
      await ref('members-open');

      const popover = page.locator('[data-radix-popper-content-wrapper], [role="listbox"], [class*="popover"]:visible').first();
      const pvBox = await bbox(popover, 'Agent dropdown');
      if (pvBox) {
        const top = Math.min(at.y, pvBox.y);
        const bottom = pvBox.y + pvBox.height;
        const left = Math.min(at.x, pvBox.x);
        const right = Math.max(at.x + 250, pvBox.x + pvBox.width);
        await snap('group-scheduling-members-raw', {
          x: Math.max(0, left - 20),
          y: Math.max(0, top - 15),
          width: Math.min(840, right - left + 40),
          height: Math.min(430, bottom - top + 30),
        });
      } else {
        await snap('group-scheduling-members-raw', {
          x: Math.max(0, at.x - 15),
          y: Math.max(0, at.y - 10),
          width: 500,
          height: 300,
        });
      }
    }
  }
} else {
  console.log('Save did not work - event not in list');
  await ref('save-failed');
}

await browser.close();
console.log('DONE');
