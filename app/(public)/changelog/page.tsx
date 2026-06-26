import Link from "next/link";
import { format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { MarkChangelogSeen } from "@/components/mark-changelog-seen";

type ChangelogEntry = {
  version: string;
  release_date: string;
  description: string;
};

type VersionGroup = {
  version: string;
  date: string;
  items: string[];
};

function groupByVersion(entries: ChangelogEntry[]): VersionGroup[] {
  const map = new Map<string, VersionGroup>();
  for (const entry of entries) {
    if (!map.has(entry.version)) {
      map.set(entry.version, { version: entry.version, date: entry.release_date, items: [] });
    }
    map.get(entry.version)!.items.push(entry.description);
  }
  return Array.from(map.values());
}

export default async function ChangelogPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const isRecent = view === "recent";

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  let seenAt: string | null = null;
  if (isRecent && userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("changelog_seen_at")
      .eq("id", userId)
      .single();
    seenAt = profile?.changelog_seen_at ?? null;
  }

  let query = supabase
    .from("changelog")
    .select("version, release_date, description")
    .order("release_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (isRecent && seenAt) {
    query = query.gt("release_date", seenAt.substring(0, 10));
  }

  const { data: entries } = await query;
  const groups = groupByVersion(entries ?? []);

  const hasNoRecent = isRecent && groups.length === 0;

  return (
    <div className="max-w-2xl mx-auto py-4">
      {isRecent && userId && <MarkChangelogSeen />}
      <h1 className="text-3xl font-bold mb-8">
        {isRecent ? "Recent Changes" : "What's New"}
      </h1>

      {hasNoRecent ? (
        <p className="text-muted-foreground">
          No recent changes.{" "}
          <Link href="/changelog" className="underline underline-offset-4 hover:text-foreground transition-colors">
            See all changes →
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <div key={group.version}>
              <div className="flex items-baseline gap-3 mb-3">
                <h2 className="text-lg font-semibold">v{group.version}</h2>
                <span className="text-sm text-muted-foreground">
                  {format(parseISO(group.date), "MMMM d, yyyy")}
                </span>
              </div>
              <ul className="flex flex-col gap-1.5 pl-1">
                {group.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
