import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { BookMarked, BookOpen, PlusIcon } from "lucide-react";
import { CookbookCard } from "@/components/cookbook-card";
import Link from "next/link";

async function CookbookContent() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const isAuthenticated = !!claimsData?.claims;

  // ── Authenticated: show the user's own cookbooks ──────────────────────────
  if (isAuthenticated) {
    const userId = claimsData.claims.sub;

    const { data: cookbooks, error } = await supabase
      .from("cookbooks")
      .select(
        "id, name, description, is_public, created_by, profiles(name), cookbook_tags(tags(name)), cookbook_recipes(count)"
      )
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (
      <>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              My Cookbooks
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse and manage your cookbooks.
            </p>
          </div>
          <Link
            href="/dashboard/cookbooks/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <PlusIcon className="w-4 h-4" />
            New Cookbook
          </Link>
        </div>

        {!cookbooks?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border border-dashed border-border rounded-lg">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">No cookbooks yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cookbooks.map((cookbook) => {
              const tags =
                cookbook.cookbook_tags?.flatMap(
                  (ct: {
                    tags: { name: string } | { name: string }[] | null;
                  }) =>
                    Array.isArray(ct.tags)
                      ? ct.tags.map((t) => t.name)
                      : ct.tags
                        ? [ct.tags.name]
                        : []
                ) ?? [];
              return (
                <CookbookCard
                  key={cookbook.id}
                  id={cookbook.id}
                  name={cookbook.name}
                  description={cookbook.description}
                  isPublic={cookbook.is_public}
                  isOwner={cookbook.created_by === userId}
                  creatorName={
                    (
                      cookbook.profiles as unknown as {
                        name: string | null;
                      } | null
                    )?.name ?? undefined
                  }
                  tags={tags}
                  recipeCount={
                    (
                      cookbook.cookbook_recipes as unknown as
                        | { count: number }[]
                        | null
                    )?.[0]?.count ?? 0
                  }
                />
              );
            })}
          </div>
        )}
      </>
    );
  }

  // ── Unauthenticated: public listing ───────────────────────────────────────
  const { data: cookbooks, error } = await supabase
    .from("cookbooks")
    .select(
      "id, name, description, is_public, created_by, profiles(name), cookbook_tags(tags(name)), cookbook_recipes(count)"
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

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
          <BookMarked className="w-10 h-10" />
          <p>No cookbooks have been shared yet.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cookbooks.map((cookbook) => {
            const creatorName =
              (
                cookbook.profiles as unknown as {
                  name: string | null;
                } | null
              )?.name ?? undefined;
            const tags: string[] =
              cookbook.cookbook_tags?.flatMap(
                (ct: {
                  tags: { name: string } | { name: string }[] | null;
                }) =>
                  Array.isArray(ct.tags)
                    ? ct.tags.map((t) => t.name)
                    : ct.tags
                      ? [ct.tags.name]
                      : []
              ) ?? [];
            const recipeCount =
              (
                cookbook.cookbook_recipes as unknown as
                  | { count: number }[]
                  | null
              )?.[0]?.count ?? 0;

            return (
              <li key={cookbook.id}>
                <CookbookCard
                  id={cookbook.id}
                  name={cookbook.name}
                  description={cookbook.description}
                  isPublic={cookbook.is_public}
                  creatorName={creatorName}
                  tags={tags}
                  recipeCount={recipeCount}
                />
              </li>
            );
          })}
        </ul>
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
