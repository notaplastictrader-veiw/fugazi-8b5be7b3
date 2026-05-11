## Issue
The board header says "*All times are in GMT." but the event detail modal displays times like `Tue, May 12, 12:00 AM UTC`. GMT and UTC are functionally identical, but the label mismatch is confusing.

## Fix
Make the modal display the timezone label as **GMT** to match the board, while still computing the time in the UTC zone (no time math change).

**File: `src/components/calendar/EventDetailModal.tsx`**
- In `formatTime(iso, tz)`, when `tz === "UTC"`, append `" GMT"` instead of relying on `timeZoneName: "short"` (which renders "UTC"). Concretely: drop `timeZoneName` from the `Intl.DateTimeFormat` options for the UTC branch and append `" GMT"` to the returned string. Local-time branch stays unchanged.

## Out of scope
No changes to `WeekNewsBoard`, the board header, the `timezone` prop name/type, the hook, or DB.