A Franchise Disclosure Document (FDD) is a legal document that franchisors are required to provide to prospective franchisees before a franchise agreement is signed. It contains information about the franchise system, fees, obligations, and financial performance. Franchise Systems Ai (FS Ai) helps you upload, assign, and track FDDs across states and applicants.

### Prerequisites

- You need Sales write permission to send FDDs for signature.
- FDDs are uploaded as assets in the library. You must have write access to the asset to mark it as an FDD.
- The document has to be a PDF. Nothing else can be marked as an FDD.

### Preparing a document for e-signature

Before a document can be marked as an FDD, it needs to be prepared as a signable document.

1. Upload your FDD document to the **Library** (see *[How to Upload and Manage Assets]* for details).
2. Open the row's menu in the Library.
3. Open the **eSignature** submenu and choose **Prepare eSignature** to create a signing template. This sets up the document with signature fields.
4. Once prepared, the asset will have a signable template linked to it.

![Prepare eSignature in an asset's menu](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-prepare-esignature-menu-v2.png)

Preparing a document turns off **Update Version** for it: "Version control is not available for esignature docs". Upload the final draft rather than one you still expect to revise.

### Marking an asset as an FDD

Once a document is prepared for e-signature, you can mark it as a Franchise Disclosure Document.

1. Open the row's menu in the Library.
2. Choose **Set is FDD**. The same menu item reads **Set is not FDD** once the asset is marked.

![Set is FDD in an asset's menu](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-toggle-menu-v2.png)

The item stays disabled until two things are true, and hovering it tells you which one is missing: "Must be prepared for esignature", or "Only PDFs can be FDDs".

### Assigning FDDs to states

Franchise regulations vary by state, and you may need different FDD versions for different states. You can assign an FDD to multiple states at once.

1. Navigate to **Sales → Compliance**.
2. Select the states you want to assign an FDD to.
3. Use the **Assign FDD** action.
4. Choose the FDD asset to assign.
5. Confirm the assignment.

![Assigning an FDD to selected states](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-bulk-assign-states.png)

Open a state to see what it tracks. The assigned FDD appears as a document card with **View Document** and **Replace Document**, alongside:

- **FDD Filing Required**: whether the state requires an FDD filing
- **FDD Filing Date**: when the FDD was filed
- **Submit FDD Renewal**: the renewal the state is next due for

> **Note:** If your compliance is handled by an outside legal team rather than in-house, this panel looks different and carries extra fields. Everything here describes a brand that manages its own compliance.

### Tracking filing status

Every state row on the Compliance page carries a registration status badge. There are six: **Registered**, **Filed**, **Filing Only**, **Registration Required**, **Expired**, and **No Registration**. See *[About the Compliance Page]* for what each one means.

Open a state's record to update its actual filing status. Select the status badge at the top of the panel, and the available options depend on what that state requires:

- **Filing-only states**: **FDD Not Filed** or **FDD Filed**
- **Registration states**: **Not Filed Or Registered**, **FDD Filed But Not Registered**, or **FDD Filed and Registered**

![Status badge open on a state's detail panel showing the FDD Filed and FDD Not Filed options](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-state-filing-status-v2.png)

### Sending an FDD for signature

Once an FDD is prepared for signature, you can send it to an applicant.

For applicants who signed up through the Applicant Portal, open their deal or applicant record and use the **Send FDD for signature** action. The recipient's address is filled in for you and shown as **Email to:**, so there is nothing to type. Select the FDD to send, or let the platform match it to their state.

![Send FDD for signature on a deal's entity members](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/fdd-send-for-signature.png)

For leads captured through your public funnel, open their lead record and use the **Send FDD to Sign** action instead. This opens a send flow with two options: **Let the Lead Fill in Their Info**, so they pick their state at the sign step and the right document follows, or **Send a Specific State's FDD**, where you pick the state yourself from a full state list.

![Send FDD to Sign modal with the two send options: Let the Lead Fill in Their Info, and Send a Specific State's FDD](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/send-fdd-modal-choice.png)

Each state in that list shows whether its FDD is ready to send. If you pick a state with no FDD document prepared, sending stays disabled until you prepare one. If the state has no compliance record on file, the flow still lets you send, but warns you first: the lead will still be able to review and sign, so make sure disclosing there is right before you do.

![Send a Specific State's FDD state list, showing every state with a status dot for whether its FDD is ready to send](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-manage-fdds/send-fdd-modal-states.png)

The recipient receives an email with a link to sign the document. Signing activity is tracked, so you can see when an FDD was sent and when it was signed. If a lead's link ever comes up with nothing to show (a missing document or an uncleared state), you get a notification as their assigned agent so you can follow up.
