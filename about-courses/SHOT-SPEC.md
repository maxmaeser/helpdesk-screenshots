# Shot spec: About Courses

Brand: **Lumon Fresh** (populated data) plus **Kharcho Kings** (zero-data empty states) on `https://staging.app.franchisesystems.ai/`. Captured via agent fallback (`scripts/capture/session.js` persisted session, not Max) since this was a zero-image text-only article needing its first image pass.

Target crop ~840-900 CSS px width (2882 raw px at 2x, sidebar cropped out at capture time). No cursor overlays: all five shots are read-only overview/table/empty-state views per the cursor heuristic.

## Captured

| # | Shot | UI state | Cursor | Filename | Status |
|---|---|---|---|---|---|
| 1 | Courses tab + stat tiles | **Operations → Courses**, Lumon Fresh brand, default Courses tab, 4 stat tiles (Total Courses, Published, Enrollments, Completion Rate) visible above the course table | none | `courses-stat-tiles.png` | done |
| 2 | Learning Paths empty state | Learning Paths tab, Kharcho Kings brand (zero data), "No Learning Paths Yet" empty state | none | `courses-learning-paths-empty.png` | done |
| 3 | Certificates empty state | Certificates tab, Kharcho Kings brand (zero data), "No Certificates Yet" empty state | none | `courses-certificates-empty.png` | done |
| 4 | Enrollments tab | Enrollments tab, Lumon Fresh brand, assignment table with Franchisee/Type/Status/Progress/Due Date/Assigned columns populated | none | `courses-enrollments.png` | done |
| 5 | Analytics Overview | Analytics tab, Overview sub-tab, Lumon Fresh brand, cards for Total Enrolments/Completion Rate/Active Learners/Learning Hours plus Enrolment Status, Quiz Performance, Course Library tables | none | `courses-analytics-overview.png` | done |

## Notes

- Lumon Fresh has real course/enrollment data (11 courses, 12 enrollments), which gave a much more representative "Courses tab" and "Enrollments tab" shot than an empty brand would.
- Lumon Fresh's Learning Paths and Certificates tabs were NOT empty (2 learning paths, 1 certificate already exist there), so those two empty-state shots were captured on Kharcho Kings instead, which still has zero data across the board. Both empty states match the article's literal quoted copy ("No Learning Paths Yet" / "No Certificates Yet").
- Did not add a dedicated "Course" or "Franchisee" analytics sub-tab shot; the article only calls out the sub-tabs by name and the card types, which the Overview sub-tab already demonstrates.
- Full-page captures at 1680x1050 CSS, deviceScaleFactor 2 (3360x2100 raw), sidebar clipped out at CSS x=239 before saving to `raw/`.
