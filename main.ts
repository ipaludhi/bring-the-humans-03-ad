// bring-the-humans-03 entry (Node 22, standard library only).
//
// The entry is the TikTok video itself: this program's only job is to hand
// the house the video's address. It reads VIDEO.json from the repository
// root and copies it unchanged to /output/VIDEO.json, where the gate reads
// it and the house reads the video's views from TikTok.
//
// The program never deletes or recreates the output directory (the grader
// bind-mounts it read-only for user 65534): it only creates it when it is
// missing and writes into it. Two runs write the same bytes.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const source = join(BOT_DIR, 'VIDEO.json');
const target = join(OUTPUT_DIR, 'VIDEO.json');

// The address must at least look like a TikTok video page; the gate, not
// this program, decides whether the video itself passes.
const raw = readFileSync(source, 'utf8');
const entry = JSON.parse(raw);
if (typeof entry !== 'object' || entry === null || typeof entry.url !== 'string') {
  console.error('VIDEO.json must be an object with a string "url" field');
  process.exit(1);
}
if (!/^https:\/\/(www\.|m\.)?tiktok\.com\//.test(entry.url)) {
  console.error(`VIDEO.json url is not a TikTok address: ${entry.url}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(source, target);

// Read back and confirm the copy is byte-identical to the source and still
// parses as the same entry.
const copied = readFileSync(target, 'utf8');
if (copied !== raw) {
  console.error('VIDEO.json copy differs from the source');
  process.exit(1);
}
const copiedEntry = JSON.parse(copied);
if (copiedEntry.url !== entry.url) {
  console.error('VIDEO.json copy names a different video');
  process.exit(1);
}
