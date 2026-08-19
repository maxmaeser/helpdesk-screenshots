A Franchise Disclosure Document (FDD) is a legal document that franchisors are required to provide to prospective franchisees before a franchise agreement is signed. It contains information about the franchise system, fees, obligations, and financial performance. Franchise Systems Ai (FS Ai) helps you upload, assign, and track FDDs across states and applicants.

### Prerequisites

- You need **Sales write** permission to send FDDs for signature.
- FDDs are uploaded as assets in the library. You must have write access to the asset to mark it as an FDD.
- E-signature functionality is powered by DocuSeal. Your brand must have DocuSeal configured.

### Preparing a document for e-signature

Before a document can be marked as an FDD, it needs to be prepared as a signable document.

1. Upload your FDD document to the **Library** (see the asset upload article for details).
2. Open the asset's detail view.
3. Use the **Prepare for e-signature** option to create a signing template. This sets up the document with signature fields through DocuSeal.
4. Once prepared, the asset will have a signable template linked to it.

![Prepare eSignature in an asset's menu](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-prepare-esignature-menu-v2.png)

This preparation step uses the same e-signature system as other signable documents in the platform. There is no FDD-specific signing interface - the standard document signing flow applies.

### Marking an asset as an FDD

Once a document is prepared for e-signature, you can mark it as a Franchise Disclosure Document.

1. Open the asset's detail view.
2. Toggle the **is FDD** flag. This toggle stays disabled until the asset has been prepared for e-signature.

![Set is FDD in an asset's menu](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-toggle-menu-v2.png)

You can also update the FDD flag when editing an asset's metadata by updating the title, description, and FDD status together.

### Assigning FDDs to states

Franchise regulations vary by state, and you may need different FDD versions for different states. You can assign an FDD to multiple states at once.

1. Navigate to **Sales → Compliance**.
2. Select the states you want to assign an FDD to.
3. Use the **Assign FDD** action.
4. Choose the FDD asset to assign.
5. Confirm the assignment.

![Assigning an FDD to selected states](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-bulk-assign-states.png)

Each state record tracks:

- **FDD ID**: which FDD document is assigned
- **Filing required**: whether the state requires FDD filing
- **Filing status**: Not Filed, Filed, or Filed and Registered, depending on what the state requires
- **Filing date**: when the FDD was filed
- **Filing duration**: how many days the filing process took
- **Renewal deadline**: when the FDD filing needs to be renewed

### Tracking filing status

The states list on the Compliance page shows what each state requires: **No Registration**, **Filing Only**, or **Registration Required**.

Open a state's record to update its actual filing status. Click the status badge at the top of the panel, and the available options depend on what that state requires:

- **Filing-only states**: **FDD Not Filed** or **FDD Filed**
- **Registration states**: **Not Filed Or Registered**, **FDD Filed But Not Registered**, or **FDD Filed and Registered**

![A state's FDD and filing status details](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-state-filing-status.png)

### Sending an FDD for signature

Once an FDD is prepared for signature, you can send it to an applicant.

For applicants who signed up through the Applicant Portal, open their deal or applicant record and use the **Send FDD for signature** action (**Send FDD to sign** on FS Ai Lite). Enter the recipient's email address, then select the FDD to send, or let the system match it to their state.

![Send FDD for signature on a deal's entity members](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-send-for-signature.png)

For leads captured through your public funnel, open their lead record and use the **Send FDD to Sign** action instead. This opens a send flow with two options: **Let the Lead Fill in Their Info**, so they pick their state at the sign step and the right document follows, or **Send a Specific State's FDD**, where you pick the state yourself from a full state list.

Each state in that list shows whether its FDD is ready to send. If you pick a state with no FDD document prepared, sending stays disabled until you prepare one. If the state has no compliance record on file, the flow still lets you send, but warns you first: the lead will still be able to review and sign, so make sure disclosing there is right before you do.

The recipient receives an email with a link to sign the document. Signing activity is tracked, so you can see when an FDD was sent and when it was signed. If a lead's link ever comes up with nothing to show (a missing document or an uncleared state), you get a notification as their assigned agent so you can follow up.
