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

    // Use sharp to create square transparent canvas and resize
    const metadata = await sharp(srcPath).metadata();
    const maxSide = Math.max(metadata.width || 0, metadata.height || 0, 512);

    const base = sharp(srcPath)
      .resize({ width: maxSide, height: maxSide, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png();

    const sizes = [16, 32, 48, 180, 64, 192, 512];

    // Generate standard favicons (contain with transparent padding)
    for (const s of sizes) {
      const outPath = path.join(outDir, `favicon-${s}x${s}.png`);
      await base.clone().resize(s, s).toFile(outPath);
      console.log('Written', outPath);
    }

    // Generate "zoomed" favicons where logo fills the canvas (fit: cover)
    const zoomBase = sharp(srcPath).resize({ width: 512, height: 512, fit: 'cover', position: 'centre' }).png();
    for (const s of sizes) {
      const outPath = path.join(outDir, `favicon-zoom-${s}x${s}.png`);
      await zoomBase.clone().resize(s, s).toFile(outPath);
      console.log('Written', outPath);
    }

    // Create favicon.ico from 16 and 32 PNG buffers
    const icoSizes = [16, 32];
    const icons = [];
    for (const s of icoSizes) {
      const buf = await base.clone().resize(s, s).toBuffer();
      icons.push(buf);
    }

    const icoPath = path.join(outDir, 'favicon.ico');
    const pngToIcoModule = await import('png-to-ico');
    const writeIco = pngToIcoModule.default || pngToIcoModule;
    const icoBuf = await writeIco(icons);
    fs.writeFileSync(icoPath, icoBuf);
    console.log('Written', icoPath);

    console.log('All favicons generated successfully.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
