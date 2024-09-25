import sharp from "sharp";
import { readdir, mkdir, existsSync, statSync } from "fs";
import { join, relative } from "path";

const inputSize = 16;
const outputSizes = [32, 64, 128, 256, 512, 1024];

// Base directory with 16x images
const baseInputDir = `./png-${inputSize}x/`;
// Base directory to create other sizes
const baseOutputDir = './';

// Function to create directories recursively
const ensureDirExists = (dir) => {
  if (!existsSync(dir)) {
    mkdir(dir, { recursive: true }, (err) => {
      if (err) throw err;
    });
  }
};

// Function to process and scale images
const processFiles = (inputDir) => {
  readdir(inputDir, (err, files) => {
    if (err) throw err;

    files.forEach(file => {
      const inputPath = join(inputDir, file);
      const relativePath = relative(baseInputDir, inputPath); // Get relative path

      if (statSync(inputPath).isDirectory()) {
        // If it's a directory, replicate the subfolder structure
        outputSizes.forEach((outputSize) => {
          const newOutputDir = join(baseOutputDir, `png-${outputSize}x`, relativePath);
          ensureDirExists(newOutputDir); // Ensure subfolder exists
        });
        processFiles(inputPath); // Recurse into subdirectory
      } else {
        // Scale images for each output size
        outputSizes.forEach((outputSize) => {
          const newOutputDir = join(baseOutputDir, `png-${outputSize}x`, relative(baseInputDir, inputDir)); // Get correct output dir
          ensureDirExists(newOutputDir); // Ensure subfolder exists
          const outputFile = join(newOutputDir, file);

          sharp(inputPath)
            .resize({ width: outputSize, height: outputSize, kernel: sharp.kernel.nearest })
            .toFile(outputFile, (err, info) => {
              if (err) {
                console.error(`Error processing ${file} to ${outputSize}x:`, err);
              } else {
                console.log(`Scaled ${file} to ${outputSize}x:`, info);
              }
            });
        });
      }
    });
  });
};

// Create base output directories
outputSizes.forEach((size) => {
  const outputDir = join(baseOutputDir, `png-${size}x`);
  ensureDirExists(outputDir);
});

// Start processing from the base 16x directory
processFiles(baseInputDir);