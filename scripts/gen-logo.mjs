import sharp from "sharp";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const svg = `<svg width="512" height="512" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#9333ea"/>
    </linearGradient>
  </defs>
  <path
    clip-rule="evenodd"
    d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
    fill="url(#g)"
    fill-rule="evenodd"
  />
</svg>`;

const outDir = resolve(__dirname, "..", "public");

await sharp(Buffer.from(svg)).resize(512, 512).png().toFile(resolve(outDir, "logo.png"));
console.log("Generated public/logo.png (512x512)");

await sharp(Buffer.from(svg)).resize(192, 192).png().toFile(resolve(outDir, "logo-192.png"));
console.log("Generated public/logo-192.png (192x192)");
