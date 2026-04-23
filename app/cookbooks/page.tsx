import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { BookOpen, PlusIcon } from "lucide-react";
import { CookbookCard } from "@/components/cookbook-card";
import { FollowButton } from "@/components/follow-button";
import Link from "next/link";

async function CookbookContent() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const isAuthenticated = !!claimsData?.claims;

  // ── Authenticated: show the user's own cookbooks ───────────────────────────
  if (isAuthenticated) {
    const userId = claimsData.claims.sub;

    const { data: cookbooks } = await supabase
      .from("cookbooks")
      .select("id, name, description, is_public, created_by, profiles(name)")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    return (
      <>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              My Cookbooks
            </h1>
            <p className="text-muted-foreground mt-1">
              Cookbooks you&apos;ve created.
            </p>
          </div>
          <Link
            href="/cookbooks/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <PlusIcon className="w-4 h-4" />
            New Cookbook
          </Link>
        </div>

        {!cookbooks?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border border-dashed border-border rounded-lg">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">
              You haven&apos;t created any cookbooks yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cookbooks.map((cb) => (
              <CookbookCard
                key={cb.id}
                id={cb.id}
                name={cb.name}
                description={cb.description}
                isPublic={cb.is_public}
                isOwner={true}
                creatorName={
                  (
                    cb.profiles as unknown as { name: string | null } | null
                  )?.name ?? undefined
                }
                href={`/cookbooks/${cb.id}?from=cookbooks`}
              />
            ))}
          </div>
        )}
      </>
    );
  }

  // ── Unauthenticated: public listing ───────────────────────────────────────
  const { data: cookbooks } = await supabase
    .from("cookbooks")
    .select("id, name, description, created_by, profiles(name)")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  // Batch-fetch follower counts for public listing
  let followerCounts: Record<string, number> = {};
  if (cookbooks?.length) {
    const ids = cookbooks.map((c) => c.id);
    const { data: follows } = await supabase
      .from("cookbook_follows")
      .select("cookbook_id")
      .in("cookbook_id", ids);
    if (follows) {
      followerCounts = follows.reduce(
        (acc, row) => {
          acc[row.cookbook_id] = (acc[row.cookbook_id] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
    }
  }

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Cookbooks
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse cookbooks shared by the community.
        </p>
      </div>

      {!cookbooks?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <BookOpen className="w-10 h-10" />
          <p>No cookbooks have been shared yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cookbooks.map((cb) => (
            <div key={cb.id} className="flex flex-col gap-2">
              <CookbookCard
                id={cb.id}
                name={cb.name}
                description={cb.description}
                isPublic={true}
                isOwner={false}
                creatorName={
                  (
                    cb.profiles as unknown as { name: string | null } | null
                  )?.name ?? undefined
                }
                href={`/cookbooks/${cb.id}?from=cookbooks`}
              />
              <div className="flex justify-end">
                <FollowButton
                  type="cookbook"
                  targetId={cb.id}
                  initialFollowing={false}
                  followerCount={followerCounts[cb.id] ?? 0}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function CookbookContentSkeleton() {
  return (
    <>
      <div className="h-14 animate-pulse rounded-lg bg-muted/30" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </>
  );
}

export default function CookbooksPage() {
  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<CookbookContentSkeleton />}>
        <CookbookContent />
      </Suspense>
    </div>
  );
}
