

## Issue
AuthModal-এ form-এর বাইরে (overlay/backdrop) click করলে modal বন্ধ হয়ে homepage-এ চলে যায়। User চায় শুধু X button click করলেই close হবে — outside click এ না।

## Root Cause
`src/components/ui/dialog.tsx` Radix Dialog ব্যবহার করে যেটা default-ভাবে overlay click এ `onOpenChange(false)` fire করে। AuthModal এই default behavior inherit করছে।

## Fix
`src/components/modals/AuthModal.tsx` এর `<DialogContent>`-এ Radix-এর built-in props add করা:
- `onPointerDownOutside={(e) => e.preventDefault()}` — outside click block
- `onEscapeKeyDown={(e) => e.preventDefault()}` — Esc key block (optional, user চাইলে)
- `onInteractOutside={(e) => e.preventDefault()}` — extra safety

X button (Radix `DialogPrimitive.Close`) এই props affect করবে না, তাই X দিয়ে close করা ঠিক ভাবেই কাজ করবে।

## Scope
- শুধু `AuthModal.tsx` edit (1 file)
- Global `dialog.tsx` change করব না — অন্য modal গুলোর behavior break হতে পারে

## Out of Scope
- অন্য modal (PostIdeaModal, PrivateReportModal, ReportScamModal etc.) — user শুধু auth modal এর কথা বলেছে
- Dialog component-এর global behavior change

