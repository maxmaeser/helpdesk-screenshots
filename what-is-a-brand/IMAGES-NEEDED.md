# Images needed: what-is-a-brand

## brand-settings-profile-lite.png — BLOCKED, needs Max

**Spec** (SHOT-SPEC.md #2): Brand Profile page on a Lite-plan brand, showing the
**Campaign attribution** card in place of **Associated organizations**, with the
shorter 2-item Brand nav (just **Profile**, **Appearance**).

**Why it's blocked**: Agent-captured 2026-08-24 with the `max+claude@franchisesystems.ai`
account (org "Franchise Systems Ai," the only brand-dashboard login available).
That org has 9 brands, including one literally named **"Test Lite Brand."**
Switched to it via the Settings brand-picker (`?brand=0e47f82c-b727-4bea-bdc9-6de5fa7a6553`)
and it rendered the **identical Full-plan UI** as every other brand in the org:
5-item Brand nav (Profile, Appearance, Scheduling, Team & Access, Connections)
and an **Associated organizations** card, not Campaign attribution. The brand's
*name* doesn't control this — the Profile-page swap is gated by the
**organization's** plan, and "Franchise Systems Ai" is Full plan across all its
brands. No Lite-plan org is reachable with the current credentials.

**What Max needs to shoot**: Log into a genuinely Lite-plan **organization**
(not just a brand named "Lite" inside a Full-plan org) on staging, open
Settings → Brand (Profile is the default landing page for Lite), and capture
the **Brand information** card plus the **Campaign attribution** card below it.
Include the left settings nav if it fits (should show only Profile +
Appearance under Brand). Target ~840 CSS px crop width, 2x retina, no cursor
(read-only view). Save as `what-is-a-brand/raw/brand-settings-profile-lite.png`.

If no Lite-plan staging org/account exists yet, that's a separate gap worth
flagging back — the article's Lite-vs-Full paragraph is accurate prose either
way and stands on its own without the image.
