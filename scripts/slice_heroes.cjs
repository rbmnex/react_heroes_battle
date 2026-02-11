const Jimp = require('jimp');
const path = require('path');

(async () => {
  try {
    const srcPath = path.join(__dirname, '..', 'src', 'assets', 'models', 'heroes_panel.png');
    const img = await Jimp.read(srcPath);
    const w = img.bitmap.width;
    const h = img.bitmap.height;
    const halfW = Math.floor(w / 2);
    const halfH = Math.floor(h / 2);
    const destDir = path.dirname(srcPath);

    const crops = [
      { x: 0, y: 0, name: 'heroes_panel_1.png' }, // top-left
      { x: halfW, y: 0, name: 'heroes_panel_2.png' }, // top-right
      { x: 0, y: halfH, name: 'heroes_panel_3.png' }, // bottom-left
      { x: halfW, y: halfH, name: 'heroes_panel_4.png' } // bottom-right
    ];

    for (const c of crops) {
      const clone = img.clone();
      clone.crop(c.x, c.y, halfW, halfH);
      const outPath = path.join(destDir, c.name);
      await clone.writeAsync(outPath);
      console.log('Wrote', outPath);
    }

    console.log('Done slicing heroes_panel.png into 4 images.');
  } catch (err) {
    console.error('Error slicing image:', err);
    process.exit(1);
  }
})();
