/**
 * Shot spec: how-to-invite-users-clip -- full-viewport raws for the Invite Users
 * walkthrough clip (no clip field anywhere; sidebar + page both visible).
 * Never clicks Send invite; never submits.
 */
const MEMBERS_SECTION = '?section=organization-members';
const SAN = { emails: '{first}.{last}@example.com', phones: '(720) 555-0142', freshenDates: false };
const DLG = '[role=dialog]';
const EMAIL = { role: 'textbox', name: 'Emails', within: DLG };

async function openDialog(page) {
  await page.getByRole('button', { name: /invite members/i }).first().click();
  await page.waitForSelector(DLG, { timeout: 15000 });
  await page.waitForTimeout(800);
}
const emailInput = (page) =>
  page.locator(`${DLG} input[type="email"], ${DLG} input[type="text"]`).first();
async function blur(page) {
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.waitForTimeout(300);
}
async function typeEmail(page, commit) {
  const e = emailInput(page);
  await e.click();
  await e.type('alex.rivera@example.com', { delay: 20 });
  if (commit) { await e.press('Enter'); await page.waitForTimeout(600); }
}
const ROLE_BTN = 'div:has(> label:text-is("Role")) > button[aria-haspopup="listbox"]';

module.exports = {
  surface: 'brand',
  article: 'how-to-invite-users-clip',
  shots: [
    {
      file: 'iu-clip-01-settings.png',
      url: (r) => r.resolve('SETTINGS_ORGANISATION'),
      ready: 'text=Members',
      settle: 2500,
      callouts: [
        { step: 1, label: 'Open Members', side: 'right',
          target: { role: 'link', name: 'Members', exact: true } },
      ],
      sanitize: SAN,
    },
    {
      file: 'iu-clip-02-members.png',
      url: (r) => r.resolve('SETTINGS_ORGANISATION') + MEMBERS_SECTION,
      ready: 'text=Invite members',
      settle: 2500,
      callouts: [
        { step: 2, label: 'Click Invite Members', side: 'left',
          target: { role: 'button', name: 'Invite members', exact: true } },
      ],
      sanitize: SAN,
    },
    {
      file: 'iu-clip-03-dialog.png',
      url: (r) => r.resolve('SETTINGS_ORGANISATION') + MEMBERS_SECTION,
      ready: 'text=Invite members',
      settle: 2500,
      prepare: async (page) => { await openDialog(page); await blur(page); },
      callouts: [{ step: 3, label: 'Add Each Email', side: 'above', target: EMAIL }],
      sanitize: SAN,
    },
    {
      file: 'iu-clip-04-typed.png',
      url: (r) => r.resolve('SETTINGS_ORGANISATION') + MEMBERS_SECTION,
      ready: 'text=Invite members',
      settle: 2500,
      prepare: async (page) => { await openDialog(page); await typeEmail(page, false); },
      callouts: [{ step: 3, label: 'Add Each Email', side: 'above', target: EMAIL }],
      sanitize: SAN,
    },
    {
      file: 'iu-clip-05-role-open.png',
      url: (r) => r.resolve('SETTINGS_ORGANISATION') + MEMBERS_SECTION,
      ready: 'text=Invite members',
      settle: 2500,
      prepare: async (page) => {
        await openDialog(page);
        await typeEmail(page, true);
        await page.locator(`${DLG} ${ROLE_BTN}`).click();
        await page.waitForSelector('[role=option]', { timeout: 10000 });
        await page.waitForTimeout(500);
      },
      callouts: [{ step: 4, label: 'Choose A Role', side: 'right',
        target: { role: 'option', name: /^Admin/ } }],
      sanitize: SAN,
    },
    {
      file: 'iu-clip-06-role-set.png',
      url: (r) => r.resolve('SETTINGS_ORGANISATION') + MEMBERS_SECTION,
      ready: 'text=Invite members',
      settle: 2500,
      prepare: async (page) => {
        await openDialog(page);
        await typeEmail(page, true);
        await page.locator(`${DLG} ${ROLE_BTN}`).click();
        await page.waitForSelector('[role=option]', { timeout: 10000 });
        await page.getByRole('option', { name: /^Admin/ }).click();
        await page.waitForTimeout(700);
        await blur(page);
      },
      callouts: [{ step: 5, label: 'Click Send Invite', side: 'above',
        target: { role: 'button', name: 'Send invite', exact: true, within: DLG } }],
      sanitize: SAN,
    },
  ],
};
