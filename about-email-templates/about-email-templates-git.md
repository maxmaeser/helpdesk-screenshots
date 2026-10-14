Email templates are the reusable emails you send from Franchise Systems Ai (FS Ai), for portal notifications and for one-off or scheduled campaign sends.

Go to **Studio → Email Templates** to see and manage every template in your brand.

In FranDev (Recruitment Funnel), open **Emails** instead. On Full OS, **Studio → Email Templates** appears on accounts with portal notifications enabled.

### The template list

The page shows a **Total Templates** count, then a table with these columns: **Name**, **Type**, **Department**, **Emails Sent**, **Created By**, **Date Added**, and **Last Updated**.

Every template is one of two types, and each opens into a different editor.

![](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-email-templates/email-templates-list.png)

### Portal Notification templates

Portal Notification templates are system-authored emails FS Ai sends automatically, like new chat messages or deal updates.

In the template list, the Type column marks an inactive one as **Portal Notification · Inactive**.

Opening one shows an inbox-style preview of the email. You can edit:

- **Subject Line**
- **Title**
- **Description**
- **Button Text**
- The button's colors

Click **Save** to apply your changes.

![](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-email-templates/email-template-portal.png)

### The FDD disclosure email

Open **FDD Signature Request** to edit the email that asks a lead to review and sign their FDD. Alongside the usual subject, title, description, and button fields, it has a **Disclosure Notice** section.

![FDD Signature Request editor showing Disclosure Notice and Save](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-email-templates/fdd-email-disclosure-notice.png)

Edit **Notice Heading** and **Notice Paragraphs** there, separating paragraphs with a blank line. **Reset to default** restores the default notice; click **Save** to save your changes.

### Campaign Email templates

Campaign Email templates are the emails you write and send yourself, as a single deploy or as part of a Workflow.

Opening one puts you in the campaign editor, with:

- A **subject line** field with a character counter
- A rich-text **body** that supports merge fields, so you can pull in contact and brand details automatically
- A **Fallback Footer** you can customize, including `company_name`, `company_address`, and `unsubscribe_link`

The editor gives you three actions: **Save and Exit**, **Preview**, and **Deploy**.

![](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-email-templates/email-campaign-editor.png)

### Links for your brand's applicant surface

The `funnel_url` and `portal_base_url` merge fields resolve to your brand's Recruitment Funnel or Applicant Portal address, depending on which surface it uses. Your brand needs that address configured for the fields to produce a destination.

For a Recruitment Funnel brand, campaign email unsubscribe links open a shared unsubscribe page. An Applicant Portal brand uses its portal's unsubscribe page, with the shared page as a fallback if no portal domain is configured.

Tracking short links use the same applicant-surface address, followed by `/t/` and the link's slug. Keeping that tracking URL in a template preserves the shared redirect to the link's destination.

### Warning banners

Two warning banners can appear at the top of the Email Templates page, depending on your brand's setup:

- **Missing required brand information**: your brand profile is missing details required for compliant campaign email
- A prompt to connect a verified sending domain to send your own marketing emails; automatic funnel emails use the built-in sender until then

Neither banner blocks you from viewing or editing templates.

To resolve the domain warning, connect a domain to your brand. See *[About Domains and Domain Health]* for how to add and verify one.
