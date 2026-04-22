import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { Users } from "lucide-react";
import { FamilyCard } from "@/components/family-card";

async function FamiliesList() {
  const supabase = await createClient();

  const { data: families, error } = await supabase
    .from("families")
    .select("id, name, is_public")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  if (!families || families.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <Users className="w-10 h-10" />
        <p>No families have been shared yet.</p>
      </div>
    );
  }

  return (
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
  );
}

export default function PublicFamiliesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Families
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse families shared by the community.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        <FamiliesList />
      </Suspense>
    </div>
  );
}
