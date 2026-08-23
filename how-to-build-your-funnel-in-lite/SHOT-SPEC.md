# Shot Spec: How to Build Your Funnel in Lite

Article: `articles/FS Ai Helpdesk Articles/Getting Started/how-to-build-your-funnel-in-lite.md`
Surface: brand dashboard (operator, Lite/funnel-surface brand)

Use a Lite/funnel-surface brand whose Getting Started checklist still shows **Choose your funnel template** as open (not yet Done), so shot 1 shows the real **Continue** button rather than a Done badge. The Circada test brand on staging already has a template applied, so its checklist shows this item Done and its Automations panel already shows "No automations yet" (template applied but no automations provisioned) — shots 2-4 work fine there as is, but shot 1 needs a fresher/reset brand if one is available so the "still open" state is visible. If no such brand exists, capture shot 1 on Circada as-is and note in the caption that it shows the Done state (that's also a legitimate, common state — just say so, don't fake it).

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Getting Started, Required setup section | Go to the Getting Started page (it's the homepage for a not-yet-activated Lite brand, or reachable via a deep link). Capture the "Required setup" card, cropped to its header ("Required setup", "N of 7 done") and the **Choose your funnel template** row only — don't include the other rows below it. | none (this is a status view, not a click target) | `lite-getting-started-required.png` | ~840 CSS |
| 2 | Automations panel, empty state | In the funnel builder (Studio → Funnel), click the **Automations** icon in the top toolbar (robot icon). Capture the panel open showing "No automations yet" and the **Apply a setup template** button. | arrow on the "Apply a setup template" button | `lite-funnel-automations-apply-template.png` | ~840 CSS |
| 3 | Funnel Templates modal | Click **Apply a setup template** (from shot 2) to open the "Funnel Templates" modal. Capture just the top of the modal: the title, subtitle, and the three template cards (Starter / Complete / Advanced) with their question/email counts and Preview links. Crop out the step-by-step breakdown below the cards — don't scroll to it. | arrow on the "Use Template" button, bottom right | `lite-funnel-templates-modal.png` | ~900 CSS |
| 4 | Theme panel | Close the Templates modal. In the funnel builder toolbar, click the **Theme** icon (color palette). Capture the panel open on the **Appearance** tab (default), showing the jump tabs (Appearance/Colors/Text/Buttons/Forms/Brand/Container) at top and the Appearance section's Mode/Pattern/Background image controls, with the live funnel preview visible alongside it. | none (state view, not a single click target) | `lite-funnel-theme-panel.png` | ~1050 CSS (panel + preview) |

Notes:
- Shots 2-4 are the load-bearing new-fact shots: they prove the real, production-live path to the template picker (via Automations → Apply a setup template, not the Templates toolbar icon, which only renders in dev/staging builds and is not visible to customers in production). Don't substitute a screenshot of the toolbar Templates icon for shot 2/3's entry point.
- No shot needed for "Set your qualification rule" — that's already covered in *About the Funnel Builder*'s Logic panel section; this article just cross-references it.
- Run DOM sanitization (`screenshots/scripts/dom-sanitize.js`) before every capture per `screenshots/CLAUDE.md` — the funnel preview and templates modal are generic/synthetic content, but the brand switcher and toolbar can carry real brand names.
