You can bring franchisee entities and locations into Franchise Systems Ai (FS Ai) in bulk instead of creating each one by hand.

Both importers work the same way: upload a CSV, map your columns to FS Ai's fields, review and fix anything flagged, then run the import.

### Importing franchisee entities

1. Go to **Operations > Audiences**.
2. Click **Actions** in the toolbar, then select **Import from CSV**.
3. In the **Import Franchisee Entities** window, choose the brand you're importing into from the **Brand** dropdown, then click **Start Import**.

![](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-import-franchisees-and-locations/audiences-import-actions-menu.png)

![](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-import-franchisees-and-locations/import-franchisee-entities-modal.png)
This opens the import flow. Click **Click to upload your csv file** to select your file, or drag and drop it onto the drop zone.

If you don't have a file ready, click **Download** next to **CSV Import Template** first. The template's columns are **Business Name**, **Business Entity**, **Date Of Incorporation**, **Email**, **Phone**, **Street Address**, **Line 2**, **City**, **Zip Code**, **Country**, and **State/Province**.

![](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-import-franchisees-and-locations/import-upload-step.png)
The import flow has four steps:

- **Map Franchisee Entity Fields**: FS Ai auto-matches your CSV columns to its standard fields. Fix any mismatches using the dropdown next to each field, and hover over a mapped field to preview the data it will pull in.
- **Map Custom Fields**: match any remaining columns to custom fields your brand has defined.
- **Review**: shows every mapped field with a validation status. A field with bad data (an unrecognized phone format, for example) is flagged here, and you cannot continue until every flagged field is resolved.
- **Import**: starts the import and shows live progress. Once it finishes, the new franchisee entities appear in **Operations > Audiences**.

### Importing locations

The flow for locations is identical, just started from a different page.

1. Go to **Operations > Locations**.
2. Click **Actions** in the toolbar, then select **Import From CSV**.
3. In the **Import Locations** window, choose the brand and click **Start Import**.
4. Upload your CSV, or download the CSV Import Template first to see the expected columns.

![](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-import-franchisees-and-locations/locations-import-actions-menu.png)

![](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-import-franchisees-and-locations/import-map-fields.png)
The location template covers far more ground than the franchisee entity one: address and store details, lease terms, construction dates and costs, insurance information, and contacts like the architect, project manager, and property manager. For what each of those fields means, see *[About Locations]*.

The same four steps apply: map the standard fields, map any custom fields, resolve validation issues on the review step, then import.

![](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-import-franchisees-and-locations/import-review.png)
Finished locations appear in **Operations > Locations**.

If you only need to add a location one at a time, or want to pull existing sites in from Google Places instead of a CSV, use **Add Location** or **Find Existing Locations** from that same **Actions** menu. See *[About Locations]* for both.

### Tips

- Both importers accept up to 3,000 rows per file.
- Your progress is saved automatically as you move through the steps. If you leave partway through, reopen the draft from **Actions > Imports in Progress**.
- To abandon a draft import instead of finishing it, open it and click **Delete Import**.
- The platform checks for duplicates automatically during import and skips rows that match an existing record, so re-uploading the same file twice won't create duplicates.
