"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type FeedbackCategory = "bug" | "feature" | "general";

export async function submitFeedback(
  category: FeedbackCategory,
  message: string,
  pageUrl: string
): Promise<{ error?: string }> {
  if (!message.trim()) return { error: "Message is required." };

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const { error } = await supabase.from("feedback").insert({
    user_id: claimsData.claims.sub,
    category,
    message: message.trim(),
    page_url: pageUrl || null,
  });

  if (error) return { error: "Failed to submit feedback. Please try again." };

  return {};
}
