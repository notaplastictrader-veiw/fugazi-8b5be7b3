## Google Search Console Verification — Plan

User-এর domain `https://www.notafugazitrader.com/` verify করার জন্য Google ২টা method দিয়েছে। দুটোই add করলে safest (একটা fail করলে আরেকটা backup)।

### কী কী add করব

**1. HTML file upload (primary method)**
- User-uploaded file: `google7e7f94680e0cd202.html`
- Copy করব → `public/google7e7f94680e0cd202.html`
- Publish হলে accessible হবে: `https://www.notafugazitrader.com/google7e7f94680e0cd202.html`

**2. HTML meta tag (backup method)**
- `index.html` এর `<head>` এ add করব:
```html
<meta name="google-site-verification" content="bZuAMwF5X-DiC7z_ZNcJUfqztMS7qfgnTAoHdg-sIdk" />
```
- Existing canonical/og tags এর কাছে রাখব।

### User যা করবেন (code না)

1. **Publish** button ক্লিক করে app update করুন (frontend changes live করতে হবে)
2. Browser এ check: `https://www.notafugazitrader.com/google7e7f94680e0cd202.html` খুললে শুধু একটা line দেখাবে: `google-site-verification: google7e7f94680e0cd202.html`
3. Google Search Console এ গিয়ে **Verify** button click করুন
4. Verify হলে left menu → **Sitemaps** → submit: `sitemap.xml`
5. **URL Inspection** → homepage + main pages → **Request Indexing**

### Note

- Verification file/tag কখনো remove করবেন না — Google periodically re-check করে। Remove করলে property unverified হয়ে যাবে।
- Both methods add করলে double safety — একটা fail করলেও অন্যটা কাজ করবে।

### Confirm করলে implement করি
