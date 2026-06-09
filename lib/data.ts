// results.json 로드 + 필터링.
// 빌드 시점에 data/results.json 을 import → serverless 함수 메모리에 상수처럼 상주.

import resultsJson from "@/data/results.json";
import type {
  ApiResponse,
  CaseRecord,
  FilterParams,
  ResultsFile,
} from "./types";

const RESULTS = resultsJson as unknown as ResultsFile;

function unique<T extends string>(values: (T | undefined)[]): T[] {
  return Array.from(new Set(values.filter((v): v is T => Boolean(v)))).sort();
}

const OPTIONS = {
  index_mode:  unique(RESULTS.records.map((r) => r.index_mode)),
  _source:     unique(RESULTS.records.map((r) => r._source)),
  codec:       unique(RESULTS.records.map((r) => r.codec)),
  parse_type:  unique(RESULTS.records.map((r) => r.parse_type)),
  source_type: unique(RESULTS.records.map((r) => r.source_type)),
};

function matches(rec: CaseRecord, f: FilterParams): boolean {
  if (f.role        && f.role.length        && !f.role.includes(rec.role))               return false;
  if (f.source_type && f.source_type.length && !f.source_type.includes(rec.source_type)) return false;
  if (f.index_mode  && f.index_mode.length  && (!rec.index_mode || !f.index_mode.includes(rec.index_mode)))   return false;
  if (f._source     && f._source.length     && (!rec._source    || !f._source.includes(rec._source)))         return false;
  if (f.codec       && f.codec.length       && (!rec.codec      || !f.codec.includes(rec.codec)))             return false;
  if (f.parse_type  && f.parse_type.length  && (!rec.parse_type || !f.parse_type.includes(rec.parse_type)))   return false;
  return true;
}

type Bucket = { n: number; avg: number; min: number; max: number };

function summarize<K extends string>(
  recs: CaseRecord[],
  keyFn: (r: CaseRecord) => K | undefined,
): Record<string, Bucket> {
  const groups: Record<string, number[]> = {};
  for (const r of recs) {
    const k = keyFn(r);
    if (!k) continue;
    if (typeof r.compression_ratio !== "number") continue;
    (groups[k] ??= []).push(r.compression_ratio);
  }
  const out: Record<string, Bucket> = {};
  for (const [k, arr] of Object.entries(groups)) {
    if (arr.length === 0) continue;
    const sum = arr.reduce((a, b) => a + b, 0);
    out[k] = {
      n: arr.length,
      avg: round(sum / arr.length, 4),
      min: round(Math.min(...arr), 4),
      max: round(Math.max(...arr), 4),
    };
  }
  return out;
}

function round(x: number, digits: number): number {
  const p = Math.pow(10, digits);
  return Math.round(x * p) / p;
}

export function filterAndSummarize(filter: FilterParams): ApiResponse {
  const matched = RESULTS.records.filter((r) => matches(r, filter));
  // 요약은 case 만 (baseline 제외)
  const cases = matched.filter((r) => r.role === "case");
  return {
    meta: RESULTS.meta,
    count: matched.length,
    records: matched,
    options: OPTIONS,
    summary: {
      by_mode:        summarize(cases, (r) => r.index_mode),
      by_parse:       summarize(cases, (r) => r.parse_type),
      by_source:      summarize(cases, (r) => r._source),
      by_codec:       summarize(cases, (r) => r.codec),
      by_source_type: summarize(cases, (r) => r.source_type),
    },
  };
}

export function getMeta() {
  return RESULTS.meta;
}
