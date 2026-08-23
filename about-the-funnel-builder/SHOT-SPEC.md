# Shot Spec — about-the-funnel-builder (Analytics per-page drill-down addition, 2026-08-24)

One new shot for the **Analytics** section (coverage-matrix row `funnel-analytics`, partial: the section documented the panel's stats and section-by-section drop-off list, but not the per-page drill-down you get by expanding a section). Existing images/placeholders elsewhere in the article are untouched.

Route: **Studio → Funnel** (`https://staging.app.franchisesystems.ai/studio/funnel`), click the **Analytics** icon in the toolbar.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Analytics panel, a section expanded into its page-by-page breakdown | Open the Analytics panel, then click the **Pre-Qualify** row (or Application/Compliance/FDD Request) in the "Funnel by section" list to expand it. Capture the row expanded, showing its numbered pages with view counts and the "N left here" drop-off tag. | arrow on the section name | `funnel-analytics-page-drilldown.png` | ~840 CSS |

## Notes for Max

- Verified live 2026-08-24 on the Circada test brand: expanding **Pre-Qualify** shows `1. Quick check` with a "109 left here" drop-off tag next to its view bar. Only Pre-Qualify, Application, Compliance, and FDD Request expand (they carry the click affordance + chevron); Book a Call and Resources don't, since they're single-page steps with nothing to drill into.
- Frame it the same as the panel's existing overview shot: the "Funnel by section" list with one row expanded, chevron pointing down on that row. Crop to the Analytics panel only.
- If the test brand has too little traffic to show a meaningful bar, any section with at least one page row and one drop-off count works — the point is showing the expand affordance and the per-page rows, not specific numbers.
- Run `dom-sanitize.js` before capture if any real lead names/emails are visible in the panel (shouldn't be, this view is aggregate stats only).

---

# Shot Spec — about-the-funnel-builder (FDD qualifiers + Branch routing addition, 2026-08-24)

Two new shots for the **Qualification logic** section (coverage-matrix row `funnel-compliance-fdd-sections`, partial: the section documented Pre-qualify and Application-qualify but not the FDD Auto-Qualifiers / FDD Disqualifiers rule groups or the Branch Routing selectors below them). No new shot needed for the Compliance section's **Add disclosure questions** button — it's already visible in the existing `funnel-structure-panel-scrolled.png`, and the article now calls it out in prose against that image. Existing images/placeholders elsewhere in the article are untouched.

Route: **Studio → Funnel** (`https://staging.app.franchisesystems.ai/studio/funnel`), click the **Logic** icon in the toolbar, then scroll the panel down past Application-qualify.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Logic panel scrolled to FDD Auto-Qualifiers and FDD Disqualifiers | Open the Logic panel, scroll past Pre-qualify and Application-qualify so both **FDD Auto-Qualifiers** and **FDD Disqualifiers** headers are visible, each with at least one rule row (leave the Circada test brand's existing rules in place). Capture the panel only. | none | `funnel-logic-fdd-qualifiers.png` | ~840 CSS |
| 2 | Logic panel scrolled to Branch routing | Scroll further down to the **Branch routing** section: the four selectors (Compliance / FDD Request / Book A Call / Resources) and the **Qualified path** / **Needs review path** previews beneath them. Capture the panel only. | none | `funnel-logic-branch-routing.png` | ~840 CSS |

## Notes for Max

- Verified live 2026-08-24 on the Circada test brand. Exact panel copy: FDD Auto-Qualifiers = "Applicants who meet these get the FDD automatically. Leave empty to hold every request for a rep to approve." (AND chain, same as Pre-qualify/Application-qualify). FDD Disqualifiers = "If any match, the FDD is held for a rep to approve instead." (the one OR chain in the panel).
- Branch routing selectors are all `<select>` elements: **Qualified only**, **Needs review only**, **Both paths**. On Circada they currently read Compliance = Qualified only, FDD Request = Needs review only, Book A Call = Qualified only, Resources = Both paths — any real values are fine, the shot just needs to show the four selectors and the two path-preview chip rows underneath.
- No cursor needed on either shot — both are read-only panel states, not something the reader clicks.
- Skip DOM sanitization here; the Logic panel shows only question text and rule config, no lead PII.

---

# Shot Spec — about-the-funnel-builder (Theme, Automations, Team chat additions, 2026-08-24)

One new shot for the new **Theme** section (coverage-matrix row `studio-funnel`, stale: the article never covered the Theme, Automations, or Team chat panels that now sit in the builder's toolbar alongside Details, Logic, and Analytics). The article's Automations and Team chat sections stay text-only and cross-reference *[How to Set Up Funnel Automations]* and existing screenshots elsewhere, so no new shots are needed for those two. The header/Publish/save-status rewrite in the "Details, saving, and publishing" section also needed no new shot — `funnel-builder-full-view.png` (the article's lead image) and `funnel-details-panel.png` already show the current header (save-status pill, Publish/Published button) and Details panel accurately; both were reshot recently and are current, verified against `BuilderHeader.tsx` and `DetailsPanel.tsx` on origin/master. Existing images/placeholders elsewhere in the article are untouched.

Route: **Studio → Funnel** (`https://staging.app.franchisesystems.ai/studio/funnel`), click the **Theme** icon in the toolbar (palette icon, between Logic and Automations).

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Theme panel open, Appearance and Colors sections visible | Open the Theme panel. Leave it on the default **Appearance** tab (Mode/Pattern/Background image) scrolled down just enough that the **Colors** section's Accent swatch grid is also visible. Capture the panel only. | none | `funnel-theme-panel.png` | ~840 CSS |

## Notes for Max

- Verified live 2026-08-24 on the Circada test brand via agent fallback capture (Max unavailable): the Theme panel has 6 tabs at the top — Appearance, Colors, Text, Buttons, Forms, Brand — plus a Container tab and a Reset link. Appearance holds Mode (Light/Dark), Pattern (Burst/None/Grain/Grid/Dots/Fade/Vintage/Glow/Mesh/Aurora swatches), Pattern opacity, and Background image (None/Dawn/Ocean/Forest/Dusk presets, or a pasted URL) with a Darken-for-readability slider. Colors starts with an Accent swatch grid.
- This is a read-only capture, nothing needs clicking or hovering, so no cursor.
- Frame it like the Details/Analytics panel shots: the floating panel only, not the full builder chrome behind it.
- Skip DOM sanitization; the Theme panel shows only style controls, no lead or brand PII.
