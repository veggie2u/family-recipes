"use server";

import { createClient } from "@/lib/supabase/server";

export type FeedEvent = {
  event_id: string;
  event_type:
    | "recipe_created"
    | "recipe_updated"
    | "recipe_added_to_family"
    | "recipe_added_to_cookbook"
    | "cookbook_created"
    | "cookbook_added_to_family"
    | "family_member_added";
  recipe_id: string | null;
  recipe_title: string | null;
  recipe_desc: string | null;
  recipe_is_public: boolean | null;
  actor_id: string;
  actor_name: string;
  family_id: string | null;
  family_name: string | null;
  cookbook_id: string | null;
  cookbook_name: string | null;
  cookbook_desc: string | null;
  event_created_at: string;
  score: number;
  tags: string[];
  bookmark_count: number;
};

export type EventReactionData = {
  chefs_kiss_count: number;
  made_it_count: number;
  user_chefs_kiss: boolean;
  user_made_it: boolean;
};

export async function getFeed({
  filter = "all",
  cursor,
}: {
  filter?: string;
  cursor?: string;
}): Promise<{
  events: FeedEvent[];
  nextCursor: string | null;
  reactionMap: Record<string, EventReactionData>;
  initialBookmarkedIds: string[];
}> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  const { data: rawEvents, error } = await supabase.rpc("get_feed", {
    p_user_id: userId,
    p_cursor: cursor ?? new Date().toISOString(),
    p_limit: 20,
    p_filter: userId ? filter : "all",
  });

  if (error) throw error;

  const baseEvents = (rawEvents ?? []) as Omit<FeedEvent, "bookmark_count">[];
  if (baseEvents.length === 0) return { events: [], nextCursor: null, reactionMap: {}, initialBookmarkedIds: [] };

  // Batch-fetch bookmark rows (count + user state in one query)
  const recipeIds = baseEvents
    .map((e) => e.recipe_id)
    .filter((id): id is string => id !== null);

  const bookmarkCountMap = new Map<string, number>();
  let initialBookmarkedIds: string[] = [];
  if (recipeIds.length > 0) {
    const { data: bookmarkRows } = await supabase
      .from("recipe_bookmarks")
      .select("recipe_id, user_id")
      .in("recipe_id", recipeIds);
    for (const row of bookmarkRows ?? []) {
      bookmarkCountMap.set(row.recipe_id, (bookmarkCountMap.get(row.recipe_id) ?? 0) + 1);
    }
    if (userId) {
      initialBookmarkedIds = (bookmarkRows ?? [])
        .filter((r) => r.user_id === userId)
        .map((r) => r.recipe_id);
    }
  }

  const events: FeedEvent[] = baseEvents.map((e) => ({
    ...e,
    bookmark_count: e.recipe_id !== null ? (bookmarkCountMap.get(e.recipe_id) ?? 0) : 0,
  }));

  const nextCursor = events.length === 20 ? events[events.length - 1].event_created_at : null;

  // Batch-fetch reaction rows for all events
  const cookbookIds = events
    .filter((e) => !e.recipe_id && e.cookbook_id)
    .map((e) => e.cookbook_id) as string[];

  const [recipeReactionRows, cookbookReactionRows] = await Promise.all([
    recipeIds.length > 0
      ? supabase
          .from("recipe_reactions")
          .select("recipe_id, reaction_type, user_id")
          .in("recipe_id", recipeIds)
          .then((r) => r.data ?? [])
      : Promise.resolve([] as { recipe_id: string; reaction_type: string; user_id: string }[]),
    cookbookIds.length > 0
      ? supabase
          .from("cookbook_reactions")
          .select("cookbook_id, reaction_type, user_id")
          .in("cookbook_id", cookbookIds)
          .then((r) => r.data ?? [])
      : Promise.resolve([] as { cookbook_id: string; reaction_type: string; user_id: string }[]),
  ]);

  // Aggregate into a map keyed by event_id
  const reactionMap: Record<string, EventReactionData> = {};
  for (const event of events) {
    if (event.recipe_id) {
      const rows = recipeReactionRows.filter((r) => r.recipe_id === event.recipe_id);
      reactionMap[event.event_id] = {
        chefs_kiss_count: rows.filter((r) => r.reaction_type === "chefs_kiss").length,
        made_it_count: rows.filter((r) => r.reaction_type === "made_it").length,
        user_chefs_kiss: rows.some(
          (r) => r.reaction_type === "chefs_kiss" && r.user_id === userId
        ),
        user_made_it: rows.some(
          (r) => r.reaction_type === "made_it" && r.user_id === userId
        ),
      };
    } else if (event.cookbook_id) {
      const rows = cookbookReactionRows.filter((r) => r.cookbook_id === event.cookbook_id);
      reactionMap[event.event_id] = {
        chefs_kiss_count: rows.filter((r) => r.reaction_type === "chefs_kiss").length,
        made_it_count: 0,
        user_chefs_kiss: rows.some(
          (r) => r.reaction_type === "chefs_kiss" && r.user_id === userId
        ),
        user_made_it: false,
      };
    }
  }

  return { events, nextCursor, reactionMap, initialBookmarkedIds };
}
