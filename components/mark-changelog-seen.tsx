"use client";

import { useEffect } from "react";
import { markChangelogSeen } from "@/app/actions/changelog";

export function MarkChangelogSeen() {
  useEffect(() => {
    markChangelogSeen();
  }, []);
  return null;
}
