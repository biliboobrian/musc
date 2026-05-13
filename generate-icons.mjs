import sharp from 'sharp';
import { writeFileSync } from 'fs';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <rect width="100" height="100" rx="20" fill="#1a1a1a"/>
  <!-- barre centrale -->
  <rect x="30" y="45" width="40" height="10" rx="4" fill="#ff8c00"/>
  <!-- poids gauche haut -->
  <rect x="10" y="32" width="10" height="36" rx="4" fill="#ff8c00"/>
  <!-- poids gauche bas -->
  <rect x="20" y="38" width="10" height="24" rx="3" fill="#ff8c00"/>
  <!-- poids droit haut -->
  <rect x="80" y="32" width="10" height="36" rx="4" fill="#ff8c00"/>
  <!-- poids droit bas -->
  <rect x="70" y="38" width="10" height="24" rx="3" fill="#ff8c00"/>
</svg>`;

for (const size of sizes) {
  const buffer = Buffer.from(svg(size));
  await sharp(buffer).png().toFile(`public/icons/icon-${size}x${size}.png`);
  console.log(`Generated icon-${size}x${size}.png`);
}

// maskable icon (512x512 avec plus de padding)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <rect width="100" height="100" fill="#1a1a1a"/>
  <rect x="30" y="45" width="40" height="10" rx="4" fill="#ff8c00"/>
  <rect x="10" y="32" width="10" height="36" rx="4" fill="#ff8c00"/>
  <rect x="20" y="38" width="10" height="24" rx="3" fill="#ff8c00"/>
  <rect x="80" y="32" width="10" height="36" rx="4" fill="#ff8c00"/>
  <rect x="70" y="38" width="10" height="24" rx="3" fill="#ff8c00"/>
</svg>`;

await sharp(Buffer.from(maskableSvg)).png().toFile('public/icons/icon-maskable-512x512.png');
console.log('Generated icon-maskable-512x512.png');
