The Connections page under Brand in your settings holds four cards: Domains, Campaign attribution, Integrations, and Webhooks.

Domains and Campaign attribution are covered in *[About Domains and Domain Health]*. This article covers Integrations and Webhooks.

To get there, click your profile picture at the bottom of the sidebar, select **Settings**, and open the **Connections** page under Brand.

### Integrations

The Integrations card connects third-party apps to this brand.

Currently available: **Toast**, a point of sale integration. The card shows a **Connected** or **Unconnected** badge.

Click **Connect account** to link a Toast account, or **Reconnect account** if you need to refresh an existing connection.

![Integrations card showing the Toast point of sale row with an Unconnected badge and the Connect account button](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-integrations-and-webhooks/integrations-toast-card.png)
### Webhooks

Webhooks send you a notification at your own endpoint whenever certain events happen on this brand.

Each configured webhook shows its destination URL and a signing secret, used to verify that a request actually came from Franchise Systems Ai (FS Ai). The signing secret is masked by default. Click the eye icon to reveal it.

To add a webhook, enter an **Endpoint URL** and click **Add webhook**. Webhook endpoints must use HTTPS. A plain HTTP URL is rejected.

Use the **Docs** link on this card for the event payload reference if you're setting up the receiving end yourself.

To stop a webhook, open its actions menu and select **Remove**. This deletes it permanently.

If no webhooks are configured yet, the card shows an empty state until you add your first one.

![Webhooks card in its empty state, with the Add webhook form showing the Endpoint URL field and the HTTPS requirement](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-integrations-and-webhooks/webhooks-empty-state.png)
