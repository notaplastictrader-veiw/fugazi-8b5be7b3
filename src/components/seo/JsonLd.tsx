import { useEffect } from "react";

interface JsonLdProps {
  data: Record<string, any>;
}

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

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Not A Fugazi Trader",
  url: "https://naftreview.lovable.app",
  logo: "https://naftreview.lovable.app/favicon.ico",
  sameAs: ["https://twitter.com/notafugazitrader"],
  description: "The world's most transparent broker review platform. Real reviews, real complaints, real withdrawal proof.",
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Not A Fugazi Trader",
  url: "https://naftreview.lovable.app",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://naftreview.lovable.app/brokers?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};
