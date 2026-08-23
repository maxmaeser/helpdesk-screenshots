E-Signature lets you send documents for electronic signing directly from Franchise Systems Ai (FS Ai). The feature supports both general document signing and FDD-specific workflows.

> **Prerequisite:** Your documents must be uploaded to the Library and converted into signable templates before they can be sent for signature.

### Preparing a Document for Signature

Upload your document to the **Library**. From the document's row, open the menu and choose **eSignature**, then **Prepare eSignature** to create a signable template. FS Ai processes the document and gives you a field palette (Signature, Text, Date, and Number) to drop onto the pages for signers to complete.

![eSignature field editor showing the field palette and a placed signature field on a document](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-use-e-signature/esig-prepare-fields.png)
### Generating a Public Signing Link

For documents that need to be signed by applicants, open the same document's menu and choose **eSignature**, then **Generate eSignature link** to create a shareable URL. Applicants who open the link will need an account to complete the signing.

![eSignature menu on a Library asset showing Prepare eSignature and Generate eSignature link](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-use-e-signature/esig-library-menu-v2.png)
The link status is tracked automatically. If a previous link has expired, been revoked, or become invalid, the system lets you know and you can generate a new one.

### Tracking Submission Status

The platform tracks each submission through its lifecycle. Statuses include:

- **Awaiting**: Submission created, waiting for the signer
- **Sent**: Document delivered to the signer
- **Opened**: Signer has viewed the document
- **Completed**: All signatures collected; the signed document is saved to your Library automatically
- **Declined**: Signer declined to sign

When a signer completes a document, the signed PDF is automatically uploaded to your brand's asset library.

### FDD Signing Workflow

For Franchise Disclosure Documents, the signing step has additional configuration:

1. In the portal editor, add or edit a **Sign** step
2. Toggle **Franchise Disclosure Document** on under Document Settings
3. Choose a specific FDD document, or leave it set to **Automatic** to assign the FDD based on the applicant's state

When set to automatic, the platform looks up the applicant's state and serves the correct state-specific FDD. You can also toggle **Franchise Agreement** for franchise agreement signing steps, which works the same way but is tracked separately.

![Portal editor Sign step Document Settings with Franchise Disclosure Document toggled on and Esignature Document set to Automatic](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-use-e-signature/esig-fdd-step-settings.png)
### E-Signature in the Portal

Applicants encounter e-signature through the **Sign** step type in the portal. When they reach a sign step, the document loads in an embedded viewer where they can review and sign without leaving the portal. Once completed, the signed document is processed and linked to their application record.

Sales agents can view signed documents in a lead's detail panel on the dashboard.
