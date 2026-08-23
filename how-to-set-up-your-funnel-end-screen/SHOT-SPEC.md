# Shot Spec — How to Set Up Your Funnel End Screen

Route: `Studio → Funnel` (staging: `/studio/funnel`). Requires a funnel-surface brand: use **Circada** via the multi-brand selector (portal-surface brands like Staging Test Brand / Lumon Fresh don't have a funnel builder at all). Click **Resources**, the last item in the Structure panel, to open the end screen editor. Dismiss any product-tour overlay (`[class*="tour-"]`, Escape or "Maybe Later") before every shot.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Resources editor, Qualified version | With Resources open, the **Qualified** pill is selected by default. Frame the live preview from the "Locked structure" badge down through the Qualified/Needs review pill, the Icon row (Confetti/Rising Stars/Balloons/Streamers/None), the success icon, and the title/subtitle text. Crop tight to the preview card, Structure panel not required. | none (read-only view) | `resources-editor-qualified.png` | ~840 CSS |
| 2 | Resources editor, Needs review version | Click the **Needs review** pill. Same framing as shot 1, showing the different title ("Application received") and subtitle text that appears for this version. | none (read-only view) | `resources-editor-needs-review.png` | ~840 CSS |
| 3 | Resource cards with Replace/Remove | Scroll to the row of resource cards below the title/subtitle. Hover the first card so its **Replace** and **Remove** buttons are visible, and make sure the **From Library** / **Upload** buttons at the bottom are in frame. | arrow on "Replace" of the first card | `resources-cards-hover.png` | ~840 CSS |

Notes for Max:
- Circada's Resources step ships with 3 example cards as of 2026-08-24 ("2026 Marketing Playbook", "Site Selection & Setup Guide", "Platform Walkthrough"). Fine to shoot as-is, no PII involved.
- Don't click **Save** after switching pills or hovering cards. These are unsaved-state views only; leaving the tab without saving discards them cleanly, so no cleanup needed afterward.
- If Circada's copy or icon selection has changed since 2026-08-24, shoot whatever text and icon are actually live rather than matching the exact strings named above.
