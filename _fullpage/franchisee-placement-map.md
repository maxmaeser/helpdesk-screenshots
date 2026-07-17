# Franchisee Onboarding: Placement Map

Finalized 2026-07-13, extended 2026-07-13 with articles 00 and 13, re-specced 2026-07-13 with 2 additional Home section shots. This is the reviewable spec for where each of the 40 article screenshots lands once captured. The tracker (`franchisee-capture-tracker.html`, v2) is the checklist UI for capture progress; this file is the human readable source of truth for placement, grade, and dependencies. Both are synced to the same shot list.

Images only get inserted into an article's importable `-git.md` after capture and processing. URL pattern once pushed to the screenshots repo:

`https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/{article-folder}/{filename}.png`

Insertion rules: a blank line before the image, none after (a trailing blank line creates an empty TipTap paragraph on import), and sentence length alt text describing what the image shows. If a shot needs re-capturing after it's already been imported once, give the new capture a fresh filename (`-v2`, `-v3`, ...) rather than reusing the old one, since GitHub's CDN caches the old bytes at that URL for roughly 5 minutes and the platform importer can grab the stale version.

Grades: **green** means the shot is capturable now against current staging content. **yellow** means it needs specific setup or seeding first (a started course, a dependency-gated task, an editable location, and so on). See `capture-playbook-DRAFT.md` section 1.6 for the full prerequisites checklist.

Full-page reference shots F1 through F12 are unchanged from v1 and are not covered here. They feed the portal UI map, not the articles.

## 00 Creating Your Account

- **`account-signup-form.png`** · green
  Account creation form (locked Invite Code and Email, name and phone fields).
  Placement: `## Accepting your invite → after "Your brand sends an invite email with…"`

## 01 Welcome

- **`welcome-sidebar.png`** · green
  Full sidebar, all items visible.
  Placement: `## What's in the sidebar → directly under heading, before the bullet list`

- **`welcome-avatar-menu.png`** · green
  Avatar menu open (Settings, Log Out).
  Placement: `## Your menu → after "Click your avatar at the bottom of…"`

- **`welcome-help-menu.png`** · green · new shot
  Need help? menu open in top bar (Submit a ticket, My tickets, Open Helpdesk).
  Placement: `## Your menu → after the "For help, click the Need help?…" sentence`

## 02 Home

- **`home-overview.png`** · green
  Home top: greeting hero and Chat panel.
  Placement: `intro → after "Home is the snapshot of your business…", before ## What you'll find`

- **`home-tasks.png`** · green · new shot
  Your Tasks panel (header, task rows with due dates and status).
  Placement: `## What you'll find → after the Tasks bullet`

- **`home-panels.png`** · green · new shot
  Home panel stack: Manuals, Brand Feed, Assets, Team.
  Placement: `## What you'll find → after the Quick links bullet (end of list)`

- **`home-task-open.png`** · yellow · renamed from `home-task-hover.png`
  A task opened from Home with the Details popover (status, due date, type).
  Placement: `## How to use it → after "Start your day here. Open a task…"`

## 03 What Projects Are

- **`projects-index.png`** · yellow
  Projects index list.
  Placement: `## Finding your way around → after "The Projects page lists your projects in…"`

- **`projects-detail.png`** · yellow
  Open project: task list grouped by status.
  Placement: `## Finding your way around → after "Click a project to open it and…"`

- **`projects-overview.png`** · yellow · re-spec, renamed from `projects-templates.png`
  Project Overview popover (summary, start date, linked locations).
  Placement: `## The project overview → after "Open a project and click Overview…"`

- **`projects-locked.png`** · yellow · re-spec, renamed from `projects-blocked.png`
  A Locked task row (dependency-gated, lock icon).
  Placement: `## Task status → after "Some tasks depend on others finishing first…"`

## 04 Completing a Task

- **`task-anatomy.png`** · yellow
  Task panel: type, due date, action button.
  Placement: `intro → after "Task panels work the same way across…", before ## The seven task types`

- **`task-attachments.png`** · yellow · re-spec, renamed from `task-file-upload.png`
  Task attachments area (upload + attach from library).
  Placement: `## Attachments → after "Tasks have an attachments area where you…"`

- **`task-complete.png`** · yellow
  A completed task with green check.
  Placement: `intro → after "Once you finish, the task gets a green…", before ## The seven task types`

## 05 Working with Approvers

- **`approvers-roles.png`** · yellow
  Task with approver roles shown.
  Placement: `## The five roles → after the RACI-A bullet list, before ## How approval works`

- **`approvers-pending.png`** · yellow
  Pending approval badge + approver avatar.
  Placement: `## Tracking a pending task → after "When you finish a task that has…"`

## 06 Locations

- **`locations-list.png`** · green
  Locations list with status chips.
  Placement: `intro → after "Locations is the live record of each…", before ## The location detail`

- **`locations-detail.png`** · green
  Location detail + status history timeline.
  Placement: `## The location detail → after "Click into a location and the detail…"`

- **`locations-status.png`** · yellow
  Status dropdown open.
  Placement: `## Updating a status → after "Status updates happen right from the detail…"`

## 07 Vendors

- **`vendors-grid.png`** · green
  Vendor table (name, usage badge, category, location assignments, contacts).
  Placement: `## The vendor list → after "The main view is a table…"`

- **`vendors-detail.png`** · green
  Vendor detail: tabs Details / Contacts / Locations / Manuals / Assets.
  Placement: `## The vendor list → after "Click a row and the detail view opens…"`

- **`vendors-setup-status.png`** · green · re-spec, renamed from `vendors-report-issue.png`
  Vendor Setup Status menu (Not Implemented / Implementing / Implemented).
  Placement: `## Setup status → after "The Locations tab tracks where this vendor…"`

## 08 Team and Roles

- **`team-roster.png`** · green
  Team roster.
  Placement: `intro → after "Team is your roster of the people…", before ## Inviting a team member`

- **`team-add-member.png`** · green
  Invite teammate modal (name, email, title, reason).
  Placement: `## Inviting a team member → at step 1`

- **`team-role-controls.png`** · green · re-spec, renamed from `team-role-dropdown.png`
  Role controls on a roster row (Primary radio / Consulted toggle) or the promote-to-Primary modal.
  Placement: `## Roles → after "Roles are defined by your brand, and…"`

- **`team-member-detail.png`** · green · new shot
  Member detail panel (Primary/Consulted badge, email, phone, joined date).
  Placement: `## The member detail → after its lead paragraph`

## 09 Brand Standards

- **`brand-overview.png`** · green
  Brand overview page.
  Placement: `intro → after "Brand is your identity reference: a read…", before ## One page, up to six tabs`

- **`brand-identity.png`** · green · renamed from `brand-visual-standards.png`
  Identity tab (logos, color palette with hex values).
  Placement: `## One page, up to six tabs → after the Identity bullet`

`brand-request-approval.png` is dropped entirely. No approval flow exists on the Brand pages in the current codebase, and article 09 doesn't describe one, so there's nothing to shoot or re-spec.

## 10 Learning

- **`learning-courses.png`** · green
  Courses tab with catalog.
  Placement: `## The Courses tab → after "The tab opens on Pick up where…"`

- **`learning-course-card.png`** · yellow
  Started course card with Continue Course (list view; needs a started course).
  Placement: `## The Courses tab → after "Each course card shows the cover, the…"`

- **`learning-course-view.png`** · green
  Course view: chapters, player, Resources.
  Placement: `## Inside a course → after "Open a course and the course view…"`

## 11 Manuals

- **`manuals-home.png`** · green
  Manuals home: tabs (Browse, My List, Recommended...) with category filter pills.
  Placement: `## Browsing and categories → after "Manuals opens on tabs across the top…"`

- **`manuals-document.png`** · green
  Document view with table of contents.
  Placement: `## Reading a manual → after "Each manual opens in a clean document…"`

- **`manuals-search.png`** · green
  Search results for a phrase (result card with title and snippet).
  Placement: `## Search → after "Search runs across the whole library, not…"`

## 12 Assets

- **`assets-home.png`** · green
  Assets home: Collections/Files toggle with collection cards.
  Placement: `intro → after "Assets is your brand's file library…", before ## Collections and files`

- **`assets-collection.png`** · yellow · renamed from `assets-photos.png`
  An opened collection grid (nearest populated collection).
  Placement: `## Collections and files → after "Collections shows cards your brand has put together…"`

- **`assets-file-detail.png`** · green
  File detail with Download.
  Placement: `## Downloading a file → after "The flow is the same whether you're…"`

## 13 Resetting Your Password

- **`login-forgot-link.png`** · green
  Log In page with the Forgot Password? Reset here. link.
  Placement: `## Requesting a reset → at its first sentence, after "On the Log In page, click Forgot Password? Reset here."`

- **`forgot-password-form.png`** · green
  Reset your Password page (email field, Reset Password button).
  Placement: `## Requesting a reset → after "Enter the email attached to your account and press Reset Password."`

## Changes from v1

**6 re-specs adopted from the capture-playbook-DRAFT RED list:**

- `projects-templates.png` renamed to `projects-overview.png`, now shoots the Project Overview popover instead of a nonexistent template gallery.
- `projects-blocked.png` renamed to `projects-locked.png`, now shoots a Locked dependency-gated task row instead of a nonexistent Blocked status with reason.
- `task-file-upload.png` renamed to `task-attachments.png`, now shoots the task attachments area instead of a nonexistent File Upload task type.
- `vendors-report-issue.png` renamed to `vendors-setup-status.png`, now shoots the vendor Setup Status menu instead of a nonexistent Report Issue form.
- `team-role-dropdown.png` renamed to `team-role-controls.png`, now shoots the Primary radio / Consulted toggle controls instead of a nonexistent role dropdown.
- `brand-request-approval.png` dropped, no re-spec. See the note under 09 Brand Standards above.

**1 dropped:**

- `brand-request-approval.png`, no approval flow exists on Brand pages.

**2 new shots:**

- `welcome-help-menu.png`, the top-bar Need help? menu, added to article 01 to cover the help desk paragraph.
- `team-member-detail.png`, the member detail panel, added to article 08 to cover its own dedicated section.

**3 clarity renames (not RED re-specs, just naming and description fixes):**

- `home-task-hover.png` renamed to `home-task-open.png`, since the shot captures an opened task, not a hover state.
- `brand-visual-standards.png` renamed to `brand-identity.png`, matching the real tab name Identity.
- `assets-photos.png` renamed to `assets-collection.png`, matching the real Collections model instead of a nonexistent Photos category.

**Description fixes (filename unchanged):**

- `welcome-avatar-menu.png`: now "Avatar menu open (Settings, Log Out)", was "Avatar menu open (Help desk, Settings)". The avatar menu only ever held Settings and Log Out; help lives in the top-bar menu, which is why `welcome-help-menu.png` was added.
- `projects-detail.png`: now "Open project: task list grouped by status", was "Open project: phases + tasks". The franchisee surface groups tasks by status; there's no phases UI.
- `task-anatomy.png`: now "Task panel: type, due date, action button", was "Task card with chip + action button called out". Matches the real task panel anatomy.
- `vendors-detail.png`: now "Vendor detail: tabs Details / Contacts / Locations / Manuals / Assets", was "Vendor detail with 3 action buttons". The three franchisee action buttons don't exist; the detail view is tabbed.
- `team-add-member.png`: now "Invite teammate modal (name, email, title, reason)", was "Add Team Member form". The button and modal are both labeled Invite teammate, not Add Team Member.
- `learning-course-card.png`: now "Started course card with Continue Course (list view; needs a started course)", was "A course card (started, Continue Course)". Continue Course only renders in list view, not grid view.
- `assets-home.png`: now "Assets home: Collections/Files toggle with collection cards", was "Assets home: five category tiles". The five category tiles don't exist; Assets is a Collections/Files toggle with brand-defined collection cards.

## Changes since v2 (2026-07-13)

**2 new article groups, 3 new shots, all green:**

- Article 00 Creating Your Account added ahead of article 01: `account-signup-form.png`.
- Article 13 Resetting Your Password added after article 12: `login-forgot-link.png`, `forgot-password-form.png`.
- Article-shot count moves from 35 to 38; combined with the unchanged 12 full-page reference shots, the tracker total moves from 47 to 50.

**Re-sync against current article text (2026-07-13, second pass):**

- Article 07 retitled its lead section from "The vendor grid" to "The vendor list" and moved from a card grid to a table. `vendors-grid.png` description updated to "Vendor table (name, usage badge, category, location assignments, contacts)"; its placement and `vendors-detail.png`'s placement re-derived from the current text ("The main view is a table…" / "Click a row and the detail view opens…").
- Article 11 restructured "## Categories" into "## Browsing and categories" (tabs: Browse, My List, Recommended, Recently Viewed, Recently Updated, plus category filter pills, no more left-rail categories). `manuals-home.png` description, state, and placement updated accordingly. `manuals-search.png` description updated to "Search results for a phrase (result card with title and snippet)" and its cursor dropped from arrow to none.
- All 38 article-shot placement anchors re-verified against current article text. One additional drift found and fixed outside 07/11: article 04's `task-complete.png` anchor quoted "Once you finish, the task gets a green…", but the current text reads "the task gets a Task complete confirmation with a large green check…" — anchor updated to "Once you finish, the task gets a Task complete confirmation…". All other anchors in articles 01, 03, 04, 05 (and 11's `manuals-document.png`) matched current text verbatim; no changes needed.

## Article 02 re-spec (2026-07-13, third pass)

**2 new shots, both green, at Max's request to cover the Home page section by section:**

- `home-tasks.png` added: Your Tasks panel (header, task rows with due dates and status). Placement: `## What you'll find → after the Tasks bullet`.
- `home-panels.png` added: Home panel stack (Manuals, Brand Feed, Assets, Team). Placement: `## What you'll find → after the Quick links bullet (end of list)`.
- `home-overview.png` description narrowed to "Home top: greeting hero and Chat panel" (was the whole-page "Home page overview") now that the tasks and mid-page panels have their own dedicated shots.
- `home-task-open.png` description expanded to name the Details popover explicitly; its cursor changes from hand to arrow (it's an icon-button trigger, not a link). Placement and grade (yellow) unchanged.
- Article 02 moves from 2 to 4 shots; article-shot count moves from 38 to 40, and the tracker total (with the unchanged 12 full-page reference shots) moves from 50 to 52.
