"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createFamily(formData: FormData) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const userId = claims.claims.sub;

  // Ensure a profile row exists
  await supabase
    .from("profiles")
    .upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true });

  const name = formData.get("name") as string;
  const is_public = formData.get("is_public") === "on";

  const { data: family, error } = await supabase
    .from("families")
    .insert({ name, is_public, created_by: userId })
    .select("id")
    .single();

  if (error || !family) throw new Error(error?.message ?? "Failed to create family");

  await supabase.from("family_members").insert({
    family_id: family.id,
    user_id: userId,
    role: "admin",
    status: "active",
  });

  redirect(`/dashboard/families/${family.id}`);
}

export async function searchUsers(
  query: string,
  familyId: string
): Promise<Array<{ id: string; name: string | null }>> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return [];

  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  // Get existing member user IDs to exclude
  const { data: members } = await supabase
    .from("family_members")
    .select("user_id")
    .eq("family_id", familyId);
  const excludeIds = members?.map((m) => m.user_id) ?? [];

  // Search profiles by name
  let profileQuery = supabase
    .from("profiles")
    .select("id, name")
    .ilike("name", `%${trimmed}%`)
    .limit(8);

  if (excludeIds.length > 0) {
    profileQuery = profileQuery.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data: profiles } = await profileQuery;

  return profiles ?? [];
}

export async function inviteToFamily(familyId: string, userId: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  // Check if already a member
  const { data: existing } = await supabase
    .from("family_members")
    .select("id, status")
    .eq("family_id", familyId)
    .eq("user_id", userId)
    .single();

  if (existing) {
    if (existing.status === "active") throw new Error("That user is already a member of this family");
    if (existing.status === "invited") throw new Error("That user has already been invited");
  }

  const { error } = await supabase.from("family_members").insert({
    family_id: familyId,
    user_id: userId,
    role: "member",
    status: "invited",
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/families/${familyId}`);
}

export async function acceptInvitation(memberId: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const userId = claims.claims.sub;

  const { error } = await supabase
    .from("family_members")
    .update({ status: "active" })
    .eq("id", memberId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/families");
  revalidatePath("/families");
}

export async function declineInvitation(memberId: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const userId = claims.claims.sub;

  const { error } = await supabase
    .from("family_members")
    .delete()
    .eq("id", memberId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/families");
  revalidatePath("/families");
}

export async function addCookbookToFamily(familyId: string, cookbookId: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const { error } = await supabase
    .from("family_cookbooks")
    .insert({ family_id: familyId, cookbook_id: cookbookId });

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/families/${familyId}`);
}

export async function removeCookbookFromFamily(familyId: string, cookbookId: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const { error } = await supabase
    .from("family_cookbooks")
    .delete()
    .eq("family_id", familyId)
    .eq("cookbook_id", cookbookId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/families/${familyId}`);
}
