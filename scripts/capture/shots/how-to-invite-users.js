/**
 * Shot spec: how-to-invite-users  (brand dashboard, Settings > Organization > Members)
 *
 * Reshoot lineage: original Apr 2026 -> v2 2026-08-14 (invite flow rebuilt
 * 2026-07-22: old "Team Admins" card + "Invite Team Member" modal are gone,
 * replaced by OrganizationSettingsTeam.tsx / OrganizationSettingsInviteModal.tsx)
 * -> re-verified 2026-08-25 by this spec.
 *
 * Both shots live on ONE route; the modal is reached by a single click, so
 * neither needs seeded data or a query-param deep link.
 *
 *   node ../shoot.js shots/how-to-invite-users.js --out /tmp/shots
 */

const MEMBERS_SECTION = '?section=organization-members';

/** Framing is inherited from the v2 raws so the house style does not drift:
 *  Members card header + toolbar + first 3 rows, raw-relative (no crop field). */
const MEMBERS_CLIP = { x: 448, y: 168, width: 1024, height: 340 };

module.exports = {
  surface: 'brand',
  article: 'how-to-invite-users',

  shots: [
    {
      file: 'invite-nav-members-v2.png',
      url: (r) => r.resolve('SETTINGS_ORGANISATION') + MEMBERS_SECTION,
      ready: 'text=Invite members',
      settle: 2500,
      clip: MEMBERS_CLIP,
      // Staging personas are already *.example.com, but run anyway: the member
      // list is live data and a real address can appear at any time.
      // freshenDates MUST be false -- see the note on the modal shot.
      sanitize: {
        emails: '{first}.{last}@example.com',
        phones: '(720) 555-0142',
        freshenDates: false,
      },
    },

    {
      file: 'invite-modal-v2.png',
      url: (r) => r.resolve('SETTINGS_ORGANISATION') + MEMBERS_SECTION,
      ready: 'text=Invite members',
      settle: 2500,
      // One sample chip so the form reads as in-progress rather than empty,
      // then blur so no focus ring shows (matches the v2 revision's intent).
      prepare: async (page) => {
        await page.getByRole('button', { name: /invite members/i }).first().click();
        await page.waitForSelector('[role=dialog]', { timeout: 15000 });
        await page.waitForTimeout(800);
        const email = page
          .locator('[role=dialog] input[type="email"], [role=dialog] input[type="text"]')
          .first();
        await email.click();
        await email.type('team@example.com', { delay: 20 });
        await email.press('Enter');
        await page.waitForTimeout(600);
        await page.evaluate(() => document.activeElement && document.activeElement.blur());
        await page.waitForTimeout(400);
      },
      // Dialog bounding box + 40px so the darkened page backdrop reads as page
      // context, per the framing standard.
      clip: { selector: '[role=dialog]', pad: 40 },
      // The member rows behind the dimmed backdrop fall inside the +40px pad,
      // so emails still have to be scrubbed here.
      //
      // freshenDates: false is LOAD-BEARING. dom-sanitize's default remaps any
      // "<n> <unit>" onto a recency ladder, and this dialog's footer contains
      // PRODUCT COPY with a duration in it -- "Invites are valid for 7 days".
      // With the default on, the 2026-08-14 capture shipped a final reading
      // "valid for 1 week", contradicting the article body. Never freshen dates
      // on a shot whose frame contains a product string with a duration.
      sanitize: {
        emails: '{first}.{last}@example.com',
        phones: '(720) 555-0142',
        freshenDates: false,
      },
    },
  ],
};
