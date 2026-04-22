"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
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

  redirect(`/dashboard/cookbooks/${cookbook.id}`);
}

export async function updateCookbook(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const isPublic = formData.get("is_public") === "on";
  const tags: string[] = JSON.parse((formData.get("tags") as string) || "[]");

  const { error } = await supabase
    .from("cookbooks")
    .update({ name, description, is_public: isPublic })
    .eq("id", id)
    .eq("created_by", claims.claims.sub);

  if (error) throw new Error(error.message);

  await syncCookbookTags(supabase, id, tags);

  redirect(`/dashboard/cookbooks/${id}`);
}

export async function deleteCookbook(id: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const { error } = await supabase
    .from("cookbooks")
    .delete()
    .eq("id", id)
    .eq("created_by", claims.claims.sub);

  redirect("/dashboard");
}

export async function addRecipeToCookbook(cookbookId: string, recipeId: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const userId = claims.claims.sub;

  const { data: cookbook } = await supabase
    .from("cookbooks")
    .select("id")
    .eq("id", cookbookId)
    .eq("created_by", userId)
    .single();

  if (!cookbook) throw new Error("Cookbook not found or access denied");

  const { error } = await supabase
    .from("cookbook_recipes")
    .insert({ cookbook_id: cookbookId, recipe_id: recipeId });

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/cookbooks/${cookbookId}`);
  revalidatePath(`/dashboard/recipes/${recipeId}`);
}

export async function removeRecipeFromCookbook(cookbookId: string, recipeId: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const userId = claims.claims.sub;

  const { data: cookbook } = await supabase
    .from("cookbooks")
    .select("id")
    .eq("id", cookbookId)
    .eq("created_by", userId)
    .single();

  if (!cookbook) throw new Error("Cookbook not found or access denied");

  const { error } = await supabase
    .from("cookbook_recipes")
    .delete()
    .eq("cookbook_id", cookbookId)
    .eq("recipe_id", recipeId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/cookbooks/${cookbookId}`);
  revalidatePath(`/dashboard/recipes/${recipeId}`);
}
