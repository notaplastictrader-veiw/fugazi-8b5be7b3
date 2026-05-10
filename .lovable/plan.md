## Plan: Google-এ site index করানোর জন্য SEO fix

### আসল সমস্যা কী

**1. Wrong canonical domain everywhere** — এটাই main issue
- `public/sitemap.xml` → সব URL `fugazi.lovable.app` দিয়ে দেওয়া
- `public/robots.txt` → sitemap link `fugazi.lovable.app/sitemap.xml`
- `src/components/SEO.tsx` → `BASE_URL = "https://naftreview.lovable.app"` (পুরোনো URL!)
- ফলে Google যা index করছে সেটা `notafugazitrader.com` না, lovable subdomain → আপনার custom domain খুঁজলে পায় না

**2. Site Google-এ submit করা হয়নি**
- Google Search Console-এ verify + sitemap submit না করা পর্যন্ত নতুন site index হতে weeks/months লাগে

**3. SPA rendering** — minor; Google JS render করতে পারে, fix করার দরকার নেই

### কী কী fix করব (code side)

**A. `src/components/SEO.tsx`**
- `BASE_URL` change করব `https://www.notafugazitrader.com` → সব canonical, og:url, og:image link সঠিক domain-এ যাবে

**B. `public/sitemap.xml`**
- প্রতিটা `<loc>` rewrite — `fugazi.lovable.app` → `www.notafugazitrader.com`
- `lastmod` আজকের date-এ update

**C. `public/robots.txt`**
- Sitemap line update → `https://www.notafugazitrader.com/sitemap.xml`

**D. `index.html`**
- `og:url` meta tag add `https://www.notafugazitrader.com/`
- Default canonical link tag add (fallback যখন React mount-এর আগে crawler আসে)

**E. Optional: dynamic sitemap entries**
- এখন static, শুধু main pages আছে। চাইলে future-এ broker/news/promotion detail pages-ও যোগ করা যাবে — এই plan-এ skip, পরে আলাদা feature হিসেবে।

### আপনি যা করবেন (Google side — code না)

1. **Google Search Console** (https://search.google.com/search-console) এ যান
2. **Property add** → `https://www.notafugazitrader.com` (URL prefix) দিন
3. **Verify** — সবচেয়ে সহজ method: **DNS TXT record** (আপনার domain যেখানে কেনা সেখানে add) অথবা **HTML tag** (verification meta tag দিলে আমি `index.html` এ paste করে দিব)
4. Verify হলে left menu → **Sitemaps** → submit: `sitemap.xml`
5. **URL Inspection** → `https://www.notafugazitrader.com/` লিখে → **Request Indexing**
6. Important pages (brokers, signals, scam-alerts) প্রতিটার জন্য আলাদা request indexing
7. ১-৭ দিন wait — তারপর Google-এ `site:notafugazitrader.com` search করে check করুন

### Deepseek-এর Step 7 (Next.js migrate) সম্পর্কে
দরকার **নেই** এখনো। Google JS-rendered SPA index করতে পারে। ১-২ মাস ভালোভাবে SEO চলার পরও যদি ranking না আসে তখন SSR consider করা যাবে। আগে domain fix + Search Console submit করে দেখি।

### Confirm করলে A–D implement করি
Verification meta tag পেলে সাথে সাথে paste করে দিব।