import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function BookmarksContent() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border border-dashed border-border rounded-lg">
      <p className="text-muted-foreground text-lg">
        Your saved recipes will appear here.
      </p>
    </div>
  );
}

export default function BookmarksPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Bookmarks</h1>
        <p className="text-muted-foreground mt-1">Recipes you&apos;ve saved for later.</p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 rounded-lg border border-border bg-muted/30 animate-pulse" />
            ))}
          </div>
        }
      >
        <BookmarksContent />
      </Suspense>
    </div>
  );
}
