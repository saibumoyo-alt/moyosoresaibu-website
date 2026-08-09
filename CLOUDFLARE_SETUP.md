# Cloudflare production setup — Premium V8.1 Worker Connected

The contact pipeline has been tested successfully:

`moyosoresaibu.com` → `https://moyosore-contact-mailer.saibumoyo.workers.dev/contact` → Cloudflare Email Service binding → verified `saibumoyo@gmail.com`

The website no longer uses the old Email Sending REST API/token route.

## 1. Required Worker

Worker:
`moyosore-contact-mailer`

Production endpoint:
`https://moyosore-contact-mailer.saibumoyo.workers.dev/contact`

Required binding:
- Type: Email Service
- Variable name: `EMAIL`

Verified Email Routing destination:
`saibumoyo@gmail.com`

The Worker has already been tested with a real POST request and successful Gmail delivery.

## 2. Pages project cleanup after V8.1 is live

Once the live contact form has been tested successfully from `moyosoresaibu.com`, the following Pages variables are no longer required and may be deleted:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_EMAIL_API_TOKEN`
- `CONTACT_TO`
- `CONTACT_FROM`

The dedicated Worker owns email delivery now.

Do not delete or modify the Worker's `EMAIL` binding.

## 3. Analytics

Cloudflare Web Analytics can remain enabled.

The optional Pages Function at `/api/event` remains in V8.1 for privacy-respecting first-party CTA/event measurement if an Analytics Engine binding named `CRO_ANALYTICS` is configured.

It does not intentionally record contact-form message bodies or email addresses.

## 4. Production test after deployment

1. Open:
   `https://moyosoresaibu.com/contact.html?intent=challenge&from=qa`
2. Submit a genuine test message.
3. Confirm the UI reports success.
4. Confirm the message arrives at `saibumoyo@gmail.com`.
5. Press Reply in Gmail and verify the reply recipient is the visitor email entered in the form.
6. Test the Field Notes form on `/insights/`.

## 5. Abuse protection

Current protections include:
- allowed-origin enforcement in the Worker
- field validation
- message/request size limits
- honeypot field
- no public API credential in browser code

Cloudflare Turnstile is intentionally not forced into the form yet. If spam becomes meaningful, add Turnstile and validate every token server-side in the Worker before sending email.
