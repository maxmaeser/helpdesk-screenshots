/**
 * Take spec: invite-users  (brand dashboard, Settings > Organization > Members)
 *
 *   node record.js takes/invite-users.js --dry    # stops before Send 2 invites
 *   node record.js takes/invite-users.js          # films and SENDS two invites
 *
 * Opens on Home, goes to Settings through the profile menu, and sends one
 * batch of two Admin invites with Billing access to
 * walkthrough+invite@example.com and walkthrough+invite2@example.com
 * (example.com only; the 2026-10-18 take sent the first one, approved by Max).
 * Restore: revoke both under Pending invites (tools/clip/invite-users/RESTORE.md).
 *
 * Needs the capture account to be an ADMIN of the Lumon org: as a Member the
 * Members page renders no "Invite members" button (recon 2026-10-18).
 */
const { dressHome } = require('../dress-home.js');
const DLG = '[role=dialog]';
const EMAILS = ['walkthrough+invite@example.com', 'walkthrough+invite2@example.com'];
const ROLE_BTN = 'div:has(> label:text-is("Role")) > button[aria-haspopup="listbox"]';
const PROFILE = { css: 'button[aria-haspopup="menu"][data-menu-trigger][aria-label]' }; // profile picture, bottom of the sidebar
const INVITE_BTN = { role: 'button', name: 'Invite members', exact: true };

module.exports = {
  id: 'invite-users',
  article: 'how-to-invite-users',
  surface: 'brand',
  brand: 'Lumon Cafe',
  // Opens on Home: the brand chip check needs a brand page, so the take starts
  // on Settings Organization and prepare() moves to Home off camera.
  start: (r) => r.resolve('SETTINGS_ORGANISATION'),
  ready: 'text=Members',
  prepare: async (page) => {
    await page.goto(new URL('/', page.url()).href, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Your upcoming meetings', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await dressHome(page); // private inbox and calendar hidden, fictional busy copy on top
  },
  steps: [
    {
      step: 1, label: 'Click your profile picture',
      action: async (rec) => {
        await rec.hold(1500); // pre-roll: the template needs ~3.3 s before the first click
        await rec.click(PROFILE);
        await rec.wait('[role=menuitem] >> text=Settings', 'profile menu open');
        await rec.hold(600);
      },
    },
    {
      step: 2, label: 'Select Settings',
      action: async (rec) => {
        await rec.click({ role: 'menuitem', name: 'Settings', exact: true }, { transition: 'page' });
        await rec.wait('a[href="/settings/organizations?section=organization-members"]', 'settings load');
      },
    },
    {
      step: 3, label: 'Open Members',
      action: async (rec, page) => {
        await rec.click({ role: 'link', name: 'Members', exact: true }, { transition: 'page' });
        await rec.wait(() => page.getByRole('button', { name: 'Invite members', exact: true }).waitFor({ state: 'visible', timeout: 30000 }), 'members section load');
        await rec.result(INVITE_BTN); // top right of the member list
      },
    },
    {
      step: 4, label: 'Click Invite members',
      action: async (rec) => {
        await rec.click(INVITE_BTN, { transition: 'page' });
        await rec.wait(DLG, 'dialog open');
        await rec.hold(500); // let the dialog animation finish before measuring
        await rec.result(DLG);
      },
    },
    {
      step: 5, label: 'Click the Emails field',
      action: async (rec) => {
        await rec.click({ role: 'textbox', name: 'Emails', within: DLG }, { cursor: 'text' });
      },
    },
    {
      step: 6, label: 'Type an email, press Enter',
      action: async (rec, page) => {
        await rec.type({ role: 'textbox', name: 'Emails', within: DLG }, EMAILS[0], { commit: 'Enter' });
        await rec.result(page.locator(DLG).getByText(EMAILS[0], { exact: true })); // the address becomes a chip
      },
    },
    {
      step: 7, label: 'Paste the next email',
      action: async (rec, page) => {
        // Pasted, not typed: while a second address is typed, the guard sanitizer
        // rewrites the half-typed "...@example.co" value (unsafe domain) into a fake
        // address (recon 2026-10-23). insertText lands the whole address at once,
        // which is also how a paste looks.
        await rec.click({ role: 'textbox', name: 'Emails', within: DLG }, { cursor: 'text' });
        await page.keyboard.insertText(EMAILS[1]);
        await rec.hold(700);
        await page.keyboard.press('Enter');
        await rec.result(page.locator(DLG).getByText(EMAILS[1], { exact: true }));
      },
    },
    {
      step: 8, label: 'Open the Role menu',
      action: async (rec) => {
        await rec.click({ css: ROLE_BTN, within: DLG });
        await rec.wait('[role=option]', 'role menu open');
      },
    },
    {
      step: 9, label: 'Choose Admin',
      action: async (rec) => {
        await rec.select({ role: 'option', name: /^Admin/ });
        await rec.hold(400);
        await rec.result({ css: ROLE_BTN, within: DLG });
      },
    },
    {
      step: 10, label: 'Turn on Billing access',
      action: async (rec, page) => {
        await rec.click({ role: 'switch', name: 'Billing access', within: DLG });
        await rec.wait(() => page.locator(`${DLG} [role=switch][aria-checked=true]`).waitFor({ timeout: 5000 }), 'switch on');
        await rec.result({ role: 'switch', name: 'Billing access', within: DLG });
      },
    },
    {
      step: 11, label: 'Click Send 2 invites',
      action: async (rec, page) => {
        await rec.click({ role: 'button', name: 'Send 2 invites', exact: true, within: DLG }, { transition: 'page', write: true });
        await rec.wait(() => page.waitForSelector(DLG, { state: 'detached', timeout: 20000 }), 'invites sent');
        await rec.wait(`text=${EMAILS[1]}`, 'pending invites listed');
        await rec.result(page.getByText(EMAILS[1], { exact: true }), { hold: 3000 }); // listed under Pending invites
      },
    },
  ],
  outro: async (rec) => { await rec.hold(2500); },
};
