# Shot spec: How to Import Franchisees and Locations

No committed article prose existed with an image gate for this one — the ~6 shot list below was derived directly from the canonical article body (`articles/FS Ai Helpdesk Articles/Operations/how-to-import-franchisees-and-locations.md`) since no shot list had been written yet. Captured via the persisted session in `scripts/capture/session.js` (fallback/agent capture, Max unavailable for this batch). Target crop width ~840 CSS px (1680 real px at 2x). Cursor added in post.

**No real records were created.** Two throwaway import drafts (Kharcho Kings franchisee-org and Kharcho Kings locations) were created purely to reach the mapping/review UI states, then removed via the documented **Delete Import** action before finishing — see notes below.

## Captured

| # | Shot | UI state | Cursor | Filename | Status |
|---|---|---|---|---|---|
| 1 | Audiences Actions menu | Operations → Audiences (Lumon Fresh), **Actions** dropdown open showing Create Entity / Imports in Progress / Import from CSV | arrow on **Import from CSV** | `audiences-import-actions-menu.png` | done |
| 2 | Import Franchisee Entities modal | Same page, clicked **Import from CSV**. Modal with **Brand** dropdown (set to Lumon Fresh) and **Start Import** | arrow on **Start Import** | `import-franchisee-entities-modal.png` | done |
| 3 | Upload step | Landed on the upload page after **Start Import** (Lumon Fresh). Dropzone + **CSV Import Template** / **Download** row | hand on **Click to upload your csv file** | `import-upload-step.png` | done |
| 4 | Map Fields step | **Locations** import flow (Kharcho Kings, not Lumon — see note below), after uploading a throwaway CSV. Shows auto-matched fields (Location Name, City, Zip Code all auto-mapped) plus `Select` dropdowns for unmapped columns | arrow on the **Store ID** row's `Select` dropdown | `import-map-fields.png` | done |
| 5 | Review step | Same Locations import draft, Review tab, **Location Name** field selected showing the validation table with a green **Valid** row | none (read-only result view) | `import-review.png` | done |
| 6 | Locations Actions menu | Operations → Locations (Kharcho Kings), **Actions** dropdown open showing Add Location / Imports in Progress / Import From CSV / Find Existing Locations | arrow on **Import From CSV** | `locations-import-actions-menu.png` | done |

## Why shots 4-5 are Locations, not Franchisee Entities, and why the brand switches

The franchisee-entity importer's field-mapping schema is **broken on staging right now**: `GET /ingestion/csv/schema/franchisee-org/{brandId}` returns `{"schema":{}}` (verified via response logging), so the "Map Franchisee Entity Fields" step renders a completely empty column list (`0 Mapped Fields` / correct total count, but no rows) no matter what CSV is uploaded. This reproduced identically on both Lumon Fresh and Kharcho Kings, so it's a backend bug, not a brand-data or CSV-formatting issue. Worth flagging to the product team.

The equivalent Locations schema endpoint (`/ingestion/csv/schema/location/{brandId}`) works correctly and auto-matched 4 of 7 columns from a throwaway CSV. Since the article states outright that "the flow for locations is identical" and "the same four steps apply" to both importers, shots 4 and 5 were captured from the Locations flow instead — same UI pattern, same step components, just not blocked by the bug. They're placed in the article's "Importing locations" section, where they're contextually accurate (the on-screen header says "Import Locations" / "Map Location Fields").

Lumon Fresh's franchisee-entity importer was additionally blocked by a **pre-existing pending draft** (`franchisee_org_import_template (1).csv`, 0/50 rows, created ~2 days before this session by someone else) that the "start a new import" flow refuses to bypass ("Please complete your existing franchisee entity import before starting another"). That draft was left untouched per the no-modify-staging-data constraint. Kharcho Kings was used instead for shots 4-6 because it had no blocking draft and no meaningful existing data to disturb.

## Cleanup performed

Two throwaway import drafts were created on Kharcho Kings to reach the mapping/review screens (a franchisee-org draft that hit the schema bug above, and a locations draft used for shots 4-5). Both were removed via the **Delete Import** button immediately after the screenshots were taken, confirmed by the page resetting to a fresh empty-upload state with no draft/Delete Import affordance left behind. No franchisee entities or locations were actually created on any brand.

## Test CSVs used (not committed)

- `franchisee-entities-sample.csv` — one row matching the article's documented template columns (Business Name, Business Entity, Date Of Incorporation, Email, Phone, Street Address, Line 2, City, Zip Code, Country, State/Province). Never successfully mapped due to the schema bug above.
- `locations-sample.csv` — one row (Location Name, Address, City, State, Zip Code, Country, Phone) used for the working Locations mapping/review shots.

## Notes for whoever picks this up next

- Brand ids used: Lumon Fresh = `11111111-1111-1111-1111-111111111111`, Kharcho Kings = `baa36ad1-ab80-4163-b03d-777db2e2a0da`. Set both `fsai-selected-brands-single` and `fsai-selected-brands-multi` localStorage keys before navigating.
- Routes: `FRANCHISEES` (`/operations/audience`), `FRANCHISEES_IMPORT` (modal-driven, not a direct deep link), `LOCATIONS` (`/operations/locations`), `LOCATIONS_IMPORT` (also modal-driven — direct-linking `/operations/locations/import` without an active draft/brand param 404s or hangs).
- The **Import Franchisee Entities** / **Import Locations** brand-select modal's "Start Import" button stays disabled until you explicitly click the dropdown and pick an option from `[role=option]` — the dropdown showing the brand name as placeholder text is not the same as the form having a value.
- The Locations onboarding modal ("Operations: Locations / Track every operating unit") pops on first visit per brand — dismiss with the **Maybe Later** button before screenshotting.
- `dom-sanitize.js` ran before every screenshot with defaults. No real customer PII was present in any of these flows (the CSV rows are synthetic test data I authored).
