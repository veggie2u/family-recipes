import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./user-menu";
import { getFeatureFlags, isFlagEnabled } from "@/lib/feature-flags";

export async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    const flags = await getFeatureFlags();
    const allowSignUps = isFlagEnabled(flags, "ALLOW_SIGN_UPS");
    return (
      <div className="flex gap-2">
        <Button asChild variant={"outline"}>
          <Link href="/auth/login">Sign in</Link>
        </Button>
        {allowSignUps ? (
          <Button asChild variant={"default"}>
            <Link href="/auth/sign-up">Sign up</Link>
          </Button>
        ) : (
          <Button variant={"default"} disabled>
            Sign up
          </Button>
        )}
      </div>
    );
  }

  const profileResult = await supabase
    .from("profiles")
    .select("name, changelog_seen_at")
    .eq("id", user.sub)
    .single();

  const seenAt = profileResult.data?.changelog_seen_at ?? "1970-01-01";

  const [inviteResult, changelogResult] = await Promise.all([
    supabase
      .from("family_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.sub)
      .eq("status", "invited"),
    supabase
      .from("changelog")
      .select("id", { count: "exact", head: true })
      .gt("release_date", seenAt),
  ]);

  const displayName = profileResult.data?.name ?? user.email ?? "";
  const inviteCount = inviteResult.count ?? 0;
  const unreadChanges = changelogResult.count ?? 0;

  return <UserMenu displayName={displayName} inviteCount={inviteCount} unreadChanges={unreadChanges} />;
}
