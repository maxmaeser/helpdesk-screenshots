The portal editor lets you build and customize the applicant-facing experience - the pages and steps your leads see after signing up. You control the layout, content, and visual design from a single editor.

### Opening the Portal Editor

Navigate to **Portals → Editor** from the sidebar. The editor opens in a full-screen view with three tabs at the top: **Edit**, **Theme**, and **Style**.

![Studio sidebar with Portals Editor selected](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-edit-your-portal/portal-nav-sidebar-2026-03-13.png)
### Working with Sections and Steps

Your portal is organized into **sections** (collapsible groups) containing **steps** (individual actions an applicant completes). Each step has a type that determines what the applicant does.

![Portal editor full view with sections and steps](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-edit-your-portal/portal-editor-overview-2026-03-13.png)
**Available step types:**

- **Video**: Embed a video for the applicant to watch
- **Form**: Present a form to collect information
- **Slides**: Display a slide deck or presentation
- **Call**: Schedule a call through the booking system
- **Sign**: Send a document for electronic signature
- **Visit Link**: Direct the applicant to an external URL
- **Upload**: Request a file upload from the applicant

To add a step, click **Add Step** at the bottom of a section. Select the step type, fill in the title and description, then configure the action-specific fields.

![Add Step panel with step type dropdown](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-edit-your-portal/portal-add-step-2026-03-15.png)
### Reordering Steps

Drag and drop steps to reorder them within a section. You can also drag steps between sections to move them to a different group.

### Hiding Steps from Applicants

Each step has a **Hide For Applicants** toggle in its visibility settings. Turn this on to keep a step hidden while you work on it. The step remains in the editor but does not appear on the live portal.

![Step settings panel with Hide For Applicants toggle](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-edit-your-portal/portal-hide-toggle-2026-03-13.png)
### Customizing Typography

Switch to the **Theme** tab to adjust text styling. You can configure the font family and size for four text levels:

- **Heading 1**: Primary headings
- **Heading 2**: Secondary headings
- **Heading 3**: Tertiary headings
- **Body**: Standard paragraph text

Each level offers three size options (Small, Medium, Large) and a selection of font families including Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Playfair Display, and Raleway. Heading levels can also inherit the body font.

![Typography settings with font size and family for each heading level](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-edit-your-portal/portal-theme-typography-2026-03-13.png)
### Choosing Theme Colors

Below the typography settings, select a **Base Theme Color** and a **Secondary Theme Color** from 10 presets: Default, Blue, Burgundy, Cyan, Gold, Green, Orange, Purple, Red, and Yellow. The secondary color controls accents like buttons, icons, and avatars.

![Base Theme Color presets with 10 color options](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-edit-your-portal/portal-theme-colors-2026-03-13.png)
### Adding Custom CSS

Switch to the **Style** tab to open the CSS editor. Write custom CSS using data-attribute selectors to target specific portal elements such as headers, stage cards, and step cards. A CSS selector reference is displayed below the editor for quick lookup.

![Custom Styles CSS editor with selector reference](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-edit-your-portal/portal-style-css-2026-03-13.png)
### Editing the Signup Page

Navigate to **Portals → Signup Builder** to customize the page where new applicants create their account. The builder has three sections:

- **Page Style**: Choose a layout (Left Aligned, Right Aligned, or Center Aligned), upload a background image, set a title and subtitle, and adjust logo sizing
- **Form Fields**: Select an existing form to display additional fields during signup, beyond the required First Name, Last Name, Email, and Phone
- **Custom CSS**: Add custom styles to the signup and login pages using data-attribute selectors

Click **Publish** to save your signup page changes. Use **View Live Portal** to preview the result.
