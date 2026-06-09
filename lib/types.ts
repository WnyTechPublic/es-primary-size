// v2 결과 데이터 타입 정의 (../../results/results.json 구조와 일치)

export type IndexMode = "tsds_def" | "tsds_iof" | "logsdb" | "standard";
export type SourceOpt = "syn" | "str";
export type Codec     = "lz4" | "zstd";
export type ParseType = "oo" | "po" | "oap";
export type SrcType   = string;
export type Role      = "baseline" | "case";

export interface CaseRecord {
  label: string;
  datastream: string;
  source_type: SrcType;
  role: Role;
  // case 전용 필드
  index_mode?: IndexMode;
  _source?: SourceOpt;
  codec?: Codec;
  parse_type?: ParseType;
  // 공통 측정
  docs: number;
  raw_bytes: number;
  primary_bytes: number;
  total_bytes: number;
  compression_ratio: number | null;
  backing_indices: string[];
  disk_usage?: Record<string, number>;
}

export interface ResultsMeta {
  measured_at: string;
  es_version: string;
  raw_size_per_source_bytes: Record<SrcType, number>;
  total_targets: number;
  detailed: boolean;
}

export interface ResultsFile {
  meta: ResultsMeta;
  records: CaseRecord[];
}

export interface FilterParams {
  index_mode?: IndexMode[];
  _source?: SourceOpt[];
  codec?: Codec[];
  parse_type?: ParseType[];
  source_type?: SrcType[];
  role?: Role[];
}

export interface ApiResponse {
  meta: ResultsMeta;
  count: number;
  records: CaseRecord[];
  options: {
    index_mode: IndexMode[];
    _source: SourceOpt[];
    codec: Codec[];
    parse_type: ParseType[];
    source_type: SrcType[];
  };
  summary: {
    by_mode:        Record<string, { n: number; avg: number; min: number; max: number }>;
    by_parse:       Record<string, { n: number; avg: number; min: number; max: number }>;
    by_source:      Record<string, { n: number; avg: number; min: number; max: number }>;
    by_codec:       Record<string, { n: number; avg: number; min: number; max: number }>;
    by_source_type: Record<string, { n: number; avg: number; min: number; max: number }>;
  };
}
