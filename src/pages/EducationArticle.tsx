import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { educationArticles, getArticleBySlug, getNextArticle } from "@/data/educationArticles";
import { ChevronRight, Clock, User, ArrowRight, Lock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotFound from "./NotFound";
import { useState, useEffect } from "react";

const trackLabels: Record<string, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

const EducationArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : null;
  const nextArticle = slug ? getNextArticle(slug) : null;
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (article?.sections.length) setActiveSection(article.sections[0].id);
  }, [article]);

  useEffect(() => {
    const handleScroll = () => {
      if (!article) return;
      for (const section of [...article.sections].reverse()) {
        const el = document.getElementById(`section-${section.id}`);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [article]);

  if (!article) return <NotFound />;

  if (article.isLocked) {
    return (
      <MainLayout>
        <SEO title={article.title} description={`Unlock: ${article.title}`} path={`/education/${slug}`} />
        <section className="max-w-3xl mx-auto px-4 pt-6 pb-24 text-center">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-display font-extrabold text-foreground mb-4">{article.title}</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            This content is part of our Advanced Trading Course. Get access to unlock all premium lessons.
          </p>
          <Button asChild>
            <Link to="/education#courses">
              <BookOpen className="w-4 h-4 mr-2" />
              View Courses & Get Access →
            </Link>
          </Button>
        </section>
      </MainLayout>
    );
  }

  const related = educationArticles
    .filter(a => a.track === article.track && a.slug !== article.slug && !a.isLocked)
    .slice(0, 3);

  return (
    <MainLayout>
      <SEO title={article.title} description={article.keyTakeaway} path={`/education/${slug}`} />
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 font-mono">
          <Link to="/education" className="hover:text-primary transition-colors">Education</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">{trackLabels[article.track]}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate max-w-[200px]">{article.title}</span>
        </nav>

        <div className="flex gap-10">
          {/* Main content */}
          <article className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.readTime} min read</span>
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />NAPT Education Team</span>
            </div>

            <div className="space-y-10">
              {article.sections.map((section) => (
                <div key={section.id} id={`section-${section.id}`}>
                  <h2 className="text-xl font-display font-bold text-foreground mb-4">{section.title}</h2>
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground
                      prose-headings:text-foreground prose-strong:text-foreground
                      prose-li:text-muted-foreground prose-a:text-primary
                      prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              ))}
            </div>

            {/* Key Takeaway */}
            <div className="mt-12 rounded-xl border-2 border-accent/40 bg-accent/5 p-6">
              <h3 className="text-sm font-mono font-semibold text-accent uppercase tracking-wider mb-2">
                Key Takeaway
              </h3>
              <p className="text-foreground leading-relaxed">{article.keyTakeaway}</p>
            </div>

            {/* Next Article */}
            {nextArticle && !nextArticle.isLocked && (
              <Link
                to={`/education/${nextArticle.slug}`}
                className="mt-8 glass-card rounded-xl p-6 flex items-center justify-between group hover:border-primary/30 transition-colors block"
              >
                <div>
                  <span className="text-xs font-mono text-muted-foreground uppercase">Next Article</span>
                  <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                    {nextArticle.title}
                  </h3>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            )}
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Table of Contents */}
              <div className="glass-card rounded-xl p-5">
                <h4 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  In This Article
                </h4>
                <nav className="space-y-1">
                  {article.sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#section-${s.id}`}
                      className={`block text-sm py-1.5 px-2 rounded transition-colors ${
                        activeSection === s.id
                          ? "text-primary bg-primary/10 font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* CTA */}
              <div className="glass-card rounded-xl p-5 text-center">
                <p className="text-sm text-muted-foreground mb-3">Ready to trade?</p>
                <Button asChild size="sm" className="w-full">
                  <Link to="/brokers">Check Our Top Brokers →</Link>
                </Button>
              </div>

              {/* Related */}
              {related.length > 0 && (
                <div className="glass-card rounded-xl p-5">
                  <h4 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Related Articles
                  </h4>
                  <div className="space-y-2">
                    {related.map(r => (
                      <Link
                        key={r.slug}
                        to={`/education/${r.slug}`}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                      >
                        {r.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </MainLayout>
  );
};

export default EducationArticle;
