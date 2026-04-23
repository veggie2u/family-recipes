import { createCookbook } from "../actions";
import { CookbookForm } from "../cookbook-form";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import { BackButton } from "@/components/back-button";

async function NewCookbookForm() {
  const supabase = await createClient();
  const { data: tags } = await supabase
    .from("tags")
    .select("name")
    .order("name");

  const allTags = tags?.map((t) => t.name) ?? [];

  return <CookbookForm action={createCookbook} cancelHref="/dashboard" allTags={allTags} />;
}

export default function NewCookbookPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <BackButton label="← Back to dashboard" />
        <h1 className="font-display text-3xl font-bold text-foreground mt-3">
          New Cookbook
        </h1>
      </div>

      <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-10 bg-muted rounded" /><div className="h-20 bg-muted rounded" /></div>}>
        <NewCookbookForm />
      </Suspense>
    </div>
  );
}
