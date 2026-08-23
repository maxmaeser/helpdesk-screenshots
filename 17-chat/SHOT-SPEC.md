# Shot spec: Chat

Franchisee Portal, any brand/account. Get there via **Chat** in the sidebar, or direct URL `/chat`.

Target crop ~840 CSS px width (1680 real px at 2x). Cursor added in post; Max just sets up the real UI state.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Chat Overview, thread list | Land on **Chat**. Left panel shows **Chat Overview** header and the list of conversation rows (name, last-message preview, "Xw"/"Xd" time, unread badge on at least one row). At least 2-3 rows of different types if the test account has them (a location chat, a group/org chat). Crop to the list panel; a sliver of the sidebar with the **Chat** nav item (and its own unread badge) is a nice-to-have if it fits in ~840px, not required. | none (read-only view) | `chat-overview-list.png` | ~840 CSS |
| 2 | New Chat dropdown open | Click **New Chat** at the top of the Chat Overview panel. Dropdown shows **New Private Chat** and **New Group Chat**. Do not actually start a chat. | arrow on **New Chat** trigger | `chat-new-chat-menu.png` | ~840 CSS |
| 3 | Open thread, messages + reactions | Open any conversation row. Header shows the thread name and (for a group/location chat) the member count. Body shows at least 3-4 messages with sender name, avatar, timestamp, and at least one emoji reaction visible. A date divider ("13 Aug 2026" style) in frame is a nice-to-have. Crop to the thread panel, header through a few messages down. | none (read-only view) | `chat-thread-view.png` | ~840 CSS |
| 4 | Message composer | Same open thread as #3, scrolled to the bottom. Crop tight to the **Write a message...** input row and its icon strip (paperclip, emoji, mic) plus the **Send** button. Do not actually send anything. | hand on paperclip (attach) icon | `chat-composer.png` | ~840 CSS |

## Notes for whoever processes these

- Verified live on staging 2026-08-24 via `scripts/capture/session.js` + `routes.js` `resolvePortal('CHAT')` (Lumon Fresh brand, franchisee session `portal`). No product-tour overlay appeared on this page.
- Test data on staging includes real-looking staff names/avatars from the seeded Lumon Fresh test brand (not real customer PII, but still: run `dom-sanitize.js` before each screenshot per standard practice in case Max is using a different, real-data account).
- Row types seen on staging: a location-scoped chat (pin icon), an org/group-wide chat (building icon), and a ticket-linked chat (grey "TT" icon, tied to a submitted support ticket). Shot 1 should ideally include at least the location-chat and one other type so the row-icon variety reads, but don't force it if the test account only has one kind.
- Own messages render right-aligned in a tinted bubble with a small read-receipt checkmark next to the timestamp; other people's messages render left-aligned in white bubbles with the sender's name above. Neither needs its own shot, both are visible together in shot 3.
- If the account has zero conversations, start one via **New Group Chat** first so shots 3 and 4 have real content to show (a location or org chat, not a DM, reads better for a training screenshot).
