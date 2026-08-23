# Shot Spec — about-sales-analytics (tab-gating + chart refresh, 2026-08-24)

Row: `sales-analytics-overview` (coverage-matrix, verdict `stale`). The article's
"two tabs: Overview and Portal Steps" claim is wrong: `Analytics.utils.ts`
(`ANALYTICS_TAB_GATES`) now composes tabs per brand. Portal-surface brands get
**Overview / Portal Steps / Emails**; funnel-surface brands get **Leads /
Emails** instead (covered by the separate article *About the Leads Tab*, not
this one). Separately, the Overview charts were rebuilt on `BarLineChart` /
`GeoChart` / `PieChart` from `@fsai/shared-ui` (`ChartCard` → `SectionCard`,
Nivo retired, both `812f6dd2b`, 2026-08-21) — visually different from every
existing screenshot in this folder, all of which predate that swap and also
still show the old 2-tab bar with no Emails tab.

Verified live on staging 2026-08-24 via `session.js` + `routes.js` against
`SALES_ANALYTICS` (`/sales/analytics`). Confirmed the current Overview tab
has **no Bar/Line toggle** on any chart (old screenshots show one — that
control is gone, don't recreate it in the new captures or the article text).

## New shots needed

These 3 replace 4 old finals (`sales-analytics-overview-top-v2.png`,
`sales-analytics-generate-insights-v2.png`, and `sales-analytics-portal-steps-v2.png`
are all superseded; `sales-analytics-leads-by-source.png` too). Keep
`sales-analytics-generate-report.png` as is — that modal doesn't show the tab
bar or any chart-library UI, still accurate, no reshoot.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Overview tab top | **Sales → Analytics**, a portal-surface brand (e.g. Lumon Fresh), Overview tab active. Capture the brand-tab row, the 3-tab bar (**Overview** / **Portal Steps** / **Emails**, confirming Emails is now visible), **Generate Report** button + **Weekly View**/From/To on the right, the **Generate Insights** panel below, and the row of 5 stat tiles. This one shot covers both the Overview intro and the Generate Insights CTA — no separate Insights-only shot needed. | arrow resting on the **Generate Insights** button | `sales-analytics-overview-top-v3.png` | ~840 CSS |
| 2 | Leads By Source donut + table | Same brand, Overview tab, scrolled to the **Leads By Source** card. Live staging has no real UTM-tagged leads (donut renders a single blue "No Data" 100% wedge), so this needs the same DOM fill used last time (see `raw/shots.json` note on the old `sales-analytics-leads-by-source.png` — clone the real donut `<path>` + table `<tr>` markup, replace with a plausible synthetic breakdown that sums to 100%, using the app's real accent CSS vars for slice colors). Reuse that same breakdown (google 35%, organic 25%, direct 15%, referral 10%, paid social 10%, email 5%) so the numbers stay consistent with what's already been shown to Max. Crop to just the card, no tab bar needed. | none (read-only chart view) | `sales-analytics-leads-by-source-v2.png` | ~840 CSS (card-only crop) |
| 3 | Portal Steps tab | Same brand, **Portal Steps** tab active, a brand with several real onboarding steps seeded (Lumon Fresh has 16 on staging — reuse it, not the Staging Test Brand which only has 2 placeholder steps). Capture the 3-tab bar (confirming Emails is visible here too), **Sample Size** / **Avg Completed** tiles, the search/filter/sort row, **All time** dropdown + Total Steps count, and several rows of the funnel table. | none (read-only view) | `sales-analytics-portal-steps-v3.png` | ~840 CSS |

## Notes

- All three are agent-capturable via `scripts/capture/session.js` +
  `routes.js` (`SALES_ANALYTICS`) if Max is unavailable — no scripted state
  needed except the DOM fill on shot 2, and clicking the **Portal Steps** tab
  for shot 3. Run the usual `dom-sanitize.js` pass before every screenshot
  regardless of who captures it.
- Do not add a Bar/Line toggle to any capture or crop tightly enough to imply
  one exists — it was removed in the chart-library swap and the article no
  longer mentions it.
- The **Generate Report** dialog (`sales-analytics-generate-report.png`,
  kept) still matches the live "Generate New Report" flow exactly: Report
  Configuration panel, Weekly View + From/To, and the "What's included in
  your report" bullets (executive summary, detailed tables and trends, lead
  geography and source performance, PDF ready for sharing). No change needed.
- After processing, mark `sales-analytics-overview-top-v2.png`,
  `sales-analytics-generate-insights-v2.png`, `sales-analytics-portal-steps-v2.png`,
  and `sales-analytics-leads-by-source.png` as `superseded` in
  `raw/shots.json` (matching how the `-v1` files were already retired there).
