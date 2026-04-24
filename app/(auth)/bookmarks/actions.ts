"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function bookmarkRecipe(recipeId: string): Promise<void> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");
  const userId = claimsData.claims.sub;

  const { error } = await supabase
    .from("recipe_bookmarks")
    .insert({ recipe_id: recipeId, user_id: userId });

  if (error) throw error;

  revalidatePath("/bookmarks");
  revalidatePath("/feed");
  revalidatePath(`/recipes/${recipeId}`);
}

export async function removeBookmark(recipeId: string): Promise<void> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");
  const userId = claimsData.claims.sub;

  const { error } = await supabase
    .from("recipe_bookmarks")
    .delete()
    .eq("recipe_id", recipeId)
    .eq("user_id", userId);

  if (error) throw error;

  revalidatePath("/bookmarks");
  revalidatePath("/feed");
  revalidatePath(`/recipes/${recipeId}`);
}
