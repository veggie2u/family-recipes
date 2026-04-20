"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  const { error } = await supabase.from("recipes").insert({
    title,
    description,
    ingredients,
    instructions,
    is_public: isPublic,
    created_by: userId,
  });

  if (error) throw new Error(error.message);

  redirect("/dashboard");
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

  const { error } = await supabase
    .from("recipes")
    .update({ title, description, ingredients, instructions, is_public: isPublic })
    .eq("id", id)
    .eq("created_by", claims.claims.sub);

  if (error) throw new Error(error.message);

  redirect(`/dashboard/recipes/${id}`);
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

  redirect("/dashboard");
}
