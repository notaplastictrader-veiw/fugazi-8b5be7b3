import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ChevronRight, type LucideIcon } from "lucide-react";

export interface LegalSection {
  id: string;
  number: string;
  title: string;
  content: React.ReactNode;
}

interface LegalLayoutProps {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro?: string;
  icon: LucideIcon;
  accent?: "primary" | "destructive";
  sections: LegalSection[];
  contactEmail?: string;
}

const LegalLayout = ({
  eyebrow,
  title,
  lastUpdated,
  intro,
  icon: Icon,
  accent = "primary",
  sections,
  contactEmail = "notafugazitrader@gmail.com",
}: LegalLayoutProps) => {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const accentText = accent === "destructive" ? "text-destructive" : "text-primary";
  const accentBg = accent === "destructive" ? "bg-destructive/10" : "bg-primary/10";
  const accentBorder = accent === "destructive" ? "border-destructive/30" : "border-primary/30";

  return (
    <section className="max-w-7xl mx-auto px-4 pt-6 pb-24">
      {/* Hero */}
      <div
        className={`rounded-xl border ${accentBorder} bg-gradient-to-br from-card via-card to-transparent p-6 md:p-10 mb-10 relative overflow-hidden`}
      >
        <div
          className={`absolute -top-16 -right-16 w-64 h-64 rounded-full ${accentBg} blur-3xl opacity-60 pointer-events-none`}
        />
        <div className="relative flex items-start gap-4 md:gap-6">
          <span
            className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl ${accentBg} ${accentText} shrink-0`}
          >
            <Icon className="w-6 h-6 md:w-7 md:h-7" />
          </span>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-mono uppercase tracking-widest ${accentText} mb-2`}>
              {eyebrow}
            </p>
            <h1 className="text-3xl md:text-5xl font-display font-extrabold text-foreground leading-tight mb-3">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
            {intro && (
              <p className="text-sm md:text-base text-muted-foreground mt-4 max-w-2xl leading-relaxed">
                {intro}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
        {/* Sticky TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              On this page
            </p>
            <nav className="space-y-1 border-l border-border">
              {sections.map((s) => {
                const active = activeId === s.id;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={`group flex items-start gap-2 -ml-px pl-4 pr-2 py-1.5 border-l-2 text-sm transition ${
                      active
                        ? `${accentText} border-l-current font-semibold`
                        : "text-muted-foreground border-l-transparent hover:text-foreground hover:border-l-border"
                    }`}
                  >
                    <span className="font-mono text-xs opacity-60 mt-0.5 shrink-0">
                      {s.number}
                    </span>
                    <span className="leading-snug">{s.title}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Sections */}
        <div className="space-y-6 min-w-0">
          {sections.map((s) => (
            <article
              key={s.id}
              id={s.id}
              className="scroll-mt-24 rounded-lg border border-border bg-card/40 p-6 md:p-8 hover:border-border/80 transition"
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2 rounded-md ${accentBg} ${accentText} font-mono text-sm font-bold`}
                >
                  {s.number}
                </span>
                <h2 className="text-xl md:text-2xl font-display font-extrabold tracking-tight text-foreground m-0">
                  {s.title}
                </h2>
              </div>
              <div className="text-foreground/85 leading-relaxed text-[0.95rem] space-y-3 [&_ul]:list-none [&_ul]:space-y-2 [&_ul]:pl-0 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_a]:text-primary [&_a]:font-semibold hover:[&_a]:underline">
                {s.content}
              </div>
            </article>
          ))}

          {/* Contact footer card */}
          <div className="rounded-lg border border-border bg-card/40 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <span
                className={`inline-flex items-center justify-center w-10 h-10 rounded-md ${accentBg} ${accentText} shrink-0`}
              >
                <Mail className="w-5 h-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground m-0">Questions?</p>
                <p className="text-sm text-muted-foreground m-0">
                  Reach out and we'll get back to you.
                </p>
              </div>
            </div>
            <a
              href={`mailto:${contactEmail}`}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition`}
            >
              {contactEmail}
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Cross-links */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              to="/terms"
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition"
            >
              Privacy Policy
            </Link>
            <Link
              to="/disclaimer"
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition"
            >
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/** Bullet list helper for legal content */
export const LegalList = ({ items }: { items: React.ReactNode[] }) => (
  <ul>
    {items.map((item, i) => (
      <li key={i}>
        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export default LegalLayout;
