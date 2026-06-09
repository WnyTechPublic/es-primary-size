"use client";

import { useMemo, useState } from "react";
import FilterBar, { FilterState } from "@/components/FilterBar";
import Summary from "@/components/Summary";
import CaseTable from "@/components/CaseTable";
import { filterAndSummarize } from "@/lib/data";

const EMPTY: FilterState = {
  index_mode: [], _source: [], codec: [], parse_type: [], source_type: [],
};

export default function Page() {
  const [filter, setFilter] = useState<FilterState>(EMPTY);
  const data = useMemo(
    () => filterAndSummarize({ ...filter, role: ["case", "baseline"] }),
    [filter],
  );

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
        <p className="text-xs text-white/40">
          측정: <span className="font-mono">{data.meta.measured_at}</span>{" "}
          · ES <span className="font-mono">{data.meta.es_version}</span>
        </p>
      </header>

      <FilterBar value={filter} onChange={setFilter} options={data.options} />
      <Summary data={data} />
      <CaseTable data={data} />

      <footer className="text-xs text-white/40 pt-4">
        결과는 정적 JSON 번들 (Option A). 갱신은 on-premise 측정 → results.json
        push → GitHub Pages 자동 빌드.
      </footer>
    </main>
  );
}
