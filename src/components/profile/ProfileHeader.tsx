import { MapPin, Calendar, Shield } from "lucide-react";
import ReputationBadge from "./ReputationBadge";

interface ProfileHeaderProps {
  profile: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    country: string | null;
    created_at: string;
    reputation_score: number;
    reputation_tier: string;
    show_real_name: boolean;
    show_country: boolean;
    is_public: boolean;
    bio: string | null;
    trading_style: string | null;
  };
  stats: {
    reviews: number;
    complaints: number;
    ideas: number;
    helpfulVotes: number;
  };
}

const ProfileHeader = ({ profile, stats }: ProfileHeaderProps) => {
  const displayName = profile.show_real_name ? profile.full_name : profile.username;
  const initials = (profile.full_name || profile.username || "U")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Avatar */}
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={displayName || ""} className="w-20 h-20 rounded-full object-cover border-2 border-primary/30" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-2xl font-display font-bold text-primary">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Name & Username */}
          <h1 className="text-2xl font-display font-extrabold text-foreground truncate">
            {displayName || "Anonymous"}
          </h1>
          {profile.username && (
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
            {profile.show_country && profile.country && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {profile.country}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Member since {memberSince}
            </span>
            {profile.trading_style && (
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" /> {profile.trading_style}
              </span>
            )}
          </div>

          {/* Reputation */}
          <div className="mt-3">
            <ReputationBadge score={profile.reputation_score} tier={profile.reputation_tier} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
        {[
          { label: "Reviews", value: stats.reviews },
          { label: "Complaints", value: stats.complaints },
          { label: "Trading Ideas", value: stats.ideas },
          { label: "Helpful Votes", value: stats.helpfulVotes },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-xl font-display font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeader;
