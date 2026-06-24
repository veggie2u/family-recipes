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
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/auth/login">Sign in</Link>
        </Button>
        {allowSignUps ? (
          <Button asChild size="sm" variant={"default"}>
            <Link href="/auth/sign-up">Sign up</Link>
          </Button>
        ) : (
          <Button size="sm" variant={"default"} disabled>
            Sign up
          </Button>
        )}
      </div>
    );
  }

  const [profileResult, inviteResult] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", user.sub).single(),
    supabase
      .from("family_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.sub)
      .eq("status", "invited"),
  ]);

  const displayName = profileResult.data?.name ?? user.email ?? "";
  const inviteCount = inviteResult.count ?? 0;

  return <UserMenu displayName={displayName} inviteCount={inviteCount} />;
}
