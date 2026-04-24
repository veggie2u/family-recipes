import { createClient } from "@/lib/supabase/server";
import { acceptInvitation, declineInvitation } from "@/app/families/actions";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

type InviteRow = {
  id: string;
  families: { id: string; name: string } | null;
};

export async function PendingInvitesBanner() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return null;

  const { data: invitations } = await supabase
    .from("family_members")
    .select("id, families(id, name)")
    .eq("user_id", claimsData.claims.sub)
    .eq("status", "invited");

  const rows = (invitations ?? []) as unknown as InviteRow[];
  const pending = rows.filter((inv) => inv.families != null);

  if (pending.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-card px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-muted-foreground shrink-0" />
        <h2 className="font-semibold text-sm text-foreground">
          Pending Family Invitation{pending.length > 1 ? "s" : ""}
        </h2>
      </div>
      <ul className="flex flex-col gap-2">
        {pending.map((inv) => {
          const accept = acceptInvitation.bind(null, inv.id);
          const decline = declineInvitation.bind(null, inv.id);
          return (
            <li
              key={inv.id}
              className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-4 py-3"
            >
              <span className="text-sm font-medium text-foreground">
                {inv.families!.name}
              </span>
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
