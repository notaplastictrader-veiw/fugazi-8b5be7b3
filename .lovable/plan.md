
## Goal
GitHub PR `gogang735-oss/Sportsbook#1` theke 5 ta ebook ene `courses` table a `type='ebook'` hisebe add kora, jate `/pro` page a "Courses & Ebooks" grid a show hoy.

## Source
Branch: `ebook/cold-calling-mastery`. Sob ebook markdown format a (.md), PDF na.

## Steps

### 1. Markdown → PDF conversion (sandbox)
- 5 ta `.md` file raw GitHub URL theke download koro
- Each MD ke ekta script (pandoc/markdown-pdf) diye styled PDF a convert koro (NAFT branding cover page, dark theme)
- Output: `/tmp/ebooks/*.pdf`

### 2. Upload PDFs to Supabase Storage
- Bucket: `media` (already exists), folder: `ebooks/`
- 5 ta PDF + 5 ta cover thumbnail upload
- Public URLs save koro

### 3. Insert 5 courses rows
Each row: `type='ebook'`, `status='published'`, `is_active=true`, `thumbnail_url`, `note` (download link), `display_order`

| Slug | Title | Price | Featured |
|---|---|---|---|
| cold-calling-mastery | Cold Calling Mastery | $29 | ✓ Best Value |
| forex-fundamentals-bootcamp | Forex Fundamentals Bootcamp | $19 | — |
| smart-money-concepts-ict | Smart Money Concepts (ICT) | $39 | — |
| risk-management-masterclass | Risk Management Masterclass | $24 | — |
| prop-firm-playbook | Prop Firm Playbook | $29 | — |

Includes array: chapter highlights from each ebook's content.

### 4. Verify
- `/pro` page a Courses grid a 5 ta notun ebook card visible
- Each "Buy" click korle existing `CoursePurchaseModal` open hobe (USDT/Telegram instructions)
- Admin → Courses & Ebooks panel theke edit/delete kora jay

## Confirmations needed
1. **Prices ki theek?** Cold Calling $29 confirmed; baki 4 tar price ($19/$39/$24/$29) ami suggest korechi — change korte chaile bolo.
2. **Sob 5 ta add korbo, naki sudhu Cold Calling Mastery (PR title onujayi) first a?**
3. **Cover thumbnails** — ami AI diye 5 ta minimal cover image generate kore debo (NAFT brand colors), naki text-only PDFs okay?
