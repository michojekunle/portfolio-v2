/**
 * Downloads the large, static binaries the free in-browser voice needs
 * (Piper phonemizer + ONNX Runtime WASM, ~32 MB) into public/vendor/piper so
 * they are served from this site instead of a third-party CDN at runtime.
 *
 * The small JS glue is committed in the repo. These files are pinned to exact
 * npm versions and verified by SHA-256: a mismatch fails the build rather than
 * serving something unexpected. Skipped when the files are already present.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "vendor", "piper");

const FILES = [
  {
    name: "piper_phonemize.wasm",
    url: "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm",
    sha256: "b777cd107a91d2bcc6a1ea46f2c26a662a7407394fe84589198aeaa83dd7a9d6",
  },
  {
    name: "piper_phonemize.data",
    url: "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
    sha256: "29f1025eb23a5b5c192cd14a6efbce4509402ff265405072ee6f7d1a09b78f8c",
  },
  {
    name: "ort/ort-wasm-simd-threaded.wasm",
    url: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/ort-wasm-simd-threaded.wasm",
    sha256: "d1ab1b94b16a65b29d710d0b587b29e7bed336827577623913479b8afe8113e6",
  },
  {
    name: "ort/ort-wasm-simd-threaded.mjs",
    url: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/ort-wasm-simd-threaded.mjs",
    sha256: "0a1e718d99c41b22c21f2520ff4f9e883a6b5533856e398d21816ee8eb8185d3",
  },
];

const sha = (buffer) => createHash("sha256").update(buffer).digest("hex");

async function isValid(file) {
  try {
    await access(join(root, file.name));
    return sha(await readFile(join(root, file.name))) === file.sha256;
  } catch {
    return false;
  }
}

let downloaded = 0;
for (const file of FILES) {
  if (await isValid(file)) continue;
  console.log(`[vendor-piper] downloading ${file.name}`);
  const response = await fetch(file.url);
  if (!response.ok) throw new Error(`[vendor-piper] ${file.url} returned HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (sha(buffer) !== file.sha256) throw new Error(`[vendor-piper] checksum mismatch for ${file.name}; refusing to use it`);
  await mkdir(dirname(join(root, file.name)), { recursive: true });
  await writeFile(join(root, file.name), buffer);
  downloaded += 1;
}
console.log(downloaded ? `[vendor-piper] ${downloaded} file(s) downloaded` : "[vendor-piper] up to date");
