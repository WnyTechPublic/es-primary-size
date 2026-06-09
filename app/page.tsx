"use client";

import { useEffect, useState } from "react";
import FilterBar, { FilterState } from "@/components/FilterBar";
import Summary from "@/components/Summary";
import CaseTable from "@/components/CaseTable";
import type { ApiResponse } from "@/lib/types";

const EMPTY: FilterState = {
  index_mode: [], _source: [], codec: [], parse_type: [], source_type: [],
};

function buildQuery(f: FilterState): string {
  const sp = new URLSearchParams();
  (Object.keys(f) as (keyof FilterState)[]).forEach((k) => {
    if (f[k].length) sp.set(k, (f[k] as string[]).join(","));
  });
  // baseline 은 별도로 항상 같이 가져옴
  sp.append("role", "case");
  sp.append("role", "baseline");
  return sp.toString();
}

export default function Page() {
  const [filter, setFilter] = useState<FilterState>(EMPTY);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    fetch(`/api/cases?${buildQuery(filter)}`)
      .then((r) => r.json())
      .then((j: ApiResponse) => { if (!cancel) setData(j); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [filter]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">
          ES Storage Matrix <span className="text-white/40">v2</span>
        </h1>
        <p className="text-sm text-white/60">
          Elasticsearch 옵션 조합별 저장 효율 비교.{" "}
          압축률 = primary store / 원본 (source_type 별 ~10 MB).
        </p>
        {data && (
          <p className="text-xs text-white/40">
            측정: <span className="font-mono">{data.meta.measured_at}</span>{" "}
            · ES <span className="font-mono">{data.meta.es_version}</span>
            {loading && <span className="ml-3 text-amber-300">loading…</span>}
          </p>
        )}
      </header>

      <FilterBar value={filter} onChange={setFilter} options={data?.options} />
      <Summary data={data} />
      <CaseTable data={data} />

      <footer className="text-xs text-white/40 pt-4">
        결과는 정적 JSON 번들 (Option A). 갱신은 on-premise 측정 → results.json
        push → Vercel 자동 빌드.
      </footer>
    </main>
  );
}
