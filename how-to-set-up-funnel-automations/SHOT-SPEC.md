# Shot Spec: How to Set Up Funnel Automations

Surface: brand dashboard. Route: `/studio/funnel` (Studio → Funnel), a funnel-surface brand (e.g. Circada on staging). Open the robot-icon Automations panel in the top toolbar (`[data-guide-target="panel-automations"]`).

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Automations panel, empty state | Studio → Funnel on a brand with no automations yet (Circada on staging is currently empty). Open the Automations panel. Panel shows "No automations yet" and the "Apply a setup template" button. | arrow on "Apply a setup template" | `funnel-automations-empty.png` | ~840 CSS |
| 2 | Funnel Templates modal | From the empty-state panel, click "Apply a setup template" to open the Funnel Templates modal. Capture with all 3 cards visible (Starter / Complete / Advanced), don't submit. | none | `funnel-automations-template-modal.png` | ~840 CSS |
| 3 | Expanded automation card | Needs a brand with at least one automation already provisioned (apply a template on a sandbox/test brand first, or use one that already has automations). Open the Automations panel, click a card to expand it, showing its trigger line, step badges (e.g. Email, Wait), and an email step preview with subject line + excerpt. | none | `funnel-automations-card-expanded.png` | ~840 CSS |

## Notes

- Shot 3 needs a brand with automations already set up. Circada (the funnel-surface staging brand used for shots 1-2) currently has none, so either apply a template to it first (that also replaces its funnel structure, per the confirm-dialog warning) or find/use a different funnel-surface brand that already has automations.
- If a card with a blocked toggle (tooltip showing "Add email content before turning this automation on." or "Connect a sending domain to turn automations on.") is easy to find in the same pass, it's a nice-to-have but not required. The article describes these states in text without an image.
- Sanitize any real lead/contact data per the standard DOM sanitization pass if it appears anywhere in view (unlikely on this panel, but check the card names).
