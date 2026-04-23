"use server";

import { createClient } from "@/lib/supabase/server";

export type FeedEvent = {
  event_id: string;
  event_type:
    | "recipe_created"
    | "recipe_added_to_family"
    | "recipe_added_to_cookbook"
    | "cookbook_created"
    | "cookbook_added_to_family";
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

  const events = (rawEvents ?? []) as Omit<FeedEvent, "tags">[];

  if (events.length === 0) {
    return { events: [], nextCursor: null };
  }

  const recipeIds = events
    .map((e) => e.recipe_id)
    .filter((id): id is string => id !== null);

  const tagMap = new Map<string, string[]>();
  if (recipeIds.length > 0) {
    const { data: tagRows } = await supabase
      .from("recipe_tags")
      .select("recipe_id, tags(name)")
      .in("recipe_id", recipeIds);

    for (const row of tagRows ?? []) {
      const tagName = (row.tags as unknown as { name: string } | null)?.name;
      if (tagName) {
        const existing = tagMap.get(row.recipe_id) ?? [];
        existing.push(tagName);
        tagMap.set(row.recipe_id, existing);
      }
    }
  }

  const eventsWithTags: FeedEvent[] = events.map((e) => ({
    ...e,
    tags: e.recipe_id !== null ? (tagMap.get(e.recipe_id) ?? []) : [],
  }));

  const nextCursor =
    events.length === 20
      ? events[events.length - 1].event_created_at
      : null;

  return { events: eventsWithTags, nextCursor };
}
