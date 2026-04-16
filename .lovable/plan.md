

# Scam Alerts Page এ Demo Data Insert + Fallback

## সমস্যা
`/scam-alerts` page DB থেকে fetch করে কিন্তু DB তে কোনো scam alert নেই। তাই page empty দেখায়। Homepage এর ScamAlertSection এ fallback আছে কিন্তু full page তে নেই।

## সমাধান

### Step 1: Database এ Demo Scam Alerts Insert (Migration)
Homepage এর fallback data গুলোকে DB তে `status = 'published'` হিসেবে insert করবো:

| Title | Description | Severity |
|-------|-------------|----------|
| TradeWave Markets | Withdrawal refused after profit — $12,400 unresolved | high |
| GoldFX Pro | Fake regulation, platform manipulation — $8,200 under investigation | high |
| CryptoEdge BD | Account frozen, no response 30+ days — $3,800 unresolved | medium |

### Step 2: `/scam-alerts` Page এ Fallback Logic
DB empty হলে same fallback data দেখাবে (ScamAlertSection এর মতো pattern)।

## Files

| File | Change |
|------|--------|
| SQL Migration | `INSERT INTO scam_alerts (title, description, severity, status)` — 3 rows |
| `src/pages/ScamAlerts.tsx` | Add fallback array, use when DB returns empty |

