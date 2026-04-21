"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function syncCookbookTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cookbookId: string,
  tagNames: string[]
) {
  if (!tagNames.length) {
    await supabase.from("cookbook_tags").delete().eq("cookbook_id", cookbookId);
    return;
  }

  const { error: tagError } = await supabase
    .from("tags")
    .upsert(
      tagNames.map((name) => ({ name })),
      { onConflict: "name", ignoreDuplicates: true }
    );

  if (tagError) throw new Error(tagError.message);

  const { data: existingTags } = await supabase
    .from("tags")
    .select("id, name")
    .in("name", tagNames);

  const tagIds = (existingTags ?? []).map((t) => t.id);

  await supabase.from("cookbook_tags").delete().eq("cookbook_id", cookbookId);
  if (tagIds.length) {
    await supabase
      .from("cookbook_tags")
      .insert(tagIds.map((tag_id) => ({ cookbook_id: cookbookId, tag_id })));
  }
}

export async function createCookbook(formData: FormData) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const userId = claims.claims.sub;

  // Ensure a profile row exists (handles users who signed up before the trigger was added)
  await supabase.from("profiles").upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true });

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const isPublic = formData.get("is_public") === "on";
  const tags: string[] = JSON.parse((formData.get("tags") as string) || "[]");

  const { data: cookbook, error } = await supabase
    .from("cookbooks")
    .insert({ name, description, is_public: isPublic, created_by: userId })
    .select("id")
    .single();

  if (error || !cookbook) throw new Error(error?.message ?? "Failed to create cookbook");

  await syncCookbookTags(supabase, cookbook.id, tags);

  redirect("/dashboard");
}
