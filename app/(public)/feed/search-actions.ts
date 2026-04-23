"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchResultType = "recipe" | "cookbook" | "family" | "user";

export type SearchResult = {
  result_type: SearchResultType;
  id: string;
  name: string;
  description: string | null;
  creator_name: string | null;
  tags: string[];
  score: number;
};

export async function searchGlobal(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  const { data, error } = await supabase.rpc("search_global", {
    p_user_id: userId,
    p_query: query.trim(),
    p_limit: 20,
  });

  if (error) {
    console.error("searchGlobal error:", error);
    return [];
  }

  return (data ?? []) as SearchResult[];
}
