import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CookbookCard } from "@/components/cookbook-card";
import { BookOpen, PlusIcon } from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { Suspense } from "react";

async function CookbookList() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;

  const { data: cookbooks, error } = await supabase
    .from("cookbooks")
    .select("id, name, description, is_public, created_by, profiles(name), cookbook_tags(tags(name)), cookbook_recipes(count)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  if (!cookbooks || cookbooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border border-dashed border-border rounded-lg">
        <BookOpen className="w-10 h-10 text-muted-foreground" />
        <p className="text-muted-foreground text-lg">No cookbooks yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cookbooks.map((cookbook) => {
        const tags = cookbook.cookbook_tags?.flatMap((ct: { tags: { name: string } | { name: string }[] | null }) =>
          Array.isArray(ct.tags) ? ct.tags.map((t) => t.name) : ct.tags ? [ct.tags.name] : []
        ) ?? [];
        return (
          <CookbookCard
            key={cookbook.id}
            id={cookbook.id}
            name={cookbook.name}
            description={cookbook.description}
            isPublic={cookbook.is_public}
            isOwner={cookbook.created_by === userId}
            creatorName={(cookbook.profiles as unknown as { name: string | null } | null)?.name ?? undefined}
            tags={tags}
            recipeCount={(cookbook.cookbook_recipes as unknown as { count: number }[] | null)?.[0]?.count ?? 0}
          />
        );
      })}
    </div>
  );
}

function CookbookListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-lg border border-border bg-muted/30 animate-pulse"
        />
      ))}
    </div>
  );
}

export default function AllCookbooksPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <BackButton label="← Back to my cookbooks" />
          <h1 className="font-display text-3xl font-bold text-foreground mt-3">
            All Cookbooks
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse your cookbooks and public cookbooks from the community.
          </p>
        </div>
        <Link
          href="/dashboard/cookbooks/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <PlusIcon className="w-4 h-4" />
          Add Cookbook
        </Link>
      </div>

      <Suspense fallback={<CookbookListSkeleton />}>
        <CookbookList />
      </Suspense>
    </div>
  );
}
