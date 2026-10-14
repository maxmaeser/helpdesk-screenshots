Connect your ad accounts to your application pages in Franchise Systems Ai (FS Ai). Ad tracking reports visitor activity and application milestones to Meta and Google.

> You need permission to edit brand settings and the IDs or conversion labels from your ad account.

### Find Ad Tracking

Open **Connections** under Brand in your settings, then find **Ad tracking**. On FranDev (Recruitment Funnel), the card is on the **Profile** page under Brand instead.

You reach **Settings** from your profile picture at the bottom of the sidebar. The card's description identifies whether you are connecting an applicant portal or a funnel.

![Ad tracking card with Meta and Google sections collapsed](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/ad-tracking/ad-tracking-overview.png)

### Connect Meta

1. Expand **Meta**.
2. Paste your **Meta Pixel ID**. The field's help text explains where to find it.

![Expanded Meta section with the pixel ID field](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/ad-tracking/ad-tracking-meta.png)

The pixel receives page views, sign-ups, booked calls, and signed FDDs. Funnel brands also report submitted applications.

### Connect Google

1. Expand **Google**.
2. Paste your **Google tag ID**. Use an ID starting with AW- for Google Ads. An ID starting with G- also works for page views.
3. Add the conversion labels for the milestones you track. Use the part after the slash in the conversion action's send_to value.

- **Sign-up conversion label**: someone signs up or starts an application.
- **Email confirmed conversion label**: an applicant confirms their email in the applicant portal. A funnel does not send this event.
- **Call booked conversion label**: an applicant books a call with your team.

![Google tag and conversion labels for sign-up, email confirmation, and booked calls](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/ad-tracking/ad-tracking-google-upper.png)

- **Application submitted conversion label**: an applicant submits the funnel application form. An applicant portal does not send this event.
- **FDD signed conversion label**: an applicant signs their FDD on your page.

For an FDD signed through an outside signing link, the applicant portal reports it once the applicant returns to the portal. The funnel does not report outside-link signatures.

The optional **Google Tag Manager container ID** is for agencies managing their own tags.

![Remaining Google conversion labels, optional Tag Manager container, and Save](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/ad-tracking/ad-tracking-google-lower.png)

### Save Your Settings

Click **Save** at the bottom of the card.

A section shows **Connected** when it has at least one saved value. This indicates saved configuration; it does not confirm that an ad account has received an event.

For tracked short links and QR codes, see *[About Link Tracking]*.
