"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export type Interest = { key: string; nameAr: string; emoji: string; category?: string };
let cache: Interest[] | null = null;
let inflight: Promise<Interest[]> | null = null;

export function loadInterests(): Promise<Interest[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) inflight = api<Interest[]>("/interests").then((r) => (cache = (r.success && Array.isArray(r.data) ? r.data : []) as Interest[]));
  return inflight;
}

export function useInterests() {
  const [list, setList] = useState<Interest[]>(cache || []);
  useEffect(() => { loadInterests().then(setList); }, []);
  return list;
}

export function InterestChips({ keys, all }: { keys?: string[]; all: Interest[] }) {
  if (!keys?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {keys.map((k) => {
        const i = all.find((x) => x.key === k || x.nameAr === k);
        return <span key={k} className="h-8 px-3 rounded-full bg-h-chip text-sm font-semibold flex items-center gap-1.5">{i?.emoji} {i?.nameAr || k}</span>;
      })}
    </div>
  );
}
