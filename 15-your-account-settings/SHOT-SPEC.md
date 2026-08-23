# Shot spec: Your Account Settings

Franchisee Portal, any brand/account. Get there via avatar (bottom of sidebar) → **Settings**, or direct URL `/settings/account`.

Target crop ~840 CSS px width (1680 real px at 2x). Cursor added in post; Max just sets up the real UI state.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Profile Details, default view | Land on **Settings**, **Profile Details** tab selected (it's the default). Avatar photo, Upload New Avatar / Delete Avatar buttons, and the read-only First Name / Last Name / Email / Phone fields all visible. Left panel shows the **Profile Details** / **Notification Preferences** tab list. | none (read-only view) | `account-settings-profile.png` | ~840 CSS |
| 2 | Profile Details, edit mode | Click the pencil icon top-right of the **Profile Details** card. First Name, Last Name, and Phone become bordered text inputs; Email stays plain text (no input box); **Save Changes** and **Cancel** buttons appear top-right. Do not actually save. | arrow on **Save Changes** | `account-settings-edit.png` | ~840 CSS |
| 3 | Notification Preferences tab | Click **Notification Preferences** in the left panel. Table with 3 columns (Notification / Notify Me In-App / Notify Me By Email) and paired Yes/No radio buttons per row. Crop to the top ~10-12 rows, no need to scroll to the bottom of the list. | none (read-only view) | `account-settings-notifications.png` | ~840 CSS |

## Notes for whoever processes these

- Verified live on staging 2026-08-24 via `scripts/capture/session.js` + `routes.js` `resolvePortal('ACCOUNT_SETTINGS')` (Lumon Fresh brand, franchisee session). No product-tour overlay appeared on this page.
- The account used for verification (`max+aspenunited@franchisesystems.ai`, display name "Creed Smith") is fine to leave visible in Max's own capture, or swap for whatever franchisee account he's using: run `dom-sanitize.js` before each screenshot regardless, per standard practice, since the name/email/phone here are real PII fields by design.
- Shot 2's edit mode is reached by clicking the pencil-icon button in the top-right corner of the Profile Details card (not a separate page/route).
- Notification Preferences has ~24 rows total (chat, deals, courses, manuals, vendors, locations, tasks, projects, approvals, learning). Shot 3 only needs the top portion, the article names representative categories rather than every row.
