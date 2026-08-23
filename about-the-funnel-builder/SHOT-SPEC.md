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
