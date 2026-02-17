const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '..', 'public', 'images');
const outputDir = path.join(__dirname, '..', 'public', 'images', 'optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function compressImages() {
  // Get all Bild*.png files
  const files = fs.readdirSync(inputDir).filter(file => 
    file.startsWith('Bild') && file.endsWith('.png')
  );

  console.log(`Compressing ${files.length} images...`);

  let totalOriginalSize = 0;
  let totalCompressedSize = 0;

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    const webpPath = path.join(outputDir, file.replace('.png', '.webp'));

    try {
      // Get original size
      const originalStats = fs.statSync(inputPath);
      totalOriginalSize += originalStats.size;

      // Compress PNG (reduce quality and resize if too large)
      await sharp(inputPath)
        .resize(400, 400, { 
          fit: 'cover',
          withoutEnlargement: true 
        })
        .png({ 
          quality: 80,
          compressionLevel: 9 
        })
        .toFile(outputPath);

      // Create WebP version (even better compression)
      await sharp(inputPath)
        .resize(400, 400, { 
          fit: 'cover',
          withoutEnlargement: true 
        })
        .webp({ 
          quality: 85 
        })
        .toFile(webpPath);

      // Get compressed sizes
      const compressedStats = fs.statSync(outputPath);
      const webpStats = fs.statSync(webpPath);
      totalCompressedSize += compressedStats.size;

      const reduction = Math.round(((originalStats.size - compressedStats.size) / originalStats.size) * 100);
      const webpReduction = Math.round(((originalStats.size - webpStats.size) / originalStats.size) * 100);

      console.log(`${file}: ${Math.round(originalStats.size/1024)}KB → ${Math.round(compressedStats.size/1024)}KB (${reduction}% reduction) | WebP: ${Math.round(webpStats.size/1024)}KB (${webpReduction}% reduction)`);

    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  const totalReduction = Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100);
  console.log(`\nTotal: ${Math.round(totalOriginalSize/1024/1024)}MB → ${Math.round(totalCompressedSize/1024/1024)}MB (${totalReduction}% reduction)`);
  console.log('Compression complete! Optimized images saved to public/images/optimized/');
  console.log('\nNext steps:');
  console.log('1. Test the optimized images');
  console.log('2. Replace original images if satisfied');
  console.log('3. Update components to use WebP with PNG fallback');
}

compressImages().catch(console.error);