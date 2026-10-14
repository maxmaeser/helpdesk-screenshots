SMS templates store reusable text messages in Franchise Systems Ai (FS Ai). You can write and save a template before buying a sending number or completing carrier registration.

> SMS must be enabled for your brand, and you need permission to create content in Marketing.

### Open the SMS composer

1. Go to **Marketing** → **Content**.
2. Open **Create** and select **SMS**.
3. Enter a **Template name** that your team can recognize.
4. Check **Departments**. Marketing is selected when you create the template here; **Add department...** lets you make it available to another department.

![Create menu with the SMS option](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/sms-templates/sms-templates-create.png)

### Write the message

Enter the text in **Message**. Under **Insert variable**, choose **First name**, **Last name**, or **Brand name** to insert a merge tag at the cursor.

These insert `{{first_name}}`, `{{last_name}}`, and `{{brand_name}}`. When Operations is selected, **Franchisee business name** also inserts `{{franchisee_name}}` for the recipient's business name.

You can also type `{{email}}` or `{{phone}}` into the message for recipient data. These do not have insertion buttons, and the sample preview does not replace them with example values.

For example: `Hi {{first_name}}, your Lumon Cafe discovery visit is tomorrow. Reply with any questions.`

![SMS composer with merge variables, message, and preview](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/sms-templates/sms-templates-composer.png)

### Check and save

Review **Preview** and the character and segment estimate. The preview uses sample names and includes the appended opt-out footer, so the final length depends on the recipient's details.

Emoji and other non-standard characters can change the encoding and increase the segment count. Follow the warning shown in the composer.

Click **Create template** to save. To edit later, open the SMS template from the content list and use **Save changes**.

Saving a template does not send a text. For the sending number and approval requirements, see *[How to Set Up SMS for Your Brand]*.
