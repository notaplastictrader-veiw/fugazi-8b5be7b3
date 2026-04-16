import { supabase } from "@/integrations/supabase/client";

/**
 * Notify all super_admin users by inserting notifications.
 * Fetches super_admin user IDs from user_roles, then bulk-inserts notifications.
 */
export async function notifyAdmins(title: string, message: string, link: string = "/admin/approvals") {
  try {
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "super_admin" as any);

    if (!adminRoles || adminRoles.length === 0) return;

    const notifications = adminRoles.map((r) => ({
      user_id: r.user_id,
      type: "admin",
      title,
      message,
      link,
    }));

    await supabase.from("notifications").insert(notifications);
  } catch (err) {
    console.error("Failed to notify admins:", err);
  }
}
