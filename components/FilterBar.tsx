"use client";

import type {
  IndexMode, SourceOpt, Codec, ParseType, SrcType,
} from "@/lib/types";

export interface FilterState {
  index_mode:  IndexMode[];
  _source:     SourceOpt[];
  codec:       Codec[];
  parse_type:  ParseType[];
  source_type: SrcType[];
}

interface Props {
  value: FilterState;
  onChange: (next: FilterState) => void;
  options?: {
    index_mode: IndexMode[];
    _source: SourceOpt[];
    codec: Codec[];
    parse_type: ParseType[];
    source_type: SrcType[];
  };
}

const OPTS = {
  index_mode:  ["tsds_def", "tsds_iof", "logsdb", "standard"] as IndexMode[],
  _source:     ["syn", "str"] as SourceOpt[],
  codec:       ["lz4", "zstd"] as Codec[],
  parse_type:  ["oo", "po", "oap"] as ParseType[],
  source_type: ["firewall", "service", "metric"] as SrcType[],
};

const LABELS: Record<keyof FilterState, string> = {
  index_mode:  "index mode",
  _source:     "_source",
  codec:       "codec",
  parse_type:  "parse",
  source_type: "source",
};

const HELP = [
  {
    title: "index mode",
    items: [
      ["logsdb", "logsdb"],
      ["standard", "standard"],
      ["tsds_def", "timeseries synthetic _id"],
      ["tsds_iof", "timeseries stored _id"],
    ],
  },
  {
    title: "_source",
    items: [
      ["str", "stored"],
      ["syn", "synthetic"],
    ],
  },
  {
    title: "parse",
    items: [
      ["oap", "event.original + parsed data"],
      ["oo", "only event.original"],
      ["po", "only parsed data"],
    ],
  },
];

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export default function FilterBar({ value, onChange, options = OPTS }: Props) {
  const reset = () => onChange({
    index_mode: [], _source: [], codec: [], parse_type: [], source_type: [],
  });

  const anyActive = (Object.keys(options) as (keyof FilterState)[]).some(
    (k) => value[k].length > 0
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-white/60">
          필터
        </h2>
        {anyActive && (
          <button
            onClick={reset}
            className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
          >
            모두 해제
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(23rem,30rem)_1fr] lg:items-start">
        <div className="space-y-3">
          {(Object.keys(options) as (keyof FilterState)[]).map((axis) => (
            <div key={axis} className="flex items-center gap-2 flex-wrap">
              <div className="w-24 text-xs text-white/50">{LABELS[axis]}</div>
              {options[axis].map((opt) => {
                const active = (value[axis] as string[]).includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => onChange({
                      ...value,
                      [axis]: toggle(value[axis] as never[], opt as never),
                    } as FilterState)}
                    className={
                      "px-3 py-1 text-xs rounded-full border " +
                      (active
                        ? "bg-emerald-400/20 border-emerald-400 text-emerald-200"
                        : "border-white/15 hover:bg-white/10 text-white/70")
                    }
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-3 grid gap-4 sm:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 xl:grid-cols-[1.4fr_.75fr_1.5fr]">
          {HELP.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="text-xs font-semibold text-white/55">{group.title}</div>
              <dl className="space-y-1">
                {group.items.map(([term, desc]) => (
                  <div key={term} className="grid grid-cols-[4.75rem_1fr] gap-2 text-xs leading-5">
                    <dt className="font-mono text-emerald-200">{term}</dt>
                    <dd className="text-white/65">{desc}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
