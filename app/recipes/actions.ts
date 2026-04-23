"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function syncRecipeTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  recipeId: string,
  tagNames: string[]
) {
  if (!tagNames.length) {
    await supabase.from("recipe_tags").delete().eq("recipe_id", recipeId);
    return;
  }

  // Insert new tags (ignore conflicts for existing ones — no UPDATE needed)
  const { error: tagError } = await supabase
    .from("tags")
    .upsert(
      tagNames.map((name) => ({ name })),
      { onConflict: "name", ignoreDuplicates: true }
    );

  if (tagError) throw new Error(tagError.message);

  // Fetch IDs for all tag names (both newly inserted and pre-existing)
  const { data: existingTags } = await supabase
    .from("tags")
    .select("id, name")
    .in("name", tagNames);

  const tagIds = (existingTags ?? []).map((t) => t.id);

  // Replace all recipe_tags for this recipe
  await supabase.from("recipe_tags").delete().eq("recipe_id", recipeId);
  if (tagIds.length) {
    await supabase
      .from("recipe_tags")
      .insert(tagIds.map((tag_id) => ({ recipe_id: recipeId, tag_id })));
  }
}

export async function createRecipe(formData: FormData) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const userId = claims.claims.sub;

  // Ensure a profile row exists (handles users who signed up before the trigger was added)
  await supabase.from("profiles").upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true });

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const ingredients = (formData.get("ingredients") as string) || null;
  const instructions = (formData.get("instructions") as string) || null;
  const isPublic = formData.get("is_public") === "on";
  const tags: string[] = JSON.parse((formData.get("tags") as string) || "[]");

  const { data: recipe, error } = await supabase
    .from("recipes")
    .insert({ title, description, ingredients, instructions, is_public: isPublic, created_by: userId })
    .select("id")
    .single();

  if (error || !recipe) throw new Error(error?.message ?? "Failed to create recipe");

  await syncRecipeTags(supabase, recipe.id, tags);

  redirect("/recipes");
}

export async function updateRecipe(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const ingredients = (formData.get("ingredients") as string) || null;
  const instructions = (formData.get("instructions") as string) || null;
  const isPublic = formData.get("is_public") === "on";
  const tags: string[] = JSON.parse((formData.get("tags") as string) || "[]");

  const { error } = await supabase
    .from("recipes")
    .update({ title, description, ingredients, instructions, is_public: isPublic })
    .eq("id", id)
    .eq("created_by", claims.claims.sub);

  if (error) throw new Error(error.message);

  await syncRecipeTags(supabase, id, tags);

  redirect(`/recipes/${id}`);
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id)
    .eq("created_by", claims.claims.sub);

  if (error) throw new Error(error.message);

  redirect("/recipes");
}
