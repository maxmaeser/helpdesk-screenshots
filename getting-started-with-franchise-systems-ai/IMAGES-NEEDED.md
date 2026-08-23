# Images needed — getting-started-with-franchise-systems-ai

Both shots below are blocked by the same data prerequisite: **no brand the
capture account can access has a non-Completed `brandOnboardingStatus`.**

Verified directly against the API (`GET /brands?active=true` on staging,
2026-08-24):

| Brand | brandOnboardingStatus | plan |
|---|---|---|
| Staging Test Brand | completed | full |
| Lumon Fresh | completed | full |
| Kharcho Kings | completed | full |
| Circada | completed | full |
| Khinkali Krew | completed | full |
| Mtsvadi Monsters | completed | full |
| Pkhali Pushers | completed | full |
| Lumon | completed | full |
| Test Lite Brand | null | lite |

Navigating to `/getting-started` with any of these active silently
redirects to `/` (Home) — the sidebar never shows the **Getting Started**
item, because the app finds no brand still mid-intake.

"Test Lite Brand" looked like a candidate (no logo, `plan: "lite"`) but it
runs a completely different flow — `/getting-started/lite`, a per-brand
7-item setup checklist (funnel template, business info, email domain, FDD,
franchising states, eSignature prep, publish funnel). That is NOT the
org-level "select a brand to get started" cards-with-status-badges UI the
article describes, and its own sidebar item is not the same one either.

## Shot 1 — `getting-started-sidebar-item.png`
Sidebar with the **Getting Started** item showing above Home, for a brand
still mid-intake.

## Shot 2 — `getting-started-brand-cards.png`
The Getting Started page: "Select a brand to get started" header, one card
per brand with a status badge (Awaiting Intake / Intake Submitted /
Processing / Completed) and a progress ring.

## What Max needs to do
Ask eng for a **full-plan** test brand (or org) with `brandOnboardingStatus`
set to `awaiting_intake`, `intake_submitted`, or `processing` — ideally two
different brands with two different statuses in the same org, so shot 2 can
show the badge variety the article promises ("with a status badge: Awaiting
Intake, Intake Submitted, Processing, or Completed"). Once that exists:

1. Load the brand dashboard with that org/brand active. Confirm **Getting
   Started** appears in the sidebar above Home. Crop sidebar top: logo
   through Home → `getting-started-sidebar-item.png`.
2. Click **Getting Started**. Full card list, no need to scroll the whole
   viewport → `getting-started-brand-cards.png`.

No cursor overlay needed for either — both are static state views, per the
shot spec.
