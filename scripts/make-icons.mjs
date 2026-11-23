// Renders the PWA icons from an inline SVG. Run: node scripts/make-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const mark = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${pad ? 0 : 14}" fill="#1f6b4a"/>
  <g transform="translate(32 32) scale(${pad ? 0.7 : 1}) translate(-32 -32)">
    <path d="M18 44 L32 18 L46 44" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="32" cy="37" r="4.5" fill="#e2583e"/>
  </g></svg>`;

mkdirSync("public/icons", { recursive: true });
const out = [
  ["public/icons/icon-192.png", 192, false],
  ["public/icons/icon-512.png", 512, false],
  ["public/icons/icon-maskable-512.png", 512, true],
  ["public/icons/apple-touch-icon.png", 180, true],
  ["src/app/icon.png", 64, false],
];
for (const [file, size, pad] of out) {
  await sharp(Buffer.from(mark(pad))).resize(size, size).png().toFile(file);
}
console.log("icons written");
