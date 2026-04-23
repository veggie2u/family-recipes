import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { updateCookbook } from "../../actions";
import { CookbookForm } from "../../cookbook-form";
import { Suspense } from "react";
import { BackButton } from "@/components/back-button";

async function EditCookbookForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;

  const [{ data: cookbook, error }, { data: allTagsData }, { data: cookbookTagsData }] =
    await Promise.all([
      supabase.from("cookbooks").select("*").eq("id", id).eq("created_by", userId).single(),
      supabase.from("tags").select("name").order("name"),
      supabase.from("cookbook_tags").select("tags(name)").eq("cookbook_id", id),
    ]);

  if (error || !cookbook) {
    notFound();
  }

  const allTags = allTagsData?.map((t) => t.name) ?? [];
  const defaultTags = cookbookTagsData?.flatMap((ct) =>
    Array.isArray(ct.tags)
      ? ct.tags.map((t: { name: string }) => t.name)
      : ct.tags
      ? [(ct.tags as { name: string }).name]
      : []
  ) ?? [];

  const updateWithId = updateCookbook.bind(null, id);

  return (
    <CookbookForm
      action={updateWithId}
      allTags={allTags}
      defaultValues={{
        name: cookbook.name,
        description: cookbook.description ?? "",
        is_public: cookbook.is_public,
        tags: defaultTags,
      }}
      submitLabel="Save Changes"
      cancelHref={`/cookbooks/${id}`}
    />
  );
}

export default function EditCookbookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <BackButton label="← Back to cookbook" />
        <h1 className="font-display text-3xl font-bold text-foreground mt-3">
          Edit Cookbook
        </h1>
      </div>
      <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-10 bg-muted rounded" /><div className="h-20 bg-muted rounded" /><div className="h-32 bg-muted rounded" /></div>}>
        <EditCookbookForm params={params} />
      </Suspense>
    </div>
  );
}
