import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Globe, Lock } from "lucide-react";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { CookbookCard } from "@/components/cookbook-card";
import { cn } from "@/lib/utils";
import { InviteForm } from "./invite-form";
import AddCookbookToFamilyPanel from "@/components/add-cookbook-to-family-panel";
import { RemoveCookbookFromFamilyButton } from "@/components/remove-cookbook-from-family-button";
import AddRecipeToFamilyPanel from "@/components/add-recipe-to-family-panel";
import { RemoveRecipeFromFamilyButton } from "@/components/remove-recipe-from-family-button";
import { RecipeCard } from "@/components/recipe-card";

// ── Types ─────────────────────────────────────────────────────────────────────

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

type RecipeRow = {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_by: string;
  recipe_tags: Array<{ tags: { name: string } | { name: string }[] | null }>;
};

// ── Detail content ─────────────────────────────────────────────────────────────

async function FamilyDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub;

  const { data: family, error } = await supabase
    .from("families")
    .select("id, name, is_public, created_by")
    .eq("id", id)
    .single();

  if (error || !family) notFound();

  const { data: rawMembers } = await supabase
    .from("family_members")
    .select("id, user_id, role, status, profiles(name)")
    .eq("family_id", id)
    .order("joined_at", { ascending: true });

  const members = (rawMembers ?? []) as unknown as MemberRow[];

  const currentMember = members.find(
    (m) => m.user_id === userId && m.status === "active"
  );
  const isOwner = family.created_by === userId;
  const isActiveMember = !!currentMember;

  // Cookbooks already in this family
  const { data: rawFamilyCookbooks } = await supabase
    .from("family_cookbooks")
    .select("cookbooks(id, name, description, is_public, created_by, cookbook_tags(tags(name)), cookbook_recipes(count))")
    .eq("family_id", id)
    .order("added_at", { ascending: false });

  const familyCookbooks = (rawFamilyCookbooks ?? [])
    .map((fc) => fc.cookbooks)
    .flat()
    .filter((c): c is NonNullable<typeof c> => c != null) as unknown as CookbookRow[];

  const cookbookIdsInFamily = familyCookbooks.map((c) => c.id);

  // All cookbooks owned by the current user (for the add panel)
  let allUserCookbooks: { id: string; name: string; description: string | null }[] = [];
  if (isActiveMember) {
    const { data } = await supabase
      .from("cookbooks")
      .select("id, name, description")
      .eq("created_by", userId)
      .order("name");
    allUserCookbooks = data ?? [];
  }

  // Recipes already in this family
  const { data: rawFamilyRecipes } = await supabase
    .from("family_recipes")
    .select("recipes(id, title, description, is_public, created_by, recipe_tags(tags(name)))")
    .eq("family_id", id)
    .order("added_at", { ascending: false });

  const familyRecipes = (rawFamilyRecipes ?? [])
    .map((fr) => fr.recipes)
    .flat()
    .filter((r): r is NonNullable<typeof r> => r != null) as unknown as RecipeRow[];

  const recipeIdsInFamily = familyRecipes.map((r) => r.id);

  // All recipes owned by the current user (for the add panel)
  let allUserRecipes: { id: string; title: string; description: string | null }[] = [];
  if (isActiveMember) {
    const { data } = await supabase
      .from("recipes")
      .select("id, title, description")
      .eq("created_by", userId)
      .order("title");
    allUserRecipes = data ?? [];
  }

  return (
    <article className="flex flex-col gap-8">
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
        {isOwner && (
          <p className="text-sm text-accent/70">Your family</p>
        )}
      </div>

      {/* Members */}
      <section className="flex flex-col gap-4">
        <h2 className="font-semibold text-xl text-foreground">Members</h2>
        {members.length === 0 ? (
          <p className="text-muted-foreground">No members yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {members.map((member) => {
              const displayName =
                member.profiles?.name ?? "Unknown";
              return (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-5 py-3"
                >
                  <span className="text-foreground font-medium">
                    {displayName}
                  </span>
                  <div className="flex items-center gap-2">
                    {member.role === "admin" && (
                      <Badge variant="default" className="text-xs">
                        Admin
                      </Badge>
                    )}
                    {member.status === "invited" && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Invited
                      </Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Invite form — active members only */}
      {isActiveMember && (
        <section className="flex flex-col gap-4">
          <h2 className="font-semibold text-xl text-foreground">
            Invite Someone
          </h2>
          <InviteForm familyId={id} />
        </section>
      )}

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
        {familyCookbooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              No cookbooks in this family yet.
              {isActiveMember ? " Use the button above to add your first cookbook." : ""}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyCookbooks.map((cookbook) => {
              const tags = cookbook.cookbook_tags?.flatMap(
                (ct: { tags: { name: string } | { name: string }[] | null }) =>
                  Array.isArray(ct.tags) ? ct.tags.map((t) => t.name) : ct.tags ? [ct.tags.name] : []
              ) ?? [];
              return (
                <div key={cookbook.id} className="flex flex-col gap-1">
                  <CookbookCard
                    id={cookbook.id}
                    name={cookbook.name}
                    description={cookbook.description}
                    isPublic={cookbook.is_public}
                    isOwner={cookbook.created_by === userId}
                    recipeCount={(cookbook.cookbook_recipes as unknown as { count: number }[] | null)?.[0]?.count ?? 0}
                    tags={tags}
                  />
                  {isActiveMember && (
                    <div className="flex justify-end">
                      <RemoveCookbookFromFamilyButton familyId={id} cookbookId={cookbook.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recipes */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold text-xl text-foreground">Recipes</h2>
          {isActiveMember && (
            <AddRecipeToFamilyPanel
              familyId={id}
              allRecipes={allUserRecipes}
              initialSelectedIds={recipeIdsInFamily}
            />
          )}
        </div>
        {familyRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              No recipes in this family yet.
              {isActiveMember ? " Use the button above to add your first recipe." : ""}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyRecipes.map((recipe) => {
              const tags = recipe.recipe_tags?.flatMap(
                (rt: { tags: { name: string } | { name: string }[] | null }) =>
                  Array.isArray(rt.tags) ? rt.tags.map((t) => t.name) : rt.tags ? [rt.tags.name] : []
              ) ?? [];
              return (
                <div key={recipe.id} className="flex flex-col gap-1">
                  <RecipeCard
                    id={recipe.id}
                    title={recipe.title}
                    description={recipe.description}
                    isPublic={recipe.is_public}
                    isOwner={recipe.created_by === userId}
                    tags={tags}
                  />
                  {isActiveMember && (
                    <div className="flex justify-end">
                      <RemoveRecipeFromFamilyButton familyId={id} recipeId={recipe.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </article>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FamilyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard/families"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to families
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        }
      >
        <FamilyDetailContent params={params} />
      </Suspense>
    </div>
  );
}
