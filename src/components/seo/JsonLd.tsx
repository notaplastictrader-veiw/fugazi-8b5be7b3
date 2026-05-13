import { useEffect } from "react";

interface JsonLdProps {
  data: Record<string, any>;
}

const SITE_URL = "https://www.notafugazitrader.com";
const SITE_NAME = "Not A Fugazi Trader";

const JsonLd = ({ data }: JsonLdProps) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    script.setAttribute("data-jsonld", "true");
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [data]);

  return null;
};

export default JsonLd;

// ---------- Reusable schemas ----------

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  sameAs: [
    "https://twitter.com/notafugazitrader",
    "https://t.me/notafugazitrader",
  ],
  description:
    "The world's most transparent broker review platform. Real reviews, real complaints, real withdrawal proof.",
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/brokers?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

// Generate a BreadcrumbList schema from an ordered list of crumbs.
// Pass paths relative to the root (e.g. "/brokers" or "/brokers/exness").
export const breadcrumbSchema = (
  items: { name: string; path: string }[]
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: it.name,
    item: `${SITE_URL}${it.path}`,
  })),
});

// FAQPage schema — pass an array of {question, answer}
export const faqSchema = (
  qa: { question: string; answer: string }[]
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: qa.map((q) => ({
    "@type": "Question",
    name: q.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: q.answer,
    },
  })),
});

// Aggregate broker review (rich result with stars). Optional `reviews` array
// emits per-review Review entries for richer SERP eligibility.
export const brokerReviewSchema = (broker: {
  name: string;
  slug: string;
  score: number; // out of 10
  stars: number; // out of 5
  reviewCount: number;
  description?: string;
  logoUrl?: string;
  reviews?: { author: string; rating: number; content: string; date: string }[];
}) => {
  const editorialReview = {
    "@type": "Review",
    author: { "@type": "Organization", name: SITE_NAME },
    reviewRating: {
      "@type": "Rating",
      ratingValue: (broker.score / 2).toFixed(1),
      bestRating: "5",
      worstRating: "1",
    },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  const userReviews = (broker.reviews ?? []).slice(0, 5).map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.author || "Verified Trader" },
    datePublished: r.date,
    reviewBody: (r.content || "").slice(0, 500),
    reviewRating: {
      "@type": "Rating",
      ratingValue: Math.max(1, Math.min(5, r.rating || 3)).toString(),
      bestRating: "5",
      worstRating: "1",
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: broker.name,
    url: `${SITE_URL}/brokers/${broker.slug}`,
    ...(broker.logoUrl ? { image: broker.logoUrl } : {}),
    ...(broker.description ? { description: broker.description } : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (broker.stars || broker.score / 2).toFixed(1),
      bestRating: "5",
      worstRating: "1",
      ratingCount: Math.max(broker.reviewCount, 1),
      reviewCount: Math.max(broker.reviewCount, 1),
    },
    review: [editorialReview, ...userReviews],
  };
};

// Article schema for news / education / scam alert detail pages
export const articleSchema = (article: {
  title: string;
  description: string;
  path: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.description,
  mainEntityOfPage: `${SITE_URL}${article.path}`,
  ...(article.image ? { image: article.image } : {}),
  ...(article.datePublished ? { datePublished: article.datePublished } : {}),
  ...(article.dateModified
    ? { dateModified: article.dateModified }
    : article.datePublished
    ? { dateModified: article.datePublished }
    : {}),
  author: {
    "@type": "Organization",
    name: article.author || SITE_NAME,
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.svg` },
  },
});
