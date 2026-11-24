// Gera os ícones do app (PWA + favicon) a partir de um SVG.
// Uso: npm run icons
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const NAVY = "#14213D";
const SAFFRON = "#F2A93B";
const STONE = "#E8ECEF";

// Coroa sobre uma barra com anilhas. Desenhada numa caixa de 512x512.
function svg({ rounded, scale }) {
  const mark = `
    <polygon points="112,318 138,172 220,252 256,150 292,252 374,172 400,318" fill="${SAFFRON}" stroke="${SAFFRON}" stroke-width="14" stroke-linejoin="round"/>
    <rect x="112" y="338" width="288" height="34" rx="17" fill="${SAFFRON}"/>
    <rect x="64" y="396" width="384" height="14" rx="7" fill="${STONE}"/>
    <rect x="84" y="364" width="24" height="78" rx="9" fill="${STONE}"/>
    <rect x="404" y="364" width="24" height="78" rx="9" fill="${STONE}"/>
    <rect x="116" y="378" width="16" height="50" rx="7" fill="${STONE}"/>
    <rect x="380" y="378" width="16" height="50" rx="7" fill="${STONE}"/>
  `;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="${NAVY}"/>
    <g transform="translate(256 256) scale(${scale}) translate(-256 -270)">${mark}</g>
  </svg>`;
}

async function render(file, size, opts) {
  await sharp(Buffer.from(svg(opts))).resize(size, size).png().toFile(file);
  console.log("ok", file);
}

await mkdir("public/icons", { recursive: true });
await render("public/icons/icon-192.png", 192, { rounded: true, scale: 1 });
await render("public/icons/icon-512.png", 512, { rounded: true, scale: 1 });
await render("public/icons/maskable-512.png", 512, { rounded: false, scale: 0.72 });
await render("src/app/icon.png", 192, { rounded: true, scale: 1 });
await render("src/app/apple-icon.png", 180, { rounded: false, scale: 0.9 });
