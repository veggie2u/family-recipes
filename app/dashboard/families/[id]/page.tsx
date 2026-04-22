import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Globe, Lock } from "lucide-react";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InviteForm } from "./invite-form";

// ── Types ─────────────────────────────────────────────────────────────────────

type MemberRow = {
  id: string;
  user_id: string;
  role: string;
  status: string;
  profiles: { name: string | null } | null;
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
    <div className="max-w-2xl">
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
