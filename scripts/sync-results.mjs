// results.json 동기화: v2/results/results.json → v2/webapp/data/results.json
//
// 빌드 / 배포 직전 한 번 실행해 최신 측정 결과를 webapp 번들에 포함시킨다.
//
// Usage:
//   node scripts/sync-results.mjs               # v2/results/results.json 사용
//   node scripts/sync-results.mjs <path>        # 임의 경로 지정

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEBAPP    = resolve(__dirname, "..");
const V2        = resolve(WEBAPP, "..");
const DEFAULT   = join(V2, "results", "results.json");
const TARGET    = join(WEBAPP, "data", "results.json");

const src = process.argv[2] ? resolve(process.argv[2]) : DEFAULT;

if (!existsSync(src)) {
  console.error(`[sync-results] source not found: ${src}`);
  console.error("v2/results/measure.py 를 먼저 실행했는지 확인");
  process.exit(1);
}

mkdirSync(dirname(TARGET), { recursive: true });
copyFileSync(src, TARGET);

const sz = statSync(TARGET).size;
console.log(`[sync-results] copied`);
console.log(`  src: ${src}`);
console.log(`  dst: ${TARGET}`);
console.log(`  size: ${sz} bytes`);
