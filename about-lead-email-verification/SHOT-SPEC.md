# Shot Spec: About Lead Email Verification

Category: Sales. Article: `articles/FS Ai Helpdesk Articles/Sales/about-lead-email-verification.md`.

All shots need a **funnel-surface** brand (has a **Funnel** / **Applicant Portal** toggle above the Leads table — pick **Funnel**). A portal-only brand won't show the Verification column, filter, or badge at all.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Leads table, Verification column | Go to **Sales → Pipeline**, switch the surface toggle to **Funnel**. Crop to show the Name, Email, and Verification columns together (hide unrelated columns if the table is too wide). Ideally include a few different badge states (Verified, Unverified, Pending) — if the current data is all Verified/dash, ask Josh/whoever seeds staging leads for a couple of unverified test leads first, or pick a lead and leave it unverified. | none | `leads-verification-column.png` | ~840 CSS |
| 2 | Leads table, Filters panel with Email Verification Status filter | From the same Leads table, click the **Filter** icon in the toolbar, then add a filter row and select **Email Verification Status** as the field so its operator/value selects are visible. | arrow on the filter field dropdown | `leads-verification-filter.png` | ~840 CSS |
| 3 | Lead detail panel, verification badge popover open | Open a lead whose email is **Unverified**, **Not Valid**, or **Validation Error** (not Verified/Pending — those don't have a popover). Click their verification badge next to their name so the popover with the **Start verification** button is open. Crop to the panel header area, not the full panel. | arrow on the Start verification button | `lead-panel-verification-popover.png` | ~840 CSS |
| 4 | Send Email modal, Email Not Verified confirm dialog | From that same unverified lead's detail panel, start a send (Send Email / send a template), get to the final send step, and click Send/Continue so the **Email Not Verified** confirm dialog opens on top with the **Send anyway** button visible. Do not actually click Send anyway. | arrow near Send anyway (don't click) | `send-email-not-verified-dialog.png` | ~840 CSS |

Notes:
- Run `dom-sanitize.js` conventions don't apply here since Max is shooting by hand, but scrub any real lead name/email/phone that isn't already test data before sending me the raws, same as usual.
- Shot 1 and 2 can come from the same table session; shot 3 and 4 need one lead in a non-Verified state.
