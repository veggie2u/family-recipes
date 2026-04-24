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

export async function getFeed({
  filter = "all",
  cursor,
}: {
  filter?: string;
  cursor?: string;
}): Promise<{ events: FeedEvent[]; nextCursor: string | null }> {
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
  if (baseEvents.length === 0) return { events: [], nextCursor: null };

  // Batch-fetch bookmark counts for all recipe_ids in this page
  const recipeIds = baseEvents
    .map((e) => e.recipe_id)
    .filter((id): id is string => id !== null);

  const bookmarkCountMap = new Map<string, number>();
  if (recipeIds.length > 0) {
    const { data: bookmarkRows } = await supabase
      .from("recipe_bookmarks")
      .select("recipe_id")
      .in("recipe_id", recipeIds);
    for (const row of bookmarkRows ?? []) {
      bookmarkCountMap.set(row.recipe_id, (bookmarkCountMap.get(row.recipe_id) ?? 0) + 1);
    }
  }

  const events: FeedEvent[] = baseEvents.map((e) => ({
    ...e,
    bookmark_count: e.recipe_id !== null ? (bookmarkCountMap.get(e.recipe_id) ?? 0) : 0,
  }));

  const nextCursor = events.length === 20 ? events[events.length - 1].event_created_at : null;
  return { events, nextCursor };
}
