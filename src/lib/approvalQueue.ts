import { supabase } from "@/integrations/supabase/client";

/**
 * Auto-insert into approval_queue when content is created or edited.
 * Also logs to audit_log.
 */
export const submitToApprovalQueue = async (
  contentType: string,
  contentId: string,
  userId: string,
) => {
  await supabase.from("approval_queue").insert({
    content_type: contentType,
    content_id: contentId,
    submitted_by: userId,
    status: "pending",
  });
};

export const logAuditAction = async (
  userId: string,
  action: string,
  tableName: string,
  recordId: string | null,
  oldData: any = null,
  newData: any = null,
) => {
  await supabase.from("audit_log").insert({
    user_id: userId,
    action,
    table_name: tableName,
    record_id: recordId,
    old_data: oldData,
    new_data: newData,
  });
};
