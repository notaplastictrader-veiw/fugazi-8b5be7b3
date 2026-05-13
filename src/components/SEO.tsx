import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: string;
}

const SITE_NAME = "Not A Fugazi Trader";
const BASE_URL = "https://www.notafugazitrader.com";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

// Locales supported by I18nContext (keep in sync)
const LOCALES = ["en", "ar", "bn", "hi", "ur", "es", "fr", "ms", "id", "pt", "tr", "ru", "zh", "de", "ja"];

const setMeta = (attr: string, key: string, content: string) => {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertLink = (rel: string, href: string, hreflang?: string) => {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const SEO = ({ title, description, path = "/", image, type = "website" }: SEOProps) => {
  const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`;
  const canonical = `${BASE_URL}${path}`;
  const ogImage = image || DEFAULT_IMAGE;

  useEffect(() => {
    document.title = fullTitle;

    setMeta("name", "description", description);

    // Canonical
    upsertLink("canonical", canonical);

    // Hreflang alternates (15 locales + x-default)
    LOCALES.forEach((loc) => {
      const href = `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}lang=${loc}`;
      upsertLink("alternate", href, loc);
    });
    upsertLink("alternate", canonical, "x-default");

    // Open Graph
    setMeta("property", "og:type", type);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:site_name", SITE_NAME);

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);
    setMeta("name", "twitter:site", "@notafugazitrader");
  }, [fullTitle, description, canonical, ogImage, type, path]);

  return null;
};

export default SEO;
