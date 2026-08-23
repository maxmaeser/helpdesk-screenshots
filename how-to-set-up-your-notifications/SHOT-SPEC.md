# Shot Spec — How to Set Up Your Notifications (edit pass, 2026-08-24)

Notifications settings was rebuilt to the new grouped-card design (fsai-codebase
`bd9f760d6`, Aug 21). The old flat-table shot (`notifications-table.png`) is
stale and should be replaced by the shot below. `notifications-profile-menu.png`
is unaffected by the redesign and stays as-is (already referenced in the
article with its real URL, no recapture needed).

URL: `https://staging.app.franchisesystems.ai/settings/notifications` (profile
picture → Settings → under Account, Notifications page).

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Applicants & Sales group card, grouped layout | On the Notifications page, scroll so the **Applicants & Sales** card is fully in view: its "All Applicants & Sales" master row (In-App/Email column headers + master toggle) at top, plus at least the first 5-6 individual event rows below it (FDD Signed, FDD Viewed, Applicant Sends a Chat Message, etc.). No dropdown/menu to open, this is a static state — just make sure the group has a realistic mix of on/off toggles so the master row shows its dash (partial) state rather than a plain check, since that's the detail worth showing. Crop tight to the card, not the sidebar. | none (read-only state, no cursor per the skip-it rule) | `notifications-group-card.png` | ~840 CSS |

Replaces: `notifications-table.png` (delete after the new shot lands and the
`-git.md` is reassembled; do not delete before, the current `-git.md` still
points at it).
