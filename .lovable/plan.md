
## Goal
Backfill logos for the 107 entries added today (16 forex brokers, 5 crypto exchanges, 86 betting sites) using a free public logo service. No paid API, no edge function — one SQL update.

## Approach
For each brand, map name → official domain, then set the logo URL to Clearbit's free logo CDN:

```
https://logo.clearbit.com/{domain}
```

Clearbit returns transparent PNGs for known brands and 404s for unknown ones. Since the existing card components already fall back gracefully when `logo`/`logo_url` is empty or fails to load (initial letter placeholder shows), broken/unknown logos won't break the UI. For brands Clearbit doesn't know (small regional betting sites like Khelibet, Krikya, Planbet), the placeholder + NAFT Testing badge will stay — and you can manually replace later from the admin panel.

## Steps

1. **Build a brand→domain map** for all 107 new entries by best-guess of the official domain:
   - Forex: avatrade.com, blueberrymarkets.com, dupoin.com, markets4you.com, traze.com, imperialfx.com, finsaitrade.com, cribmarkets.com, tagmarkets.com, skyriss.com, nxgmarkets.com, smbcnikko.co.jp, hirose-fx.co.jp, fxbroadnet.com, moneypartners.co.jp, everbright-sec.com, gtht.com (Guotai Haitong)
   - Crypto: margex.com, bisq.network, localcoinswap.com, bestwallet.com, coin.space
   - Betting: 86 entries — use slug+`.com` for popular names, override known ones (baji.live, jeetbuzz.com, krikya9.com, jaya9.com, mostbet.com, 1win.com, melbet.com, dafabet.com, bet365.com, etc.)

2. **One SQL UPDATE per table** (in build mode):
   ```sql
   UPDATE brokers SET logo_url = 'https://logo.clearbit.com/<domain>'
   WHERE slug = '<slug>' AND (logo_url IS NULL OR logo_url = '');

   UPDATE betting_sites SET logo = 'https://logo.clearbit.com/<domain>'
   WHERE slug = '<slug>' AND (logo IS NULL OR logo = '');
   ```
   Batched as a single `CASE WHEN` per table to do all rows at once.

3. **Verify** by spot-checking 5–10 cards in `/sports`, forex broker grid, and crypto category in the preview.

## What stays placeholder
- Bangla/regional betting brands without crawlable websites (~10-15 entries probably)
- Any brand Clearbit hasn't indexed
- You can fix these one-by-one from admin → broker/betting site edit later

## Out of scope
- Uploading custom logos to Supabase Storage (manual work for you)
- Building an admin bulk-logo uploader
- Edge function-based logo scraper (overkill for 107 one-time entries)
