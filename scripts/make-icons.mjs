// Renders the PWA icons from the brand mark (white ink on #171717). Run: node scripts/make-icons.mjs
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";

const src = readFileSync("src/components/Logo.tsx", "utf8");
const viewBox = src.match(/MARK_VIEWBOX = "([^"]+)"/)[1].split(" ").map(Number);
const paths = JSON.parse(src.match(/MARK_PATHS = (\[.*?\]);/s)[1]);
const [x, y, w, h] = viewBox;

// scale: fraction of the icon the mark fills; round: corner radius for non-maskable icons
const icon = (scale, round) => {
  const s = 512, m = s * scale, off = (s - m) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${round ? 112 : 0}" fill="#171717"/>
  <svg x="${off}" y="${off}" width="${m}" height="${m}" viewBox="${x} ${y} ${w} ${h}">
    ${paths.map((d) => `<path fill="#f7f7f5" d="${d}"/>`).join("")}
  </svg></svg>`;
};

mkdirSync("public/icons", { recursive: true });
const out = [
  ["public/icons/icon-192.png", 192, 0.7, true],
  ["public/icons/icon-512.png", 512, 0.7, true],
  ["public/icons/icon-maskable-512.png", 512, 0.56, false],
  ["public/icons/apple-touch-icon.png", 180, 0.62, false],
  ["src/app/icon.png", 64, 0.78, true],
];
for (const [file, size, scale, round] of out) {
  await sharp(Buffer.from(icon(scale, round))).resize(size, size).png().toFile(file);
}
console.log("icons written");
