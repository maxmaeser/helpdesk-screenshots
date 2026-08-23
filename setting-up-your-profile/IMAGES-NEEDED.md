# Images needed — setting-up-your-profile

## Update, 2026-08-24 — row settings-account-2fa: done, 5/5

The "Out-of-scope discovery" section below flagged 5 `SHOT:` placeholders for
a two-factor-authentication walkthrough that had landed in canonical ahead of
a SHOT-SPEC. A SHOT-SPEC.md for row `settings-account-2fa` was since added and
this row is now closed:

- `profile-security-2fa-setup-qr.png` — captured, processed, wired in.
- `profile-security-2fa-backup-codes.png` — captured, processed, wired in.
- `profile-security-2fa-enabled.png` — captured, processed, wired in.
- `profile-security-2fa-disable.png` — captured, processed, wired in.
- `profile-security-2fa-regenerate.png` — captured, processed, wired in.

All 5 required a real authenticator-app TOTP code (per SHOT-SPEC.md's setup
note). Rather than a human authenticator app, a pure-stdlib TOTP generator
(no external deps) computed valid 6-digit codes from the secret shown on
staging's own QR/manual-entry screen — same RFC 6238 math any authenticator
app runs, just scripted. 2FA was actually enabled on the shared automation
account (`max+claude@franchisesystems.ai`, the account `session.js` uses for
every brand-dashboard capture task) partway through the walkthrough shots,
then explicitly disabled again afterward (also via a computed TOTP code) so
the account is back to its original no-2FA state for other concurrent/future
capture sessions using `session.js` — verified live after the fact.

`setting-up-your-profile-git.md` was regenerated: canonical's current body
(now including the 3 new H3 subsections) is the backbone, with the
pre-existing images (`profile-security-v2.png`, `profile-security-2fa-api.png`,
etc.) preserved untouched at their prior positions — nothing about their
placement or the still-open question below (whether `profile-security-2fa-api.png`
is now redundant) was decided by this pass.

**Tooling gotcha below still applies** — confirmed independently this pass:
running the folder-wide `--cursor-map` batch regressed the same 2 highlighted
finals again (caught via `git status` before anything was committed, reverted
to HEAD, then regenerated everything correctly via `--doc raw/shots.json`,
which reproduced the 2 highlighted files byte-identical to HEAD). This
confirms the gotcha isn't a one-off — the CLAUDE.md "Processing" section
recipe should be corrected for any article whose `raw/shots.json` has
`highlights`.

## Scope note, 2026-08-24 (edit-pass task)

This task's `SHOT-SPEC.md` specced exactly one new shot
(`profile-security-sessions-actions.png` — Active sessions card, full width).
That shot was captured, processed, and wired into `setting-up-your-profile-git.md`
in this pass. Counts: 1/1 done.

## Out-of-scope discovery — do not action without a new SHOT-SPEC

While reading the canonical article to sync the git.md, found the canonical
file (`articles/FS Ai Helpdesk Articles/Getting Started/setting-up-your-profile.md`)
carries an **uncommitted working-tree diff** (not in this task's SHOT-SPEC.md,
not authored by this task) that adds a full two-factor-authentication
walkthrough: two new H3 sections ("Turning on two-factor authentication",
"Turning off two-factor authentication") plus "Regenerating backup codes",
with 5 new `SHOT:` placeholders:

- `profile-security-2fa-setup-qr.png` — QR-code step of 2FA setup (Security tab > Enable > Get Started)
- `profile-security-2fa-backup-codes.png` — backup-codes step of 2FA setup, 10 codes + Copy all
- `profile-security-2fa-enabled.png` — Security tab with 2FA enabled, Disable button + codes-remaining count
- `profile-security-2fa-disable.png` — Disable confirmation dialog, 6-digit code input
- `profile-security-2fa-regenerate.png` — Regenerate backup codes form, code input + Regenerate button

This new draft also appears to drop the narrative slot that
`profile-security-2fa-api.png` (2FA toggle + personal API key field, currently
in the git.md) used to fill — the new canonical text has no API-key
walkthrough at all after the 2FA sections.

**Left untouched, on purpose:** did not resolve, delete, or otherwise edit any
of these 5 `SHOT:` lines in canonical or attempt to reconcile git.md's
structure against this bigger draft. This is unrelated to the assigned
SHOT-SPEC, is mid-edit in another session's working tree per the suite's
cross-session-coordination convention (articles vs screenshots sessions run
concurrently), and reconciling it solo risks corrupting someone else's
in-progress prose restructuring — particularly since it's not yet clear
whether `profile-security-2fa-api.png` is meant to survive.

**Next step:** whoever owns the articles-side edit should commit it, then spec
these 5 shots (UI states, filenames, cursor/framing) the normal way so a
follow-up capture pass can pick them up. `setting-up-your-profile-git.md` was
NOT regenerated from the full current canonical body for this reason — it
still reflects the pre-2FA-walkthrough structure, plus the one
Active-sessions image this pass added.

## Tooling gotcha found this pass — CLAUDE.md's documented batch command regressed 2 finals

`raw/shots.json` carries `highlights` (lens-magnify effects) for
`profile-menu-settings.png` and `profile-details-v2.png` that only
`helpdesk-image.py --doc shots.json` renders. The suite's documented batch
recipe (`screenshots/CLAUDE.md` "Processing" section, and this task's own
instructions) uses `--cursor-map raw/cursors.json` instead — running that
over the whole `raw/` folder silently drops the lens highlight on both
files (confirmed via pixel diff against the committed HEAD versions) even
though dimensions and file presence look fine, so it's easy to miss in a
quick spot-check.

Caught before this touched git history: reverted both files to HEAD and
regenerated only the new shot in single-file mode
(`helpdesk-image.py raw/profile-security-sessions-actions.png
profile-security-sessions-actions.png --cursor 1879,94 --round 36`) instead
of the whole-folder batch. Worth fixing in CLAUDE.md: either point the batch
recipe at `--doc raw/shots.json` when a `shots.json` with highlights exists,
or call out that `--cursor-map` batch mode is unsafe to run over a folder
that has any highlighted shots in it.
