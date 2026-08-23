# Shot Spec: How to Work a Lead (update, 2026-08-24)

Coverage-matrix row `sales-lead-panel-activity`. Existing 9 finals in this
folder stay as-is; this is 1 new shot.

The article's rationale also cited the funnel progress rail (cd50f08f4) as a
gap, but that's now fully covered by the separate, already-written article
*How to Track Funnel Progress on a Lead* (coverage row
`sales-leads-funnel-journey-step`, its own shot spec at
`screenshots/how-to-track-funnel-progress-on-a-lead/SHOT-SPEC.md`). This
article just links to it instead of duplicating the rail shots.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | FDD Sent activity entry with email preview | Open a lead with an **FDD Sent** entry on the **Activity** tab (a lead an FDD was sent to). Frame the entry itself with its tag visible. If feasible, click the tag to open the email preview modal and capture that state instead, showing the from/reply-to line. | hand, pointing at the tag on the FDD Sent row | `lead-panel-activity-fdd-email.png` | ~840 CSS |

## Notes for capture

- Needs a lead that has actually had an FDD sent (Quick actions → **Send FDD for signature**, or one already in that state).
- DOM-sanitize before capture: the email preview will contain a lead's email address and message content. Sanitize the from/reply-to line and any personal details in the email body per `screenshots/CLAUDE.md`.
- Process with the normal pipeline: `.venv/bin/python scripts/helpdesk-image.py how-to-work-a-lead/raw/ how-to-work-a-lead/ --cursor-map how-to-work-a-lead/raw/cursors.json --round 36`.
- Assemble into `how-to-work-a-lead-git.md`: insert right after the new FDD Sent paragraph in the Activity section, replacing the `SHOT:` placeholder in the article source.
