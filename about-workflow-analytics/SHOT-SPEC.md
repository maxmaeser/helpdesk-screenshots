# Shot Spec: About Workflow Analytics

Route: `Marketing → Workflows` (or Sales/Operations → Workflows), **Analytics** tab.
Any department works since the tab is identical (shared `EmailAnalyticsHome` component); use whichever brand has real send history so the tables aren't all zeros.

Sales-only alternate route that renders this exact same page: `Sales → Analytics`, **Emails** tab. Confirmed on staging 2026-08-24: same summary tiles, same Templates/Domains/Events sub-tabs, same data, just a different sidebar entry point. These shots also serve that page, no separate capture needed.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Analytics tab overview | Go to Workflows → **Analytics** tab. Leave the **Templates** view selected (default). Pick a brand/department with actual sent emails if one exists, so the summary tiles and table show non-zero numbers. | none | `workflows-analytics-overview.png` | ~840 CSS |
| 2 | Domains and Events views | On the Analytics tab, click the **Domains** segment. If you can get one clean shot showing the segmented control with the Domains table below it, that covers the section; a second shot of the **Events** segment is a nice-to-have but not required if a real Events log isn't available. | hover on "Domains" in the segmented control | `workflows-analytics-domains-events.png` | ~840 CSS |
| 3 | Template detail drill-in | From the Templates view, click a template row with real send data to open its detail page. Capture the engagement chart plus the metric breakdown on the right (Delivered/Clicks/Bounced/Complaints), with 1-2 event rows visible below if space allows. | none | `workflows-analytics-detail.png` | ~840 CSS |

Notes:
- Shot 1 and shot 3 are load-bearing (referenced directly in the article body). Shot 2 illustrates the Domains/Events toggle described in the "Templates, Domains, and Events" section.
- If every brand on staging shows zero sends, that's fine to capture as-is — the article's "If a section looks empty" section covers the zero state — but a data-rich brand makes a much better screenshot if one is available.
- Full-page context isn't needed here; crop to the Analytics tab content area (metric tiles + table/chart), same framing style as other analytics articles.
