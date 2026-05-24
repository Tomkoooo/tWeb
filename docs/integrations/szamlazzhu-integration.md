# Számlázz.hu integration

## Overview

This project supports feature-flagged automatic invoicing through `szamlazz.js` and Számlázz.hu.

- Feature flag: `szamlazzInvoicing`
- Auto issue trigger: after successful payment and order creation
- Auto email: invoice PDF attached when available
- User/Admin download: secure invoice endpoints with provider-first fetch and MongoDB-stored PDF fallback (no `uploads/` folder — Vercel-safe)
- Manual admin mode: invoice number edit, optional metadata, optional PDF upload

## Environment variables

Set one of the authentication options:

- `SZAMLAZZ_AGENT_KEY` (recommended)
- OR `SZAMLAZZ_USER` + `SZAMLAZZ_PASSWORD`

Optional settings:

- `SZAMLAZZ_TIMEOUT_MS` (default: `10000`)
- `SZAMLAZZ_SELLER_BANK_NAME`
- `SZAMLAZZ_SELLER_BANK_ACCOUNT`
- `SZAMLAZZ_ISSUER_NAME`
- `SZAMLAZZ_EMAIL_SUBJECT`
- `SZAMLAZZ_EMAIL_MESSAGE`

Mail settings (existing app requirements):

- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`
- `EMAIL_FROM_NAME` (inbox display name for app-sent mail; default `Krausz Barkácsmester`)

## Behavior

## Flag OFF (`szamlazzInvoicing=false`)

- No automatic invoice issue.
- Admin can still manage manual invoice fields and upload PDF.
- Admin can still resend invoice-related emails.

## Flag ON (`szamlazzInvoicing=true`)

1. Payment succeeds.
2. Order is created.
3. System attempts invoice issue via Számlázz.hu.
4. On success:
   - `invoiceId` and status saved on order
   - invoice email sent (`invoice_sent`)
5. On failure:
   - order remains valid
   - invoice status marked failed with error message
   - issue email sent (`invoice_issue`)

## Invoice line items

Automatic invoices include:

- All order product lines (`grossUnitPrice` + per-line `vat` from the order snapshot).
- **Szállítás** when `shippingFee > 0`.
- **Fizetési kezelési díj** when `paymentFee > 0`.

Shipping and payment fees are stored as **gross** on the order. On the invoice they use the **highest product VAT %** in the cart (e.g. only 5% products → fees at 5%; mixed 5% and 27% → fees at 27%). Net and ÁFA on each fee line are derived from that gross via `szamlazz.js` (`grossUnitPrice` + `vat`).

The Számlázz **rendelésszám** (`orderNumber`) is the 6-character display code (`formatOrderNumber`, same as admin and customer emails), not the full MongoDB `_id`.

## Download strategy

1. Try provider fetch using `getInvoiceData({ invoiceId or orderNumber, pdf: true })` with the short display order number.
2. If that fails, retry with the full MongoDB id (legacy invoices issued before short order numbers).
3. If provider fetch still fails, load PDF from the `Media` collection via `invoicePdfFileName` (same storage as admin uploads).
4. If neither available: return 404.

## Endpoints

- User invoice download (own order only):  
  `GET /api/user/orders/:id/invoice`
- Admin invoice download (admin only):  
  `GET /api/admin/orders/:id/invoice`

## Admin operations

On order detail page admin can:

- set/update invoice number
- set optional external id / issue date / status
- upload manual invoice PDF
- resend invoice email

If PDF is uploaded and invoice id is present, system sends invoice email with attachment.

## Email templates

Seeded template types:

- `invoice_sent`
- `invoice_issue`

Both are editable from Admin -> Email templates.

## Notes

- For production, prefer `SZAMLAZZ_AGENT_KEY` auth.
- Keep invoice emails and PDF storage monitored.
- If provider outages happen, manual mode remains available.
