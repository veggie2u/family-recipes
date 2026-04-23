"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function followFamily(familyId: string): Promise<void> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");
  const userId = claimsData.claims.sub;

  const { error } = await supabase
    .from("family_followers")
    .insert({ family_id: familyId, user_id: userId });

  if (error) throw error;

  revalidatePath(`/families/${familyId}`);
}

export async function unfollowFamily(familyId: string): Promise<void> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");
  const userId = claimsData.claims.sub;

  const { error } = await supabase
    .from("family_followers")
    .delete()
    .eq("family_id", familyId)
    .eq("user_id", userId);

  if (error) throw error;

  revalidatePath(`/families/${familyId}`);
}

export async function followCookbook(cookbookId: string): Promise<void> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");
  const userId = claimsData.claims.sub;

  const { error } = await supabase
    .from("cookbook_follows")
    .insert({ cookbook_id: cookbookId, user_id: userId });

  if (error) throw error;

  revalidatePath(`/cookbooks/${cookbookId}`);
}

export async function unfollowCookbook(cookbookId: string): Promise<void> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");
  const userId = claimsData.claims.sub;

  const { error } = await supabase
    .from("cookbook_follows")
    .delete()
    .eq("cookbook_id", cookbookId)
    .eq("user_id", userId);

  if (error) throw error;

  revalidatePath(`/cookbooks/${cookbookId}`);
}
