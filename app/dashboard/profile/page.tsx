import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserCircle } from "lucide-react";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, avatar_url")
    .eq("id", user.sub)
    .single();

  const displayName = profile?.name ?? user.email ?? "Unknown";
  const avatarUrl = profile?.avatar_url ?? null;

  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-6 py-12">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={displayName}
          className="h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <UserCircle className="h-24 w-24 text-muted-foreground" />
      )}

      <ProfileForm defaultName={profile?.name ?? ""} defaultDisplayName={displayName} />
    </div>
  );
}
