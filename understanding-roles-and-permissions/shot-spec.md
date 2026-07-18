# Shot Spec: Understanding Roles and Permissions

**Status: captured (fallback agent capture, 2026-07-17) — superseding the table below, which was the original Max-shoots spec.**

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Organization Members page, Team Admins section | Settings > Organization > Members, cropped to the heading + first three rows so only clean job-title chips (CTO, Intern, COO) are visible | none | members-access-levels.png | 900 CSS px |
| 2 | Team member's Settings tab, Brand Permissions matrix | Settings > Organization > Members, click a Team Member row to open their Agent Profile panel, open the Settings tab, expand a brand in Brand Permissions to show the Read/Write/Chat category toggles | none (read-only informational panel) | member-brand-permissions.png | 896 CSS px |
| 3 | Brand Team role dropdown open | Settings > Brand > Team & Access, open a member's role dropdown showing all RACI options (No role checked, through VP Franchise Development) | none (trigger hidden behind the open menu in this crop, so cursor omitted per the dropdown rule) | brand-team-role-list.png | 900 CSS px |

3-shot list for a conceptual article: shot 1 anchors "organization access levels" + "job title is not a role"; shot 2 anchors the "member specific brand permissions" grant mentioned in the Member paragraph (added 2026-07-18 per Max's review comment); shot 3 anchors "brand team roles are for project templates". Billing access and the invite flow are already illustrated in `how-to-invite-users` (cross-referenced from this article), so no invite-modal shot was duplicated here.
