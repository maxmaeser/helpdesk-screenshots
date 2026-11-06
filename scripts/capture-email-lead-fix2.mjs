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
      let el = h.parentElement;
      for (let i = 0; i < 5; i++) {
        if (!el) break;
        const rect = el.getBoundingClientRect();
        if (rect.width > 200 && rect.height < 100 && rect.height > 30) {
          topY = Math.min(topY, rect.y);
          break;
        }
        el = el.parentElement;
      }
      topY = Math.min(topY, h.getBoundingClientRect().y);
    }
    return topY < 9999 ? topY : null;
  });
}

// ═══ IMAGE 2: Template ═══
console.log('\n═══ IMAGE 2: email-lead-template ═══');
await openLeadAndSendEmail();
await page.getByText('Use Template').first().click();
await page.waitForTimeout(3000);
await prep();
await page.getByText('Fast Track Email').first().click();
await page.waitForTimeout(2000);
await prep();

const tmplTop = await findOverlayTop();
console.log(`  Overlay header top: y=${tmplTop}`);
// 20px above header for a comfortable margin
const tmplY = Math.max(0, (tmplTop || 120) - 20);
await snap('email-lead-template-raw.png', { x: 0, y: tmplY, width: 1050, height: Math.min(500, 900 - tmplY) });

// ═══ IMAGE 3: Compose ═══
console.log('\n═══ IMAGE 3: email-lead-compose ═══');
await openLeadAndSendEmail();
await page.getByText('Compose Email').first().click();
await page.waitForTimeout(3000);
await prep();

const compTop = await findOverlayTop();
console.log(`  Overlay header top: y=${compTop}`);
const compY = Math.max(0, (compTop || 120) - 20);
await snap('email-lead-compose-raw.png', { x: 0, y: compY, width: 1050, height: Math.min(500, 900 - compY) });

await browser.close();
console.log('\n✓ Done.');
