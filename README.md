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

## Marketing welcome and early access

The premium welcome page is integrated in `src/pages/Welcome.jsx` with page-scoped
styles, locally served licensed fonts, accessible example tabs and a consented
email form. Sign-in and demo still use the existing app callbacks. Account creation
retains its existing backend availability gate in `AccountSignup.jsx`.

The email form calls `/api/early-access` through `VITE_API_BASE_URL`. Deploy the
matching backend endpoint and its early-access database migration before this UI.
Opt-ins are separate from paid accounts and no marketing emails are sent here.

Sign-in, account signup and early access share the approved landscape treatment,
modern typography and high-contrast inspiration panels. Fifty curated examples
rotate in a shuffled, non-repeating sequence every eight seconds, pause on hover,
and remain static when the visitor requests reduced motion. These are suggestions
for conversations, not automatic business actions. Existing authentication and
account-creation availability checks remain in place.
