import { getFeatureFlags, isFlagEnabled } from "@/lib/feature-flags";
import { createClient } from "@/lib/supabase/server";
import { FeedbackButton } from "@/components/feedback-dialog";

export async function BetaBanner() {
  const flags = await getFeatureFlags();
  if (!isFlagEnabled(flags, "BETA_MODE_ON")) return null;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = !!data?.claims?.sub;

  return (
    <div className="w-full bg-amber-100 border-b border-amber-300">
      <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
        <p className="text-sm text-amber-900 font-medium">
          Currently in beta. Full release coming soon. Please leave feedback.
        </p>
        {isLoggedIn && <FeedbackButton />}
      </div>
    </div>
  );
}
