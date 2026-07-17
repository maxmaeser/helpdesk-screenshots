E-Signature lets you send documents for electronic signing directly from Franchise Systems Ai (FS Ai). The feature is powered by DocuSeal and supports both general document signing and FDD-specific workflows.

> **Prerequisite:** Your documents must be uploaded to the Library and converted into signable templates through DocuSeal before they can be sent for signature.

### Preparing a Document for Signature

Upload your document to the **Library**. Once uploaded, open the asset details and use the e-signature option to create a signable template. DocuSeal processes the document and generates the fields (signature blocks, date fields, text inputs) that signers will complete.

![eSignature menu on a Library asset showing Prepare eSignature and Generate eSignature link](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-use-e-signature/esig-library-menu-v2.png)

![DocuSeal template builder showing the field palette and a placed signature field on an FDD](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-use-e-signature/esig-prepare-fields.png)

### Sending a Document for Signature

From an asset's detail panel, select **Prepare Asset for e-signature**. This opens the signature workflow where you:

1. Search for and add recipients who need to sign
2. Set each recipient's role (Needs to Sign is the default)
3. Optionally add a note for each signer
4. Optionally enable **Set signing order** so each signer only gets access after the previous one completes
5. Click **Send** to create the submission

### Generating a Public Signing Link

For documents that need to be signed by applicants, you can generate a public e-signature link from the asset panel. Click **Generate Public E-Signature Link** to create a shareable URL. Applicants who open the link will need an account to complete the signing.

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
