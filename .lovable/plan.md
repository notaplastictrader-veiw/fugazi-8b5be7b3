

## What's happening
The Approval Queue is showing the same `scam_alert_auto` entry **3 times** because the auto-detection logic in `detect_potential_scam()` only checks for **draft/pending** existing alerts before creating a new one — but in your case those previous alerts were **approved**, so the dedup check doesn't catch them.

Let me verify by checking the DB.
