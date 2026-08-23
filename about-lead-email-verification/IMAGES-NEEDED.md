# Images Needed: about-lead-email-verification

Agent capture (session.js + routes.js, staging) got shots 1 and 2. Shots 3 and 4
could not be captured — reason and exact UI state below.

## Missing

### 3. `lead-panel-verification-popover.png` — Lead detail panel, verification badge popover open

**Why it couldn't be shot:** No lead in the org's only funnel-surface brand
(Circada, `app=3d0cbafc-a87f-4a45-921f-1903e5fb9bd2`) is in a non-Verified
state that has a popover. Surveyed all 3 funnel leads that exist in staging
(the only funnel leads in the whole org — every other brand pinned to this
account is Applicant Portal-surface and has no Verification column at all):

| Lead | Email | Verification |
|---|---|---|
| Fable Testlead | max+funneltest2@franchisesystems.ai | Verified |
| Fable Testlead | max+funneltest@franchisesystems.ai | Verified |
| Joshua Tests | josh+circada@franchisesystems.ai | — (never run) |

Per the article, **Verified** and **Pending** badges have no popover — only
**Unverified**, **Not Valid**, or **Validation Error** leads do. None of the
3 existing funnel leads are in any of those three states, and the dash ("—")
state (verification never triggered) is also not clickable into a popover.

**UI state Max should shoot:** On the Circada brand (Sales → Pipeline,
Funnel toggle), get one lead into Unverified / Not Valid / Validation Error —
easiest path is submitting a new test lead through Circada's live funnel with
an email that will fail verification (a nonexistent-domain address, e.g.
`test@thisdomaindoesnotexist-fsai.test`), or ask Josh to seed one directly.
Once that lead exists: open its detail panel, click the verification badge
next to their name so the popover with **Start verification** opens, crop to
the panel header area (not the full panel), arrow on the Start verification
button.

### 4. `send-email-not-verified-dialog.png` — Send Email modal, Email Not Verified confirm dialog

**Why it couldn't be shot:** Same root cause as #3 — this shot needs the same
non-Verified lead (start a send from their detail panel, get to the final
send step, the **Email Not Verified** confirm dialog needs their address to
not be Verified). No qualifying lead exists yet.

**UI state Max should shoot:** Once a non-Verified test lead exists (see #3),
from that lead's detail panel start a send (Send Email / send a template),
proceed to the final send step, click Send/Continue so the **Email Not
Verified** dialog opens with **Send anyway** visible. Arrow near Send anyway
— do not actually click it.

## Done

1. `leads-verification-column.png` — Leads table, Name/Email/Verification
   columns, Circada brand, Funnel surface. Real data has only Verified and
   dash states (no Unverified/Pending test lead exists) — narrower badge
   variety than the spec's "ideally" ask, but truthful to current staging
   data.
2. `leads-verification-filter.png` — Filters panel with Email Verification
   Status field selected, operator/value selects visible, arrow on the field
   dropdown.
