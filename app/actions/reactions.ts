"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type EntityType = "recipe" | "cookbook";
type ReactionType = "chefs_kiss" | "made_it";

export async function toggleReaction(
  entityType: EntityType,
  entityId: string,
  reactionType: ReactionType
): Promise<{ active: boolean; count: number }> {
  if (entityType === "cookbook" && reactionType === "made_it") {
    throw new Error("Cookbooks do not support the 'made_it' reaction.");
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");
  const userId = claimsData.claims.sub;

  const table =
    entityType === "recipe" ? "recipe_reactions" : "cookbook_reactions";
  const idColumn = entityType === "recipe" ? "recipe_id" : "cookbook_id";

  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .eq(idColumn, entityId)
    .eq("user_id", userId)
    .eq("reaction_type", reactionType)
    .maybeSingle();

  let active: boolean;

  if (existing) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    active = false;
  } else {
    const { error } = await supabase.from(table).insert({
      [idColumn]: entityId,
      user_id: userId,
      reaction_type: reactionType,
    });
    if (error) throw error;
    active = true;
  }

  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(idColumn, entityId)
    .eq("reaction_type", reactionType);

  return { active, count: count ?? 0 };
}

export async function getRecipeReactionData(
  recipeId: string,
  userId: string | null
): Promise<{
  chefs_kiss_count: number;
  made_it_count: number;
  user_chefs_kiss: boolean;
  user_made_it: boolean;
}> {
  const supabase = await createClient();

  const [{ count: chefsKissCount }, { count: madeItCount }] = await Promise.all(
    [
      supabase
        .from("recipe_reactions")
        .select("*", { count: "exact", head: true })
        .eq("recipe_id", recipeId)
        .eq("reaction_type", "chefs_kiss"),
      supabase
        .from("recipe_reactions")
        .select("*", { count: "exact", head: true })
        .eq("recipe_id", recipeId)
        .eq("reaction_type", "made_it"),
    ]
  );

  let user_chefs_kiss = false;
  let user_made_it = false;

  if (userId) {
    const [{ data: ckRow }, { data: miRow }] = await Promise.all([
      supabase
        .from("recipe_reactions")
        .select("id")
        .eq("recipe_id", recipeId)
        .eq("user_id", userId)
        .eq("reaction_type", "chefs_kiss")
        .maybeSingle(),
      supabase
        .from("recipe_reactions")
        .select("id")
        .eq("recipe_id", recipeId)
        .eq("user_id", userId)
        .eq("reaction_type", "made_it")
        .maybeSingle(),
    ]);
    user_chefs_kiss = ckRow !== null;
    user_made_it = miRow !== null;
  }

  return {
    chefs_kiss_count: chefsKissCount ?? 0,
    made_it_count: madeItCount ?? 0,
    user_chefs_kiss,
    user_made_it,
  };
}

export async function getRecipeReactionsBatch(
  recipeIds: string[],
  userId: string | null
): Promise<
  Record<
    string,
    {
      chefs_kiss_count: number;
      made_it_count: number;
      user_chefs_kiss: boolean;
      user_made_it: boolean;
    }
  >
> {
  if (recipeIds.length === 0) return {};

  const supabase = await createClient();

  // Fetch all reactions for all recipe IDs in one query
  const [{ data: allReactions }, { data: userReactions }] = await Promise.all([
    supabase
      .from("recipe_reactions")
      .select("recipe_id, reaction_type")
      .in("recipe_id", recipeIds),
    userId
      ? supabase
          .from("recipe_reactions")
          .select("recipe_id, reaction_type")
          .in("recipe_id", recipeIds)
          .eq("user_id", userId)
      : Promise.resolve({ data: [] as { recipe_id: string; reaction_type: string }[] }),
  ]);

  // Build result map
  const result: Record<
    string,
    { chefs_kiss_count: number; made_it_count: number; user_chefs_kiss: boolean; user_made_it: boolean }
  > = {};

  for (const id of recipeIds) {
    result[id] = { chefs_kiss_count: 0, made_it_count: 0, user_chefs_kiss: false, user_made_it: false };
  }

  for (const row of allReactions ?? []) {
    if (!result[row.recipe_id]) continue;
    if (row.reaction_type === "chefs_kiss") result[row.recipe_id].chefs_kiss_count++;
    if (row.reaction_type === "made_it") result[row.recipe_id].made_it_count++;
  }

  for (const row of userReactions ?? []) {
    if (!result[row.recipe_id]) continue;
    if (row.reaction_type === "chefs_kiss") result[row.recipe_id].user_chefs_kiss = true;
    if (row.reaction_type === "made_it") result[row.recipe_id].user_made_it = true;
  }

  return result;
}

export async function getCookbookReactionData(
  cookbookId: string,
  userId: string | null
): Promise<{
  chefs_kiss_count: number;
  user_chefs_kiss: boolean;
}> {
  const supabase = await createClient();

  const { count: chefsKissCount } = await supabase
    .from("cookbook_reactions")
    .select("*", { count: "exact", head: true })
    .eq("cookbook_id", cookbookId)
    .eq("reaction_type", "chefs_kiss");

  let user_chefs_kiss = false;

  if (userId) {
    const { data: ckRow } = await supabase
      .from("cookbook_reactions")
      .select("id")
      .eq("cookbook_id", cookbookId)
      .eq("user_id", userId)
      .eq("reaction_type", "chefs_kiss")
      .maybeSingle();
    user_chefs_kiss = ckRow !== null;
  }

  return {
    chefs_kiss_count: chefsKissCount ?? 0,
    user_chefs_kiss,
  };
}
