# Shot spec: How to Send a Template from a Lead

Brand: **Lumon Fresh** on `https://staging.app.franchisesystems.ai/`.

Target crop width ~840 CSS px (1680 real px at 2x). Cursor is added in post, so only the UI state matters. Do not press the final **Send Email** button on the details step, that would actually send.

## Captured

| # | Shot | UI state | Cursor | Filename | Status |
|---|---|---|---|---|---|
| 1 | Lead panel actions menu with Send Email visible | Lead panel open, three-dot **Actions** menu open | arrow on **Send Email** | `lead-actions-send-email.png` | done (reprocessed from the approved `how-to-work-a-lead` raw) |

## Outstanding

Resolved 2026-08-14. These shots are captured and committed. The 401 that blocked the 2026-07-22 attempt was never a permissions or endpoint fault: the lead detail panel's request was missing the `X-Session-Type` header, which only a properly bootstrapped session sets, so a fresh headless login produced a session the panel rejected with "You need to sign in to continue / You are not authorized. Please sign in again." while the Leads table behind it loaded fine. Re-logging in could not fix it, which is why six attempts all failed and a second agent reproduced it. Capturing through the persisted session in `scripts/capture/session.js` reuses an already-bootstrapped session and the panel loads normally. Use that harness for any lead-panel shot rather than a fresh scripted login.

Every UI string below was read from `origin/master` at `1a12f1ee1` (`SendEmailToContactModal.tsx`, `ContactPanel.tsx`, `MarketingLeadPanel.tsx`, `constants/scheduling.ts`), so the copy is verified even though the shots are missing.

Capture notes for whoever picks this up:

- Profile name to reuse: `hd-lead-template` (keeps you off other sessions' profiles).
- `~/.config/fsai-capture/login.env` quotes its values. Strip surrounding quotes before filling the form or react-hook-form silently rejects the email and the login never fires.
- Pass `freshenDates: false` to `dom-sanitize.js` on any page showing segment or saved-view names: the default `'auto'` rewrites real UI strings like "No Activity in 7 Days".
- Full-page references belong in `screenshots/_fullpage/brand-dashboard/`.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 2 | Send Email entry step | Lead panel `...` menu, click **Send Email**. Modal opens on "Choose how you'd like to send this email" with the **Use Template** and **Compose Email** cards | arrow on **Use Template** | `send-email-choose-path.png` | ~840 CSS (modal is 704 wide, include the dimmed page around it) |
| 3 | Template list with one selected | On the entry step click **Use Template**, then click a template in the left list so the checkmark appears | hand on the selected template row | `send-email-pick-template.png` | ~880 CSS, crop from the modal's left edge (search box + list + the start of the preview) |
| 4 | Rendered preview | Same state as #3 | none (read-only result) | `send-email-template-preview.png` | ~840 CSS, crop the right-hand preview pane |
| 5 | Details step with the Purpose dropdown open | From #3 click **Continue**, then open the **Purpose** select. Both sales options should be visible: General Sales (Consensual), Sales Newsletter (Consensual). "Email will be sent from:" box and the **Send Immediately** toggle should be in frame | arrow on the **Purpose** field | `send-email-purpose.png` | ~840 CSS |
| 6 | Prospect panel actions menu | **Marketing → Audiences**, click a prospect, open the three-dot **Actions** menu. Only two items: **Send Email** and **Convert To Lead** | arrow on **Send Email** | `prospect-actions-send-email.png` | ~840 CSS |

Optional: `send-email-schedule.png`, the details step with **Send Immediately** toggled off so the **Schedule For** date and time inputs are visible.

## Placement in `how-to-send-a-template-from-a-lead-git.md`

- #1 after the "Open the Send Email window" list (already placed)
- #2 after step 1 of "Choose the template", i.e. put it at the end of that section
- #3 and #4 after the "Choose the template" list
- #5 after the "Set the purpose and send" list
- #6 in "Sending a template from a prospect", after the navigation sentence

Images must sit between blocks, never inside a numbered list: an image mid-list splits the list and the numbering restarts.

Remember: blank line BEFORE each image, none after.
