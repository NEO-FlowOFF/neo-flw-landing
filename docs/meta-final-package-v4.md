# NEO FLOW Final Package v4

Status: internal registration of the package received from the Meta dev agent.

Source artifact:

```text
docs/Neo-Flow-V4-Minimal.html
```

The source HTML is kept locally as evidence, but it must not be published or
committed because it includes a copyable webhook verify token. This Markdown
version preserves the operational content in a safe, reviewable format.

## 01 — Validation Snapshot

Canonical domain:

```text
neoflowoff.agency
```

Webhook subdomain:

```text
https://whatsapp.neoflowoff.agency/webhook
```

App ID:

```text
1500002841696407
```

Graph API:

```text
v25.0
```

Operational notes from the package:

- App domain is the canonical `neoflowoff.agency`.
- Privacy, Terms, and Data Deletion surfaces are hosted on HTTPS.
- Webhook is isolated on `whatsapp.neoflowoff.agency`.
- Webhook GET must return `hub.challenge` as plain text when
  `hub.verify_token` matches.
- Webhook POST must return `200 OK` quickly and process events async.

Canonical correction for this repository:

- Public Data Deletion page is `https://neoflowoff.agency/excluir-dados/`.
- Data Deletion callback is `https://neoflowoff.agency/api/meta/data-deletion`.
- Do not use `/data-deletion` as the public instruction URL.

## 02 — Where To Submit

Meta dashboard path:

```text
Meta Developers > App > App Review > Permissions and Features
```

Submission URL pattern:

```text
https://developers.facebook.com/apps/1500002841696407/app-review/permissions/
```

Instruction preserved from the package:

```text
Click "Request" for each permission below. Paste the English use case exactly
from the cards. Attach screenshots and the screencast link. Canonical domain:
neoflowoff.agency. New webhook: whatsapp.neoflowoff.agency/webhook.
```

## 03 — Permissions

Requested permissions:

- `whatsapp_business_management`
- `whatsapp_business_messaging`
- `business_management`

### `whatsapp_business_management`

Why:

```text
Required to onboard and manage client WhatsApp Business Accounts (WABA) as a
Tech Provider. We create and manage phone numbers, display names, and templates
on behalf of clients after Embedded Signup.
```

Use case:

```text
NEO FLOW is a Tech Provider platform that helps agencies/clients manage their
own WhatsApp Business Accounts. As a Tech Provider, we use
whatsapp_business_management to: 1) Complete Embedded Signup to get access
token and WABA ID, 2) Configure phone numbers and webhooks
(https://whatsapp.neoflowoff.agency/webhook) per client, 3) Create and manage
message templates via API for client approval, 4) Manage WABA settings. We do
NOT send messages with this permission - only management. Data is isolated per
client WABA.
```

### `whatsapp_business_messaging`

Why:

```text
Required to send transactional and support messages on behalf of clients using
their own WABA and phone number, after user opt-in.
```

Use case:

```text
We use whatsapp_business_messaging to send messages ONLY on behalf of clients,
using their own WABA ID and phone number, after explicit user opt-in collected
by the client. Use cases: 1) Send utility/transactional templates (order
updates, appointment reminders) via Cloud API, 2) Respond to user-initiated
conversations within 24h window via webhook
https://whatsapp.neoflowoff.agency/webhook, 3) All messages are logged per
WABA for client compliance. We never send marketing without approved template
and opt-in. Webhook validates inbound messages at
whatsapp.neoflowoff.agency/webhook.
```

### `business_management`

Why:

```text
Required to list client's businesses/WABAs after Business Login and associate
webhook assets correctly.
```

Use case:

```text
NEO FLOW needs business_management to complete Tech Provider onboarding: After
Facebook Login with business_management, we list businesses the user admins,
to let them select the Business that owns the WABA. We then store only
business_id and waba_id mapping to route webhooks from
whatsapp.neoflowoff.agency/webhook to correct workspace. We do NOT manage ad
accounts or pages. We only read business list and WABA ownership to enable
Embedded Signup flow. This is standard for Tech Providers as per Meta
documentation.
```

## 04 — Webhook Challenge Handling

Webhook endpoint:

```text
https://whatsapp.neoflowoff.agency/webhook
```

GET behavior:

```text
GET /webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
```

Expected result:

```text
If mode == subscribe and token == ENV verify token:
  return 200 with hub.challenge as plain text
Else:
  return 403
```

POST behavior:

```text
POST /webhook
Verify X-Hub-Signature-256 if app secret is configured.
Return 200 OK within 1 second.
Queue or process the event asynchronously.
```

Node.js example from the package, adjusted to use the canonical env name:

```js
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post('/webhook', (req, res) => {
  res.sendStatus(200);
  // Process req.body.entry asynchronously.
});
```

## 05 — Data Deletion

Canonical public page:

```text
https://neoflowoff.agency/excluir-dados/
```

Canonical Meta callback:

```text
https://neoflowoff.agency/api/meta/data-deletion
```

Operational behavior:

- User can request deletion through the public instructions page.
- Meta can call the callback with `signed_request`.
- Callback validates the request with `META_APP_SECRET`.
- Deletion removes WABA mapping, tokens, and operational records according to
  retention policy.
- Callback returns `confirmation_code` and public status URL.

## 06 — Screencast Script

Suggested 60-90 second script:

```text
0:00-0:08 - Show neoflowoff.agency and App ID 1500002841696407.
0:08-0:22 - Show Business Login and Embedded Signup.
0:22-0:35 - Show permissions:
            whatsapp_business_management,
            whatsapp_business_messaging,
            business_management.
0:35-0:48 - Show WABA/phone selection and webhook configured as
            https://whatsapp.neoflowoff.agency/webhook.
0:48-1:05 - Show template or test message and inbound webhook logs.
1:05-1:20 - Show data isolation per WABA and Data Deletion page:
            https://neoflowoff.agency/excluir-dados/.
```

## 07 — Final Checklist

- App Domains include `neoflowoff.agency`.
- Webhook callback is `https://whatsapp.neoflowoff.agency/webhook`.
- GET `/webhook` returns raw `hub.challenge` as plain text.
- POST `/webhook` returns `200 OK` quickly and processes async.
- Privacy page is `https://neoflowoff.agency/privacy/`.
- Terms page is `https://neoflowoff.agency/terms/`.
- Data Deletion page is `https://neoflowoff.agency/excluir-dados/`.
- Data Deletion callback is
  `https://neoflowoff.agency/api/meta/data-deletion`.
- Screencast shows Embedded Signup, webhook verification, and message flow.
- Use cases are submitted in English.
- Do not paste or expose raw verify tokens in docs, screenshots, videos, or
  public pages.
