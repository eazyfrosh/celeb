# Firestore data model

All writes are server-side through Firebase Admin. Do not expose Firestore directly to the browser.

- `admins/{email}` — `email`, `passwordHash`, `createdAt`
- `talents/{id}` — `slug`, `name`, `discipline`, `location`, `bio`, `image`, `tags[]`, `featured`, `published`
- `enquiries/{id}` — booking brief, contact fields, `reference`, `status`, `notes`, `createdAt`
- `content/site` — editable service, foundation, FAQ, featured and contact content
- `paymentMethods/{id}` — `name`, `network`, `address`, `instructions`, `qrCodeUrl`, `enabled`, `order`
- `paymentRequests/{id}` — unique reference, booking reference, exact amount/currency, description, status and creation time
- `payments/{id}` — booking/payment references, exact amount/currency, method, transaction hash, proof, manual `status`, verification notes, immutable-style `history[]`
- `conversations/{id}` — visitor contact, assignment/status, unread count, messages and timestamps

Recommended indexes: `enquiries.createdAt DESC`, `payments.createdAt DESC`, and `conversations.updatedAt DESC`. Firebase will prompt to create any required single-field indexes automatically; no composite query is required by the current app.
