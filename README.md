# Velaire talent booking platform

An original, production-oriented Next.js App Router website for a fictional talent collective. All sample profiles and foundation copy are clearly labelled and must be replaced with authorised material before launch.

## Local setup

1. Run `npm install` in this directory.
2. Copy `.env.example` to `.env.local` and fill the required values.
3. Run `npm run dev` and open `http://localhost:3000`.

Without Firebase credentials, data is held in server memory for interface testing and resets whenever the server restarts. That mode is never appropriate for production.

## Create the first admin

Configure Firebase Admin variables in `.env.local`, then run `npm run setup:admin`. The script refuses weak passwords and uses Node `scrypt`; only the salted hash is stored. Alternatively, set a strong temporary `ADMIN_SETUP_KEY` and POST once to `/api/setup/admin` with the `x-setup-key` header and an email/password JSON body. Rotate or remove `ADMIN_SETUP_KEY` afterward.

## Vercel deployment

1. Import the repository into Vercel and set the Root Directory to `velaire`.
2. Create a Firebase project and Firestore database. Add the three Firebase Admin server variables from a service account.
3. Create a public Vercel Blob store for talent/QR media and connect it with prefix `BLOB_CELEB`; create a private store for payment proofs and connect it with prefix `BLOB_PRIVATE`. The resulting `BLOB_CELEB_STORE_ID` and `BLOB_PRIVATE_STORE_ID` use Vercel OIDC. Legacy read-write tokens remain supported for local development.
4. Add `SESSION_SECRET` (32+ random bytes), `ADMIN_SETUP_KEY`, `NEXT_PUBLIC_APP_URL`, and Resend email variables.
5. Optionally add Upstash Redis REST credentials for distributed rate limiting. This is strongly recommended for multi-instance production deployments.
6. Deploy, create the first admin, verify notification delivery, then rotate/remove the setup key.

The build command is `npm run build`; the framework preset is Next.js.

## Security notes

- Middleware verifies the signed, HTTP-only admin session for every `/admin/*` page and `/api/admin/*` route.
- Public payloads are validated with Zod, honeypot protected and rate limited.
- Public talent/QR uploads accept JPG, PNG or WebP. Payment proofs accept JPG, PNG, WebP or PDF and use a separate private Blob store; admins retrieve them through an authenticated, non-cacheable proxy. All uploads are limited to 5MB.
- Enabled payment methods alone appear publicly. Network warnings are prominent, hashes are unique, and every submission starts as `pending`; screenshots and hashes never auto-confirm payment.
- Payment decisions append an audit entry with actor, time, action and note.
- Keep the Firebase service account, session secret and API keys server-side. Never prefix them with `NEXT_PUBLIC_`.

## Brand assets and service keys still required

- Final name, logo, favicon, colours and approved typography
- Authorised talent names, biographies, categories and licensed images
- Verified foundation name, legal status, programmes and disclosures
- Business address, phone, support/booking emails, privacy policy and terms
- Firebase Admin credentials, connected Vercel Blob stores, Resend key/from-domain, session secret
- Optional Upstash Redis REST credentials
- Verified payment networks and wallet addresses (the included addresses are deliberately invalid samples)
- Approved payment request/invoice source and operational verification policy
