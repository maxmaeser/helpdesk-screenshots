# Franchisee Onboarding — Capture Plan

> Synced with tracker v2 and placement map, 2026-07-13. Re-specs from capture-playbook-DRAFT adopted.

For the 12 franchisee onboarding articles (v1 text is drafted and importable now; images retrofit at v2). Capture on staging (`https://staging.app.franchisesystems.ai/`) as a franchisee, brand Lumon (super-admin impersonation preferred). All shots 2x (Retina).

Two things to capture:

1. **Full-page reference shots** (one per portal page) — for Claude's UI awareness and to verify the drafts against the real UI. Uncropped, any width. Drop in `screenshots/_fullpage/franchisee-portal/YYYY-MM-DD-{page}.png`.
2. **Article shots** (per the shot lists below) — the images that go in each article. Set up the real UI state; Claude adds cursors and branding in post. Drop raws in `screenshots/{article}/raw/`.

## Full-page reference shots (12)

| Page | File name |
|---|---|
| Home | `franchisee-portal/DATE-home.png` |
| Projects index + one open project | `franchisee-portal/DATE-projects.png` |
| A task card (any type) | `franchisee-portal/DATE-task-card.png` |
| Task card in pending-approval state | `franchisee-portal/DATE-task-pending.png` |
| Locations list + one location detail | `franchisee-portal/DATE-locations.png` |
| Vendors grid + one vendor detail | `franchisee-portal/DATE-vendors.png` |
| Team roster + Add Team Member form | `franchisee-portal/DATE-team.png` |
| Brand overview + a standards section | `franchisee-portal/DATE-brand.png` |
| Learning Courses tab + a course view | `franchisee-portal/DATE-learning.png` |
| Manuals home + a document view | `franchisee-portal/DATE-manuals.png` |
| Assets home + a file detail | `franchisee-portal/DATE-assets.png` |
| Sidebar + avatar menu open | `franchisee-portal/DATE-sidebar.png` |

## Per-article shot lists

Cursor column = where the pointer should conceptually sit (Claude overlays it). Placement = where the shot lands in the article (`## Section → after "quoted first words…"`). Skip a shot if the UI doesn't exist yet or matches another article's shot.

### 00 Creating Your Account
| # | Shot | UI state | Cursor | Filename | Placement |
|---|---|---|---|---|---|
| 1 | Account creation form (locked Invite Code and Email, name and phone fields) | logged out, open /franchisees/signup with no query params (renders the empty form shape) | none | `account-signup-form.png` | `## Accepting your invite → after "Your brand sends an invite email with…"` |

### 01 Welcome
| # | Shot | UI state | Cursor | Filename | Placement |
|---|---|---|---|---|---|
| 1 | Full sidebar, all items visible | Portal loaded, sidebar expanded | none | `welcome-sidebar.png` | `## What's in the sidebar → directly under heading, before the bullet list` |
| 2 | Avatar menu open (Settings, Log Out) | Click avatar at bottom of sidebar | arrow | `welcome-avatar-menu.png` | `## Your menu → after "Click your avatar at the bottom of…"` |
| 3 | Need help? menu open in top bar (Submit a ticket, My tickets, Open Helpdesk) | top-bar Need help? menu open | hand | `welcome-help-menu.png` | `## Your menu → after the "For help, click the Need help?…" sentence` |

### 02 Home
| # | Shot | UI state | Cursor | Filename | Placement |
|---|---|---|---|---|---|
| 1 | Home top: greeting hero and Chat panel | Home, fully loaded | none | `home-overview.png` | `intro → after "Home is the snapshot of your business…", before ## What you'll find` |
| 2 | Your Tasks panel (header, task rows with due dates and status) | Home, tasks panel in view | none | `home-tasks.png` | `## What you'll find → after the Tasks bullet` |
| 3 | Home panel stack: Manuals, Brand Feed, Assets, Team | Home, mid-page panels in view | none | `home-panels.png` | `## What you'll find → after the Quick links bullet (end of list)` |
| 4 | A task opened from Home with the Details popover (status, due date, type) | task open from Home, Details popover expanded | arrow | `home-task-open.png` | `## How to use it → after "Start your day here. Open a task…"` |

### 03 What Projects Are
| # | Shot | UI state | Cursor | Filename | Placement |
|---|---|---|---|---|---|
| 1 | Projects index list | Projects page loaded | none | `projects-index.png` | `## Finding your way around → after "The Projects page lists your projects in…"` |
| 2 | Open project: task list grouped by status | A project open | none | `projects-detail.png` | `## Finding your way around → after "Click a project to open it and…"` |
| 3 | Project Overview popover (summary, start date, linked locations) | project open, Overview popover expanded | hand | `projects-overview.png` | `## The project overview → after "Open a project and click Overview…"` |
| 4 | A Locked task row (dependency-gated, lock icon) | project with a dependency-gated task seeded | none | `projects-locked.png` | `## Task status → after "Some tasks depend on others finishing first…"` |

### 04 Completing a Task
| # | Shot | UI state | Cursor | Filename | Placement |
|---|---|---|---|---|---|
| 1 | Task panel: type, due date, action button | Any task card | none | `task-anatomy.png` | `intro → after "Task panels work the same way across…", before ## The seven task types` |
| 2 | Task attachments area (upload + attach from library) | task open, attachments area visible | arrow | `task-attachments.png` | `## Attachments → after "Tasks have an attachments area where you…"` |
| 3 | A completed task with green check | Task marked complete | none | `task-complete.png` | `intro → after "Once you finish, the task gets a Task complete confirmation…", before ## The seven task types` |

### 05 Working with Approvers
| # | Shot | UI state | Cursor | Filename | Placement |
|---|---|---|---|---|---|
| 1 | Task with approver roles shown | Task detail with RACI-A | none | `approvers-roles.png` | `## The five roles → after the RACI-A bullet list, before ## How approval works` |
| 2 | Pending approval badge + approver avatar | Finished task pending approval | none | `approvers-pending.png` | `## Tracking a pending task → after "When you finish a task that has…"` |

### 06 Locations
| # | Shot | UI state | Cursor | Filename | Placement |
|---|---|---|---|---|---|
| 1 | Locations list with status chips | Locations loaded | none | `locations-list.png` | `intro → after "Locations is the live record of each…", before ## The location detail` |
| 2 | Location detail + status history timeline | Open a location | none | `locations-detail.png` | `## The location detail → after "Click into a location and the detail…"` |
| 3 | Status dropdown open | Click status dropdown | arrow | `locations-status.png` | `## Updating a status → after "Status updates happen right from the detail…"` |

### 07 Vendors
| # | Shot | UI state | Cursor | Filename | Placement |
|---|---|---|---|---|---|
| 1 | Vendor table (name, usage badge, category, location assignments, contacts) | Vendors loaded | none | `vendors-grid.png` | `## The vendor list → after "The main view is a table…"` |
| 2 | Vendor detail: tabs Details / Contacts / Locations / Manuals / Assets | Open a vendor | none | `vendors-detail.png` | `## The vendor list → after "Click a row and the detail view opens…"` |
| 3 | Vendor Setup Status menu (Not Implemented / Implementing / Implemented) | vendor detail, setup status menu open | hand | `vendors-setup-status.png` | `## Setup status → after "The Locations tab tracks where this vendor…"` |

### 08 Team and Roles
| # | Shot | UI state | Cursor | Filename | Placement |
|---|---|---|---|---|---|
| 1 | Team roster | Team loaded | none | `team-roster.png` | `intro → after "Team is your roster of the people…", before ## Inviting a team member` |
| 2 | Invite teammate modal (name, email, title, reason) | Click Add Team Member | arrow | `team-add-member.png` | `## Inviting a team member → at step 1` |
| 3 | Role controls on a roster row (Primary radio / Consulted toggle) or the promote-to-Primary modal | Team roster visible, a member's role controls in view | arrow | `team-role-controls.png` | `## Roles → after "Roles are defined by your brand, and…"` |
| 4 | Member detail panel (Primary/Consulted badge, email, phone, joined date) | member detail open | none | `team-member-detail.png` | `## The member detail → after its lead paragraph` |

### 09 Brand Standards
| # | Shot | UI state | Cursor | Filename | Placement |
|---|---|---|---|---|---|
| 1 | Brand overview page | Brand loaded | none | `brand-overview.png` | `intro → after "Brand is your identity reference: a read…", before ## One page, up to six tabs` |
| 2 | Identity tab (logos, color palette with hex values) | Open Visual standards | none | `brand-identity.png` | `## One page, up to six tabs → after the Identity bullet` |

`brand-request-approval.png` dropped: no approval flow exists on Brand pages, article 09 already correct without it.

### 10 Learning
| # | Shot | UI state | Cursor | Filename | Placement |
|---|---|---|---|---|---|
| 1 | Courses tab with catalog | Learning loaded, Courses tab | none | `learning-courses.png` | `## The Courses tab → after "The tab opens on Pick up where…"` |
| 2 | Started course card with Continue Course (list view; needs a started course) | Hover a started course | none | `learning-course-card.png` | `## The Courses tab → after "Each course card shows the cover, the…"` |
| 3 | Course view: chapters, player, Resources | Open a course | none | `learning-course-view.png` | `## Inside a course → after "Open a course and the course view…"` |

### 11 Manuals
| # | Shot | UI state | Cursor | Filename | Placement |
|---|---|---|---|---|---|
| 1 | Manuals home: tabs (Browse, My List, Recommended...) with category filter pills | Browse tab, fully loaded | none | `manuals-home.png` | `## Browsing and categories → after "Manuals opens on tabs across the top…"` |
| 2 | Document view with table of contents | Open a manual | none | `manuals-document.png` | `## Reading a manual → after "Each manual opens in a clean document…"` |
| 3 | Search results for a phrase (result card with title and snippet) | Run a search | none | `manuals-search.png` | `## Search → after "Search runs across the whole library, not…"` |

### 12 Assets
| # | Shot | UI state | Cursor | Filename | Placement |
|---|---|---|---|---|---|
| 1 | Assets home: Collections/Files toggle with collection cards | Assets loaded | none | `assets-home.png` | `intro → after "Assets is your brand's file library…", before ## Collections and files` |
| 2 | An opened collection grid (nearest populated collection) | a populated collection open | none | `assets-collection.png` | `## Collections and files → after "Collections shows cards your brand has put together…"` |
| 3 | File detail with Download | Open a file | arrow | `assets-file-detail.png` | `## Downloading a file → after "The flow is the same whether you're…"` |

### 13 Resetting Your Password
| # | Shot | UI state | Cursor | Filename | Placement |
|---|---|---|---|---|---|
| 1 | Log In page with the Forgot Password? Reset here. link | logged out, /login | hand | `login-forgot-link.png` | `## Requesting a reset → at its first sentence, after "On the Log In page, click Forgot Password? Reset here."` |
| 2 | Reset your Password page (email field, Reset Password button) | logged out, /forgot-password | none | `forgot-password-form.png` | `## Requesting a reset → after "Enter the email attached to your account and press Reset Password."` |

## Verify at capture

These claims in the drafts are script-derived or were just corrected against code, not confirmed on a live screen. While capturing, check each one against the real UI and flag any mismatch so the article text gets fixed before import.

- **Button labels (exact casing):** **New project** (article 03), **Mark Complete** / **Submit** / **Open Link** (article 04), **Send invite** (article 08). Confirm each label reads exactly as bolded in the article.
- **Chat page (article 01):** confirm the one-line descriptor ("your message threads") matches what the page actually is.
- **Home panels (articles 02 and 05):** confirm what the Home page panels are actually named. Article 02 says brand feed; article 05 now says approvals surface "from Home". Note the real panel titles.
- **Avatar menu (article 01):** confirm the avatar menu shows only **Settings** and **Log Out**, and that help lives in the top-bar **Need help?** menu with **Submit a ticket**, **My tickets**, and **Open Helpdesk**.
- **Single-location sidebar label (articles 01 and 06):** with a one-unit franchisee, confirm the sidebar item reads **Location** singular.
- **Task-type picker (article 04):** confirm exactly 7 types: To Do, Form, Link, Meeting, Video, Slides, eSignature.
- **Locations statuses (article 06):** confirm the status set has 5 values including **Inactive**.
