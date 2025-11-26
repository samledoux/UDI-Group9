// Script to generate PWA icons from SVG
// This script requires sharp package: npm install --save-dev sharp

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSizes = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
];

const inputSvg = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  if (!fs.existsSync(inputSvg)) {
    console.error('Error: icon.svg not found in public directory');
    process.exit(1);
  }

  for (const { size, name } of iconSizes) {
    try {
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, name));
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`Error generating ${name}:`, error);
    }
  }
  
  console.log('Icon generation complete!');
}

generateIcons().catch(console.error);

