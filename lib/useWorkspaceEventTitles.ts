"use client";

import { useEffect, useState } from "react";
import { fetchWorkspaceEventTitles } from "./workspaceEventLookup";

type LookupStatus = "idle" | "loading" | "ready" | "error";
type LookupResult = { idsKey: string; titles: Record<string, string>; status: "ready" | "error" };

export function useWorkspaceEventTitles(eventIds: string[]) {
  const idsKey = eventIds.join("\u0000");
  const [result, setResult] = useState<LookupResult | null>(null);

  useEffect(() => {
    if (!idsKey) return;
    let active = true;
    void fetchWorkspaceEventTitles(idsKey.split("\u0000"))
      .then((next) => {
        if (!active) return;
        setResult({ idsKey, titles: next, status: "ready" });
      })
      .catch(() => {
        if (active) setResult({ idsKey, titles: {}, status: "error" });
      });
    return () => { active = false; };
  }, [idsKey]);

  const status: LookupStatus = !idsKey ? "idle" : result?.idsKey === idsKey ? result.status : "loading";
  return { titles: status === "ready" ? result!.titles : {}, status };
}
