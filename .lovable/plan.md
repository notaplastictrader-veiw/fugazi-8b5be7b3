## Remove X Social Media from Footer

### Summary
Remove the X (formerly Twitter) social media link from the site footer. Other social platforms remain in code but stay hidden until URLs are configured later.

### Steps
1. **Remove X from `socialIconMap`** in `src/components/layout/Footer.tsx` — delete both `"X"` and `"Twitter"` entries.
2. **Remove `"X"` from `defaultSocial`** array in the same file.
3. Keep all other social platforms (LinkedIn, YouTube, Telegram, Facebook, Instagram, TikTok) untouched — they already auto-hide when their URL is empty or `"#"`.

### Result
- The X icon will no longer appear in the footer regardless of CMS settings.
- Other social links remain dormant (hidden) until the marketing team configures real URLs later.