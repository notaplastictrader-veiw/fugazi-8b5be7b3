import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { BookOpen, TrendingUp, Zap, ChevronRight, Bell, Lock, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { educationArticles as staticArticles, courses as staticCourses } from "@/data/educationArticles";
import CoursePurchaseModal from "@/components/modals/CoursePurchaseModal";
import type { Course } from "@/data/educationArticles";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { ListingToolbar } from "@/components/common/ListingToolbar";
import { SmartPagination } from "@/components/common/SmartPagination";
import { EmptyResults } from "@/components/common/EmptyResults";

interface Track {
  id: string;
  label: string;
  icon: typeof BookOpen;
}

const tracks: Track[] = [
  { id: "beginner", label: "Beginner", icon: BookOpen },
  { id: "intermediate", label: "Intermediate", icon: TrendingUp },
  { id: "advanced", label: "Advanced", icon: Zap },
];

const typeBadgeColors: Record<string, string> = {
  course: "bg-primary/10 text-primary",
  ebook: "bg-accent/10 text-accent",
  bundle: "bg-coral/10 text-coral",
};

const Education = () => {
  const [activeTrack, setActiveTrack] = useState("beginner");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [articles, setArticles] = useState<any[]>(staticArticles);
  const [courses, setCourses] = useState<Course[]>(staticCourses);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      const [{ data: arts }, { data: cs }] = await Promise.all([
        supabase.from("education_articles").select("*").eq("status", "published").order("display_order"),
        supabase.from("courses").select("*").eq("status", "published").order("display_order"),
      ]);
      if (arts && arts.length) {
        setArticles(arts.map(a => ({
          id: a.id, slug: a.slug, title: a.title, track: a.track,
          readTime: a.read_time, isLocked: a.is_locked,
          sections: (a.sections as any) || [], keyTakeaway: a.key_takeaway,
        })));
      }
      if (cs && cs.length) {
        setCourses(cs.map(c => ({
          id: c.id, slug: c.slug, title: c.title, type: c.type as any,
          price: Number(c.price), originalPrice: c.original_price ? Number(c.original_price) : undefined,
          description: c.description || "", includes: (c.includes || []).join(", "),
          note: c.note || "", isActive: c.is_active, isFeatured: c.is_featured,
        })));
      }
    })();
  }, []);

  const filteredLessons = articles.filter(a => a.track === activeTrack);

  return (
    <MainLayout>
      <SEO
        title="Trading Education"
        description="Free trading courses from beginner to advanced. Learn forex, crypto, prop firm strategies, and trader psychology."
        path="/education"
      />
      <section className="max-w-5xl mx-auto px-4 pt-6 pb-24">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary">
              LEARN TRADING
            </span>
            <a href="#courses" className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
              FOR PREMIUM ↓
            </a>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Education Hub
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Simple, honest trading education. No fluff, no upsells — just what you need to trade smarter.
          </p>
        </div>

        {/* Track Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {tracks.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTrack(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeTrack === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Lessons */}
        <div className="space-y-3">
          {filteredLessons.map((lesson, i) => (
            <Link
              key={lesson.slug}
              to={lesson.isLocked ? "/education#courses" : `/education/${lesson.slug}`}
              className="glass-card rounded-xl p-6 flex items-start gap-4 group hover:border-primary/20 transition-colors cursor-pointer block"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h3>
                  {lesson.isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">FREE</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {lesson.sections[0]?.content?.replace(/<[^>]*>/g, "").slice(0, 120)}...
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
            </Link>
          ))}
        </div>

        {/* Get Notified — only show for logged-out users */}
        {!user && (
          <div className="glass-card rounded-2xl p-8 mt-12 text-center">
            <Bell className="w-10 h-10 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-display font-bold text-foreground mb-2">Get Notified About New Lessons</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
              Create a free account to get notified when new courses and lessons drop. No spam — just learning updates.
            </p>
            <Button asChild size="sm">
              <Link to="/signup">Sign Up Free →</Link>
            </Button>
          </div>
        )}

        {/* Courses Section */}
        <div id="courses" className="mt-20">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-accent/10 text-accent mb-4">
              PREMIUM CONTENT
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mb-3">
              Take Your Trading Further
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Structured courses and ebooks written by professional traders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.filter(c => c.isActive).map((course) => (
              <div
                key={course.id}
                className={`glass-card rounded-xl p-6 flex flex-col relative ${
                  course.isFeatured ? "border-accent/40 ring-1 ring-accent/20" : ""
                }`}
              >
                {course.isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground text-[10px] font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> BEST VALUE
                    </span>
                  </div>
                )}

                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit mb-3 ${typeBadgeColors[course.type] || "bg-muted text-muted-foreground"}`}>
                  {course.type}
                </span>

                <h3 className="font-display font-bold text-foreground mb-2 text-lg leading-tight">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{course.description}</p>

                <div className="text-xs text-muted-foreground mb-4">{course.includes}</div>

                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <span className="text-2xl font-bold text-foreground">${course.price}</span>
                    {course.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through ml-2">${course.originalPrice}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={course.isFeatured ? "default" : "outline"}
                    onClick={() => setSelectedCourse(course)}
                    className="shrink-0"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                    Buy Now →
                  </Button>
                </div>

                <p className="text-[10px] text-muted-foreground mt-3 font-mono">{course.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CoursePurchaseModal
        course={selectedCourse}
        open={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </MainLayout>
  );
};

export default Education;
