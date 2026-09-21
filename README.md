# Rivetara Frontend

Railway-ready React/Vite frontend for the current Rivetara web build.

## Deploy
1. Upload the contents of this folder to the root of your frontend GitHub repo.
2. Create/connect that repo as a Railway service.
3. Set `VITE_API_BASE_URL` to your Rivetara backend Railway domain.
4. Deploy and generate a Railway frontend domain.

Never put the OpenAI API key in this frontend. AI calls go through the backend.

Included: Apple-style responsive dashboard; zero-state account; central tap-on/tap-off Rivetara AI with spoken browser confirmation; jobs/history; invoices with Paid/archive flow; customers; Privacy Centre; £19.99 plan; `/admin` manager UI foundation; backend API client; Railway config.

Product requirements such as secure production authentication/MFA, full offline native sync, WhatsApp, Xero, Apple Watch, App Store billing and native notifications require their matching backend/native integrations and are not falsely simulated in this browser-only project.
