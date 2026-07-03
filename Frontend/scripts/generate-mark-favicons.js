const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

(async () => {
  try {
    const srcPath = path.join(__dirname, '..', 'public', 'logoanova.png');
    const outDir = path.join(__dirname, '..', 'public');

    if (!fs.existsSync(srcPath)) {
      console.error('Source logo not found at', srcPath);
      process.exit(1);
    }

    const metadata = await sharp(srcPath).metadata();
    const cropHeight = Math.floor(metadata.height * 0.52);
    const crop = sharp(srcPath).extract({ left: 0, top: 0, width: metadata.width, height: cropHeight }).png();

    const sizes = [16, 32, 48, 180, 512];

    for (const s of sizes) {
      const outPath = path.join(outDir, `favicon-mark-${s}x${s}.png`);
      await crop.clone().resize({ width: s, height: s, fit: 'cover', position: 'centre' }).toFile(outPath);
      console.log('Written', outPath);
    }

    const icoSizes = [16, 32];
    const icons = [];
    for (const s of icoSizes) {
      const buf = await crop.clone().resize({ width: s, height: s, fit: 'cover', position: 'centre' }).toBuffer();
      icons.push(buf);
    }

    const icoPath = path.join(outDir, 'favicon-mark.ico');
    const pngToIcoModule = await import('png-to-ico');
    const writeIco = pngToIcoModule.default || pngToIcoModule;
    const icoBuf = await writeIco(icons);
    fs.writeFileSync(icoPath, icoBuf);
    console.log('Written', icoPath);

    console.log('All mark-based favicons generated successfully.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();