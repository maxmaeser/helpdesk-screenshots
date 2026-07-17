Uploading a file to your asset library does not make it visible to franchisees.

In Franchise Systems Ai (FS Ai), an asset moves through three separate states. It only reaches a franchisee once you take a second, explicit step after uploading.

This article explains that model so you know exactly why a file does or does not show up for your franchisees.

### The three states of an asset

Think of every file as sitting in one of three states.

**Uploaded**: The file lives in your **Library**. Only brand agents can see it. No franchisee has access yet. This is the default state for everything you upload.

**Published to franchisees**: The file is now visible to your franchisees in their own library view. This is a brand-wide switch, not tied to any one location.

**Linked to a location**: The file lives inside a specific location's library and appears on that location's page. It is visible only to the franchisees of that location's entity, plus brand agents.

Uploading handles the first state. Publishing and linking are two different actions that handle the other two. They surface in two different places.

### Two ways to reach franchisees

There are two independent paths, and choosing the wrong one is the most common reason a file seems to go missing.

**Publish to all franchisees (from the Library)**: Makes the asset or collection available to every franchisee organization, brand-wide. It appears in their library, not on any specific location page.

**Link it to a location (from Operations → Locations)**: Places the asset in one location's library so it appears on that location's page, scoped to the franchisees of that location's entity.

Publishing in the Library does not put a file on a location page.
Linking a file to a location does not publish it to everyone.

If you published a file to the Library and expected it on a location page, this is why it was not there. Those are two separate surfaces.

### Publishing a collection to all franchisees

1. Go to **Library**.
2. Right-click the collection in the left sidebar and choose **Edit Collection**.
3. Turn on the **Publish to all franchisees** toggle.
4. Click **Save Changes**.

When the toggle is off, the helper text reads "Only visible to explicitly shared organisations."
When it is on, it reads "Visible to all franchisee organisations."

![Edit Collection dialog with the Publish to all franchisees toggle on](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-assets-reach-your-franchisees/library-edit-collection-toggle.png)

A published collection shows a blue **Published** pill with a globe icon next to its name in the sidebar.

![Library sidebar showing collections with the blue Published pill](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-assets-reach-your-franchisees/library-published-pills-v2.png)

To share a collection with only certain franchisee organizations instead of all of them, use **Sharing and Permissions** from the same right-click menu.

### Publishing individual assets

You can also publish files one by one without using a collection.

1. Go to **Library**.
2. Select one or more assets using the checkboxes at the left of each row.
3. Choose **Publish to Franchisees** from the actions that appear.

![Library list with three assets selected and the Publish to Franchisees action open](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-assets-reach-your-franchisees/library-bulk-publish-v2.png)

The **Published to Franchisees** filter at the top of the Library sidebar, marked with a globe icon, shows everything currently published brand-wide. Use it to confirm what your franchisees can see.

### Adding assets to a location

This is the path that makes a file appear on a specific location's page.

1. Go to **Operations → Locations** and open a location.
2. Select the **Assets** tab.
3. In the **Libraries** column, pick the entity library for that location (listed under **Entity Libraries**).
4. Use **Upload** to add files, or **+ Add collection** to group them.

![Location Assets tab with the entity library selected and its visibility caption](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-assets-reach-your-franchisees/location-assets-entity-library.png)

The panel confirms who can see the files with a caption that names the location and its entity. It states the files are visible to franchisees of that entity and to brand agents.

You can create a collection directly inside a location's library. When a library has no collections yet, the empty state offers to "Link an existing collection or create one to group these files." The **+ Add collection** button sits at the bottom of the column.

### When a location loses its franchisee link

If a location is no longer linked to the franchisee entity that owned its library, a yellow banner appears on the **Assets** tab. It warns that the location is no longer linked to that entity, so franchisees can no longer see the documents and only brand agents can.

![Yellow warning banner on a location's Assets tab for a library no longer linked to its entity](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-assets-reach-your-franchisees/location-assets-orphaned-banner.png)

If franchisees report missing documents on a location, check for this banner first. Re-linking the location to its entity restores their access.

### Next steps

- Learn the upload, versioning, and permission basics: *[How to Upload and Manage Assets]*
- Understand the location record that assets attach to: *[About Locations]*
