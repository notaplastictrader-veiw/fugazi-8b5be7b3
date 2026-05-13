import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import MainLayout from "@/components/layout/MainLayout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import FollowButton from "@/components/profile/FollowButton";
import JournalStatsPanel from "@/components/profile/JournalStatsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, MessageSquare, AlertTriangle, TrendingUp, User, Users } from "lucide-react";
import { useState } from "react";

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [followerDelta, setFollowerDelta] = useState(0);
  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!username,
  });

  const { data: reviewCount } = useQuery({
    queryKey: ["profile-reviews-count", profile?.user_id],
    queryFn: async () => {
      const { count } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile!.user_id)
        .eq("status", "published");
      return count ?? 0;
    },
    enabled: !!profile?.user_id,
  });

  const { data: complaintCount } = useQuery({
    queryKey: ["profile-complaints-count", profile?.user_id],
    queryFn: async () => {
      const { count } = await supabase
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile!.user_id)
        .eq("status", "published");
      return count ?? 0;
    },
    enabled: !!profile?.user_id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["profile-reviews", profile?.user_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, brokers(name, slug)")
        .eq("user_id", profile!.user_id)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.user_id,
  });

  const { data: complaints } = useQuery({
    queryKey: ["profile-complaints", profile?.user_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("complaints")
        .select("*, brokers(name, slug)")
        .eq("user_id", profile!.user_id)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.user_id && profile?.show_complaints,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-2xl" />
            <div className="h-8 w-48 bg-muted rounded" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground">This user doesn't exist or their profile is private.</p>
        </div>
      </MainLayout>
    );
  }

  if (!profile.is_public) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Private Profile</h1>
          <p className="text-muted-foreground">This user has set their profile to private.</p>
        </div>
      </MainLayout>
    );
  }

  const stats = {
    reviews: reviewCount ?? 0,
    complaints: complaintCount ?? 0,
    ideas: 0,
    helpfulVotes: 0,
  };

  return (
    <MainLayout>
      <SEO
        title={`${profile.full_name || profile.username} — NAFT Profile`}
        description={profile.bio || `View ${profile.username}'s trading profile on NAFT`}
        path={`/profile/${username}`}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <ProfileHeader profile={profile as any} stats={stats} />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start bg-card border border-border rounded-xl p-1 gap-1">
            <TabsTrigger value="overview" className="rounded-lg text-xs">Overview</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-lg text-xs">
              <MessageSquare className="w-3 h-3 mr-1" /> Reviews ({stats.reviews})
            </TabsTrigger>
            <TabsTrigger value="complaints" className="rounded-lg text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" /> Complaints
            </TabsTrigger>
            <TabsTrigger value="ideas" className="rounded-lg text-xs">
              <TrendingUp className="w-3 h-3 mr-1" /> Trading Ideas
            </TabsTrigger>
            <TabsTrigger value="about" className="rounded-lg text-xs">About</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
              {(reviews?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {reviews?.slice(0, 5).map(r => (
                    <div key={r.id} className="flex items-center gap-3 text-sm">
                      <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-foreground">
                        Reviewed <span className="font-semibold">{(r as any).brokers?.name || "a broker"}</span>
                      </span>
                      <span className="text-muted-foreground ml-auto text-xs">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 space-y-3">
            {reviews?.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">No reviews yet.</div>
            ) : (
              reviews?.map(r => (
                <div key={r.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">{(r as any).brokers?.name || "Broker"}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.rating ?? 5 }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xs">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{r.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="complaints" className="mt-4 space-y-3">
            {!profile.show_complaints ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
                This user has chosen to keep complaints private.
              </div>
            ) : complaints?.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">No complaints filed.</div>
            ) : (
              complaints?.map(c => (
                <div key={c.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">{(c as any).brokers?.name || "Broker"}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="ideas" className="mt-4">
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
              No trading ideas posted yet.
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-4">
            <div className="glass-card rounded-xl p-6 space-y-4">
              {profile.bio ? (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Bio</h4>
                  <p className="text-sm text-foreground">{profile.bio}</p>
                </div>
              ) : null}
              {profile.experience_level && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Experience Level</h4>
                  <p className="text-sm text-foreground">{profile.experience_level}</p>
                </div>
              )}
              {profile.trading_style && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Trading Style</h4>
                  <p className="text-sm text-foreground">{profile.trading_style}</p>
                </div>
              )}
              {(profile.social_telegram || profile.social_twitter) && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Social</h4>
                  <div className="flex gap-3">
                    {profile.social_telegram && (
                      <a href={`https://t.me/${profile.social_telegram}`} target="_blank" rel="noopener" className="text-sm text-primary hover:underline">
                        Telegram
                      </a>
                    )}
                    {profile.social_twitter && (
                      <a href={`https://x.com/${profile.social_twitter}`} target="_blank" rel="noopener" className="text-sm text-primary hover:underline">
                        X / Twitter
                      </a>
                    )}
                  </div>
                </div>
              )}
              {!profile.bio && !profile.experience_level && !profile.trading_style && (
                <p className="text-sm text-muted-foreground">This user hasn't added any info yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
