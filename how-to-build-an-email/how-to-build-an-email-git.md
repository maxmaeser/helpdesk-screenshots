The email builder is a visual editor where you compose email content, set subject lines, and preview how your emails look before sending. Every email template you create can be reused across campaigns and workflows.

### Opening the Email Builder

1. Navigate to the **Workflows** section under Marketing, Sales, or Operations.
2. Switch to the **Content** tab.
3. Click on an existing email template to edit it, or create a new one.

![Content tab under Marketing Workflows showing the template list](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-build-an-email/workflows-content-tab.png)

The editor opens in a full-screen view with the editing canvas on the left and a settings sidebar on the right.

![Email builder editor open, showing the canvas and the sidebar](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-build-an-email/email-builder-overview.png)

### Using the Blocks Tab

The sidebar on the right has three tabs: **Blocks**, **Theme**, and **Details**. The **Blocks** tab is where you drag and drop elements onto the canvas.

Blocks come in two groups, and the group tells you what kind of thing you are adding.

**Basic** is text. Seven blocks, each one a paragraph-level element you then type into:

- **Text**: an ordinary paragraph. This is the one you will use most.
- **Heading 1**, **Heading 2**, **Heading 3**: three heading levels, styled by your theme rather than set per block.
- **Bulleted List** and **Numbered List**: both drop in with one list item ready to type into. Press Enter for the next item.
- **Blockquote**: an indented quote block.

![Blocks tab open with the Basic group, a block mid-drag onto the canvas](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-build-an-email/email-builder-blocks-basic.png)

**Insert** is everything that is not text. Seven blocks, and these are the ones worth knowing before you build:

- **Divider**: a horizontal rule between sections.
- **Button**: a linked call to action. Drops in reading "Button"; click it to set the label and the link.
- **Image**: drops in a placeholder you then click to upload over. See **Editing an Image** below for what you can do to it afterwards.
- **Two Columns**: a side-by-side pair of empty columns. Drag other blocks into either side.
- **Merge Tags**: inserts a personalization tag inline. Same tags as the subject line.
- **Brand Logo**: pulls the logo straight from your brand settings, so it stays right when the brand changes.
- **Footer**: your unsubscribe and address block. It can only be added once, and once it is on the canvas the block greys out in the sidebar. Hover the row for a **Footer Settings** action to edit what it says.

![Blocks tab open with the Insert group and a Two Columns, Button and Brand Logo block placed on the canvas](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-build-an-email/email-builder-blocks-insert.png)

Drag a block from the sidebar and drop it into the canvas at the position you want. This works alongside slash commands, so you can build your layout with whichever method is faster for what you are adding.

### Writing Your Email

The editor uses a rich-text WYSIWYG format. You can type directly into the canvas and format text using the toolbar or slash commands:

- **Text formatting**: Bold, italic, headings, lists, links, and alignment
- **Slash commands**: Type `/` to open a command menu for inserting elements like images or your brand logo
- **Keyboard shortcut**: Press **Cmd+S** (Mac) or **Ctrl+S** (Windows) to save at any time

### Using Merge Tags

Merge tags let you personalize emails with recipient-specific information. Insert them by selecting from the available variables in the editor toolbar:

- `{{first_name}}`: Recipient's first name
- `{{last_name}}`: Recipient's last name
- `{{email}}`: Recipient's email address

Merge tags work in both the email body and the subject line. When the email is sent, each tag is replaced with the actual data for that recipient.

### Setting the Subject Line

The subject line sits in its own row above the canvas, labeled **Subject:**. It takes merge tags the same way the body does.

To its right is a counter reading your length over 72, the recommended limit. Go past 72 and the number turns orange. Nothing stops you sending a longer subject, but some email clients will truncate it.

![Subject line field with a merge tag chip and the character counter reading 39/72](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-build-an-email/email-builder-subject-line.png)

### Adding Images

You can add images two ways:

- **Slash command**: Type `/` and select **Image** to upload a file
- **Brand logo**: Type `/` and select **Brand Logo** to insert your brand's logo (this pulls from your Brand Settings)

Images are uploaded and hosted automatically. You can also click on any existing image in the editor to change its source.

### Editing an Image

Click any image in the canvas to bring up its toolbar. From there you can:

- **Align** the image left, center, or right
- **Lock the aspect ratio** so resizing keeps the image in proportion
- **Change Image** to swap in a different upload
- **Delete** the image
- **Add a link** so clicking the image opens a URL
- **Set border radius** to round the corners
- **Set outline width and color** to add a border around the image

![Image selected in the canvas with its toolbar open, showing alignment, the aspect ratio lock, change, delete, link, border radius and outline controls](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-build-an-email/email-builder-image-toolbar.png)

Drag the handles on the image's corners to resize it. With the aspect ratio lock on, resizing keeps the width and height proportional.

### Customizing the Theme

The sidebar includes theme options for styling your email. You can adjust colors, fonts, and layout settings to match your brand identity. If your portal has a primary brand color configured, it appears as a selectable option in the editor.

![Theme tab open with Typography and Body font controls expanded](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-build-an-email/email-builder-theme.png)

### Previewing Your Email

Next to the template name in the top bar is a control with **Edit** and **Preview** on it, plus **Performance** once the template has been saved. Switch it to **Preview** to see the email rendered.

A second toggle appears beside it while you are in Preview, with two views:

- **Desktop**: the email at full width, as a desktop client shows it
- **Mobile**: the same email in a narrower column

![Preview mode showing the Desktop view](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-build-an-email/email-builder-preview-desktop.png)

![Preview mode showing the Mobile view](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-build-an-email/email-builder-preview-mobile.png)

Switch the control back to **Edit** to keep working.

### Saving Your Work

- Click **Save and Exit** to save changes and return to the content list.
- Use the dropdown arrow next to the button if you need to exit without saving.
- The editor shows a **Last saved at** timestamp so you always know when your latest changes were preserved.

![Save and Exit dropdown open, showing Exit without saving](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-build-an-email/email-builder-save-dropdown.png)
