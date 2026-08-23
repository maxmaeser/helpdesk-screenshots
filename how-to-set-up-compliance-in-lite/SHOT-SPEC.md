# Shot Spec: How to Set Up Compliance in Lite

Source page for all 3 shots: **Sales → Compliance** (`/territories`). Dismiss the Spadea Lignana partnership banner if it's open (hover the X, "Dismiss forever" or just crop above the map so it's out of frame). Crop to the left panel column (~840 CSS px), not the map.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | State detail panel, FDD card | On the **States** tab, click a state row to open its detail panel. Panel shows the **Franchise Disclosure Document** card. Prefer a state with no FDD set yet (card reads "No FDD Document has been set yet" with a **Select Document** button) if one exists in this brand's data; otherwise capture as-is with **View Document** / **Replace Document** showing | arrow on **Select Document** (or **Replace Document** if that's what's showing) | `compliance-state-fdd-card.png` | ~840 CSS |
| 2 | Set Status menu open | On the **States** tab, check 2 state checkboxes. The bulk action bar appears at the bottom of the list ("N selected", **Set Status**, **Assign FDD**). Click **Set Status** to open its dropdown showing **Actively Franchising** / **Not Actively Franchising** | arrow on the **Set Status** trigger button | `compliance-set-status-menu.png` | ~840 CSS |
| 3 | FDDs tab, expanded action icons | Select the **FDDs** tab. Click the FDD row under **Active FDDs** to expand it. This reveals 4 action icons: view, **Attach states** (flag), **Replace document** (circular arrow), and **Prepare eSignature** (pencil, may read "Change eSignature Preparation" if already prepared) | arrow on the pencil icon | `compliance-fdd-action-icons.png` | ~840 CSS |

Notes:
- All 3 shots map 1:1 to the article's 3 H3 sections (Upload your FDD / Mark your franchising states / Prepare your FDD for e-signature).
- No real applicant/lead PII appears on this page (state and FDD-document data only), but run the usual sanitize pass if any email/phone shows up in a governing-agency field.
- If DOM sanitization or product-tour overlays appear, dismiss `[class*="tour-"]` elements first.
