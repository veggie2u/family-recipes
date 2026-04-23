import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function ProfileContent({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .single();

  if (!profile) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
          {profile.name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{profile.name ?? "Anonymous"}</h2>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border border-dashed border-border rounded-lg">
        <p className="text-muted-foreground text-lg">
          Public recipes and cookbooks from this user will appear here.
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Profile</h1>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
              <div className="h-6 w-40 bg-muted rounded animate-pulse" />
            </div>
          </div>
        }
      >
        <ProfileContentWrapper params={params} />
      </Suspense>
    </div>
  );
}

async function ProfileContentWrapper({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <ProfileContent userId={userId} />;
}
