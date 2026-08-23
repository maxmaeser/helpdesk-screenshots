# Shot spec: Your Notification Settings

Franchisee Portal, staging (`https://staging-applicant-portal.netlify.app/`), Lumon Fresh brand, logged in as Creed Smith. Verified live via `screenshots/scripts/capture/session.js` (portal context) + `routes.js` `resolvePortal('NOTIFICATION_PREFERENCES')` → `/settings/notifications`.

Target crop ~840 CSS px width (1680 raw px at 2x). No product-tour overlay appeared on this run; none to dismiss.

| # | Shot | UI state | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Notifications panel (bell icon) | Click the bell icon in the top bar to open the notifications panel; a few "New"-tagged task alerts visible | arrow on the bell icon | `notif-inbox-panel.png` | ~840 CSS |
| 2 | Settings left panel, Notification Preferences | On `/settings/notifications`, capture the small left-hand panel showing avatar, name, email, and the **Profile Details** / **Notification Preferences** links, with **Notification Preferences** in its active/bold state | arrow on **Notification Preferences** | `notif-settings-nav.png` | ~500 CSS (narrow panel, include surrounding page context) |
| 3 | Notification Preferences table | Full table: Notification / Notify Me In-App / Notify Me By Email columns, default toggle states, top ~10-12 rows visible (New Chat Messages through Vendor Setup Status Changed is plenty; don't need all 24 rows in frame) | none (read-only view) | `notif-preferences-table.png` | ~1050 CSS (wide table, crop to the three columns, no need to scroll to bottom) |

## Notes

- Reached via: click your avatar at the bottom of the sidebar → **Settings** → **Notification Preferences** in the left panel. **Profile Details** is the default tab that loads first.
- The In-App and Email switches are independent radio-style toggles per row (not a single on/off), confirmed live: toggling one side does not affect the other, and the choice applies immediately, no save button, no confirmation toast observed.
- 24 notification types total on this account; the article groups them by category rather than listing all 24, so shot 3 does not need to show the full scrolled list, the first dozen or so rows make the point.
- Shot 1 (bell panel) supports the article's "Where notifications land" section, distinct from the fp-settings-notifications preferences page itself, if a separate "Your Notifications" (bell) article gets written later there will be some visual overlap with this shot, that's expected and fine.
- DOM sanitization not required for these three shots: no real customer PII visible (Creed Smith is the standing staging test persona used across franchisee portal articles), and no dates/activity feed content in frame that needs freshening.
