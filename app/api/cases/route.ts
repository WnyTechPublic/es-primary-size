import { NextRequest, NextResponse } from "next/server";
import { filterAndSummarize } from "@/lib/data";
import type { FilterParams } from "@/lib/types";

// Node runtime (results.json import 정적으로 번들됨)
export const runtime = "nodejs";

function multi<T extends string>(sp: URLSearchParams, key: string): T[] | undefined {
  // ?codec=lz4,zstd  또는  ?codec=lz4&codec=zstd  둘 다 지원
  const raw = sp.getAll(key).flatMap((v) => v.split(","));
  const cleaned = raw.map((v) => v.trim()).filter(Boolean) as T[];
  return cleaned.length ? cleaned : undefined;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const filter: FilterParams = {
    index_mode:  multi(sp, "index_mode"),
    _source:     multi(sp, "_source"),
    codec:       multi(sp, "codec"),
    parse_type:  multi(sp, "parse_type"),
    source_type: multi(sp, "source_type"),
    role:        multi(sp, "role"),
  };
  const data = filterAndSummarize(filter);
  return NextResponse.json(data);
}
