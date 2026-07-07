# Franchisee Onboarding — Capture Plan

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

Cursor column = where the pointer should conceptually sit (Claude overlays it). Skip a shot if the UI doesn't exist yet or matches another article's shot.

### 01 Welcome
| # | Shot | UI state | Cursor | Filename |
|---|---|---|---|---|
| 1 | Full sidebar, all items visible | Portal loaded, sidebar expanded | none | `welcome-sidebar.png` |
| 2 | Avatar menu open (Help desk, Settings) | Click avatar at bottom of sidebar | arrow on avatar | `welcome-avatar-menu.png` |

### 02 Home
| # | Shot | UI state | Cursor | Filename |
|---|---|---|---|---|
| 1 | Home page overview | Home loaded, panels visible | none | `home-overview.png` |
| 2 | Task hovered showing due date + status | Hover an active task card | arrow on task | `home-task-hover.png` |

### 03 What Projects Are
| # | Shot | UI state | Cursor | Filename |
|---|---|---|---|---|
| 1 | Projects index list | Projects page loaded | none | `projects-index.png` |
| 2 | Open project: phases + tasks | A project open | none | `projects-detail.png` |
| 3 | New project template gallery | Click New project | arrow on a template | `projects-templates.png` |
| 4 | Task with Blocked status + reason | Open a blocked task | none | `projects-blocked.png` |

### 04 Completing a Task
| # | Shot | UI state | Cursor | Filename |
|---|---|---|---|---|
| 1 | Task card with chip + action button called out | Any task card | none | `task-anatomy.png` |
| 2 | A File Upload task card | Open a File Upload task | arrow on drop zone | `task-file-upload.png` |
| 3 | A completed task with green check | Task marked complete | none | `task-complete.png` |

### 05 Working with Approvers
| # | Shot | UI state | Cursor | Filename |
|---|---|---|---|---|
| 1 | Task with approver roles shown | Task detail with RACI-A | none | `approvers-roles.png` |
| 2 | Pending approval badge + approver avatar | Finished task pending approval | none | `approvers-pending.png` |

### 06 Locations
| # | Shot | UI state | Cursor | Filename |
|---|---|---|---|---|
| 1 | Locations list with status chips | Locations loaded | none | `locations-list.png` |
| 2 | Location detail + status history timeline | Open a location | none | `locations-detail.png` |
| 3 | Status dropdown open | Click status dropdown | arrow on new value | `locations-status.png` |

### 07 Vendors
| # | Shot | UI state | Cursor | Filename |
|---|---|---|---|---|
| 1 | Vendor grid of cards | Vendors loaded | none | `vendors-grid.png` |
| 2 | Vendor detail with 3 action buttons | Open a vendor | none | `vendors-detail.png` |
| 3 | Report Issue form | Click Report Issue | arrow on submit | `vendors-report-issue.png` |

### 08 Team and Roles
| # | Shot | UI state | Cursor | Filename |
|---|---|---|---|---|
| 1 | Team roster | Team loaded | none | `team-roster.png` |
| 2 | Add Team Member form | Click Add Team Member | arrow on Send invite | `team-add-member.png` |
| 3 | Role dropdown open on member detail | Open role dropdown | arrow on a role | `team-role-dropdown.png` |

### 09 Brand Standards
| # | Shot | UI state | Cursor | Filename |
|---|---|---|---|---|
| 1 | Brand overview page | Brand loaded | none | `brand-overview.png` |
| 2 | Visual standards reference | Open Visual standards | none | `brand-visual-standards.png` |
| 3 | Request approval form | Click Request approval | arrow on submit | `brand-request-approval.png` |

### 10 Learning
| # | Shot | UI state | Cursor | Filename |
|---|---|---|---|---|
| 1 | Courses tab with catalog | Learning loaded, Courses tab | none | `learning-courses.png` |
| 2 | A course card (started, Continue Course) | Hover a started course | none | `learning-course-card.png` |
| 3 | Course view: chapters, player, Resources | Open a course | none | `learning-course-view.png` |

### 11 Manuals
| # | Shot | UI state | Cursor | Filename |
|---|---|---|---|---|
| 1 | Manuals home: categories + document list | Manuals loaded | none | `manuals-home.png` |
| 2 | Document view with table of contents | Open a manual | none | `manuals-document.png` |
| 3 | Search results with highlighted matches | Run a search | arrow on a result | `manuals-search.png` |

### 12 Assets
| # | Shot | UI state | Cursor | Filename |
|---|---|---|---|---|
| 1 | Assets home: five category tiles | Assets loaded | none | `assets-home.png` |
| 2 | Photos grid | Open Photos | none | `assets-photos.png` |
| 3 | File detail with Download | Open a file | arrow on Download | `assets-file-detail.png` |
