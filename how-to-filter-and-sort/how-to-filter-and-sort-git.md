The prospect and lead tables both support filtering, sorting, and text search so you can find specific contacts or narrow your view to a working subset.

![Leads table toolbar with search bar, filter, sort, and views buttons](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-filter-and-sort/leads-toolbar.png)
### Searching

Type in the **search bar** at the top of the table to find contacts by name, email, phone number, city, company name, state, or country. Results update as you type.

### Filtering

Filters let you narrow the table to contacts matching specific criteria.

You can apply multiple filters at the same time. All filters must be satisfied for a contact to appear (AND logic).

![Filter dropdown open showing available filter fields](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-filter-and-sort/filter-panel.png)
**To add a filter:**

1. Click the **Filters** button in the toolbar.
2. Select a field to filter on.
3. Choose an operator (for example, "Contains", "Equals", "Is Before", "Is One Of").
4. Enter or select the filter value.
5. Click **Apply Filters**.

![Filter panel with First Name field, Contains operator, and a value entered, ready to apply](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-filter-and-sort/filter-panel-open-v2.png)
**Available filter fields for prospects:**

- **First Name**: contains, equals, is not equal to
- **Email**: contains, equals, is not equal to
- **Email Verification Status**: is, is not (Verified, Unverified, Invalid, Unknown, etc.)
- **City**: contains, equals, is not equal to
- **Imported**: is imported, is not imported
- **Segments (Tags)**: is one of, is not one of
- **Created At**: date comparisons (before, after, on, etc.)
- **Invited At**: date comparisons
- **LinkedIn URL**: has URL, has no URL

**Available filter fields for leads** include name, email, status, assigned rep, tags, city, company name, source, created date, and more.

To remove a filter, click the active filter chip and clear it, or remove all filters at once.

![Applied Status filter set to Fast-Track, narrowing the Leads table to 2 matching results](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-filter-and-sort/filter-example-applied.png)
### Sorting

You can sort the table by one or more fields to control the display order.

![Sort panel open with Created At descending](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-filter-and-sort/sort-panel.png)
**To apply a sort:**

1. Click the **Sorting** button in the toolbar.
2. Select a field (for example, Created At, First Name, Last Name, or Imported).
3. Choose **Ascending** or **Descending**.
4. Add additional sort conditions if needed. The table sorts by your first condition first, then breaks ties with subsequent conditions.
5. Click **Apply Sorting**.

### Views

Both the prospect table and the leads table let you save your current filters, sort order, and columns as a named view. Views also appear on other tables across FS Ai, including Franchisees, Locations, and Vendors.

![Views panel open on the Leads table, showing the default configuration and no saved views yet](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-filter-and-sort/views-panel-empty.png)
**To save a view:**

1. Set up the filters, sort order, and columns you want.
2. Click **Views** in the toolbar.
3. Enter a name and click **Save**.

Changing the filters, sort, or columns while a saved view is active flags that view as having unsaved changes. Click **Update view** to save the changes to it, or **Save as new** to keep the original view and create a separate one.

![Views panel showing an active view flagged with unsaved changes, with Update view and Save as new buttons](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-filter-and-sort/views-panel-unsaved-changes.png)
Hover a view and click the star icon to set it as your default. Your default view loads automatically the next time you open the table.

**Reset to default** clears your current configuration and returns to it.

Use **Search views** to find a view by name once you have several saved, and a view's actions menu to delete it.

Views are personal to your account. Other team members do not see your saved views.

### Tips

- Filters and sorting are preserved in the URL, so you can bookmark or share a filtered view with a teammate by copying the page URL.
- Combine filters to build targeted lists. For example, filter by tag "Trade Show" and email verification status "Verified" to find your highest-quality contacts from a specific source.
