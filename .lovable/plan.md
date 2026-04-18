

## Goal
Priority Support dialog-এ contact details (Name, Phone, Email) mandatory fields হিসেবে add করা যাতে admin সরাসরি যোগাযোগ করতে পারে।

## Plan

### 1. Update `support_messages` table
Add 3 new columns (all NOT NULL):
- `contact_name` text
- `contact_email` text
- `contact_phone` text

SQL migration to alter the table.

### 2. Update `ContactAdminDialog.tsx`
Add 3 new mandatory input fields above Subject:
- **Name** (text, required, max 100)
- **Email** (email, required, max 255, basic email validation)
- **Phone** (tel, required, max 30)

**Auto-prefill** from logged-in user's profile (if available via `profiles` table — full_name, email, phone) so users don't retype every time. Editable still.

Validation (zod schema):
- All three fields trimmed, non-empty
- Email format valid
- Block submit until all fields valid → toast specific error per field

Update insert payload to include the 3 new fields.

### 3. Update Admin Inbox `SupportMessagesAdmin.tsx`
Show contact details prominently in:
- **List card**: small "by {name} • {email}" line under subject
- **Detail dialog**: dedicated "Contact" block with clickable `mailto:` and `tel:` links so admin can reach out in one click

## Files to Touch
- 1 SQL migration → add 3 NOT NULL columns to `support_messages`
- `src/components/portal/ContactAdminDialog.tsx` — add fields, validation, prefill
- `src/pages/admin/SupportMessagesAdmin.tsx` — display contact info + click-to-contact links

## Out of Scope
- Phone number international format validation (basic length check only)
- Verifying email/phone ownership
- Editing contact info after submission

