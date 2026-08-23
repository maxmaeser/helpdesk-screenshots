# Shot Spec: How to Set Your Brand Appearance

Page: click profile picture (bottom of sidebar) → **Settings** → **Appearance** under Brand. URL is `/settings/brands?section=brand-appearance`.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Appearance page, default state | Land on the Appearance page under Brand settings. Show the full card: Full Logo, Small Logo, Favicon upload rows, and the Primary Color row, with the Preview panel visible on the right. Use a brand that already has a logo and favicon set (not the empty-avatar placeholder state) if one's available on staging. | none | `brand-appearance-settings-overview.png` | ~840 CSS |
| 2 | Primary color field, unsaved change | Click into the Primary Color hex input and type a new valid hex value (e.g. a green or purple, something different from the current saved color) without clicking Save yet. The swatch next to the field should reflect the new color, and the **Save** button should be active (not grayed out). | arrow on **Save** | `brand-appearance-color-picker.png` | ~840 CSS |
| 3 | Preview panel, too-light color warning | With the same hex input, enter a very light color (e.g. `#F5F5F5` or `#FFFFCC`) so the warning appears under the Preview panel: "This color is too light for white text. Pick something darker so buttons stay readable." Crop to include the Preview panel and the warning banner. Note that Save stays disabled in this state. | none | `brand-appearance-preview-warning.png` | ~840 CSS |

## Notes for capture

- All 3 shots are on the same page, no navigation between them beyond editing the color field.
- Shot 1 should NOT have the color already edited, revert the field before capturing it if you shoot out of order.
- Shots 2 and 3 both need the primary color field mid-edit but not saved. Don't click Save between them, or 1's "current saved color" reference breaks for later reshoots.
- If the test brand has no logo/favicon uploaded yet, the empty state shows a store-icon avatar in each preview slot instead of an image. That's fine to use for shot 1 if nothing better is available, just flag it in the raw notes.
