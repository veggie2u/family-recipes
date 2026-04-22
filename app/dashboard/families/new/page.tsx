import { createFamily } from "../actions";
import { FamilyForm } from "../family-form";
import Link from "next/link";
import { Suspense } from "react";

export default function NewFamilyPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link
          href="/dashboard/families"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to families
        </Link>
        <h1 className="font-display text-3xl font-bold text-foreground mt-3">
          New Family
        </h1>
      </div>

      <Suspense
        fallback={
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-muted rounded" />
            <div className="h-6 bg-muted rounded w-1/2" />
          </div>
        }
      >
        <FamilyForm action={createFamily} cancelHref="/dashboard/families" />
      </Suspense>
    </div>
  );
}
