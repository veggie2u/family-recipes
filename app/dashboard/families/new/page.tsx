import { createFamily } from "../actions";
import { FamilyForm } from "../family-form";
import Link from "next/link";
import { Suspense } from "react";
import { BackButton } from "@/components/back-button";

export default function NewFamilyPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <BackButton label="← Back to families" />
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
