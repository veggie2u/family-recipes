"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const name = formData.get("name") as string;

  const { error } = await supabase
    .from("profiles")
    .update({ name })
    .eq("id", claims.claims.sub);

  if (error) throw new Error(error.message);

  revalidatePath("/profile");
}
