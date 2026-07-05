import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Service-role client — bypasses RLS. Server-only; never import this from a client component.
 * Used for the public match page (FR-5.5), which must read another user's recommendations
 * without their session.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  return createServiceClient<Database>(url, serviceRoleKey, { auth: { persistSession: false } });
}
