import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  targetUserId: string;
  onCountChange?: (delta: number) => void;
}

const FollowButton = ({ targetUserId, onCountChange }: Props) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user || user.id === targetUserId) {
      setChecking(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("profile_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("followed_id", targetUserId)
        .maybeSingle();
      setIsFollowing(!!data);
      setChecking(false);
    })();
  }, [user, targetUserId]);

  if (!user || user.id === targetUserId || checking) return null;

  const toggle = async () => {
    setLoading(true);
    if (isFollowing) {
      const { error } = await supabase
        .from("profile_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("followed_id", targetUserId);
      if (error) toast.error(error.message);
      else {
        setIsFollowing(false);
        onCountChange?.(-1);
      }
    } else {
      const { error } = await supabase
        .from("profile_follows")
        .insert({ follower_id: user.id, followed_id: targetUserId });
      if (error) toast.error(error.message);
      else {
        setIsFollowing(true);
        onCountChange?.(1);
        toast.success("Following");
      }
    }
    setLoading(false);
  };

  return (
    <Button
      size="sm"
      variant={isFollowing ? "outline" : "default"}
      onClick={toggle}
      disabled={loading}
      className="gap-2"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
};

export default FollowButton;
