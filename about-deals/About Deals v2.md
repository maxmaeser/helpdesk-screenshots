A deal in Franchise Systems Ai (FS Ai) represents a franchise opportunity tied to a lead or franchisee organization. Deals track the progression from an interested applicant through to a signed franchise agreement and conversion into a franchisee.

You find deals under **Sales → Pipeline**, then select the **Deals** tab.

![Sales sidebar with Pipeline selected and Deals tab](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-deals/deals-nav-pipeline.png)
### Deal Overview

When you open a deal, the **Overview** tab shows the core details:

- **Deal ID**: a unique number assigned automatically
- **Deal Type**: Single Unit Development, Multi Unit Development, or Area Developer
- **Date Created**: when the deal was created
- **Status**: Open, In Review, Won, or Lost (with a bell icon toggle to receive notifications on status changes)
- **FDD Disclosure Date**: when the Franchise Disclosure Document was disclosed to the applicant
- **Date Agreement Signed**: when the franchise agreement was signed
- **Notes**: free-text notes about the deal

![Deal 20 overview showing deal fields and notes](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-deals/deals-overview.png)
### Deal Statuses

- **Open**: the deal is active and in progress
- **In Review**: the deal is being evaluated
- **Won**: the deal has been closed successfully, set automatically when converted to a franchisee
- **Lost**: the deal did not move forward

You can update a deal's status from the deal detail view or use bulk actions from the Deals table.

![Status dropdown showing deal status options](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-deals/deals-status-dropdown.png)
### Documents & Signatures

Documents related to the deal, such as FDD receipts or exemption forms, appear in this section. Documents submitted through the applicant portal are automatically linked to the deal.

You can also:

- **Link Asset**: attach an existing document from your Library
- **Upload**: upload a new document directly to the deal

![Documents and Signatures section with Link Asset and Upload buttons](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-deals/deals-documents.png)
### Deal Zone

Each deal can have geographic deal zones assigned to it. The deal zone section shows a map with your assigned zones. Click **Edit** to assign or modify deal zones for this deal.

![Deal Zone map showing assigned zones in Denver area](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-deals/deals-zone-map.png)
### Locations and Development Schedule

Track the franchise locations tied to this deal. You can add proposed locations with addresses and estimated timelines. When the deal is converted to a franchisee, proposed locations are moved to the Operations department as actual location records.

![Locations section with expanded location showing address fields](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-deals/deals-locations.png)
### Business Entity & Members

This section captures the legal entity details for the franchisee:

- Franchisee Entity Name (Legal Entity)
- Entity Type
- Street Address, City, State, Zip Code, Country
- Date of Incorporation
- EIN (Employer Identification Number)

![Business Entity fields showing entity name, type, address, and EIN](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-deals/deals-entity.png)
### Entity Members

Entity members are the people associated with the deal who need to sign the FDD. Each member shows:

- Their name and role (e.g., Primary Applicant)
- Ownership percentage
- FDD signature status (e.g., "Awaiting Signature")
- A **Resend FDD** button to resend the signing request if needed

This section is where you track FDD signing progress for each individual involved in the deal.

![Entity Members showing member name, role, and FDD signing status](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-deals/deals-entity-members.png)
### Payments & Fees

Record franchise fees, payments, and financial obligations associated with the deal. Click **+ Add** to create a new fee entry.

### Legal Terms & Conditions

Add legal terms and conditions specific to this deal. Click **+ Add** to create new entries.

### Visibility

Control whether the deal is visible to the applicant in their portal. Toggle **Visible for applicants** to Yes or No. When set to No, the applicant cannot see deal details from their portal.

### Converting a Deal to a Franchisee

When a deal is ready to close, you can convert it into a franchisee. This action:

1. Creates a new franchisee organization with the legal entity details from the deal.
2. Creates franchisee user accounts for each entity member.
3. Marks the lead as converted.
4. Sets the deal status to **Won** and records the conversion date.
5. Moves proposed deal locations into the Operations department as actual location records.
6. Sends notifications to the new franchisee if the portal is enabled.

You can choose whether to send a portal invitation during conversion. Once converted, the deal cannot be reverted.
