# Shot spec: About Email Templates

Brand: **Lumon Fresh** on `https://staging.app.franchisesystems.ai/`, captured via the persisted session in `scripts/capture/session.js` (fallback/agent capture, Max unavailable for this batch).

Target crop width ~840 CSS px (1680 real px at 2x). Cursor added in post.

## Captured

| # | Shot | UI state | Cursor | Filename | Status |
|---|---|---|---|---|---|
| 1 | Template list + warning banners | Studio → Email Templates, Lumon Fresh selected. Both warning banners ("Missing required brand information" / "No domain connected to your Applicant Portal") happened to be live for this brand, so one shot covers both the list and the banners section | none (informational) | `email-templates-list.png` | done |
| 2 | Portal Notification editor | Opened the **Deal Available** template (a Portal Notification). Inbox-style preview on the left, Subject/Title/Description/Button Text/colors panel on the right, **Save** button | none (editing/result view) | `email-template-portal.png` | done |
| 3 | Campaign Email editor | Opened **Fast Track Email** (a Campaign Email with real content, not the blank "New Email Template"). Shows the Subject field with its `49/72` character counter, the rich-text body, and the **Blocks** panel. Top bar shows Save and Exit / Preview / Deploy | arrow on **Preview** | `email-campaign-editor.png` | done |

## Notes for whoever picks this up next

- Brand selector: set both `fsai-selected-brands-single` and `fsai-selected-brands-multi` localStorage keys to the Lumon Fresh id (`11111111-1111-1111-1111-111111111111`) — the list page reads the multi key, template detail/editor pages read the single key. Setting only one leaves the other page showing "Staging Test Brand".
- Row clicks: use `table tbody tr.cursor-pointer`, not a bare `tbody tr` (decoy rows).
- Route: `STUDIO_EMAIL_TEMPLATES` / `STUDIO_EMAIL_TEMPLATE_CAMPAIGN` / `STUDIO_EMAIL_TEMPLATE_PORTAL` in `scripts/capture/routes.brand.json`.
- Picked "Fast Track Email" for the campaign editor shot deliberately — a brand-new "New Email Template" opens to an empty canvas with just the Fallback Footer merge-field chips, which doesn't show the rich-text body the article describes.
- `dom-sanitize.js` ran before every screenshot with defaults. The Portal Notification preview's mock sender address (`franchise@example.com` on Staging Test Brand) got rewritten by the default email replacement pattern when re-shot under Lumon Fresh — that's expected/desired, it's cosmetic preview chrome, not real data.
