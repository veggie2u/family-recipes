"use client";

import { createContext, useContext } from "react";
import type { FeatureFlagMap } from "./feature-flags";

const FeatureFlagContext = createContext<FeatureFlagMap>({});

export function FeatureFlagProvider({
  flags,
  children,
}: {
  flags: FeatureFlagMap;
  children: React.ReactNode;
}) {
  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFlag(key: string): boolean {
  const flags = useContext(FeatureFlagContext);
  return flags[key]?.enabled ?? false;
}

export function useFlagMetadata(key: string): Record<string, unknown> | null {
  const flags = useContext(FeatureFlagContext);
  return flags[key]?.metadata ?? null;
}
