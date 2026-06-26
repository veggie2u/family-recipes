"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markChangelogSeen(): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) return;

  await supabase
    .from("profiles")
    .update({ changelog_seen_at: new Date().toISOString() })
    .eq("id", data.claims.sub);

  revalidatePath("/", "layout");
}
