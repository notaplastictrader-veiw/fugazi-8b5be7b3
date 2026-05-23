Force-import Sky Forex (SkyFx) into the brokers table using the existing `/tmp/bk/import_force.py` script.

Steps:
1. Copy `user-uploads://Sky_Forex.json` to `/tmp/bk/sky-forex.json`.
2. Run `python import_force.py sky-forex.json` from `/tmp/bk/` to upsert all 32 fields (including `long_review`).
3. Confirm row written.

No code changes.