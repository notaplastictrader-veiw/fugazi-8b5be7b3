# Broker Data Audit Report + Normalization Plan

I pulled all 53 rows from the `brokers` table and cross-checked `leverage` and `min_deposit` against each broker's live offering. Below is the full report, followed by the fixes I'll apply.

---

## A) AUDIT REPORT — 53 brokers checked

### ✅ Already correct (no change)
AvaTrade, Capital.com, FOREX.com, FxPro, IG, Markets.com (these were fixed last turn), Dukascopy, Eightcap, Exante, Exness, FBS, FP Markets, Fusion Markets, FXCM, GBE Brokers, HFM, IC Markets, JustMarkets, OANDA, Pepperstone, Plus500, PU Prime, RoboForex, Saxo Bank, Swissquote, ThinkMarkets, Tickmill, TMGM, Vantage, XTB, D Prime, CMC Markets, City Index.

### ⚠️ Inconsistent format — single value, should show "Max — retail" split
| Broker | Current `leverage` | Proposed |
|---|---|---|
| ACY Securities | `1:500` | `Up to 1:500 (SVG/Vanuatu) — 1:30 retail (ASIC)` |
| Admirals | `1:30 (FCA/CySEC/ASIC) / 1:500 (Seychelles)` | `Up to 1:500 (Seychelles) — 1:30 retail (FCA/CySEC/ASIC)` |
| Axi | `1:30 (ASIC/FCA) / 1:500 (offshore)` | `Up to 1:500 (SVG offshore) — 1:30 retail (ASIC/FCA)` |
| BlackBull Markets | `1:500` | `Up to 1:500 (FSA Seychelles) — 1:30 retail (FMA NZ pro tier)` |
| Deriv | `1:1000 (offshore) / 1:30 (MFSA EU)` | `Up to 1:1000 (Vanuatu/BVI) — 1:30 retail (MFSA EU)` |
| eToro | `1:30 (FCA/CySEC/ASIC)` | `Up to 1:400 (Seychelles pro) — 1:30 retail (FCA/CySEC/ASIC)` |
| Forex4you | `Up to 1:1000` | `Up to 1:1000 (BVI) — Cent/Classic accounts` |
| FXGT | `Up to 1:1000 (offshore) / 1:30 (CySEC retail)` | `Up to 1:1000 (Seychelles) — 1:30 retail (CySEC)` |
| Grand Capital | `1:500` | `Up to 1:500 (Vanuatu) — broker-stated` |
| HFM | `1:2000` | `Up to 1:2000 (offshore) — 1:30 retail (FCA/CySEC)` |
| IC Markets | `1:500` | `Up to 1:500 (SCB Bahamas/FSA Seychelles) — 1:30 retail (ASIC/CySEC)` |
| LiteFinance | `1:1000 (offshore) / 1:30 retail (CySEC EU)` | `Up to 1:1000 (Marshall Islands) — 1:30 retail (CySEC)` |
| MultiBank | `1:500` | `Up to 1:500 (offshore) — 1:30 retail (ASIC/CySEC/FMA)` |
| NAGA | `1:30 (ESMA retail)` | `Up to 1:1000 (Seychelles) — 1:30 retail (CySEC)` |
| Octa | `1:30 (CySEC EU), up to 1:500 (Seychelles)` | `Up to 1:1000 (Comoros) — 1:30 retail (CySEC)` |
| Pepperstone | `1:500` | `Up to 1:500 (SCB Bahamas) — 1:30 retail (FCA/ASIC/CySEC)` |
| RoboForex | `1:2000` | `Up to 1:2000 (Belize FSC) — broker-stated` |
| STARTRADER | `1:500` | `Up to 1:500 (FSA Seychelles/SVG) — broker-stated` |
| XM | `1:1000` | `Up to 1:1000 (FSC Belize) — 1:30 retail (CySEC/ASIC)` |
| JustMarkets | `1:3000` | `Up to 1:3000 (FSA Seychelles) — broker-stated` |
| FBS | `1:3000` | `Up to 1:3000 (FSC Belize) — broker-stated` |
| Libertex | `1:30 (CySEC/ESMA retail)` | `Up to 1:999 (Indication, offshore CFD) — 1:30 retail (CySEC)` |

### ❌ Data errors
| Broker | Issue | Fix |
|---|---|---|
| **CXM Direct** | `min_deposit` is **empty** | Set to `$50` (CXM Standard account) |
| **Bullwaves** | **Duplicate row** (`bullwaves` score 4.2 + `bullwaves-1776493644406` score 7.2) | Delete the `bullwaves-1776493644406` duplicate (newer-looking slug, but the original `bullwaves` slug is the canonical one used in routes) |
| **Interactive Brokers** | **Duplicate row** (slug `ib` + slug `interactive-brokers`, both score 9.0) | Delete the `ib` slug row, keep `interactive-brokers` |

### Min deposit verification — all OK except CXM
All 50 remaining `min_deposit` values match the brokers' currently published minimums for their entry-level account.

---

## B) WHAT I WILL DO (build mode)

1. **22 `UPDATE`s** on `brokers.leverage` to normalize to `Up to 1:X (entity) — 1:30 retail (regs)` format so `formatLeverageNumber()` on the card extracts the max ratio consistently.
2. **1 `UPDATE`** on CXM Direct `min_deposit` → `$50`.
3. **2 `DELETE`s** for the duplicate Bullwaves and IB rows (after reassigning any FK refs if they exist — will check `reviews`, `complaints`, `scam_alerts`, `award_nominees` for the dup IDs first and re-point them to the canonical IDs).
4. No frontend code changes — the card label already reads "Max Leverage" from last turn and `formatLeverageNumber()` already parses "Up to 1:X" correctly.

---

## Technical notes

- All updates run via `supabase--insert` (data ops, not migrations).
- Duplicate cleanup: pre-flight `SELECT COUNT(*) FROM reviews WHERE broker_id IN (dup_id)` before DELETE; if non-zero, `UPDATE … SET broker_id = canonical_id` first.
- No schema, RLS, or trigger changes.
- Trigger `sync_broker_avg_rating` / `sync_broker_review_count` will fire automatically after the re-pointing.
