import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Globe, Lock } from "lucide-react";
import { Suspense } from "react";
import { BackButton } from "@/components/back-button";
import { FollowButton } from "@/components/follow-button";
import { CookbookCard } from "@/components/cookbook-card";
import { MembersCollapsible } from "./members-collapsible";
import AddCookbookToFamilyPanel from "@/components/add-cookbook-to-family-panel";
import { RemoveCookbookFromFamilyButton } from "@/components/remove-cookbook-from-family-button";
import { cn } from "@/lib/utils";
import { acceptInvitation, declineInvitation } from "@/app/families/actions";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

type MemberRow = {
  id: string;
  user_id: string;
  role: string;
  status: string;
  profiles: { name: string | null } | null;
};

type CookbookRow = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_by: string;
  cookbook_tags: Array<{ tags: { name: string } | { name: string }[] | null }>;
  cookbook_recipes: { count: number }[];
};

async function FamilyDetailContent({
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

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  const [
    { data: rawMembers },
    { count: followerCount },
    { data: userFollowRow },
    { data: rawFamilyCookbooks },
  ] = await Promise.all([
    supabase
      .from("family_members")
      .select("id, user_id, role, status, profiles(name)")
      .eq("family_id", id)
      .order("joined_at", { ascending: true }),
    supabase
      .from("family_followers")
      .select("*", { count: "exact", head: true })
      .eq("family_id", id),
    userId
      ? supabase
          .from("family_followers")
          .select("id")
          .eq("family_id", id)
          .eq("user_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("family_cookbooks")
      .select("cookbooks(id, name, description, is_public, created_by, cookbook_tags(tags(name)), cookbook_recipes(count))")
      .eq("family_id", id)
      .order("added_at", { ascending: false }),
  ]);

  const members = (rawMembers ?? []) as unknown as MemberRow[];
  const currentMember = members.find((m) => m.user_id === userId && m.status === "active");
  const invitedMember = members.find((m) => m.user_id === userId && m.status === "invited");
  const isOwner = family.created_by === userId;
  const isActiveMember = !!currentMember;
  const isInvited = !!invitedMember;
  const isFollowing = !!userFollowRow;

  // Private family: only visible to owner, active members, and invited users (via RLS).
  // If none of the above, RLS already blocked the query and we'd have notFound() above.
  // Extra guard: if private and user has no relationship at all, hide it.
  if (!family.is_public && !isOwner && !isActiveMember && !isInvited && userId === null) {
    notFound();
  }

  const familyCookbooks = (rawFamilyCookbooks ?? [])
    .map((fc) => fc.cookbooks)
    .flat()
    .filter((c): c is NonNullable<typeof c> => c != null) as unknown as CookbookRow[];

  // Hide private cookbooks from unauthenticated visitors
  const visibleCookbooks = userId
    ? familyCookbooks
    : familyCookbooks.filter((c) => c.is_public);
  const hiddenPrivateCount = familyCookbooks.length - visibleCookbooks.length;

  const cookbookIdsInFamily = familyCookbooks.map((c) => c.id);

  let allUserCookbooks: { id: string; name: string; description: string | null }[] = [];
  if (isActiveMember && userId) {
    const { data } = await supabase
      .from("cookbooks")
      .select("id, name, description")
      .eq("created_by", userId)
      .order("name");
    allUserCookbooks = data ?? [];
  }

  return (
    <article className="flex flex-col gap-8">
      {/* Pending invitation banner */}
      {isInvited && invitedMember && (
        <section className="rounded-lg border border-border bg-card px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
            <h2 className="font-semibold text-sm text-foreground">
              You&apos;ve been invited to join this family
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <form action={acceptInvitation.bind(null, invitedMember.id)}>
              <Button type="submit" size="sm">Accept</Button>
            </form>
            <form action={declineInvitation.bind(null, invitedMember.id)}>
              <Button type="submit" variant="outline" size="sm">Decline</Button>
            </form>
          </div>
        </section>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span
            className={cn(
              "self-start flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
              family.is_public
                ? "border border-emerald-600/40 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500/40"
                : "border border-border text-muted-foreground"
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
          {isOwner && (
            <p className="text-sm text-accent/70">Your family</p>
          )}
        </div>

        {/* Follow button — authenticated non-members and non-invited users only */}
        {userId && !isActiveMember && !isInvited && family.is_public && (
          <FollowButton
            type="family"
            targetId={id}
            initialFollowing={isFollowing}
            followerCount={followerCount ?? 0}
            className="shrink-0"
          />
        )}
      </div>

      {/* Members (collapsible, collapsed by default) */}
      <section>
        <MembersCollapsible
          members={members}
          isActiveMember={isActiveMember}
          familyId={id}
          isAuthenticated={userId !== null}
        />
      </section>

      {/* Cookbooks */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold text-xl text-foreground">Cookbooks</h2>
          {isActiveMember && (
            <AddCookbookToFamilyPanel
              familyId={id}
              allCookbooks={allUserCookbooks}
              initialSelectedIds={cookbookIdsInFamily}
            />
          )}
        </div>
        {visibleCookbooks.length === 0 && hiddenPrivateCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              No cookbooks in this family yet.
              {isActiveMember ? " Use the button above to add your first cookbook." : ""}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleCookbooks.map((cookbook) => {
                const tags = cookbook.cookbook_tags?.flatMap(
                  (ct: { tags: { name: string } | { name: string }[] | null }) =>
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
                    recipeCount={(cookbook.cookbook_recipes as unknown as { count: number }[] | null)?.[0]?.count ?? 0}
                    tags={tags}
                    href={`/cookbooks/${cookbook.id}?from=family`}
                    removeSlot={
                      isActiveMember ? (
                        <RemoveCookbookFromFamilyButton familyId={id} cookbookId={cookbook.id} />
                      ) : undefined
                    }
                  />
                );
              })}
            </div>
            {hiddenPrivateCount > 0 && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                {hiddenPrivateCount} private cookbook{hiddenPrivateCount > 1 ? "s" : ""} visible to family members only.
              </p>
            )}
          </>
        )}
      </section>
    </article>
  );
}

export default function FamilyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <BackButton label="← Back to families" className="self-start" />

      <Suspense
        fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-6 bg-muted rounded w-1/4" />
          </div>
        }
      >
        <FamilyDetailContent params={params} />
      </Suspense>
    </div>
  );
}
