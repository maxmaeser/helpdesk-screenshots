Email domains control how your outbound emails appear to recipients and affect whether those emails land in inboxes or spam folders. Setting up and maintaining healthy domains is essential for effective email communication across your franchise.

> You need the **Workspace Settings** permission to add, edit, or remove domains.

### What Is an Email Domain?

An email domain is the part after the "@" in your sending address (e.g., `news@yourbrand.com`). When you connect a domain to Franchise Systems Ai (FS Ai), you can send emails from addresses on that domain rather than from a generic sender.

### Domain Purposes

Each domain can be assigned one or more purposes that determine which types of emails it handles. You can enable or disable these at any time:

- **Sales**: Outbound emails to leads in your sales pipeline
- **Cold**: Cold outreach to prospects who have not opted in
- **Consensual Marketing**: Marketing emails to contacts who have given consent
- **Newsletters**: Bulk newsletter sends to your audience segments
- **Franchisees**: Communications with your franchisee network
- **Portal Notifications**: Automated notifications from the applicant portal (e.g., new chat messages, deal updates)
- **Transactional**: System-generated emails like password resets and confirmations

Using separate domains for different purposes protects your sender reputation. For example, keeping cold outreach on a different domain than your transactional emails prevents deliverability issues from affecting critical account notifications.

![Domain Management section showing a connected domain with Active, Verified, and All Purposes status](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-domains-and-domain-health/domains-management-overview.png)
### Adding a New Domain

1. Click your profile picture at the bottom of the sidebar, select **Settings**, and open the **Brand** page. Scroll to **Domains**.
2. Click **Add Domain** and enter your domain name (e.g., `mail.yourbrand.com`).
3. Select which purposes this domain should serve.
4. Enter a **local part** (the portion before the @) and a **display name** for the sending address.
5. Configure your **reply-to** settings (see below).
6. Click **Create**. FS Ai registers the domain and provides DNS records you need to add.

![Add your sending domain form with purposes, local part, display name, and reply-to strategy fields](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-domains-and-domain-health/domains-add-domain-form.png)
### DNS Verification

After creating a domain, you receive a set of DNS records (typically MX, TXT, and CNAME) that must be added to your domain's DNS provider. These records authenticate your domain so email providers trust messages sent from it.

1. Copy the DNS records shown in the domain detail view.
2. Add each record to your DNS provider (e.g., Cloudflare, GoDaddy, Namecheap).
3. Return to FS Ai and click **Verify**. The system checks each record's status with your email provider.
4. Once all records show a **verified** status, the domain activates automatically.

DNS propagation can take up to 48 hours, so verification may not succeed immediately.

### Domain Health

Each domain has a **health score** and a **status** indicator. FS Ai syncs domain status with your email provider whenever you view your domains, keeping records up to date.

- **Score**: A numeric rating reflecting your domain's sender reputation
- **Status**: Shows whether the domain is verified, pending, or has issues
- **DNS Records**: Individual record statuses let you pinpoint which records need attention

FS Ai also provides AI-powered domain health insights that analyze your domain configuration and offer actionable recommendations.

### Reply-To Settings

When configuring a domain's email address, you choose a **reply-to strategy** that determines where recipient replies are directed:

- **Static**: Replies go to a fixed email address you specify (e.g., `support@yourbrand.com`). Use this when you want all replies funneled to a shared inbox.
- **Assigned Rep**: Replies go to the email address of the sales rep or agent assigned to that contact. If the recipient is a lead, the system looks up their assigned rep. If they are a franchisee, it finds their assigned agent. This keeps conversations personal and routed to the right person.

![Connected domain's Email Settings with the Assigned Sales Rep reply-to strategy active](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-domains-and-domain-health/domains-manage-detail.png)
### Managing Multiple Domains

You can add as many domains as you need. Common setups include:

- A primary domain for sales and marketing emails
- A separate domain for cold outreach to protect your main domain's reputation
- A dedicated domain for transactional and portal notification emails

You can toggle any domain's **active** status on or off without deleting it, and you can update its assigned purposes at any time.
