A Franchise Disclosure Document (FDD) is a legal document that franchisors are required to provide to prospective franchisees before a franchise agreement is signed. It contains information about the franchise system, fees, obligations, and financial performance. Franchise Systems Ai (FS Ai) helps you upload, assign, and track FDDs across states and applicants.

### Prerequisites

- You need **Sales write** permission to send FDDs for signature.
- FDDs are uploaded as assets in the library. You must have write access to the asset to mark it as an FDD.
- E-signature functionality is powered by DocuSeal. Your brand must have DocuSeal configured.

### Uploading an FDD

An FDD is a regular asset with the FDD flag enabled.

1. Upload your FDD document to the **Library** (see the asset upload article for details).
2. Open the asset's detail view.
3. Toggle the **FDD** flag to mark this asset as a Franchise Disclosure Document.

You can also set the FDD flag when editing an asset's metadata by updating the title, description, and FDD status together.

![Set is FDD in an asset's menu](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-toggle-menu-v2.png)

### Preparing an FDD for e-signature

Before an FDD can be sent for signing, it needs to be prepared as a signable document.

1. Open the FDD asset.
2. Use the **Prepare for Signature** option to create a signing template. This sets up the document with signature fields through DocuSeal.
3. Once prepared, the asset will have a signable template linked to it.

This preparation step uses the same e-signature system as other signable documents in the platform. There is no FDD-specific signing interface - the standard document signing flow applies.

![Prepare eSignature in an asset's menu](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-prepare-esignature-menu-v2.png)

### Assigning FDDs to states

Franchise regulations vary by state, and you may need different FDD versions for different states. You can assign an FDD to multiple states at once.

1. Navigate to **Sales → Territories**.
2. Select the states you want to assign an FDD to.
3. Use the **Bulk Assign FDD** action.
4. Choose the FDD asset to assign.
5. Confirm the assignment.

![Assigning an FDD to selected states](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-bulk-assign-states.png)

Each state record tracks:

- **FDD ID**: which FDD document is assigned
- **Filing required**: whether the state requires FDD filing
- **Filing status**: one of: Not Filed, Pending, or Completed
- **Filing date**: when the FDD was filed
- **Filing duration**: how many days the filing process took
- **Renewal deadline**: when the FDD filing needs to be renewed

### Tracking filing status

You can track the filing status of your FDDs on a per-state basis. The three statuses are:

- **Not Filed**: the FDD has not been submitted to the state
- **Pending**: the filing has been submitted and is awaiting approval
- **Completed**: the state has approved the filing

Update the filing status directly on the state record in the Territories section.

![A state's FDD and filing status details](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-state-filing-status.png)

### Sending an FDD for signature

Once an FDD is prepared for signature, you can send it to an applicant.

1. Open the deal or applicant record.
2. Use the **Send FDD** action.
3. Enter the recipient's email address.
4. Select the FDD to send (or let the system match based on the applicant's state).
5. The recipient receives an email with a link to sign the document.

![Send FDD for signature on a deal's entity members](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-send-for-signature.png)

The platform can automatically match the correct FDD based on the applicant's location state, or you can specify a particular FDD to send. Signing activity is tracked, so you can see when an FDD was sent and when it was signed.
