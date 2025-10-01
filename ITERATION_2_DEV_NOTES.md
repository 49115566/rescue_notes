# RESCUE NOTES Iteration 2 – Developer Notes

This document provides implementation notes for features in Iteration 2 that may require special attention or are less commonly implemented in typical web applications. All recommendations prefer cost-free or self-hosted solutions.

---

## Account Management

- **Email Verification (6-digit code):**
  - Use a custom email service (e.g., self-hosted SMTP server such as Postfix or Mailu) to send verification codes.
  - Store codes securely in your database (e.g., PostgreSQL) and expire them after a short period (e.g., 10 minutes).
  - Implement rate limiting in your backend to prevent abuse.

- **Google Login:**
  - Use OAuth 2.0 directly with Google’s free developer APIs.
  - Avoid paid authentication platforms; handle token refresh and error states in your backend.

- **Password Reset (One-time Link):**
  - Generate secure, time-limited reset links and send via your custom email service.
  - Automatically log the user in after a successful reset.

---

## Note Storage & Sync

- **Local vs Cloud Storage:**
  - Local notes: Use IndexedDB (via idb or Dexie.js) for offline storage.
  - Cloud notes: Use a self-hosted backend (e.g., Node.js/Express with PostgreSQL or SQLite).
  - UI should clearly indicate storage type and allow toggling.

- **Syncing Notes:**
  - For real-time sync, use WebSockets (e.g., socket.io) with your own backend.
  - Offline changes: Queue updates locally and sync when online.
  - Conflict resolution: Decide on last-write-wins or prompt user for manual merge.

- **Bulk Move to Cloud:**
  - Batch upload notes to your backend and handle errors per note.
  - Confirm with user before moving all notes.

---

## Emergency Communication

- **Device Capabilities:**
  - Use Web APIs (e.g., `navigator.share`, `tel:` and `sms:` links) for calls/texts.
  - For device pairing, consider Web Bluetooth, WebRTC, or QR code-based handoff (all free and browser-native).

- **Receiving Messages/Calls:**
  - Avoid paid push notification services; use browser-native push notifications or background sync (service workers).
  - Privacy: Ensure user consent and secure handling of sensitive data.

---

## PWA & Mobile Layout

- **Offline Functionality:**
  - Use service workers for caching and offline access.
  - Test all flows with network disabled.

- **Notifications:**
  - Use the Notifications API and ensure permissions are requested appropriately.
  - Style notifications to match device conventions.

- **Responsive Design:**
  - Use CSS media queries and test on multiple devices.
  - Avoid fixed heights; prefer flexbox/grid layouts for adaptability.

---

For further details, see the frontend code and consult platform-specific documentation as needed.
