# Shot Spec — How to Track Funnel Progress on a Lead

Route: `Sales → Pipeline` (staging: `/sales`, Leads tab, default). The Step column and funnel progress rail only render for brands on the **funnel** surface. On staging, select the **Circada** brand (or another funnel-surface brand) via the multi-brand selector, not a portal-surface brand like Staging Test Brand or Lumon Fresh, or the Step column and rail will not appear. Dismiss any product-tour overlay (`[class*="tour-"]`, Escape or "Maybe Later") before every shot.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Leads table with Step column | On a funnel-surface brand's **Sales → Pipeline**, Leads tab. Crop to the Name / Status / Step columns (hide or scroll past Email/Verification/Phone if the table runs wide). Ideally 2-3 rows with different Step values/dot colors (e.g. one gray "Not started", one blue mid-funnel step, one green "Booked a call" or finished step) so all three dot colors are visible. | none (table view) | `leads-table-step-column.png` | ~840-1050 CSS |
| 2 | Lead panel, mid-funnel progress rail | Click a lead that has started the funnel but not finished (a blue in-progress Step in the table). Open their detail panel on the **Details** tab. Frame the header badges through the rail and its caption/button row, showing the branch fork (Qualified / Needs review lanes), the "Stopped at [step]" caption, and the **Send resume link** button. | none (read-only view) | `lead-panel-progress-rail-instep.png` | ~840 CSS |
| 3 | Lead panel, completed progress rail | Click a lead who finished the funnel (green "Booked a call" or similar Step in the table). Same framing as shot 2: header badges through the rail and caption. The resume-link button should be absent (lead is done, nothing to resume into). | none (read-only view) | `lead-panel-progress-rail-booked.png` | ~840 CSS |

Notes for Max:
- Staging's Circada brand (filter by the "Funnel" toggle at the top of the multi-brand selector, or search brands for "Circada") has a small set of funnel test leads as of 2026-08-24 that already cover all three states: a "Not started" lead, a "Pre-Qualify" (blue, mid-funnel, stalled) lead, and a "Resources" step lead whose journey ended in "Booked a call" (green). Those three are fine to shoot as-is.
- Sanitize any real email addresses in the Email column for shot 1 per the standard DOM-sanitize pass; the seed leads use `max+funneltest@franchisesystems.ai`-style addresses which should still be swept.
- If Circada's leads change, any funnel-surface brand with at least one stalled (blue) and one finished (green) lead works for shots 2 and 3.
