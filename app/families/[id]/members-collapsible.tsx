"use client";

import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { InviteForm } from "./invite-form";
import { cn } from "@/lib/utils";

type MemberRow = {
  id: string;
  user_id: string;
  role: string;
  status: string;
  profiles: { name: string | null } | null;
};

interface MembersCollapsibleProps {
  members: MemberRow[];
  isActiveMember: boolean;
  familyId: string;
}

export function MembersCollapsible({
  members,
  isActiveMember,
  familyId,
}: MembersCollapsibleProps) {
  const visibleMembers = members.filter(
    (m) => m.status === "active" || m.status === "invited"
  );

  return (
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 rounded-md py-1 text-left hover:opacity-80 transition-opacity border-b border-border pb-3">
        <h2 className="font-semibold text-xl text-foreground">
          Members ({visibleMembers.length})
        </h2>
        <ChevronDown className={cn(
          "h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200",
          "group-data-[state=open]:rotate-180"
        )} />
      </CollapsibleTrigger>

      <CollapsibleContent className="flex flex-col gap-6 pt-4">
        {visibleMembers.length === 0 ? (
          <p className="text-muted-foreground">No members yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visibleMembers.map((member) => {
              const displayName = member.profiles?.name ?? "Unknown";
              return (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-5 py-3"
                >
                  <span className="text-foreground font-medium">{displayName}</span>
                  <div className="flex items-center gap-2">
                    {member.role === "admin" && (
                      <Badge variant="default" className="text-xs">Admin</Badge>
                    )}
                    {member.status === "invited" && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">Invited</Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {isActiveMember && (
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg text-foreground">Invite Someone</h3>
            <InviteForm familyId={familyId} />
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
