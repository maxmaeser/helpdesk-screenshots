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
  // Clamp clip to viewport bounds
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

async function openLeadDetail() {
  await page.goto(`${STAGING}/sales`, { timeout: 60000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await prep();
  await page.getByText('Joshua Raidin', { exact: false }).first().click();
  await page.waitForTimeout(3000);
  await prep();
}

async function clickThreeDotAndSendEmail() {
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
}

// ══════════════════════════════════════════════════════════════
// IMAGE 2: email-lead-template - wider to include full preview
// ══════════════════════════════════════════════════════════════
console.log('\n═══ IMAGE 2: email-lead-template ═══');
await openLeadDetail();
await clickThreeDotAndSendEmail();

await page.getByText('Use Template').first().click();
await page.waitForTimeout(3000);
await prep();

await page.getByText('Fast Track Email').first().click();
await page.waitForTimeout(2000);
await prep();

// Capture the full overlay: template list (left) + preview (right)
// From x=0, width=1050 to get both panels, height from header to back/continue buttons
// header ~y=55, continue ~y=772
await snap('email-lead-template-raw.png', {
  x: 0,
  y: 50,
  width: 1050,
  height: 500,
});

// ══════════════════════════════════════════════════════════════
// IMAGE 3: email-lead-compose - wider to include blocks panel
// ══════════════════════════════════════════════════════════════
console.log('\n═══ IMAGE 3: email-lead-compose ═══');
await openLeadDetail();
await clickThreeDotAndSendEmail();

await page.getByText('Compose Email').first().click();
await page.waitForTimeout(3000);
await prep();

// Capture compose: editor (left) + blocks panel (right)
// Same overlay dimensions as template view
await snap('email-lead-compose-raw.png', {
  x: 0,
  y: 50,
  width: 1050,
  height: 500,
});

await browser.close();
console.log('\n✓ Fix captures complete.');
