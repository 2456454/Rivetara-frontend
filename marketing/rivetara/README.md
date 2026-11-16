# Rivetara marketing site and early-access signup

Source for the approved standalone front page, currently published at:
https://rivetara-business.y48y6svvfd.chatgpt.site

This folder is independent of the repository's React/Vite app. It does not replace
`src/pages/Welcome` or change account, business, or backend flows.

## Build and verify

From this directory, run `npm run build` then `npm test` with Node 22 or newer.
There are no package dependencies. Edit `src/index.html` and `worker/index.js`;
`dist/` is generated.

## Hosting

The existing live Site identity is configured only in its original Sites checkout.
For a separate deployment, create `.openai/hosting.json` with the desired existing
Site project ID and `"d1": "DB"`, with no static-directory setting. The Worker is
built to `dist/server/index.js`; the SQL migration is included under `dist/drizzle/`.
Apply `drizzle/0000_early_access.sql` through the hosting migration workflow before
accepting signups. Do not execute schema changes during requests.

`POST /api/early-access` stores a normalized email, consent version and creation
time in the D1 `early_access_signups` table. It requires affirmative consent,
validates email input, ignores duplicates and returns errors if storage fails.
The public endpoint never lists signups. `/privacy` describes collection.

No email delivery service is connected. Configure one and include working
unsubscribe handling before sending updates. Production browser and submission
checks remain separate from the included unit and migration checks.

To integrate this design into the existing React app, separately review routing,
CSS isolation, existing sign-in/demo navigation and a signup API appropriate to
that app's host. The Cloudflare D1 Worker is not a Vite backend.
