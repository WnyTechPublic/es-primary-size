"use client";

import type { ApiResponse } from "@/lib/types";

interface Props { data: ApiResponse | null; }

const TITLES: Record<string, string> = {
  by_mode:        "index_mode",
  by_parse:       "parse_type",
  by_source:      "_source",
  by_codec:       "codec",
  by_source_type: "source_type",
};

function ratioColor(v: number): string {
  // 작을수록 효율 (green) / 클수록 비효율 (red)
  if (v < 0.5)  return "text-emerald-300";
  if (v < 1.0)  return "text-emerald-200";
  if (v < 1.5)  return "text-amber-200";
  if (v < 2.5)  return "text-orange-300";
  return "text-rose-300";
}

export default function Summary({ data }: Props) {
  if (!data) return null;
  const groups = Object.entries(data.summary).filter(
    ([, v]) => Object.keys(v).length > 0
  );
  if (groups.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h2 className="text-sm font-semibold tracking-wider uppercase text-white/60 mb-3">
        축별 평균 압축률  <span className="text-white/40">(filtered cases={data.count})</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map(([k, buckets]) => (
          <div key={k} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-white/50 mb-2">{TITLES[k]}</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/40">
                  <th className="text-left font-normal">값</th>
                  <th className="text-right font-normal">n</th>
                  <th className="text-right font-normal">avg</th>
                  <th className="text-right font-normal">min</th>
                  <th className="text-right font-normal">max</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(buckets)
                  .sort(([, a], [, b]) => a.avg - b.avg)
                  .map(([key, b]) => (
                    <tr key={key} className="border-t border-white/5">
                      <td className="py-1 font-mono">{key}</td>
                      <td className="text-right tabular-nums text-white/60">{b.n}</td>
                      <td className={`text-right tabular-nums font-semibold ${ratioColor(b.avg)}`}>{b.avg.toFixed(3)}</td>
                      <td className="text-right tabular-nums text-white/60">{b.min.toFixed(3)}</td>
                      <td className="text-right tabular-nums text-white/60">{b.max.toFixed(3)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
