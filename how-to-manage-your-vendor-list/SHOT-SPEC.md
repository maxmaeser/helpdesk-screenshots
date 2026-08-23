# Shot Spec — How to Manage Your Vendor List

Route: `Operations → Vendors` (staging: `/operations/vendors`). Dismiss the "Operations: Vendors" and "Welcome to the Vendor Panel" product-tour modals (**Maybe Later**) before every shot.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Vendors tab, table overview | Land on **Operations → Vendors** (Vendors tab, default). Table showing at least 2-3 real vendor rows with a mix of Usage badges (Required/Recommended/Optional) and Category values populated. Sanitize any real email/phone in the Email/Phone columns. If the table is wider than ~1050px CSS, hide Email/Phone columns via the column-visibility toggle (the eye icon) so Vendor/Usage/Category/Location Assignments stay legible. | none (table view) | `vendors-tab-list.png` | ~840-1050 CSS |
| 2 | Add Vendor form, filled | Open **Actions → Create Vendor**, choose **Manual Entry**. Fill Vendor Name, select at least one Category (so the orange "select a category" warning is gone and real category pills show), select the **Required** Usage pill. Leave Email/Phone/Website blank or use placeholder-safe values. | arrow, hovering the **Required** usage pill | `vendors-create-vendor-form.png` | ~840 CSS |
| 3 | Vendor detail panel, Details tab | Click a vendor row to open its detail panel. Stay on the default **Details** tab so the tab bar (Details, Contacts, Locations Assignments, Manuals, Assets) and the header (logo, name, Usage badge, brand tag) are all visible. | none (read-only view) | `vendor-detail-panel-tabs.png` | ~840 CSS |
| 4 | Assignment Templates tab | Click the **Assignment Templates** tab (next to Vendors). Table showing Name / Vendors Assigned / Created At with at least one real template row, plus the **Create Assignment Template** button visible top-right. | arrow, hovering **Create Assignment Template** | `vendor-assignment-templates-tab.png` | ~840 CSS |

Notes for Max:
- Staging test brand has 3 seed vendors as of 2026-08-23 ("New Vendor", "Vendor B", "Figmaaa") — fine to use as-is, or swap in cleaner names/categories before shooting if the seed data looks too obviously fake.
- Shot 2's warning-orange "Select at least one category..." pill should NOT be visible in the final capture — select a category first so it reads as a normal filled-out form, not an error state.
