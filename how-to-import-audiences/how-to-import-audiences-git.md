You can add contacts to the platform one at a time or in bulk via CSV. Imports go to your prospect list (Marketing → Audiences) by default, or you can import directly into your sales leads table.

### Importing a Single Prospect

1. Go to **Marketing → Audiences**.
2. Click **Actions** in the toolbar, then **Import**, and select **Import Single Prospect**.
3. Fill in the contact details: at minimum, an **email address** is required.
4. Click **Save**.

![Actions menu on the Audiences page with Import expanded, showing Import from CSV and Import Single Prospect](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-import-audiences/audiences-import-menu.png)

The new prospect appears in your prospects table immediately.

### Importing Prospects in Bulk via CSV

1. Go to **Marketing → Audiences**.
2. Click **Actions** in the toolbar, then **Import**, and select **Import from CSV**.
3. Upload your CSV file. The platform maps your columns to prospect fields (name, email, phone, and any custom fields you have configured for your brand).
4. Optionally, select one or more **tags** to apply to all imported prospects.
5. Choose whether to **validate emails** during import. When enabled, the platform runs email verification in the background and marks each address as verified, invalid, or unknown. When disabled, imported prospects are marked as verified by default.
6. Confirm the import.

After the import completes, you see a summary showing how many prospects were successfully imported, how many were skipped (duplicates), and how many failed.

> **Duplicate handling:** The platform checks each email address against existing prospects, existing leads, and existing franchisees for the same brand. If a match is found, that row is skipped. No data is overwritten.

### Importing a Single Lead

1. Go to **Sales → Pipeline**.
2. Click **Actions** in the toolbar, then **Import**, and select **Import Single**.
3. Fill in the contact details: an **email address** is required.
4. Click **Save**.

![Actions menu on the Pipeline page with Import expanded, showing Import Single, Import from CSV, and Imports in Progress](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-import-audiences/import-dropdown-menu-v2.png)

The new lead is created directly in your sales pipeline.

### Importing Leads in Bulk via CSV

1. Go to **Sales → Pipeline**.
2. Click **Actions** in the toolbar, then **Import**, and select **Import from CSV**. This opens a dedicated import flow where you upload your file and map columns to lead fields.
3. Optionally, select tags to apply to the imported leads.
4. Confirm the import.

Imported leads are created in the sales pipeline and can be assigned to reps, given a lead status, and included in sales sequences. If you leave the import flow before it finishes, reopen it from **Actions → Import → Imports in Progress**.

### Tips

- Clean your CSV before importing. Remove rows with missing email addresses to avoid failures.
- Use tags during import to label the source of your contacts (for example, "Conference List" or "Purchased List") so you can filter and report on them later.
- If you import someone as a prospect and they later sign up through the applicant portal with the same email address, the platform merges their data into a lead record. See the best practices article for details on how this works.
