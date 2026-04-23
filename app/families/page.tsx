import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { Users, PlusIcon } from "lucide-react";
import { FamilyCard } from "@/components/family-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  acceptInvitation,
  declineInvitation,
} from "@/app/families/actions";

// ── Pending Invitations (authenticated only) ──────────────────────────────────

async function PendingInvitations({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: invitations } = await supabase
    .from("family_members")
    .select("id, families(id, name)")
    .eq("user_id", userId)
    .eq("status", "invited");

  if (!invitations || invitations.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-semibold text-xl text-foreground">
        Pending Invitations
      </h2>
      <ul className="flex flex-col gap-3">
        {invitations.map((inv) => {
          const family = inv.families as unknown as {
            id: string;
            name: string;
          } | null;
          if (!family) return null;

          const accept = acceptInvitation.bind(null, inv.id);
          const decline = declineInvitation.bind(null, inv.id);

          return (
            <li
              key={inv.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-5 py-4"
            >
              <span className="font-medium text-foreground">{family.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <form action={accept}>
                  <Button type="submit" size="sm">
                    Accept
                  </Button>
                </form>
                <form action={decline}>
                  <Button type="submit" variant="outline" size="sm">
                    Decline
                  </Button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ── Main Content ──────────────────────────────────────────────────────────────

async function FamiliesContent() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const isAuthenticated = !!claimsData?.claims;

  // ── Authenticated: show the user's families ────────────────────────────────
  if (isAuthenticated) {
    const userId = claimsData.claims.sub;

    const { data: memberships, error } = await supabase
      .from("family_members")
      .select("family_id, families(id, name, is_public)")
      .eq("user_id", userId)
      .eq("status", "active");

    if (error) throw new Error(error.message);

    return (
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                My Families
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your family groups.
              </p>
            </div>
            <Link
              href="/families/new"              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <PlusIcon className="w-4 h-4" />
              New Family
            </Link>
          </div>

          {!memberships?.length ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border border-dashed border-border rounded-lg">
              <Users className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">
                You&apos;re not a member of any families yet.
              </p>
              <Button asChild>
                <Link href="/families/new">
                  Create your first family
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberships.map((m) => {
                const family = m.families as unknown as {
                  id: string;
                  name: string;
                  is_public: boolean;
                } | null;
                if (!family) return null;
                return (
                  <FamilyCard
                    key={family.id}
                    id={family.id}
                    name={family.name}
                    isPublic={family.is_public}
                  />
                );
              })}
            </div>
          )}
        </div>

        <Suspense fallback={null}>
          <PendingInvitations userId={userId} />
        </Suspense>
      </div>
    );
  }

  // ── Unauthenticated: public listing ───────────────────────────────────────
  const { data: families, error } = await supabase
    .from("families")
    .select("id, name, is_public")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Families
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse families shared by the community.
        </p>
      </div>

      {!families?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <Users className="w-10 h-10" />
          <p>No families have been shared yet.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {families.map((family) => (
            <li key={family.id}>
              <FamilyCard
                id={family.id}
                name={family.name}
                isPublic={family.is_public}
                href={`/families/${family.id}`}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FamiliesContentSkeleton() {
  return (
    <>
      <div className="h-14 animate-pulse rounded-lg bg-muted/30" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </>
  );
}

export default function FamiliesPage() {
  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<FamiliesContentSkeleton />}>
        <FamiliesContent />
      </Suspense>
    </div>
  );
}
