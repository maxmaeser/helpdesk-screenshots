# Shot spec — setting-up-your-profile (edit pass, 2026-08-24)

Coverage-matrix row `settings-account-profile-security`: existing article already covers Password, 2FA, and API key correctly. The gap was the **Active sessions** card (device list, sign-out controls) added to `AccountSecurity.tsx` — shown in the existing `profile-security-v2.png` but never described in text, and its **Sign out** / **Sign out all others** buttons are cropped out of that image (they sit at the far right of a wide card).

Article text updated to describe Active sessions. One new shot needed to show the sign-out controls the new text names. All other existing images in this article stay as-is.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Active sessions card, full width | Profile > Security tab, scrolled to the Active sessions card. Have at least 2 sessions listed (one marked "This device"). Capture the full card width so both the left session info AND the right-side "Sign out all others" header button and per-row "Sign out" button are visible. | arrow on "Sign out all others" button | `profile-security-sessions-actions.png` | ~1200 CSS (full card width — wider than the usual ~840 target so the right-aligned sign-out buttons aren't cropped off) |

Route: `SETTINGS_ACCOUNT` (`/settings/account`), Security tab (`?tab=security` or click the Security tab). Sanitize IP addresses / session timestamps if they show real data (see `screenshots/scripts/dom-sanitize.js`).

---

# Shot spec — setting-up-your-profile (edit pass, 2026-08-24, row settings-account-2fa)

Coverage-matrix row `settings-account-2fa`: the article's Security section previously covered two-factor authentication in one clause ("you can turn two-factor authentication on or off") with no walkthrough. Text now adds three new subsections (Turning on two-factor authentication, Turning off two-factor authentication, Regenerating backup codes) that need 5 new shots. All verified live on staging (`AccountTwoFactorAuth.tsx` + `TwoFactorSetupModal.tsx`, origin/master @812f6dd2b). Existing images in this article (Details, Organizations, Sales Assignability, Preferences, and the base Security/Active-sessions shots) stay as-is.

**Setup needed before shooting:** these states require an authenticator app (Google Authenticator, Authy, 1Password, etc.) added to the staging test account to generate real 6-digit TOTP codes for the Verify/Disable/Regenerate steps. Do the Enable walkthrough first (shots 1-2) to get 2FA turned on, which unlocks shots 3-5.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Setup modal, Scan QR Code step | Profile > Security tab > click **Enable** > click **Get Started**. Modal now shows the QR code and the "Can't scan? Enter this key manually" secret key. Crop to the modal only. | arrow on **Continue** button | `profile-security-2fa-setup-qr.png` | ~840 CSS |
| 2 | Setup modal, backup codes step | Continue from shot 1: click **Continue**, enter the 6-digit code from the authenticator app, click **Verify**. Modal now shows the 10 generated backup codes and "Copy all codes" link. Crop to the modal only. | none (results view) | `profile-security-2fa-backup-codes.png` | ~840 CSS |
| 3 | Security tab, 2FA enabled | Click **I've Saved My Codes** to close the modal. Security tab now shows the 2FA card with status "enabled", the **Disable** button, and the backup-codes-remaining count. Crop to the Two-factor authentication card. | none (state view) | `profile-security-2fa-enabled.png` | ~840 CSS |
| 4 | Disable confirmation dialog | Click **Disable** next to Two-factor authentication. Confirmation panel opens with the 6-digit code input and a red **Disable** confirm button. Capture before submitting (empty or partially-filled code field is fine — don't actually disable 2FA on the account yet). | arrow on the confirm **Disable** button | `profile-security-2fa-disable.png` | ~840 CSS |
| 5 | Regenerate backup codes form | Cancel out of the disable dialog. Click **Regenerate backup codes**. Form opens with the 6-digit code input and **Regenerate** button. Capture before submitting. | arrow on **Regenerate** button | `profile-security-2fa-regenerate.png` | ~840 CSS |

Route: `SETTINGS_ACCOUNT` (`/settings/account?tab=security`). No PII in these shots (the QR/secret key/backup codes are all synthetic staging-account values, but treat them as sensitive anyway — reshoot rather than reuse if the account's real secret/codes are visible and this raw could be reused elsewhere). Sanitize per `screenshots/scripts/dom-sanitize.js` before every capture as usual.
