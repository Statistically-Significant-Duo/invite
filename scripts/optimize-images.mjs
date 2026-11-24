// Rebuild the website's responsive WebP images without modifying the originals.
// Install Sharp separately, then run:
// node scripts/optimize-images.mjs --sharp-module /absolute/path/to/node_modules/sharp
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { stat } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const moduleFlag = process.argv.indexOf('--sharp-module');
const sharpModule = moduleFlag < 0 ? 'sharp' : process.argv[moduleFlag + 1];
if (!sharpModule || sharpModule.startsWith('--')) {
  throw new Error('Supply the installed Sharp module path after --sharp-module.');
}
let sharp;
try {
  sharp = require(sharpModule);
} catch {
  throw new Error('Sharp is required. Install it in a separate tools directory and pass --sharp-module /absolute/path/to/node_modules/sharp.');
}

const assetDirectory = fileURLToPath(new URL('../assets/', import.meta.url));
const sources = [
  { source: 'pa-monogram.png', name: 'monogram', widths: [128, 256] },
  { source: 'pattachitra_wedding_hero.jpg', name: 'hero', widths: [960, 1376] },
  { source: 'couple-illustration.png', name: 'couple', widths: [480, 800] },
  { source: 'bride-illustration.png', name: 'bride', widths: [320, 640] },
  { source: 'groom-illustration.png', name: 'groom', widths: [320, 640] },
  { source: 'Traditional Pattachitra Wedding Ring Ceremony.png', name: 'blessings', widths: [640, 1000] },
  { source: 'Pattachitra Haldi Ceremony Celebration-2.png', name: 'haldi', widths: [640, 1000] },
  { source: 'Odia Pattachitra Wedding Ceremony.png', name: 'wedding', widths: [640, 1200] },
];

const manifest = [];
for (const source of sources) {
  const input = path.join(assetDirectory, source.source);
  const originalBytes = (await stat(input)).size;
  for (const width of source.widths) {
    const file = `${source.name}-${width}.webp`;
    const result = await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 84, effort: 6, smartSubsample: true })
      .toFile(path.join(assetDirectory, file));
    manifest.push({ file, width: result.width, height: result.height, bytes: result.size, original: source.source, originalBytes });
  }
}
console.log(JSON.stringify(manifest, null, 2));
