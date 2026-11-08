# Rivetara Frontend

React/Vite workspace with verified Supabase sign-in, selected-business data access,
customer records and editable AI proposals requiring explicit confirmation.

## Run

Use Node 22 and `npm ci`. Set `VITE_API_BASE_URL` to the matching backend, then
`npm run dev`. Backend public auth configuration supplies the Supabase URL and
anon key. Never put an OpenAI or service-role key in frontend variables.

The matching backend migration and session/membership endpoints must be available.
Confirmed-email accounts sign in through Supabase; initial business setup creates
an organisation and owner membership. Sessions stay in memory, refresh while the
page is open, and end locally on reload or sign-out. Business switching resets
workspace state. Password recovery and persistent login are future work.

Customers support add/edit/archive/restore. Voice notes and typed requests create
editable proposals with customer selection. Confirm/Cancel are explicit. Returning
to Today reloads pending proposals; unsaved edits return to the original proposed
values. Confirmation retries reuse the same proposal ID. The separate Live
conversation cannot change business records. The public demo uses local examples
and makes no business-record requests.

## Validate

- `npm test`: capture and voice transport tests.
- `npm run test:ui`: React UI tests for account access, business switching,
  sign-out, customer forms and confirmation/cancellation/retry behaviour.
- `npm run build`: production assets. CI runs all three using `npm ci` on Node 22.

Backend `docs/FOUNDATIONS_RELEASE.md` documents coordinated rollout, schema changes,
legacy ownership mapping, staging checks and rollback. Production and real
provider/microphone/email verification are separate release steps. Full invoice
issuance/accounting, mentor, billing and native integrations remain future work.
