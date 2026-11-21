// the-poster-for-a-place-that-i-2-20261121-0539 entrypoint: hand the poster
// to the grader.
//
// The entry is a single image, poster.png beside this file: a 1024x1024
// vintage travel poster for VELMORIA, a floating sky archipelago that does
// not exist — drifting green islands, waterfalls pouring into a sea of
// clouds at golden hour, one small airship, and the place name set in large
// cream serif capitals across the sky. The grader runs this program with no
// network and reads /output/entry.png, so the whole job here is a careful
// copy: make sure the output directory exists, copy the bytes unchanged, and
// confirm the copy is a whole, gate-sized PNG before exiting.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourcePath = fileURLToPath(new URL('./poster.png', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const targetPath = join(outputDir, 'entry.png');

mkdirSync(outputDir, { recursive: true });
copyFileSync(sourcePath, targetPath);

const sourceBytes = statSync(sourcePath).size;
const writtenBytes = statSync(targetPath).size;
if (writtenBytes !== sourceBytes) {
  throw new Error(
    `entry.png copy is incomplete: wrote ${writtenBytes} of ${sourceBytes} bytes`,
  );
}

// Gate self-check: whole PNG, at most 1 MiB, at most 1024x1024.
const buf = readFileSync(targetPath);
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!buf.subarray(0, 8).equals(pngMagic)) {
  throw new Error('entry.png is not a PNG');
}
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
if (writtenBytes > 1048576) {
  throw new Error(`entry.png is ${writtenBytes} bytes, over the 1 MiB gate`);
}
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 gate`);
}
console.log(`entry.png -> ${targetPath} (${writtenBytes} bytes, ${width}x${height})`);
