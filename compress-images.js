const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, 'public', 'images');

// Function to compress a single image
async function compressImage(inputPath, outputPath, quality = 80) {
  try {
    const stats = await sharp(inputPath)
      .webp({ quality })
      .toFile(outputPath);
    
    const originalSize = fs.statSync(inputPath).size;
    const newSize = stats.size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    console.log(`✓ ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
    console.log(`  ${(originalSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (${reduction}% smaller)`);
    
    return { originalSize, newSize, reduction };
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
    return null;
  }
}

async function compressImages() {
  console.log('🖼️  Starting image compression...\n');
  
  const totalStats = { originalTotal: 0, newTotal: 0 };
  
  // Compress Faden images
  console.log('📎 Processing Faden images:');
  for (let i = 1; i <= 6; i++) {
    const inputPath = path.join(imageDir, `Faden${i}.png`);
    const outputPath = path.join(imageDir, `Faden${i}.webp`);
    
    if (fs.existsSync(inputPath)) {
      const result = await compressImage(inputPath, outputPath, 85);
      if (result) {
        totalStats.originalTotal += result.originalSize;
        totalStats.newTotal += result.newSize;
      }
    }
  }
  
  console.log('\n👋 Processing Hand images:');
  
  // Hand image patterns
  const handPatterns = [
    'Linksaussen', 'Linksinnen', 'Rechtsaussen', 'Rechtsinnen'
  ];
  const rotations = ['0', '90', '180', '270'];
  
  for (const pattern of handPatterns) {
    for (const rotation of rotations) {
      const inputPath = path.join(imageDir, `${pattern}_${rotation}.png`);
      const outputPath = path.join(imageDir, `${pattern}_${rotation}.webp`);
      
      if (fs.existsSync(inputPath)) {
        const result = await compressImage(inputPath, outputPath, 85);
        if (result) {
          totalStats.originalTotal += result.originalSize;
          totalStats.newTotal += result.newSize;
        }
      }
    }
  }

  console.log('\n🔄 Processing additional images:');
  
  // Additional specific images
  const additionalImages = ['Hand1.png', 'kreis1.png', 'MathTask.png', 'schach1.png', 'Face2.png'];
  
  for (const imageName of additionalImages) {
    const inputPath = path.join(imageDir, imageName);
    const outputPath = path.join(imageDir, imageName.replace('.png', '.webp'));
    
    if (fs.existsSync(inputPath)) {
      const result = await compressImage(inputPath, outputPath, 85);
      if (result) {
        totalStats.originalTotal += result.originalSize;
        totalStats.newTotal += result.newSize;
      }
    } else {
      console.log(`⚠️  ${imageName} not found, skipping...`);
    }
  }
  
  // Summary
  const totalReduction = ((totalStats.originalTotal - totalStats.newTotal) / totalStats.originalTotal * 100).toFixed(1);
  console.log('\n📊 Compression Summary:');
  console.log(`Total original size: ${(totalStats.originalTotal/1024/1024).toFixed(2)}MB`);
  console.log(`Total compressed size: ${(totalStats.newTotal/1024/1024).toFixed(2)}MB`);
  console.log(`Total savings: ${((totalStats.originalTotal - totalStats.newTotal)/1024/1024).toFixed(2)}MB (${totalReduction}% reduction)`);
  console.log('\n✅ Image compression completed!');
}

compressImages().catch(console.error);