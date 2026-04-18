import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Check, X, Clock, Search, Filter, UserPlus, ShieldCheck, ArrowUpCircle,
  FileText, Building2, Radio, Dices, User, Phone, MapPin, Mail, Briefcase,
  ExternalLink, CheckCircle, XCircle, MessageSquare, Star, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { logAuditAction } from "@/lib/approvalQueue";
import BrokerTierBadge from "@/components/broker/BrokerTierBadge";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

// ─── Types ───────────────────────────────────────────────────────────
type RequestCategory = "all" | "applications" | "claims" | "upgrades" | "content" | "community";
type CommunityKind = "review" | "complaint";

interface UnifiedItem {
  id: string;
  category: RequestCategory;
  status: string;
  created_at: string;
  // Application fields
  role?: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_telegram?: string | null;
  application_data?: any;
  user_id?: string | null;
  // Claim fields
  profile_type?: string;
  profile_id?: string;
  claimed_by?: string;
  documents_url?: string | null;
  contact_info?: any;
  admin_note?: string | null;
  claimant_name?: string;
  claimant_phone?: string;
  claimant_country?: string;
  entity_name?: string;
  // Upgrade fields
  current_tier?: string;
  requested_tier?: string;
  requested_by?: string;
  // Content fields
  content_type?: string;
  content_id?: string;
  priority?: number | null;
  reviewer_notes?: string;
  submitted_by?: string | null;
  // Community fields
  community_kind?: CommunityKind;
  community_title?: string;
  community_body?: string;
  community_rating?: number | null;
  community_broker_id?: string | null;
  community_broker_name?: string;
  community_author?: string;
  // Submitter profile (community)
  submitter_full_name?: string | null;
  submitter_username?: string | null;
  submitter_avatar?: string | null;
  submitter_country?: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────
const categoryConfig: Record<Exclude<RequestCategory, "all">, { label: string; icon: any; color: string }> = {
  applications: { label: "Application", icon: UserPlus, color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  claims: { label: "Profile Claim", icon: ShieldCheck, color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  upgrades: { label: "Tier Upgrade", icon: ArrowUpCircle, color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  content: { label: "Content", icon: FileText, color: "bg-teal-500/10 text-teal-400 border-teal-500/30" },
  community: { label: "Community", icon: MessageSquare, color: "bg-pink-500/10 text-pink-400 border-pink-500/30" },
};

const communityKindConfig: Record<CommunityKind, { label: string; icon: any }> = {
  review: { label: "Review", icon: Star },
  complaint: { label: "Complaint", icon: AlertTriangle },
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  approved: "bg-green-500/10 text-green-400 border-green-500/30",
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
};

const typeIcons: Record<string, any> = { broker: Building2, signal: Radio, betting: Dices };

const ROLE_MAP: Record<string, AppRole> = {
  broker: "broker",
  signal_provider: "signal_provider",
  signal: "signal_provider",
  betting_site: "betting_site",
  betting: "betting_site",
};

const getTimeAgo = (created: string) => {
  const ms = Date.now() - new Date(created).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// ─── Component ───────────────────────────────────────────────────────
const ApprovalQueueAdmin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<RequestCategory>("all");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewItem, setReviewItem] = useState<UnifiedItem | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ── Fetch all sources ──────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const merged: UnifiedItem[] = [];

    // 1. Applications
    const { data: apps } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    (apps || []).forEach((a) =>
      merged.push({
        id: a.id,
        category: "applications",
        status: a.status,
        created_at: a.created_at,
        role: a.role,
        contact_email: a.contact_email,
        contact_phone: a.contact_phone,
        contact_telegram: a.contact_telegram,
        application_data: a.application_data,
        user_id: a.user_id,
      })
    );

    // 2. Profile Claims
    const { data: claims } = await supabase
      .from("profile_claims")
      .select("*")
      .order("created_at", { ascending: false });
    if (claims && claims.length > 0) {
      // Enrich with profiles
      const userIds = [...new Set(claims.map((c) => c.claimed_by))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, country")
        .in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      // Entity names
      const entityMap = new Map<string, string>();
      const brokerIds = claims.filter((c) => c.profile_type === "broker").map((c) => c.profile_id);
      const signalIds = claims.filter((c) => c.profile_type === "signal").map((c) => c.profile_id);
      const bettingIds = claims.filter((c) => c.profile_type === "betting").map((c) => c.profile_id);

      if (brokerIds.length > 0) {
        const { data } = await supabase.from("brokers").select("id, name").in("id", brokerIds);
        (data || []).forEach((b) => entityMap.set(b.id, b.name));
      }
      if (signalIds.length > 0) {
        const { data } = await supabase.from("signal_groups").select("id, name").in("id", signalIds);
        (data || []).forEach((s) => entityMap.set(s.id, s.name));
      }
      if (bettingIds.length > 0) {
        const { data } = await supabase.from("betting_profiles").select("id, site_name").in("id", bettingIds);
        (data || []).forEach((b) => entityMap.set(b.id, b.site_name));
      }

      claims.forEach((c) => {
        const profile = profileMap.get(c.claimed_by);
        merged.push({
          id: c.id,
          category: "claims",
          status: c.status,
          created_at: c.created_at || new Date().toISOString(),
          profile_type: c.profile_type,
          profile_id: c.profile_id,
          claimed_by: c.claimed_by,
          documents_url: c.documents_url,
          contact_info: c.contact_info,
          admin_note: c.admin_note,
          claimant_name: profile?.full_name || undefined,
          claimant_phone: profile?.phone || undefined,
          claimant_country: profile?.country || undefined,
          entity_name: entityMap.get(c.profile_id),
        });
      });
    }

    // 3. Tier Upgrades
    const { data: upgrades } = await supabase
      .from("tier_upgrades")
      .select("*")
      .order("created_at", { ascending: false });
    (upgrades || []).forEach((u) =>
      merged.push({
        id: u.id,
        category: "upgrades",
        status: u.status,
        created_at: u.created_at || new Date().toISOString(),
        profile_type: u.profile_type,
        profile_id: u.profile_id,
        current_tier: u.current_tier,
        requested_tier: u.requested_tier,
        requested_by: u.requested_by,
        contact_info: u.contact_info,
        admin_note: u.admin_note,
      })
    );

    // 4. Content approval queue
    const { data: content } = await supabase
      .from("approval_queue")
      .select("*")
      .order("created_at", { ascending: true });
    (content || []).forEach((c) =>
      merged.push({
        id: c.id,
        category: "content",
        status: c.status,
        created_at: c.created_at,
        content_type: c.content_type,
        content_id: c.content_id,
        priority: c.priority,
        reviewer_notes: c.reviewer_notes || undefined,
        submitted_by: c.submitted_by,
      })
    );

    // 5. Community submissions (reviews + complaints)
    const [reviewsRes, complaintsRes] = await Promise.all([
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("complaints").select("*").order("created_at", { ascending: false }),
    ]);

    const communityBrokerIds = new Set<string>();
    (reviewsRes.data || []).forEach((r) => r.broker_id && communityBrokerIds.add(r.broker_id));
    (complaintsRes.data || []).forEach((c) => c.broker_id && communityBrokerIds.add(c.broker_id));

    const communityBrokerMap = new Map<string, string>();
    if (communityBrokerIds.size > 0) {
      const { data: brokerNames } = await supabase
        .from("brokers")
        .select("id, name")
        .in("id", Array.from(communityBrokerIds));
      (brokerNames || []).forEach((b) => communityBrokerMap.set(b.id, b.name));
    }

    // Enrich with submitter profiles
    const submitterIds = new Set<string>();
    (reviewsRes.data || []).forEach((r) => r.user_id && submitterIds.add(r.user_id));
    (complaintsRes.data || []).forEach((c) => c.user_id && submitterIds.add(c.user_id));

    const submitterMap = new Map<string, { full_name: string | null; username: string | null; avatar_url: string | null; country: string | null }>();
    if (submitterIds.size > 0) {
      const { data: submitters } = await supabase
        .from("profiles")
        .select("user_id, full_name, username, avatar_url, country")
        .in("user_id", Array.from(submitterIds));
      (submitters || []).forEach((p) =>
        submitterMap.set(p.user_id, {
          full_name: p.full_name,
          username: p.username,
          avatar_url: p.avatar_url,
          country: p.country,
        })
      );
    }

    (reviewsRes.data || []).forEach((r) => {
      const sub = r.user_id ? submitterMap.get(r.user_id) : null;
      merged.push({
        id: r.id,
        category: "community",
        status: r.status,
        created_at: r.created_at,
        community_kind: "review",
        community_title: `${r.author || "Anonymous"} reviewed ${communityBrokerMap.get(r.broker_id || "") || "broker"}`,
        community_body: r.content || "",
        community_rating: r.rating,
        community_broker_id: r.broker_id,
        community_broker_name: communityBrokerMap.get(r.broker_id || ""),
        community_author: r.author || "Anonymous",
        user_id: r.user_id,
        submitter_full_name: sub?.full_name ?? null,
        submitter_username: sub?.username ?? null,
        submitter_avatar: sub?.avatar_url ?? null,
        submitter_country: sub?.country ?? null,
      });
    });

    (complaintsRes.data || []).forEach((c) => {
      const sub = c.user_id ? submitterMap.get(c.user_id) : null;
      merged.push({
        id: c.id,
        category: "community",
        status: c.status,
        created_at: c.created_at,
        community_kind: "complaint",
        community_title: `Complaint against ${communityBrokerMap.get(c.broker_id || "") || "broker"}`,
        community_body: c.content || "",
        community_broker_id: c.broker_id,
        community_broker_name: communityBrokerMap.get(c.broker_id || ""),
        user_id: c.user_id,
        submitter_full_name: sub?.full_name ?? null,
        submitter_username: sub?.username ?? null,
        submitter_avatar: sub?.avatar_url ?? null,
        submitter_country: sub?.country ?? null,
      });
    });

    // Sort: pending first, then by date desc
    merged.sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setItems(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Filtered items ─────────────────────────────────────────────────
  const filtered = items.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      const searchFields = [
        item.contact_email,
        item.role,
        item.claimant_name,
        item.entity_name,
        item.profile_type,
        item.content_type,
        (item.application_data as any)?.company_name,
        (item.application_data as any)?.platform_name,
        item.community_title,
        item.community_body,
        item.community_broker_name,
        item.community_author,
      ];
      return searchFields.some((f) => f && String(f).toLowerCase().includes(s));
    }
    return true;
  });

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const categoryPendingCounts = {
    applications: items.filter((i) => i.category === "applications" && i.status === "pending").length,
    claims: items.filter((i) => i.category === "claims" && i.status === "pending").length,
    upgrades: items.filter((i) => i.category === "upgrades" && i.status === "pending").length,
    content: items.filter((i) => i.category === "content" && i.status === "pending").length,
    community: items.filter((i) => i.category === "community" && i.status === "pending").length,
  };

  // ── Get display info for each item ─────────────────────────────────
  const getItemTitle = (item: UnifiedItem): string => {
    if (item.category === "applications") {
      const data = (item.application_data as any) || {};
      return data.company_name || data.platform_name || data.telegram_link || item.contact_email || "Unknown";
    }
    if (item.category === "claims") {
      return `${item.claimant_name || "User"} → ${item.entity_name || "Entity"}`;
    }
    if (item.category === "upgrades") {
      return `${item.profile_type} upgrade`;
    }
    if (item.category === "community") {
      return item.community_title || "Community submission";
    }
    return `${item.content_type?.replace("_", " ")} content`;
  };

  const getItemSubtitle = (item: UnifiedItem): string => {
    if (item.category === "applications") {
      return `${item.role?.replace("_", " ")} application`;
    }
    if (item.category === "claims") {
      return `${item.profile_type} profile claim`;
    }
    if (item.category === "upgrades") {
      return `${item.current_tier} → ${item.requested_tier}`;
    }
    if (item.category === "community") {
      const body = item.community_body || "";
      return body.length > 80 ? `${body.slice(0, 80)}…` : body || `${item.community_kind}`;
    }
    return item.content_type?.replace("_", " ") || "content";
  };

  // ── Approve handlers per type ──────────────────────────────────────
  const handleApprove = async (item: UnifiedItem) => {
    if (!user) return;
    setProcessingId(item.id);

    try {
      if (item.category === "applications") {
        await approveApplication(item);
      } else if (item.category === "claims") {
        await approveClaim(item);
      } else if (item.category === "upgrades") {
        await approveUpgrade(item);
      } else if (item.category === "content") {
        await approveContent(item);
      } else if (item.category === "community") {
        await approveCommunity(item);
      }
      toast.success("Approved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to approve");
    }

    setProcessingId(null);
    setReviewItem(null);
    setAdminNote("");
    fetchAll();
  };

  const approveApplication = async (item: UnifiedItem) => {
    if (!item.user_id || !user) return;
    const appRole = ROLE_MAP[item.role || ""];
    if (!appRole) throw new Error(`Unknown role: ${item.role}`);

    // Insert role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: item.user_id, role: appRole });
    if (roleError && !roleError.message.includes("duplicate")) throw roleError;

    // Create profile based on role
    const data = (item.application_data as any) || {};
    if (appRole === "broker") {
      const slug = (data.company_name || "broker").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
      const { data: brokerRow } = await supabase.from("brokers").insert({
        name: data.company_name || "New Broker",
        slug, type: "forex", status: "draft", created_by: item.user_id,
      }).select("id").single();
      if (brokerRow) {
        await supabase.from("broker_profiles").insert({
          broker_id: brokerRow.id, claimed_by: item.user_id, claim_status: "claimed", tier: "basic",
        });
      }
    } else if (appRole === "signal_provider") {
      const { data: signalRow } = await supabase.from("signal_groups").insert({
        name: data.telegram_link || data.group_name || "New Signal Group",
        status: "draft", created_by: item.user_id,
      }).select("id").single();
      if (signalRow) {
        await supabase.from("signal_profiles").insert({
          signal_group_id: signalRow.id, claimed_by: item.user_id, claim_status: "claimed", tier: "basic",
        });
      }
    } else if (appRole === "betting_site") {
      const slug = (data.platform_name || "betting").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
      await supabase.from("betting_profiles").insert({
        site_name: data.platform_name || "New Betting Site",
        slug, claimed_by: item.user_id, claim_status: "claimed", tier: "basic",
      });
    }

    await supabase.from("applications").update({ status: "approved", updated_at: new Date().toISOString() }).eq("id", item.id);
    await supabase.from("audit_log").insert({
      user_id: user.id, action: "approve_application", table_name: "applications", record_id: item.id,
      new_data: { role: appRole, target_user: item.user_id },
    });

    // Notify user
    if (item.user_id) {
      const portalLink = appRole === "broker" ? "/portal/broker" : appRole === "signal_provider" ? "/portal/signal" : "/portal/betting";
      await supabase.from("notifications").insert({
        user_id: item.user_id, type: "system", title: "Application Approved!",
        message: `Your ${(item.role || "").replace("_", " ")} application has been approved.`,
        link: portalLink,
      });
    }
  };

  const approveClaim = async (item: UnifiedItem) => {
    if (!user || !item.claimed_by) return;

    await supabase.from("profile_claims").update({
      status: "approved", reviewed_by: user.id, reviewed_at: new Date().toISOString(), admin_note: adminNote,
    }).eq("id", item.id);

    const pt = item.profile_type || "";
    const table = pt === "broker" ? "broker_profiles" : pt === "signal" ? "signal_profiles" : "betting_profiles";
    const idCol = pt === "broker" ? "broker_id" : pt === "signal" ? "signal_group_id" : "id";
    await (supabase.from(table) as any).update({
      claim_status: "claimed", claimed_by: item.claimed_by,
    }).eq(idCol, item.profile_id);

    const roleMap: Record<string, string> = { broker: "broker", signal: "signal_provider", betting: "betting_site" };
    const role = roleMap[pt];
    if (role) {
      await supabase.from("user_roles").insert({ user_id: item.claimed_by, role: role as any });
    }

    await logAuditAction(user.id, "approve_claim", "profile_claims", item.id, null, { status: "approved", note: adminNote });
  };

  const approveUpgrade = async (item: UnifiedItem) => {
    if (!user) return;

    await supabase.from("tier_upgrades").update({
      status: "approved", admin_note: adminNote, updated_at: new Date().toISOString(),
    }).eq("id", item.id);

    const pt = item.profile_type || "";
    const table = pt === "broker" ? "broker_profiles" : pt === "signal" ? "signal_profiles" : "betting_profiles";
    const idCol = pt === "broker" ? "broker_id" : pt === "signal" ? "signal_group_id" : "id";
    await (supabase.from(table) as any).update({
      tier: item.requested_tier,
      is_verified: item.requested_tier !== "basic",
      is_featured: item.requested_tier === "featured",
    }).eq(idCol, item.profile_id);

    await logAuditAction(user.id, "approve_upgrade", "tier_upgrades", item.id, null, { status: "approved", note: adminNote });
  };

  const approveContent = async (item: UnifiedItem) => {
    if (!user) return;

    await supabase.from("approval_queue").update({
      status: "approved", reviewed_by: user.id, reviewed_at: new Date().toISOString(),
    }).eq("id", item.id);

    if (item.content_type && item.content_id) {
      await (supabase.from(item.content_type as any) as any).update({ status: "published" }).eq("id", item.content_id);
    }

    await supabase.from("audit_log").insert({
      user_id: user.id, action: "approve", table_name: item.content_type || "unknown", record_id: item.content_id || item.id,
    });
  };

  const approveCommunity = async (item: UnifiedItem) => {
    if (!user || !item.community_kind) return;
    const table = item.community_kind === "review" ? "reviews" : "complaints";

    const { error } = await supabase
      .from(table)
      .update({ status: "published" })
      .eq("id", item.id);
    if (error) throw error;

    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: `approve_${item.community_kind}`,
      table_name: table,
      record_id: item.id,
    });

    if (item.user_id) {
      const link = item.community_broker_id ? `/brokers/${item.community_broker_id}` : "/dashboard";
      await supabase.from("notifications").insert({
        user_id: item.user_id,
        type: "system",
        title: `Your ${item.community_kind} was approved`,
        message: item.community_broker_name
          ? `Your ${item.community_kind} for ${item.community_broker_name} is now live.`
          : `Your ${item.community_kind} has been published.`,
        link,
      });
    }
  };

  // ── Reject handler ─────────────────────────────────────────────────
  const handleReject = async (item: UnifiedItem) => {
    if (!user) return;
    setProcessingId(item.id);

    try {
      if (item.category === "applications") {
        await supabase.from("applications").update({
          status: "rejected", updated_at: new Date().toISOString(),
          application_data: { ...((item.application_data as any) || {}), rejection_note: rejectNote },
        }).eq("id", item.id);
        await supabase.from("audit_log").insert({
          user_id: user.id, action: "reject_application", table_name: "applications", record_id: item.id,
        });
      } else if (item.category === "claims") {
        await supabase.from("profile_claims").update({
          status: "rejected", reviewed_by: user.id, reviewed_at: new Date().toISOString(), admin_note: rejectNote,
        }).eq("id", item.id);
        await logAuditAction(user.id, "reject_claim", "profile_claims", item.id, null, { note: rejectNote });
      } else if (item.category === "upgrades") {
        await supabase.from("tier_upgrades").update({
          status: "rejected", admin_note: rejectNote, updated_at: new Date().toISOString(),
        }).eq("id", item.id);
        await logAuditAction(user.id, "reject_upgrade", "tier_upgrades", item.id, null, { note: rejectNote });
      } else if (item.category === "content") {
        await supabase.from("approval_queue").update({
          status: "rejected", reviewed_by: user.id, reviewed_at: new Date().toISOString(),
          rejection_reason: rejectNote,
        }).eq("id", item.id);
        if (item.content_type && item.content_id) {
          await (supabase.from(item.content_type as any) as any).update({ status: "rejected" }).eq("id", item.content_id);
        }
      } else if (item.category === "community" && item.community_kind) {
        const table = item.community_kind === "review" ? "reviews" : "complaints";
        const { error } = await supabase
          .from(table)
          .update({ status: "rejected" })
          .eq("id", item.id);
        if (error) throw error;
        await supabase.from("audit_log").insert({
          user_id: user.id,
          action: `reject_${item.community_kind}`,
          table_name: table,
          record_id: item.id,
        });
        if (item.user_id) {
          await supabase.from("notifications").insert({
            user_id: item.user_id,
            type: "system",
            title: `Your ${item.community_kind} was not approved`,
            message: rejectNote
              ? `Reason: ${rejectNote}`
              : `Your ${item.community_kind} did not meet our guidelines.`,
            link: "/dashboard",
          });
        }
      }
      toast.success("Rejected");
    } catch (err: any) {
      toast.error(err.message || "Failed to reject");
    }

    setProcessingId(null);
    setReviewItem(null);
    setRejectNote("");
    setAdminNote("");
    fetchAll();
  };

  // ── Review Modal Content ───────────────────────────────────────────
  const renderReviewDetails = (item: UnifiedItem) => {
    if (item.category === "applications") {
      const data = (item.application_data as any) || {};
      return (
        <div className="space-y-3">
          <div className="border border-border rounded-lg p-3 bg-muted/30 space-y-1.5 text-sm font-mono">
            <p><span className="text-muted-foreground">Role:</span> <Badge variant="outline" className="capitalize ml-1">{(item.role || "").replace("_", " ")}</Badge></p>
            <p><span className="text-muted-foreground">Email:</span> {item.contact_email || "—"}</p>
            <p><span className="text-muted-foreground">Phone:</span> {item.contact_phone || "—"}</p>
            {item.contact_telegram && <p><span className="text-muted-foreground">Telegram:</span> {item.contact_telegram}</p>}
            {data.company_name && <p><span className="text-muted-foreground">Company:</span> {data.company_name}</p>}
            {data.platform_name && <p><span className="text-muted-foreground">Platform:</span> {data.platform_name}</p>}
            {data.website && <p><span className="text-muted-foreground">Website:</span> {data.website}</p>}
            {data.telegram_link && <p><span className="text-muted-foreground">TG Link:</span> {data.telegram_link}</p>}
            {data.regulation && <p><span className="text-muted-foreground">Regulation:</span> {data.regulation}</p>}
            {data.license && <p><span className="text-muted-foreground">License:</span> {data.license}</p>}
            {data.description && <p><span className="text-muted-foreground">Description:</span> {data.description}</p>}
            {data.track_record && <p><span className="text-muted-foreground">Track Record:</span> {data.track_record}</p>}
          </div>
          {!item.user_id && <p className="text-xs text-destructive font-mono">⚠ No user ID linked — cannot assign role</p>}
        </div>
      );
    }

    if (item.category === "claims") {
      const Icon = typeIcons[item.profile_type || ""] || Building2;
      const ci = item.contact_info || {};
      return (
        <div className="space-y-3">
          <div className="border border-border rounded-lg p-3 bg-muted/30">
            <p className="text-xs font-mono text-muted-foreground uppercase mb-1">Claiming</p>
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary" />
              <span className="font-semibold">{item.entity_name || item.profile_id}</span>
              <span className="text-[10px] text-muted-foreground font-mono uppercase">({item.profile_type})</span>
            </div>
          </div>
          <div className="border border-border rounded-lg p-3 bg-muted/30 space-y-1.5 text-sm font-mono">
            <p className="text-xs text-muted-foreground uppercase mb-1">Claimant</p>
            <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-muted-foreground" /><span>{item.claimant_name || "Unknown"}</span></div>
            <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" /><span>{item.claimant_phone || "—"}</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground" /><span>{item.claimant_country || "—"}</span></div>
            {ci.company && <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-muted-foreground" /><span>{ci.company} {ci.position ? `(${ci.position})` : ""}</span></div>}
            {ci.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-muted-foreground" /><span>{ci.email}</span></div>}
            {ci.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" /><span>{ci.phone}</span></div>}
          </div>
          {item.documents_url && (
            <div className="text-sm font-mono">
              <span className="text-muted-foreground">Docs: </span>
              <a href={item.documents_url} target="_blank" className="text-primary underline break-all">{item.documents_url}</a>
            </div>
          )}
        </div>
      );
    }

    if (item.category === "upgrades") {
      return (
        <div className="space-y-3">
          <div className="border border-border rounded-lg p-3 bg-muted/30 text-sm font-mono space-y-2">
            <p><span className="text-muted-foreground">Type:</span> {item.profile_type}</p>
            <div className="flex items-center gap-2">
              <BrokerTierBadge tier={item.current_tier || "basic"} />
              <span>→</span>
              <BrokerTierBadge tier={item.requested_tier || "premium"} />
            </div>
            {item.contact_info && Object.keys(item.contact_info).length > 0 && (
              <p><span className="text-muted-foreground">Contact:</span> {JSON.stringify(item.contact_info)}</p>
            )}
          </div>
        </div>
      );
    }

    if (item.category === "community") {
      const KindIcon = item.community_kind ? communityKindConfig[item.community_kind].icon : MessageSquare;
      const realName = item.submitter_full_name?.trim();
      const username = item.submitter_username;
      const displayName = realName || username || (item.user_id ? "Unknown user" : null);
      const authorMismatch =
        realName && item.community_author && realName.toLowerCase() !== item.community_author.toLowerCase();
      const initials = (realName || username || "?")
        .split(/\s+/)
        .map((s) => s[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

      return (
        <div className="space-y-3">
          {/* Submitted By block */}
          <div className="border border-primary/30 rounded-lg p-3 bg-primary/5 space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Submitted By</p>
            {item.user_id && displayName ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
                    {item.submitter_avatar ? (
                      <img src={item.submitter_avatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-mono font-semibold text-foreground">{initials}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                    {username && (
                      <p className="text-[11px] font-mono text-muted-foreground truncate">@{username}</p>
                    )}
                  </div>
                  {username && (
                    <a
                      href={`/u/${username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1 shrink-0"
                    >
                      Profile <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground flex-wrap">
                  {item.submitter_country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {item.submitter_country}
                    </span>
                  )}
                  <span className="flex items-center gap-1 truncate">
                    <User className="w-3 h-3" /> {item.user_id.slice(0, 8)}…
                  </span>
                </div>
                {authorMismatch && (
                  <p className="text-[10px] font-mono text-amber-400">
                    ⚠ Posted as: <span className="font-semibold">{item.community_author}</span>
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs font-mono text-amber-400">⚠ Anonymous submission (no linked account)</p>
            )}
          </div>

          <div className="border border-border rounded-lg p-3 bg-muted/30 space-y-2 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <KindIcon className="w-4 h-4 text-primary" />
              <span className="font-semibold capitalize">{item.community_kind}</span>
              {item.community_broker_name && (
                <Badge variant="outline" className="text-[10px]">{item.community_broker_name}</Badge>
              )}
              {item.community_kind === "review" && item.community_rating != null && (
                <span className="text-[10px] font-mono text-amber-400">★ {item.community_rating}/5</span>
              )}
            </div>
            <p className="text-xs font-mono text-muted-foreground">By {item.community_author || "User"}</p>
            <p className="text-sm whitespace-pre-wrap">{item.community_body || "(no content)"}</p>
          </div>
        </div>
      );
    }

    // Content
    return (
      <div className="border border-border rounded-lg p-3 bg-muted/30 text-sm font-mono space-y-1">
        <p><span className="text-muted-foreground">Content Type:</span> {item.content_type?.replace("_", " ")}</p>
        <p><span className="text-muted-foreground">Content ID:</span> {item.content_id?.slice(0, 8)}...</p>
        {item.reviewer_notes && <p><span className="text-muted-foreground">Notes:</span> {item.reviewer_notes}</p>}
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="hud-scanline">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="hud-badge">QUEUE</div>
          <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">Approval Queue</h2>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-sm px-3 py-1">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["all", "applications", "claims", "upgrades", "content", "community"] as RequestCategory[]).map((cat) => {
          const count = cat === "all" ? pendingCount : categoryPendingCounts[cat as keyof typeof categoryPendingCounts];
          const cfg = cat !== "all" ? categoryConfig[cat] : null;
          const Icon = cfg?.icon;
          return (
            <Button
              key={cat}
              size="sm"
              variant={categoryFilter === cat ? "default" : "outline"}
              onClick={() => setCategoryFilter(cat)}
              className="gap-1.5 text-xs"
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span className="capitalize">{cat === "all" ? "All" : cat}</span>
              {count > 0 && (
                <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  categoryFilter === cat ? "bg-primary-foreground/20 text-primary-foreground" : "bg-amber-500/20 text-amber-400"
                }`}>
                  {count}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-56 h-8 text-xs"
          />
        </div>
      </div>

      {/* Items */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-mono">
          No {statusFilter !== "all" ? statusFilter : ""} items {categoryFilter !== "all" ? `in ${categoryFilter}` : ""} found
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const cfg = categoryConfig[item.category as keyof typeof categoryConfig];
            if (!cfg) return null;
            const CatIcon = cfg.icon;

            return (
              <div
                key={`${item.category}-${item.id}`}
                className={`rounded-lg border p-4 bg-card/50 transition-all ${
                  item.status === "pending" ? "border-border/50 hover:border-primary/30" : "border-border/30 opacity-75"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CatIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono uppercase shrink-0 ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono uppercase shrink-0 ${statusColors[item.status] || ""}`}>
                          {item.status}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {getTimeAgo(item.created_at)}
                        </span>
                      </div>
                      <p className="text-sm font-medium mt-1 truncate">{getItemTitle(item)}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{getItemSubtitle(item)}</p>
                    </div>
                  </div>
                  {item.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-mono text-xs shrink-0"
                      onClick={() => {
                        setReviewItem(item);
                        setAdminNote("");
                        setRejectNote("");
                      }}
                    >
                      Review
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewItem} onOpenChange={() => setReviewItem(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase flex items-center gap-2">
              {reviewItem && (() => {
                const cfg = categoryConfig[reviewItem.category as keyof typeof categoryConfig];
                const CatIcon = cfg?.icon;
                return CatIcon ? <CatIcon className="w-5 h-5 text-primary" /> : null;
              })()}
              Review {reviewItem ? categoryConfig[reviewItem.category as keyof typeof categoryConfig]?.label : ""}
            </DialogTitle>
          </DialogHeader>
          {reviewItem && (
            <div className="space-y-4">
              {renderReviewDetails(reviewItem)}

              {/* Admin Note */}
              <div>
                <label className="font-mono text-xs text-muted-foreground block mb-1">Admin Note</label>
                <Input
                  value={adminNote}
                  onChange={(e) => {
                    setAdminNote(e.target.value);
                    setRejectNote(e.target.value);
                  }}
                  placeholder="Optional note..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(reviewItem)}
                  disabled={processingId === reviewItem.id || (reviewItem.category === "applications" && !reviewItem.user_id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 font-mono"
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button
                  onClick={() => handleReject(reviewItem)}
                  disabled={processingId === reviewItem.id}
                  variant="destructive"
                  className="flex-1 font-mono"
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalQueueAdmin;
