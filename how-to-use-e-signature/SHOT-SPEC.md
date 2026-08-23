# Shot spec: How to Use E-Signature (edit pass, 2026-08-24)

Existing article already has 3 finals (`esig-prepare-fields.png`, `esig-library-menu-v2.png`, `esig-fdd-step-settings.png`) — kept as-is, just repositioned/re-captioned in the `-git.md`, no reshoot needed. These 2 new shots close the remaining gaps: no shot showed submission-status tracking, and none showed the applicant-facing embedded Sign viewer.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Submission status in a lead's detail panel | Open a lead on **Sales → Pipeline** that has an e-signature document sent (FDD or general doc). Open the lead's detail panel and find the document/signature section showing its status (Awaiting / Sent / Opened / Completed / Declined) | none (read-only state) | `esig-submission-status.png` | ~840 CSS |
| 2 | Applicant-facing Sign step, embedded viewer | On the franchisee/applicant portal, reach an application with a pending **Sign** step (e.g. the FDD step) and open it so the document loads in the embedded signing viewer, before signing | none (read-only state) | `esig-portal-sign-viewer.png` | ~840 CSS |

## Notes

- Shot 1: real e-signature menu items are **Prepare eSignature** and **Generate eSignature link**, both under a document row's kebab menu → **eSignature** submenu (verified live on staging 2026-08-24). If no lead on staging already has a live submission, send `report-preview.pdf` (or any prepared doc) through **Generate eSignature link** to a test lead first, then capture the resulting status on that lead's panel.
- Shot 1 is the same UI surface flagged in memory `fsai-capture-session-401` as blocked for headless automation (lead detail panel returns 401 for the scripted brand-dashboard session) — capture this one from your real browser, not agent fallback.
- Shot 2 requires an actual applicant session, not the Studio portal-editor's step-config preview (that panel only shows the Document Settings config, already covered by `esig-fdd-step-settings.png` — confirmed via agent fallback this session).
- Both shots are net-new UI states, not currently represented in the article at all.
