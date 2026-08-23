# Images needed: How to Use E-Signature (edit pass, 2026-08-24)

Both new shots from `SHOT-SPEC.md` were attempted via agent capture (session.js + routes.js, headless
Chromium) and are blocked. Removed the corresponding `SHOT:` lines from both `how-to-use-e-signature-git.md`
and the canonical article so nothing broken ships. Need Max to shoot these two from his real browser.

## 1. `esig-submission-status.png` — Submission status in a lead's detail panel

**UI state:** Sales → Pipeline → open a lead that has an e-signature document sent (FDD or general
doc), open the lead's detail panel, find the document/signature section showing its status (Awaiting /
Sent / Opened / Completed / Declined).

**Why agent capture failed:** No lead on staging currently has a live e-signature submission (checked
several — Billy Smith, Bill Smith, others — all show "No Assets Found" on the lead panel's Assets tab).
Per the spec's own note, tried to create one via Library → `report-preview.pdf` → kebab menu →
**eSignature → Generate eSignature link**:

- The lead-panel 401 flagged in memory `fsai-capture-session-401` did NOT reproduce — the panel itself
  (Details/Chat/Tasks/Activity/Deal/Assets tabs) loads fine for the scripted brand session now, so that
  memory note is stale as of today.
- The real blocker is **Generate eSignature link**: clicking it (verified multiple ways — locator click,
  forced click, precise mouse.click at the menu item's bounding box) never opens a recipient/link modal.
  It always lands on the document preview lightbox, which gets stuck on "Loading PDF…" indefinitely in
  headless Chromium (confirmed after waiting 6s+, re-checked the full button list — no Generate/Copy
  Link control ever appears). This looks like a PDF.js-in-headless rendering issue, not a missing feature.
- **I did prepare the document for you**: `report-preview.pdf` in the Staging Test Brand library now has
  a placed "Signature Field 1" and was saved (via Prepare eSignature → drag Signature field → Save), so
  it's ready to sign. You just need to: open its kebab menu → eSignature → **Generate eSignature link**,
  send it to any test lead (e.g. Billy Smith, bill+109283@franchisesystems.ai), then open that lead's
  panel and screenshot the resulting status section.

## 2. `esig-portal-sign-viewer.png` — Applicant-facing Sign step, embedded viewer

**UI state:** Franchisee/applicant portal → an application with a pending **Sign** step (e.g. FDD step),
opened so the document loads in the embedded signing viewer, before signing.

**Why agent capture failed:** The only configured portal test login (Creed Smith / Lumon Fresh,
`session.js` surface `portal`) has **0/0 completed** on `/application` — no application steps are
configured for this applicant at all, so there's no Sign step to reach. Checked `MY_LOCATIONS` too (2
locations, one "Developing" — LF Aspen) — its Overview/Details/Activity tabs have no onboarding checklist
with a Sign step either. `LINKED_SIGNATURE` (`/linked-sign`) and `LINKED_FDD_SIGNATURE` (`/fdd-sign`)
both need a `?token=` query param we don't have and return "Link Invalid/Unavailable" without one.

Per the spec's note, the Studio portal-editor step-config preview was already ruled out this session (it
only shows Document Settings config, already covered by `esig-fdd-step-settings.png`).

**What's needed:** either point this at a real staging applicant account that has an active application
with a Sign/FDD step in progress, or set one up (assign an application flow with a Sign step to a test
applicant, or generate an e-signature link — see item 1 — through the applicant's own portal login) and
capture that applicant loading the step in a real browser.
