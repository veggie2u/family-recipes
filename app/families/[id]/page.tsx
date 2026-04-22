import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Globe, Lock, Users, BookOpen } from "lucide-react";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

async function FamilyPublicContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: family, error } = await supabase
    .from("families")
    .select("id, name, is_public, created_by")
    .eq("id", id)
    .single();

  if (error || !family) notFound();

  const [{ count: memberCount }, { count: cookbookCount }, { data: claimsData }] =
    await Promise.all([
      supabase
        .from("family_members")
        .select("*", { count: "exact", head: true })
        .eq("family_id", id)
        .eq("status", "active"),
      supabase
        .from("family_cookbooks")
        .select("*", { count: "exact", head: true })
        .eq("family_id", id),
      supabase.auth.getClaims(),
    ]);

  const userId = claimsData?.claims?.sub;

  let isActiveMember = false;
  if (userId) {
    const { data: membership } = await supabase
      .from("family_members")
      .select("id")
      .eq("family_id", id)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    isActiveMember = !!membership;
  }

  return (
    <article className="flex flex-col gap-8 max-w-2xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <span
          className={cn(
            "self-start flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
            family.is_public
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-muted text-muted-foreground"
          )}
        >
          {family.is_public ? (
            <>
              <Globe className="w-3 h-3" /> Public
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" /> Private
            </>
          )}
        </span>
        <h1 className="font-display text-3xl font-bold text-foreground">
          {family.name}
        </h1>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-sm">
            {memberCount ?? 0} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm">
            {cookbookCount ?? 0} {cookbookCount === 1 ? "cookbook" : "cookbooks"}
          </span>
        </div>
      </div>

      {/* Manage link for active members */}
      {isActiveMember && (
        <Link
          href={`/dashboard/families/${id}`}
          className="self-start inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          Manage family
        </Link>
      )}
    </article>
  );
}

export default function PublicFamilyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/families"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        ← Back to families
      </Link>

      <Suspense
        fallback={
          <div className="animate-pulse space-y-4 max-w-2xl">
            <div className="h-8 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-6 bg-muted rounded w-1/4" />
          </div>
        }
      >
        <FamilyPublicContent params={params} />
      </Suspense>
    </div>
  );
}
