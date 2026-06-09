"use client";

import { useState, useMemo } from "react";
import type { ApiResponse, CaseRecord } from "@/lib/types";

interface Props { data: ApiResponse | null; }

type SortKey =
  | "label" | "index_mode" | "_source" | "codec" | "parse_type"
  | "source_type" | "docs" | "primary_bytes" | "compression_ratio";

const cols: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "label",             label: "case" },
  { key: "index_mode",        label: "mode" },
  { key: "_source",           label: "_src" },
  { key: "codec",             label: "codec" },
  { key: "parse_type",        label: "parse" },
  { key: "source_type",       label: "type" },
  { key: "docs",              label: "docs",          align: "right" },
  { key: "primary_bytes",     label: "pri bytes",     align: "right" },
  { key: "compression_ratio", label: "ratio",         align: "right" },
];

function ratioBg(v: number | null): string {
  if (v == null) return "";
  if (v < 0.5)  return "bg-emerald-500/20";
  if (v < 1.0)  return "bg-emerald-500/10";
  if (v < 1.5)  return "bg-amber-500/10";
  if (v < 2.5)  return "bg-orange-500/15";
  return "bg-rose-500/15";
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(2)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

export default function CaseTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("compression_ratio");
  const [asc, setAsc] = useState(true);

  const rows = useMemo<CaseRecord[]>(() => {
    if (!data) return [];
    const arr = [...data.records];
    arr.sort((a, b) => {
      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return asc ? av - bv : bv - av;
      }
      return asc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [data, sortKey, asc]);

  if (!data) return null;

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setAsc(!asc);
    else { setSortKey(k); setAsc(true); }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 overflow-x-auto">
      <h2 className="text-sm font-semibold tracking-wider uppercase text-white/60 mb-3">
        케이스 ({rows.length}) <span className="text-white/40 ml-1 text-xs normal-case">— 컬럼 클릭해 정렬</span>
      </h2>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-white/50 border-b border-white/10">
            {cols.map((c) => (
              <th
                key={c.key}
                onClick={() => toggleSort(c.key)}
                className={
                  "py-2 px-2 cursor-pointer select-none font-normal " +
                  (c.align === "right" ? "text-right" : "text-left")
                }
              >
                {c.label}{sortKey === c.key ? (asc ? " ▲" : " ▼") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-1.5 px-2 font-mono text-white/80">
                {r.label}
                {r.role === "baseline" && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-200 text-[10px] align-middle">
                    baseline
                  </span>
                )}
              </td>
              <td className="py-1.5 px-2">{r.index_mode ?? "—"}</td>
              <td className="py-1.5 px-2">{r._source ?? "—"}</td>
              <td className="py-1.5 px-2">{r.codec ?? "—"}</td>
              <td className="py-1.5 px-2">{r.parse_type ?? "—"}</td>
              <td className="py-1.5 px-2">{r.source_type}</td>
              <td className="py-1.5 px-2 text-right tabular-nums">{r.docs.toLocaleString()}</td>
              <td className="py-1.5 px-2 text-right tabular-nums">{fmtBytes(r.primary_bytes)}</td>
              <td className={"py-1.5 px-2 text-right tabular-nums font-semibold " + ratioBg(r.compression_ratio)}>
                {r.compression_ratio != null ? r.compression_ratio.toFixed(3) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
