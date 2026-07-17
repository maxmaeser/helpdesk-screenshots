# Franchisee Portal Capture Playbook — DRAFT (2026-07-10)

Feasibility draft for delegating the 46-shot franchisee-portal capture to a lower-tier browser-driving agent. Derived from `origin/master` of `~/work/fsai/fsai-codebase` (f633c9e18, 2026-07-09), the palmier code-research reports (`research/palmier-2026-07-06/`), and the suite capture plan (`screenshots/_fullpage/franchisee-capture-plan.md`).

**Status: NOT runnable yet.** Two gaps only Max can close: (1) a franchisee login on staging (none exists — confirmed in `_palmier-handoff-2026-07-07.md`), (2) the Lumon staging portal URL (per-brand DB config, not in code). Plus baseline brand content (see Prerequisites). **Update 2026-07-13:** the 6 shots that were unshootable as specced have since been resolved — 5 re-specced against real UI, 1 (`brand-request-approval.png`) dropped — and 2 new shots were added; the finalized tracker v2 list (`franchisee-capture-tracker.html`, `franchisee-placement-map.md`) now totals 47 shots, 31 GREEN / 16 YELLOW / 0 RED.

---

## 1. Global setup

### 1.1 Environment

- **Portal app (staging):** deployed at `https://staging-applicant-portal.netlify.app` (confirmed live, HTTP 200, SPA titled "Applicant Portal"). BUT the portal resolves its brand from `window.location.hostname` via `portals.getPortalInfo({domain})` (`apps/applicant-portal/src/hooks/usePortalInstance.tsx`). Which brand the netlify hostname maps to is a DB fact (`portal_domain_brand` table). **Max must supply the exact URL that resolves to brand Lumon** — either the netlify domain (if mapped) or a custom staging domain.
- **Brand dashboard (staging, for impersonation minting and brand-side setup):** `https://staging.app.franchisesystems.ai` (super-admin only).
- **API (staging):** `https://staging.api.franchisesystems.ai`.
- The known "staging import broken" issue is the helpdesk CMS **importer**, not the portal app. No code evidence that the portal itself is unhealthy on staging.

### 1.2 Auth — two paths

The portal uses custom token auth: the bearer token lives in `localStorage` under key **`fsai.session_token`** (`apps/applicant-portal/src/constants/auth.ts`, `USE_COOKIE_AUTH = false`).

**Path A — impersonation URL (no password needed, but 60-minute TTL):**
Super-admin mints a session from the brand dashboard (Admin panel → Impersonate, mode "portal", pick brand Lumon + a franchisee account) or via API `POST /fsai-admin/impersonate-portal {brandId, email}`. Returns `{url, token, expiresAt}` where `url` = the brand's portal base URL + `?sessionToken=<token>`. The portal ingests `?sessionToken` on load, stores it in localStorage, and strips it from the URL (`useTokenFromUrl.ts`). **Session lasts 60 minutes** (`PORTAL_IMPERSONATION_SESSION_MINUTES = 60`, `authService.ts:2104`) — too short for a careful 46-shot run; plan on re-minting, or use Path B. Requires super-admin + 2FA, so ONLY Max can mint.

**Path B — franchisee test account (preferred, durable):**
Standard email+password login at `{portalUrl}/login`. Form (from `pages/Login/Login.tsx`):
- Email: `input` under label "Email", `placeholder="Email address"` → `page.getByLabel('Email')` or `page.getByPlaceholder('Email address')`
- Password: `input[type=password]` under label "Password", `placeholder="************"` → `page.getByLabel('Password')`
- Submit: button text **"Login"** → `page.getByRole('button', {name: 'Login'})`. Button stays disabled until email matches `\S+@\S+` and password ≥ 10 chars — fill both, then click.
- Google/LinkedIn OAuth buttons appear only if the brand's portal has those flags on; ignore them.
After login the token persists in localStorage → a **named dev-browser profile persists the session across runs** (`browser.getPage("fsai-capture")`). Regular session TTL is longer than impersonation's 60 min (standard session expiry).

**Account requirements:** the account must be a **franchisee** (`user.isFranchisee`), with `profileCompletedAt` set — otherwise `FranchiseePortalLayout` redirects to `/complete-profile` or `/login`. A plain applicant account will NOT show the franchisee portal chrome.

### 1.3 Browser + screenshot settings

- Tool: `~/bin/dev-browser` (headless Playwright wrapper; screenshots to files under `~/.dev-browser/tmp/`).
- Viewport: **1440x900, deviceScaleFactor: 2**. Set once at context creation, never resize mid-session (DPR can drop to 1x and refs go stale).
- Screenshots: `page.screenshot({ clip, scale: 'device' })` for article shots (clip in CSS px, output is 2x). `page.screenshot({ fullPage: true })` for the 12 full-page reference shots.
- Mobile variant (only if Max asks; not in the 46): fresh context at 390x844, dSF 3 or 2. The mobile bottom tab bar (Home, Manuals, Chat, Locations + More) renders below the `md` breakpoint (768px).
- After EVERY navigation inject: `* { outline: none !important; }` (kills focus rings; does not persist across `goto`).
- Wait strategy per page: `page.goto(url)` → `waitForLoadState('networkidle')` → `locator(<wait-for selector from the shot entry>).waitFor()` → extra `waitForTimeout(3000-5000)` (async data, images, fonts). The portal shows a `Loading` component until session + portal info resolve.
- HeadlessUI everywhere: menus are `[role="menu"]` / `[role="menuitem"]`, checkboxes `[role="checkbox"]`, radios `[role="radio"]` — NOT native inputs. Portal overlays (`#headlessui-portal-root`) can block clicks; press Escape or reload to clear.
- No `data-testid`s in the portal — use Playwright role/text selectors (`getByRole`, `getByText`). Sidebar items are `<a>` links with visible text (Home, Locations/Location, Manuals, Learning, Vendors, Projects, Brand, Team, Chat, Assets).

### 1.4 Layout facts that affect every shot

(`layouts/FranchiseePortalLayout/FranchiseePortalLayout.tsx`, `packages/sdk/src/types/franchiseePortalSidebar.ts`)

- Sidebar order: Home (pinned), Locations, [Catalog — lockedHidden, never visible], Manuals, Learning, Vendors, [Socials — flag-injected after Vendors], Projects (**default HIDDEN, brand opt-in**), Brand, Team, Chat, Assets. Brands can hide/rename/reorder non-locked items — verify against the live sidebar before shooting.
- **Single-location accounts** see "Location" (singular) linking straight to that location's overview instead of "Locations" → use a **multi-location account** for the plan's list shots.
- Avatar menu (bottom of sidebar, HeadlessUI Menu): **Settings, Log Out** — NOT "Help desk + Settings" as the plan says. Help lives in the **topbar HelpMenuButton**: 3 items — Submit a ticket / My tickets / Open Helpdesk (`modules/tickets/components/HelpMenuButton.tsx`).
- Content area: `max-w-[1440px]`, topbar `pt-14`, desktop sidebar `md:pl-60`.
- Chat sidebar item shows an unread-count badge — drain/ignore unread state for clean shots.

### 1.5 Output naming and delivery

- Full-page reference shots → `screenshots/_fullpage/franchisee-portal/2026-MM-DD-{page}.png` (uncropped `fullPage: true`, any width; these feed the UI map, precision does not matter).
- Article raws → `screenshots/{article-folder}/raw/{filename}.png` using the EXACT filenames from the capture plan. Folders already exist: `01-welcome-to-your-franchisee-portal`, `02-home`, `03-what-projects-are`, `04-completing-a-task`, `05-working-with-approvers`, `06-locations`, `07-vendors`, `08-team-and-roles`, `09-brand-standards`, `10-learning`, `11-manuals`, `12-assets`.
- Article-shot framing: target **~840 CSS px clip width** (=1680 real px). Narrow UI: include surrounding context, never element-only. Wide UI: crop to the relevant region; may hide irrelevant columns via CSS injection. Multi-element states: union of bounding boxes + 8-16 px padding, up to ~1050 CSS px.
- NO cursor in captures — set the real UI state (open menu, hover, selection); cursors are overlaid in post per the plan's Cursor column.
- Raw under ~1000 px wide = 1x capture = wrong; recapture.

### 1.6 Prerequisites checklist (one-time, mostly Max / brand-dashboard side)

1. Franchisee test account on staging Lumon: email+password (password ≥ 10 chars), profile completed, `isFranchisee`, member of a franchisee org with **≥2 locations**.
2. Lumon staging portal URL (the hostname that resolves to Lumon).
3. Brand-side content on Lumon (whatever is missing): **Projects sidebar item toggled ON** (portal editor; default hidden) + ≥1 project launched to the org with tasks covering: a Todo-checklist task, a task with attachments allowed, a task with approvers configured, a dependency-gated (Locked) task; vendors; manuals (≥1 article with H2/H3 headings so the TOC renders); ≥1 course (ideally with downloadable resources); Brand page content (Overview + Identity and/or Voice published); asset collections with files; a second team member and one pending invite.
4. If a "location status" shot is wanted: the location must have `editableByFranchisee = true` (brand grants editing rights), else the status dropdown is disabled.
5. Optional flags to note, not required: Socials (brand flag) injects a Socials item after Vendors — if ON, expect it in sidebar shots.

### 1.7 Known plan-vs-code mismatches (affects what to shoot; source: palmier reports verified at origin/master 2026-07-10)

- Task types are **7**: Todo checklist, Form, Signature, View slides, Schedule a call, Watch video, Visit link (`TaskPanel/taskStatus.ts`). **No File Upload, Quiz, or Survey task types.**
- Task statuses: To-do / In progress / Done (+ Awaiting-approval grouping + **Locked** rows for dependency-gated tasks, label "Locked" with lock icon). **No "Blocked with reason" status.**
- Franchisees **cannot create projects** — no New project button, no template gallery on `/projects`.
- Vendors have **no Place Order / Contact Vendor / Report Issue** actions. Vendor detail = tabs (Details/Contacts/Locations/Manuals/Assets); the one franchisee write action is per-location **Setup Status** (Not Started/Started/Completed).
- Brand page has **no Request approval** flow. Tabs (content-conditional, fixed order): Overview, Feed, News, Identity, Voice & style, Gallery.
- Team: button + modal is **"Invite teammate"** (fields: name, email, title, reason), not "Add Team Member". **No role dropdown** — roles are Primary (Accountable) radio / Consulted toggle + promote-to-Primary confirm modal.
- Locations: **5 statuses** (open, developing, inactive, closed, planned), not 4.
- Assets page (internally "Library") = **Collections/Files toggle + brand-defined collection cards**, not "five category tiles".
- Learning tabs: Courses / Learning Paths / Certificates (SegmentedControl). "Continue Course" button exists only in LIST view; grid cards have no CTA.

---

## 2. Full-page reference shots (12)

All: log in, navigate, wait per 1.3, `fullPage: true`, save to `_fullpage/franchisee-portal/`. Where the plan asks for "X + one open Y", capture two full-page files (suffix `-a`/`-b`) — these are for UI awareness, not articles.

| # | File | Route / interaction | Wait for | Grade |
|---|---|---|---|---|
| F1 | `DATE-home.png` | `/` | hero greeting text (time-of-day + date) | **GREEN** |
| F2 | `DATE-projects.png` | `/projects`, then click first project row → `/projects/:id` (capture both) | project list rows / project panel header | **YELLOW** — Projects item default hidden; needs brand opt-in + ≥1 launched project |
| F3 | `DATE-task-card.png` | open a project → click a task row (task panel opens; deep link `?task=<id>` supported) | task panel with status badge + Details popover trigger | **YELLOW** — needs seeded tasks |
| F4 | `DATE-task-pending.png` | open a task that has been finalized and awaits approval | "Awaiting approval" group/badge | **YELLOW** — needs an approver-configured task already submitted; the agent can create the state by completing one (mutates staging data — flag to Max first) |
| F5 | `DATE-locations.png` | `/my-locations`, then open a location → `/my-locations/:id` (capture both) | location rows / overview tab | **GREEN** (multi-location account) |
| F6 | `DATE-vendors.png` | `/vendors`, then click a vendor card (panel/detail opens; capture both) | vendor cards | **GREEN** (vendors seeded) |
| F7 | `DATE-team.png` | `/team`, then click "Invite teammate" (modal open; capture both) | roster rows / modal title "Invite teammate" | **GREEN** |
| F8 | `DATE-brand.png` | `/brand-overview`, then switch to Identity tab (capture both) | brand hero / tab content | **GREEN** (brand content published) |
| F9 | `DATE-learning.png` | `/learning` (Courses tab default), then open a course → `/learning/courses/:id/take` (capture both) | course cards / player + chapter sidebar | **GREEN** — note: opening a course auto-enrolls the account |
| F10 | `DATE-manuals.png` | `/manuals`, then open a manual → `/manuals/:slug` (capture both) | stat boxes ("Manuals in your library") / reader TOC | **GREEN** |
| F11 | `DATE-assets.png` | `/documents`, then double-click a file tile (FileViewer opens; capture both) | collection cards / viewer with Download | **GREEN** (collections + files shared) |
| F12 | `DATE-sidebar.png` | `/` then click the avatar (bottom of sidebar) to open the profile menu | menu items "Settings" and "Log Out" | **GREEN** — menu shows Settings + Log Out only; ALSO capture the topbar Help menu open (3 items) as a bonus frame — the plan's "Help desk in avatar menu" is wrong |

---

## 3. Per-article shots (34)

Framing target ~840 CSS px unless noted. State first, screenshot second; no cursor.

### 01 Welcome (`01-welcome-to-your-franchisee-portal/raw/`)

**S1 `welcome-sidebar.png` — GREEN.** Route `/`. Clip the full sidebar plus ~500 px of adjacent Home content (sidebar alone is too narrow). Wait: all sidebar labels rendered. Note which items this brand shows (Projects? Socials?) — the article must match.

**S2 `welcome-avatar-menu.png` — GREEN.** Route `/`. Click the avatar block at the sidebar bottom (shows first/last name); HeadlessUI menu opens upward with **Settings** and **Log Out**. Clip sidebar bottom + open menu, union + 12 px pad. MISMATCH NOTE: plan says menu holds "Help desk, Settings" — it does not; consider an extra shot of the topbar Help menu (`getByRole('button')` near bell icon → menu items Submit a ticket / My tickets / Open Helpdesk) for the article's help-desk paragraph.

### 02 Home (`02-home/raw/`)

**S1 `home-overview.png` — GREEN.** Route `/`. Clip hero + first two widget rows at ~840-1050 CSS px. Widgets render conditionally on data (Chat, Tasks, Manuals shelf, Brand feed, Files, Team, Locations + right rail ≥1200 px) — with baseline content most will show.

**S2 `home-task-hover.png` — YELLOW** (needs active tasks with due dates in the "Your tasks" module — same project seeding as 03). Hover a task card in the tasks module (`locator.hover()`), capture the hover state showing due date + priority color. Clip the tasks widget with 1-2 neighbors for context.

### 03 What Projects Are (`03-what-projects-are/raw/`)

**S1 `projects-index.png` — YELLOW** (Projects flag ON + ≥1 project). Route `/projects`. Columns: Project / Status / Next action / Progress / Due; search box + sort dropdown. Wait: first project row. Clip the table region.

**S2 `projects-detail.png` — YELLOW** (same prereqs). Click a project row. Shows status-group buckets (To-do / In progress / Awaiting approval / Done, Locked rows), next-task banner (Start/Resume task), progress. NOTE: no "phases" UI on the franchisee side — the article's phases framing needs Max's call; shoot the real grouped task list.

**S3 `projects-templates.png` — RED (spec-invalid).** No "New project" button or template gallery exists on the franchisee surface (`ProjectsLandingPage.tsx` has no create action; templates are brand-side). Cannot be captured by anyone. Replacement suggestion: skip, or shoot the Project Overview popover (summary, start date, linked locations). **ADOPTED 2026-07-13** as `projects-overview.png`.

**S4 `projects-blocked.png` — RED (spec-invalid).** No Blocked status or reason note exists. Nearest real UI: a **Locked** task row (dependency-gated: lock icon, "Locked" label, `ProjectPanelTasks.tsx:53`). If re-specced as `projects-locked.png`: YELLOW (needs a dependency-gated task in the seeded project). **ADOPTED 2026-07-13**.

### 04 Completing a Task (`04-completing-a-task/raw/`)

**S1 `task-anatomy.png` — YELLOW** (needs tasks). Open any task (task panel). Real anatomy: status badge, due date, Details popover (Status/Due date/Type/Responsible/Project), action area at bottom, per-task Chat popover. The plan's "type chip top corner" is script-derived; shoot the real panel and let the article adapt. Clip the task panel.

**S2 `task-file-upload.png` — RED (spec-invalid) as "a File Upload task card".** No File Upload task TYPE exists (7 types, `taskStatus.ts:21`). Nearest real UI: the **attachments area on any task** — local file upload + "attach from library" dialog (`FranchiseeTaskBody.tsx:303`, `TaskAttachmentLibraryDialog.tsx`). If re-specced as "attaching a file to a task": YELLOW. **ADOPTED 2026-07-13** as `task-attachments.png`.

**S3 `task-complete.png` — YELLOW.** Needs a Done task (green check, status badge "Done"). Agent can self-serve by completing a Todo-checklist task (mutates staging data — get Max's OK). Clip the task row group or panel showing Done state.

### 05 Working with Approvers (`05-working-with-approvers/raw/`)

**S1 `approvers-roles.png` — YELLOW.** Needs a task with approver slots configured (brand-side). Open that task; capture the approvers section (approver avatars/slots with pending/approved states). No Sequential/Anyone/All modes render on the franchisee surface — approver slots + statuses only.

**S2 `approvers-pending.png` — YELLOW.** Same task after finalizing: Awaiting-approval state with approver avatar + pending badge (hourglass group). Agent can trigger by completing the task (data mutation — flag to Max). Clip task panel top incl. status + approver row.

### 06 Locations (`06-locations/raw/`)

**S1 `locations-list.png` — GREEN.** Route `/my-locations`, List view (List/Map toggle exists). Hero metrics (Operating units / Sites in launch / Pipeline) + row cards with cover image, status chip, View details. Statuses are 5: open/developing/inactive/closed/planned. Clip hero + 2-3 rows.

**S2 `locations-detail.png` — GREEN.** Open a location. Overview tab: info card (sq footage, building type, store format, open date), brand-rep contacts, status + history timeline. Timeline is sparse without past status changes — note if empty. Clip overview incl. timeline.

**S3 `locations-status.png` — YELLOW.** Status dropdown only enabled when `location.editableByFranchisee` (`LocationOverview.tsx:146`) — brand must grant editing rights. Click the status dropdown to open; capture with options visible (HeadlessUI listbox, `[role="option"]`). Do NOT select a new value (data mutation); the plan's cursor lands on an option in post.

### 07 Vendors (`07-vendors/raw/`)

**S1 `vendors-grid.png` — GREEN.** Route `/vendors`. Grid of vendor cards with usage badges (Mandatory/Recommended/Optional), usage + category filters, search. Clip filters + first card rows.

**S2 `vendors-detail.png` — GREEN (with spec-correction).** Click a vendor. Detail = tabs Details/Contacts/Locations/Manuals/Assets; Details shows About, description, address, website. The plan's "3 action buttons" (Place Order etc.) DO NOT EXIST — shoot the real detail; article v2 must be corrected. Clip the panel.

**S3 `vendors-report-issue.png` — RED (spec-invalid).** No Report Issue form exists. Nearest franchisee write action: **Setup Status** cell on the vendor's Locations tab (Not Started/Started/Completed, `VendorLocationsSetupStatusCell.tsx`). If re-specced as `vendors-setup-status.png` with the status menu open: GREEN. **ADOPTED 2026-07-13**.

### 08 Team and Roles (`08-team-and-roles/raw/`)

**S1 `team-roster.png` — GREEN.** Route `/team`. Hero stats (teammate count, pending invites), roster with search + status filter (All/Active/Invited/Not invited), status chips (Active/Invited/Awaiting approval/Rejected/Not invited). Clip hero + roster.

**S2 `team-add-member.png` — GREEN (label correction).** Click **"Invite teammate"** (`Team.tsx:538`). Modal "Invite teammate": name, email, title, reason fields; submit sends invite. Fill dummy values for a realistic shot but DO NOT submit. Clip the modal. Plan filename stays; article must say "Invite teammate".

**S3 `team-role-dropdown.png` — RED (spec-invalid).** No role dropdown exists; roles are Primary radio / Consulted toggle on the member row/panel plus a promote-to-Primary confirm modal (`Team.tsx:226,659`). If re-specced as "member panel with role controls" or "promote-to-Primary confirmation": GREEN. **ADOPTED 2026-07-13** as `team-role-controls.png`.

### 09 Brand Standards (`09-brand-standards/raw/`)

**S1 `brand-overview.png` — GREEN.** Route `/brand-overview`. Hero (brand kit download if configured) + Overview tab (story video, values, network stat tiles + map, awards, leadership). Clip hero + first sections.

**S2 `brand-visual-standards.png` — GREEN (tab-name correction).** Switch to **Identity** tab (logo lockups, palette hex, typography; Do's & Don'ts panels). Tab visible only when brand published identity content. The plan's "Visual standards" name is script-derived; the tab is "Identity". Clip the tab content.

**S3 `brand-request-approval.png` — RED (spec-invalid).** No Request-approval flow exists anywhere in `pages/Brand/`. Skip; nothing to re-spec on this page. (If the article keeps the concept, it must be cut at v2.) **DROPPED 2026-07-13**.

### 10 Learning (`10-learning/raw/`)

**S1 `learning-courses.png` — GREEN.** Route `/learning` (Courses tab default). "Pick up where you left off" row (only with a started course) + "Every course" catalog, grid/list toggle, category + status filters, search + sort. Clip catalog region.

**S2 `learning-course-card.png` — YELLOW.** "Started + Continue Course" requires (a) a started course — agent can start one (open course, watch a bit; auto-enroll `CourseTaking.tsx:26`) and (b) **LIST view** — the Continue Course button only renders in list view; grid cards have no CTA. Toggle to list, capture the started row with progress bar + button. Hover optional.

**S3 `learning-course-view.png` — GREEN.** Open a course → `/learning/courses/:id/take`. Chapters/lessons sidebar left, player right, Resources panel (only if the course has downloads — prefer a course with resources). Clip the full player layout (~1050 CSS px OK).

### 11 Manuals (`11-manuals/raw/`)

**S1 `manuals-home.png` — GREEN.** Route `/manuals`. Stat boxes (Manuals in your library / Your bookmarks / Recently viewed), tabs, category filter, Grid/Cards toggle, rows with Read pills + vendor badges. Clip stats + list.

**S2 `manuals-document.png` — GREEN.** Open a manual → `/manuals/:slug`. Reader: TOC left (H2/H3 only — pick a manual with headings), reading layout, bookmark/copy link/print actions, category breadcrumb. Clip TOC + first content screen.

**S3 `manuals-search.png` — GREEN.** On `/manuals`, type ≥2 chars into the hero search (`getByPlaceholder('Search all manuals...')`), wait for debounce (250 ms) + results; search REPLACES tabs with unified results + match count + Clear. Use a term guaranteed to hit seeded manuals (pick from S1's visible titles). Clip search box + results.

### 12 Assets (`12-assets/raw/`)

**S1 `assets-home.png` — GREEN (spec-correction).** Route `/documents`. Real UI: LibraryHero + **Collections/Files** toggle, collection cards (brand-defined names/counts), sidebar filters (All/My/Shared by brand/Shared by Others). The plan's "five category tiles" don't exist; shoot the collections grid. Clip hero + cards.

**S2 `assets-photos.png` — YELLOW.** Needs a brand collection that reads as a photo/imagery set (collection names are brand data). Click into the closest collection (or Files view filtered) and capture the tile grid (access-tier badges, ellipsis menus). If Lumon has no such collection, substitute any populated collection and note the name.

**S3 `assets-file-detail.png` — GREEN.** Double-click a file tile → FileViewer (preview, name, Details/Versions/Activity tabs, Download). Capture with Download visible. Clip the viewer (~1050 CSS px OK for the full overlay).

---

## 4. Grade summary

**Updated 2026-07-13** against the finalized tracker v2 list (`franchisee-capture-tracker.html`, `franchisee-placement-map.md`): 52 shots total (12 full-page + 40 article), 0 RED. The 6 REDs below were resolved — 5 re-specced against real UI, 1 (`brand-request-approval.png`) dropped — and 2 new shots (`welcome-help-menu.png`, `team-member-detail.png`) were added. **Same day:** 3 more shots were added for articles 00 (Creating Your Account) and 13 (Resetting Your Password) — login/signup/forgot-password pages, all logged-out captures. **Same day, later pass:** article 02 (Home) re-specced from 2 shots to 4, adding `home-tasks.png` and `home-panels.png` (both green) to cover the Tasks bullet and mid-page panel stack as their own section shots.

- **GREEN: 36** (9 full-page + 27 article shots) — capturable by a briefed lower-tier agent once the baseline env exists (login + seeded Lumon content).
- **YELLOW: 16** (3 full-page + 13 article) — need specific setup first: Projects flag ON + seeded project/tasks (F2, F3, F4, 02-S4, 03-S1 through 03-S4, 04-S1 through 04-S3), approver-configured task + a completion action (05-S1, 05-S2), `editableByFranchisee` on a location (06-S3), a started course in list view (10-S2), a suitable asset collection (12-S2). Several of these involve the agent mutating staging data (completing a task, starting a course) — get Max's explicit OK.
- **RED: 0** — all 6 former REDs resolved 2026-07-13: `projects-templates.png` → `projects-overview.png`, `projects-blocked.png` → `projects-locked.png`, `task-file-upload.png` → `task-attachments.png`, `vendors-report-issue.png` → `vendors-setup-status.png`, `team-role-dropdown.png` → `team-role-controls.png`, `brand-request-approval.png` dropped with no re-spec. See `franchisee-placement-map.md` for the adopted anchors.

## 5. Open items for Max (blockers)

1. Create a durable franchisee test account on staging Lumon (email+password ≥10 chars, profile completed, multi-location org) OR commit to re-minting 60-min impersonation URLs per session.
2. Provide the Lumon staging portal URL (hostname that resolves to the brand).
3. Confirm/seed the brand-side content in 1.6 (Projects flag + project with the four task varieties is the big one).
4. Approve the 6 RED re-specs (or drop those shots) and the 3 data-mutating YELLOW actions.
5. Decide whether articles get corrected now for the plan-vs-code mismatches (1.7) or at the v2 image pass.
