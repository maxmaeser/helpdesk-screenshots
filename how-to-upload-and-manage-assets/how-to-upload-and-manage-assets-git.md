Assets are files you store and share across your organization - PDFs, images, videos, and other documents. The asset library gives you version control, granular sharing permissions, and organizational tools to keep everything accessible to the right people.

> **Note:** The **Library** in the sidebar shows all assets across your organization. Department-specific views like **Sales → Assets** display the same assets filtered to that department. Uploading or editing an asset in one view updates it everywhere.

![Library page showing the asset list for a brand](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-upload-and-manage-assets/assets-library-overview.png)
### Supported file formats

You can upload most common file types including:

- **Documents**: PDF, Word, Excel, and other office formats
- **Images**: JPEG, PNG, GIF, SVG, and other image formats
- **Video**: MP4 and other video formats (uses resumable uploads for large files)

Video uploads use the TUS resumable upload protocol, which means large video files can resume uploading if your connection is interrupted. You do not need to restart from the beginning.

### Uploading a new asset

1. Navigate to the **Library** or the asset section of a location, deal, or vendor.
2. Click **Upload** and select your file.
3. Add a title and description.
4. Set the visibility (public or private).
5. Optionally assign sharing permissions and department access during upload.

Assets can be linked to locations, deals, vendors, franchisee organizations, menu items, and applicant applications at the time of upload or later.

![Upload Assets dialog with a file selected, ready to upload](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-upload-and-manage-assets/assets-upload-modal.png)
### Creating a document (some accounts)

On accounts with the document editor enabled, the **Library** also has a **Create Document** option alongside Upload. This opens a native, collaborative document editor instead of requiring a file upload, and edits save as new versions like any other asset.

### Asset versioning

When you need to update a document, you have two choices:

- **Update Version**: Upload a new version of the same asset. This keeps the full version history intact and increments the version number. The new version becomes the current version, but all previous versions remain accessible. New versions must be the same file type as the original.
- **Upload a new document**: Create an entirely separate asset record. Use this when the new file is a different document rather than an update to the existing one.

To restore a previous version, open the asset detail view, browse the version history, and select the version you want to restore. The platform marks that version as current without deleting any other versions.

![Asset detail view, Versions tab, showing a version with Preview and Restore](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-upload-and-manage-assets/assets-version-history.png)
### Sharing permissions

Assets use a layered permission system:

**Agent-level permissions**: Share an asset with specific team members and control what they can do:

- **Read**: view and download the asset
- **Write**: edit metadata, upload new versions
- **Delete**: remove the asset
- **Share**: grant access to other agents, departments, or applicants

The person who uploaded an asset automatically has full permissions on it.

**Department-level permissions**: Share an asset with an entire department (Sales, Marketing, or Operations) within your brand. Department permissions also use the read, write, delete, and share levels. Any agent with the corresponding department access in their role can then access the asset.

**Application-level access**: Link an asset to a specific applicant's application to give them read access through their portal.

![Asset detail view, Share tab, showing the permissions matrix](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-upload-and-manage-assets/assets-sharing-permissions.png)
### Bulk-updating sharing permissions

To update permissions on multiple assets at once:

1. Select the assets you want to update in the library.
2. Use the **Bulk Share** action.
3. Choose the agents, departments, or applicants you want to grant access to, along with the permission levels.
4. Confirm the changes.

You can also use the **Share All** action to apply permission changes to every asset matching your current search and filter criteria.

![Two assets selected in the library with the bulk actions menu open on Share](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-upload-and-manage-assets/assets-bulk-share-menu.png)
### Collections

Collections let you organize assets into named groups for easier browsing. You can create a collection, give it a name and description, and add assets to it.

Collections are organizational - they help you group related assets together (for example, "Q1 Marketing Materials" or "Training Videos"). Permissions are still managed at the individual asset level, not at the collection level.

![An opened collection showing its assets](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-upload-and-manage-assets/assets-collection-view.png)
