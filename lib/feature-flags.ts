import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type FeatureFlag = {
  key: string;
  enabled: boolean;
  metadata: Record<string, unknown> | null;
};

export type FeatureFlagMap = Record<string, FeatureFlag>;

export const getFeatureFlags = cache(async (): Promise<FeatureFlagMap> => {
  const env = process.env.FEATURE_FLAGS_ENV ?? "dev";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feature_flags")
    .select("key, enabled, metadata")
    .eq("environment", env);

  if (error || !data) return {};

  return Object.fromEntries(data.map((row) => [row.key, row as FeatureFlag]));
});

export function isFlagEnabled(flags: FeatureFlagMap, key: string): boolean {
  return flags[key]?.enabled ?? false;
}
