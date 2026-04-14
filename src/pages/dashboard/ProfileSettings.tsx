import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import ReputationBadge from "@/components/profile/ReputationBadge";

const ProfileSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [tradingStyle, setTradingStyle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [socialTelegram, setSocialTelegram] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [showRealName, setShowRealName] = useState(true);
  const [showCountry, setShowCountry] = useState(true);
  const [showComplaints, setShowComplaints] = useState(true);

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setCountry(profile.country || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setTradingStyle(profile.trading_style || "");
      setExperienceLevel(profile.experience_level || "");
      setSocialTelegram(profile.social_telegram || "");
      setSocialTwitter(profile.social_twitter || "");
      setIsPublic(profile.is_public ?? true);
      setShowRealName(profile.show_real_name ?? true);
      setShowCountry(profile.show_country ?? true);
      setShowComplaints(profile.show_complaints ?? true);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          country,
          username: username || null,
          bio: bio.slice(0, 200),
          trading_style: tradingStyle || null,
          experience_level: experienceLevel || null,
          social_telegram: socialTelegram || null,
          social_twitter: socialTwitter || null,
          is_public: isPublic,
          show_real_name: showRealName,
          show_country: showCountry,
          show_complaints: showComplaints,
        })
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (err: any) => {
      if (err?.message?.includes("profiles_username_format")) {
        toast.error("Username must be 3-20 characters: letters, numbers, underscore only");
      } else if (err?.message?.includes("profiles_username_key")) {
        toast.error("This username is already taken");
      } else {
        toast.error("Failed to update profile");
      }
    },
  });

  return (
    <>
      <SEO title="Profile Settings" description="Manage your profile information." path="/dashboard/settings" />
      <h1 className="text-2xl font-display font-extrabold text-foreground mb-6">Profile Settings</h1>

      {profile && (
        <div className="mb-6">
          <ReputationBadge score={profile.reputation_score ?? 0} tier={profile.reputation_tier ?? "New Trader"} />
        </div>
      )}

      <div className="space-y-6 max-w-lg">
        {/* Basic Info */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Basic Information</h2>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} disabled className="mt-1 opacity-60" />
          </div>
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1" placeholder="3-20 chars, letters/numbers/underscore" />
            {username && profile?.username !== username && (
              <p className="text-xs text-muted-foreground mt-1">Your profile URL: /profile/{username}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1" />
          </div>
        </div>

        {/* Trading Profile */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Trading Profile</h2>
          <div>
            <Label htmlFor="bio">Bio (max 200 chars)</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value.slice(0, 200))} className="mt-1" rows={3} placeholder="Tell others about your trading journey..." />
            <p className="text-xs text-muted-foreground mt-1">{bio.length}/200</p>
          </div>
          <div>
            <Label>Trading Style</Label>
            <Select value={tradingStyle} onValueChange={setTradingStyle}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select your style" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Scalper">Scalper</SelectItem>
                <SelectItem value="Day Trader">Day Trader</SelectItem>
                <SelectItem value="Swing Trader">Swing Trader</SelectItem>
                <SelectItem value="Long Term">Long Term</SelectItem>
                <SelectItem value="Prop Trader">Prop Trader</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Experience Level</Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select your level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Social Links */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Social Links</h2>
          <div>
            <Label htmlFor="telegram">Telegram Username</Label>
            <Input id="telegram" value={socialTelegram} onChange={(e) => setSocialTelegram(e.target.value)} className="mt-1" placeholder="username (without @)" />
          </div>
          <div>
            <Label htmlFor="twitter">X / Twitter Username</Label>
            <Input id="twitter" value={socialTwitter} onChange={(e) => setSocialTwitter(e.target.value)} className="mt-1" placeholder="username (without @)" />
          </div>
        </div>

        {/* Privacy */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Privacy Settings</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Public Profile</p>
              <p className="text-xs text-muted-foreground">Allow others to view your profile</p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Show Real Name</p>
              <p className="text-xs text-muted-foreground">Display full name instead of username</p>
            </div>
            <Switch checked={showRealName} onCheckedChange={setShowRealName} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Show Country</p>
              <p className="text-xs text-muted-foreground">Display your country on profile</p>
            </div>
            <Switch checked={showCountry} onCheckedChange={setShowCountry} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Show Complaints</p>
              <p className="text-xs text-muted-foreground">Display complaints on public profile</p>
            </div>
            <Switch checked={showComplaints} onCheckedChange={setShowComplaints} />
          </div>
        </div>

        <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="w-full">
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </>
  );
};

export default ProfileSettings;
