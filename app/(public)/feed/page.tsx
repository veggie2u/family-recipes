import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

const FILTER_LABELS: Record<string, string> = {
  recipes: "Recipes",
  cookbooks: "Cookbooks",
  families: "Families",
};

const AUTH_FILTERS = ["all", "families", "following", "public"] as const;
type AuthFilter = (typeof AUTH_FILTERS)[number];

const AUTH_FILTER_LABELS: Record<AuthFilter, string> = {
  all: "All",
  families: "My Families",
  following: "Following",
  public: "Public",
};

async function FeedContent({
  filter,
}: {
  filter: string | undefined;
}) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const isAuthenticated = !!claimsData?.claims;

  const activeFilter = (filter ?? "all") as AuthFilter;

  return (
    <div className="flex flex-col gap-6">
      {isAuthenticated && (
        <div className="flex items-center gap-2 border-b border-border pb-4">
          {AUTH_FILTERS.map((f) => (
            <a
              key={f}
              href={f === "all" ? "/feed" : `/feed?filter=${f}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {AUTH_FILTER_LABELS[f]}
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border border-dashed border-border rounded-lg">
        <p className="text-muted-foreground text-lg">
          {isAuthenticated
            ? `Your personalized ${filter ? FILTER_LABELS[filter] ?? "feed" : "feed"} is coming soon.`
            : "Public recipes, cookbooks, and families will appear here."}
        </p>
        {!isAuthenticated && (
          <a
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity text-sm"
          >
            Sign up to see your personalized feed
          </a>
        )}
      </div>
    </div>
  );
}

export default function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Feed</h1>
        <p className="text-muted-foreground mt-1">
          Discover recipes from your families and the community.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg border border-border bg-muted/30 animate-pulse" />
            ))}
          </div>
        }
      >
        <FeedContentWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function FeedContentWrapper({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  return <FeedContent filter={filter} />;
}
