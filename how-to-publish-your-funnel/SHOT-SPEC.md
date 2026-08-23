# Shot Spec: How to Publish Your Funnel

Article: `articles/FS Ai Helpdesk Articles/Getting Started/how-to-publish-your-funnel.md`
Surface: brand dashboard (operator)

All shots use a brand on the funnel surface (Studio → Funnel visible in the sidebar). The Circada test brand on staging works for shots 1-3 (already has resources added, no automations applied yet, funnel is published). Shot 4 needs an org with NO payment method on file to show the real "Add a payment method" empty state — the org tied to Circada/Staging Test Brand on staging currently has none, so it should already show this state; if it's been paid since, use any other billing_required org still missing a payment method.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Resources end screen editor | Go to Studio → Funnel. In the Structure rail, scroll to the bottom and click the **Resources** step (End Screen). Capture the end-screen preview showing its resource cards and the From Library / Upload buttons at the bottom. | hand on "Resources" in the Structure rail | `funnel-resources-end-screen.png` | ~840 CSS |
| 2 | Automations panel | In the funnel builder, click the **Automations** icon in the top toolbar (robot icon) to open the panel. Capture the panel open, whatever state it's in (empty "No automations yet" is fine and honest for a fresh brand; a brand with automations applied is also fine, expand one card if so). | arrow on the Automations toolbar icon | `funnel-automations-panel.png` | ~840 CSS |
| 3 | Publish popover | In the funnel builder, click the **Publish** / **Published** pill in the top right to open the popover. Capture it open. | arrow on the Publish/Published pill | `funnel-publish-popover.png` | ~840 CSS |
| 4 | Add a payment method | Go to Settings (profile picture) → Organization → **Billing**. Capture just the top "Add a payment method" card (title, per-brand price rows, Subtotal, Promo Code, Card/US Bank Account toggle, Account Holder Email, Add Payment Method button). Crop out the Subscription/Brands/Invoices tables below it. | none | `billing-add-payment-method.png` | ~840 CSS |

Notes:
- Shot 4 is the one load-bearing new-fact shot: it proves the per-brand billing publish gate exists and shows its real copy ("A payment method is required to publish your funnel. Billing starts when you add one, then monthly."). Don't substitute a paid-org screenshot for it.
- Skip conceptual/decorative shots. No shot needed for the Getting Started checklist itself — the article names the real checklist item labels in text already.
