import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import ReviewSubmissionForm from "@/components/ReviewSubmissionForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, CheckCircle, Users, TrendingUp, BarChart3,
  Clock, Target, Shield, Star, MessageSquare
} from "lucide-react";

interface SignalGroup {
  id: string;
  name: string;
  win_rate: number;
  monthly_signals: string;
  avg_rr: string;
  track_record: string;
  members: string;
  verified: boolean;
}

interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  role: string;
  created_at: string;
}

const RatingBar = ({ label, value }: { label: string; value: number }) => {
  const color = value >= 80 ? "bg-primary" : value >= 60 ? "bg-accent" : "bg-destructive";
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-mono font-bold text-foreground w-12 text-right">{value}%</span>
    </div>
  );
};

const SignalGroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<SignalGroup | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: g } = await supabase
        .from("signal_groups")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle();
      if (g) setGroup(g as SignalGroup);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <MainLayout><div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div></MainLayout>;
  if (!group) return <MainLayout><div className="min-h-screen flex flex-col items-center justify-center gap-4"><p className="text-muted-foreground">Signal group not found.</p><Link to="/signals" className="text-primary hover:underline">← Back to Signals</Link></div></MainLayout>;

  const scoreColor = group.win_rate >= 80 ? "bg-primary" : group.win_rate >= 60 ? "bg-accent" : "bg-destructive";

  return (
    <MainLayout>
      <SEO
        title={`${group.name} — Signal Group Review`}
        description={`Full review of ${group.name} signal group. Win rate: ${group.win_rate}%, ${group.members} members.`}
        path={`/signals/${group.id}`}
      />
      <div className="min-h-screen pt-6 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Link to="/signals" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Signal Groups
          </Link>

          {/* Header */}
          <div className="glass-card rounded-xl p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-display font-extrabold text-primary">{group.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-display font-extrabold text-foreground">{group.name}</h1>
                    {group.verified && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full text-primary bg-primary/10 border-primary/20">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {group.members} members</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {group.track_record}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="text-center">
                  <div className="text-xs font-mono text-muted-foreground mb-1">Win Rate</div>
                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-mono font-extrabold text-primary-foreground ${scoreColor}`}>
                    {group.win_rate}%
                  </div>
                </div>
                <Button size="sm" className="font-display font-bold">
                  Join Group
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto bg-card border border-border rounded-lg h-auto p-1 flex-wrap">
              <TabsTrigger value="overview" className="font-display text-sm">Overview</TabsTrigger>
              <TabsTrigger value="performance" className="font-display text-sm">Performance</TabsTrigger>
              <TabsTrigger value="reviews" className="font-display text-sm">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="mt-6 space-y-8">
              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" /> Key Facts
                </h2>
                <div className="glass-card rounded-xl overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {[
                        { label: "Win Rate", value: `${group.win_rate}%` },
                        { label: "Monthly Signals", value: group.monthly_signals },
                        { label: "Avg Risk:Reward", value: group.avg_rr },
                        { label: "Track Record", value: group.track_record },
                        { label: "Members", value: group.members },
                        { label: "Verified", value: group.verified ? "Yes ✓" : "No" },
                        { label: "Platform", value: "Telegram" },
                      ].map((fact, i) => (
                        <tr key={fact.label} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                          <td className="px-5 py-3 text-sm font-medium text-muted-foreground w-44">{fact.label}</td>
                          <td className="px-5 py-3 text-sm font-medium text-foreground">{fact.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" /> Pros & Cons
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-sm font-display font-bold text-primary mb-3">✅ Pros</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• {group.win_rate >= 80 ? "Excellent" : "Good"} win rate at {group.win_rate}%</li>
                      <li>• Consistent track record of {group.track_record}</li>
                      <li>• Active community of {group.members} members</li>
                      {group.verified && <li>• Verified by NAFT team</li>}
                      <li>• Average R:R of {group.avg_rr}</li>
                    </ul>
                  </div>
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-sm font-display font-bold text-destructive mb-3">❌ Cons</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Past performance doesn't guarantee future results</li>
                      <li>• Signal timing may vary by timezone</li>
                      <li>• Premium tiers may have additional costs</li>
                    </ul>
                  </div>
                </div>
              </section>
            </TabsContent>

            {/* Performance */}
            <TabsContent value="performance" className="mt-6 space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-display font-bold text-foreground mb-4">Performance Metrics</h2>
                <div className="space-y-4">
                  <RatingBar label="Win Rate" value={group.win_rate} />
                  <RatingBar label="Consistency" value={Math.min(100, group.win_rate + 5)} />
                  <RatingBar label="Risk Mgmt" value={Math.min(100, group.win_rate - 3)} />
                  <RatingBar label="Transparency" value={group.verified ? 90 : 60} />
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-display font-bold text-foreground mb-4">Monthly Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Signals/Month", value: group.monthly_signals, icon: BarChart3 },
                    { label: "Win Rate", value: `${group.win_rate}%`, icon: TrendingUp },
                    { label: "Avg R:R", value: group.avg_rr, icon: Target },
                    { label: "Track Record", value: group.track_record, icon: Clock },
                  ].map(stat => (
                    <div key={stat.label} className="text-center p-4 rounded-lg bg-muted/20">
                      <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                      <div className="text-lg font-mono font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Reviews */}
            <TabsContent value="reviews" className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" /> Community Reviews
                </h2>
                <Button size="sm" variant="outline" onClick={() => setShowReviewForm(!showReviewForm)}>
                  {showReviewForm ? "Cancel" : "Write a Review"}
                </Button>
              </div>

              {showReviewForm && (
                <div className="glass-card rounded-xl p-6">
                  <ReviewSubmissionForm
                    entityType="signal_group"
                    entityId={group.id}
                    entityName={group.name}
                    onSuccess={() => setShowReviewForm(false)}
                  />
                </div>
              )}

              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                        {review.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{review.author}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-accent fill-accent" : "text-border"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.content}</p>
                  </div>
                ))
              ) : (
                <div className="glass-card rounded-xl p-12 text-center">
                  <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review this signal group!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default SignalGroupDetail;
