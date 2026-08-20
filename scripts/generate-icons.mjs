import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');
const splashDir = path.join(publicDir, 'splash');

mkdirSync(iconsDir, { recursive: true });
mkdirSync(splashDir, { recursive: true });

const GREEN = '#34C759';
const WHITE = '#FFFFFF';

function baseSvg(size) {
  const pad = size * 0.18;
  const inner = size - pad * 2;
  const cx = size / 2;
  const cy = size / 2;
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#34C759"/>
        <stop offset="1" stop-color="#28A745"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bg)"/>
    <g transform="translate(${cx}, ${cy})">
      <g transform="translate(${-inner / 2}, ${-inner / 2})">
        <path d="M ${inner * 0.12} ${inner * 0.28}
                 L ${inner * 0.22} ${inner * 0.28}
                 L ${inner * 0.34} ${inner * 0.72}
                 L ${inner * 0.82} ${inner * 0.72}
                 L ${inner * 0.92} ${inner * 0.38}
                 L ${inner * 0.28} ${inner * 0.38}"
              fill="none" stroke="${WHITE}" stroke-width="${inner * 0.07}"
              stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="${inner * 0.4}" cy="${inner * 0.88}" r="${inner * 0.06}" fill="${WHITE}"/>
        <circle cx="${inner * 0.76}" cy="${inner * 0.88}" r="${inner * 0.06}" fill="${WHITE}"/>
      </g>
    </g>
  </svg>`;
}

const sizes = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512];

for (const size of sizes) {
  const svg = Buffer.from(baseSvg(size));
  await sharp(svg).png().toFile(path.join(iconsDir, `icon-${size}.png`));
}

// apple-touch-icon (180x180, no transparency, iOS adds its own rounding)
await sharp(Buffer.from(baseSvg(180))).flatten({ background: GREEN }).png().toFile(
  path.join(iconsDir, 'apple-touch-icon.png'),
);

// Maskable icon with more padding (safe zone)
function maskableSvg(size) {
  const inner = size * 0.6;
  const cx = size / 2;
  const cy = size / 2;
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${GREEN}"/>
    <g transform="translate(${cx - inner / 2}, ${cy - inner / 2})">
      <path d="M ${inner * 0.12} ${inner * 0.28}
               L ${inner * 0.22} ${inner * 0.28}
               L ${inner * 0.34} ${inner * 0.72}
               L ${inner * 0.82} ${inner * 0.72}
               L ${inner * 0.92} ${inner * 0.38}
               L ${inner * 0.28} ${inner * 0.38}"
            fill="none" stroke="${WHITE}" stroke-width="${inner * 0.07}"
            stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${inner * 0.4}" cy="${inner * 0.88}" r="${inner * 0.06}" fill="${WHITE}"/>
      <circle cx="${inner * 0.76}" cy="${inner * 0.88}" r="${inner * 0.06}" fill="${WHITE}"/>
    </g>
  </svg>`;
}
await sharp(Buffer.from(maskableSvg(512))).png().toFile(path.join(iconsDir, 'icon-512-maskable.png'));

// Favicon
await sharp(Buffer.from(baseSvg(64))).png().toFile(path.join(publicDir, 'favicon.png'));

// --- Splash screens for common iPhone sizes (portrait) ---
const splashSizes = [
  { name: 'iphone-se', w: 640, h: 1136 },
  { name: 'iphone-8', w: 750, h: 1334 },
  { name: 'iphone-8-plus', w: 1242, h: 2208 },
  { name: 'iphone-x', w: 1125, h: 2436 },
  { name: 'iphone-xr', w: 828, h: 1792 },
  { name: 'iphone-12', w: 1170, h: 2532 },
  { name: 'iphone-12-pro-max', w: 1284, h: 2778 },
  { name: 'iphone-14-pro', w: 1179, h: 2556 },
  { name: 'iphone-14-pro-max', w: 1290, h: 2796 },
  { name: 'iphone-15-pro-max', w: 1290, h: 2796 },
];

function splashSvg(w, h) {
  const iconSize = Math.min(w, h) * 0.28;
  const cx = w / 2;
  const cy = h / 2;
  return `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="#F2F2F7"/>
    <g transform="translate(${cx - iconSize / 2}, ${cy - iconSize / 2})">
      <rect width="${iconSize}" height="${iconSize}" rx="${iconSize * 0.22}" fill="#34C759"/>
      <g transform="translate(${iconSize / 2}, ${iconSize / 2})">
        <g transform="translate(${-iconSize * 0.41 / 2}, ${-iconSize * 0.41 / 2})">
          <path d="M ${iconSize * 0.41 * 0.12} ${iconSize * 0.41 * 0.28}
                   L ${iconSize * 0.41 * 0.22} ${iconSize * 0.41 * 0.28}
                   L ${iconSize * 0.41 * 0.34} ${iconSize * 0.41 * 0.72}
                   L ${iconSize * 0.41 * 0.82} ${iconSize * 0.41 * 0.72}
                   L ${iconSize * 0.41 * 0.92} ${iconSize * 0.41 * 0.38}
                   L ${iconSize * 0.41 * 0.28} ${iconSize * 0.41 * 0.38}"
                fill="none" stroke="#FFFFFF" stroke-width="${iconSize * 0.41 * 0.07}"
                stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>
    </g>
    <text x="${cx}" y="${cy + iconSize * 0.75}" font-family="-apple-system, Helvetica, Arial, sans-serif"
          font-size="${iconSize * 0.22}" font-weight="600" fill="#1C1C1E" text-anchor="middle">Einkaufsliste</text>
  </svg>`;
}

for (const { name, w, h } of splashSizes) {
  await sharp(Buffer.from(splashSvg(w, h))).png().toFile(path.join(splashDir, `${name}.png`));
}

console.log('Icons and splash screens generated.');
