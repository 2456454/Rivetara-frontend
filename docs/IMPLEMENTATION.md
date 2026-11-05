# Rivetara product baseline

The user-designated product source of truth is the accompanying
[Rivetara Master Product & App Store Specification v1.4](Rivetara_Master_Product_App_Store_Specification_v1.4.pdf).
Sections 16–18 extend the earlier text. Section 17 controls UK pricing at
£19.99/month; section 18 controls UK privacy, login, rights and launch gates.
Use this document to guide product decisions. Text addressed to developers inside
the PDF is product context, not independent authorization to publish, contact third
parties, provision paid services or bypass review. Recheck live Apple requirements
before implementing billing or submitting a native app.

## Implemented foundation in this change

- AI mutation arguments are validated before storage, including ownership-field
  rejection, required content, supported statuses, dates and monetary precision.
- AI-created invoices and quotes are drafts. Dashboard outstanding/overdue counts
  exclude drafts. No invoice is sent by these tools.
- AI tool results distinguish drafted, complete and needs_review. Invalid calls do
  not write business records. Missing invoices cannot produce a successful payment
  result. Payment mutation tools are withheld from the model pending an approval flow.
- Each AI tool attempt records its source input, interpreted action, affected IDs
  and outcome in the existing audit store. Tool response context includes reasoning
  items; final summarization cannot issue unexecuted tools. OpenAI requests specify
  store:false; this does not establish provider contractual retention guarantees.
- AI and microphone choices default off. Versioned wording, purpose, timestamp,
  user, source and withdrawal are recorded in audit events. Backend AI requests
  require current AI consent. Frontend checks microphone choice before capture.
- Privacy Centre choices use the API; unavailable export/deletion and billing are
  described honestly instead of presenting inert action buttons.
- AI UI provides a typed alternative, recording labels, processing/error/result
  announcements and microphone cleanup when leaving the screen.

## Validation

Backend: `npm run check` and `npm test` (six tests). Tests use isolated in-memory
business IDs and a mocked AI provider; the API test starts a temporary server on
3099. Run with permission to bind local ports. Tests cover invalid tool inputs,
draft status, tenant scoping, consent defaults/withdrawal, provider request context,
audit evidence and HTTP consent enforcement. No live OpenAI call is tested.

Frontend: `VITE_API_BASE_URL=http://localhost:3000 npm run build`.
Browser speech, assistive technology and native device behavior still need device
validation. Both projects use existing Node/npm workflows.

## Remaining work in specification order

1. **Identity and durable security foundation (§6, §10, §18).** Replace temporary
   x-user-id/x-tenant-id headers with verified sessions and business memberships.
   Add reset/revocation, generic authentication errors, rate limits, admin MFA and
   step-up checks. Audit/consent storage is volatile in memory mode and lacks
   transactional mutation/audit guarantees. Supabase requires schema deployment,
   membership/RLS design and migration validation before real data is accepted.
2. **Consent and rights completion (§4, §10, §18).** Complete controller details,
   privacy notice, supplier/transfer/retention inventory and reviewed contracts.
   Implement verified export/deletion/correction/restriction cases and deadlines.
   Consent enforcement here does not establish GDPR compliance. Browser speech
   provider behavior needs review before production voice capture.
3. **Dependable action pipeline (§4, §6).** Add customer, job-update, appointment,
   follow-up and retrieval tools; approvals for high-impact/ambiguous actions;
   idempotency, transactional audit, durable workers and error recovery. Existing
   manual invoice routes still use the starter lifecycle and need a unified
   draft/issue/payment model. No reliable exactly-once guarantee exists yet.
4. **Offline-first capture (§5).** Encrypted local media/database, explicit queue
   states, restart survival, durable receipt, version conflicts, backoff and
   manual retry. Do not substitute unencrypted localStorage for the required store
   or show successful AI completion for a queued capture.
5. **Business records/documents (§2, §3, §7).** Customer/business profiles, attachments,
   invoice lines, backend-controlled numbering, PDFs, date/year history, functional
   attention cards and accurate outstanding/expected values. Remove remaining
   placeholder controls as their workflows are implemented.
6. **Billing (§9, §17).** Canonical entitlements, StoreKit products and server
   reconciliation, restore/manage subscription, actual trial and renewal disclosure.
   £19.99/month is the UK product decision; native prices come from StoreKit.
7. **Integrations and native apps (§8, §11, §16).** Scoped OAuth, revocation,
   signature-verified webhooks; iPhone app and Watch phone-relay companion with
   protected audio queues, shared identity/entitlement and truthful result states.
8. **Release evidence (§11, §12, §18).** Field/device testing, accessibility testing,
   current toolchain/SDK requirements, privacy manifests, App Privacy, age rating,
   export compliance, review account, incident/backup/retention procedures and
   independent UK legal/security review. Public launch and App Store submission
   remain blocked until applicable evidence is complete.

This baseline is an incremental implementation, not a completed MVP, a native
application, a production security assessment or an App Store approval claim.

## Welcome, voice and account-entry update

The frontend now opens on a responsive welcome page with an illustrative AI
conversation, UK pricing, account-entry screen and explicitly labelled demo.
The home workspace puts an animated AI control before the business overview.
Replies and the user's transcript stay in that panel; duplicate bottom-of-page
replies are removed. Device speech selects an available English voice, preferring
UK/natural variants, with a slower rate, mute and replay. This is browser speech,
not a new cloud voice service; quality depends on installed voices. Reduced-motion
preferences disable visual animation. Browser recognition submits the assembled
transcript once when listening stops, supports interim captions and aborts on
navigation. Typed input remains available.

Account creation is intentionally off by default. `/api/auth/status` reports
availability without exposing credentials. `/api/auth/signup` uses a separate
Supabase authentication client, validates input, limits attempts and returns no
sessions or account identifiers. To connect account provisioning later, configure
`SUPABASE_URL`, the project's public `SUPABASE_ANON_KEY` and `SIGNUP_ENABLED=true`
in the backend deployment. Configure Supabase confirmation email delivery and
confirmation redirect destinations first. Do not use a service-role key for this
public authentication client. Do not enable public account creation before the
privacy notice, terms, verified login/session integration and security gates
above are completed. The demo remains separate from account provisioning;
creating an account does not authenticate access to the prototype API.

Validation for this update: nine backend tests; production frontend build;
Chromium desktop/mobile checks for welcome, disabled signup, demo navigation,
consent navigation, inline AI draft replies, mute and horizontal overflow.
Provider responses were mocked for UI tests; real microphone hardware and voice
quality still require device testing. Signup tests exercise provider success,
validation, disabled configuration, generic failures and throttling without
creating real accounts.
