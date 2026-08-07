'use server';

import sharp from 'sharp';
import Tesseract from 'tesseract.js';

// Base resolution for our coordinate map
const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

// Guesstimated coordinates for a 1920x1080 image
// We will need to calibrate these!
// x (left) and y (top) are the top-left corner of the crop
const STATS_MAP = {
  possession: { home: { left: 630, top: 275, width: 100, height: 35 }, away: { left: 1150, top: 275, width: 100, height: 35 } },
  shots: { home: { left: 630, top: 315, width: 100, height: 35 }, away: { left: 1150, top: 315, width: 100, height: 35 } },
  shots_on_target: { home: { left: 630, top: 355, width: 100, height: 35 }, away: { left: 1150, top: 355, width: 100, height: 35 } },
  fouls: { home: { left: 630, top: 395, width: 100, height: 35 }, away: { left: 1150, top: 395, width: 100, height: 35 } },
  offsides: { home: { left: 630, top: 435, width: 100, height: 35 }, away: { left: 1150, top: 435, width: 100, height: 35 } },
  corner_kicks: { home: { left: 630, top: 475, width: 100, height: 35 }, away: { left: 1150, top: 475, width: 100, height: 35 } },
  free_kicks: { home: { left: 630, top: 515, width: 100, height: 35 }, away: { left: 1150, top: 515, width: 100, height: 35 } },
  passes: { home: { left: 630, top: 555, width: 100, height: 35 }, away: { left: 1150, top: 555, width: 100, height: 35 } },
  successful_passes: { home: { left: 630, top: 595, width: 100, height: 35 }, away: { left: 1150, top: 595, width: 100, height: 35 } },
  crosses: { home: { left: 630, top: 635, width: 100, height: 35 }, away: { left: 1150, top: 635, width: 100, height: 35 } },
  interceptions: { home: { left: 630, top: 675, width: 100, height: 35 }, away: { left: 1150, top: 675, width: 100, height: 35 } },
  tackles: { home: { left: 630, top: 715, width: 100, height: 35 }, away: { left: 1150, top: 715, width: 100, height: 35 } },
  saves: { home: { left: 630, top: 755, width: 100, height: 35 }, away: { left: 1150, top: 755, width: 100, height: 35 } },
};

export async function extractMatchStats(formData) {
  const file = formData.get('image');
  if (!file) {
    throw new Error('No image provided');
  }

  const debugMode = formData.get('debug') === 'true';

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Standardize image to 1920x1080
    const standardizedImage = sharp(buffer).resize(BASE_WIDTH, BASE_HEIGHT, { fit: 'fill' });

    const results = {
      home: {},
      away: {},
      debugImages: []
    };

    // Prepare Tesseract worker
    const worker = await Tesseract.createWorker('eng');
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789%',
    });

    // 2. Loop through coordinate map and extract
    for (const [statName, sides] of Object.entries(STATS_MAP)) {
      for (const side of ['home', 'away']) {
        const coords = sides[side];
        
        // Extract region, convert to grayscale and threshold for better OCR
        const croppedBuffer = await standardizedImage
          .clone()
          .extract({ left: coords.left, top: coords.top, width: coords.width, height: coords.height })
          // Normalizing helps OCR accuracy significantly
          .normalize()
          // Ensure it's grayscale
          .grayscale()
          // Threshold forces pixels to pure black or pure white
          .threshold(180) 
          .toBuffer();

        if (debugMode) {
          results.debugImages.push({
            name: `${statName}_${side}`,
            dataUrl: `data:image/png;base64,${croppedBuffer.toString('base64')}`
          });
        }

        const { data: { text } } = await worker.recognize(croppedBuffer);
        results[side][statName] = text.trim();
      }
    }

    await worker.terminate();
    
    return { success: true, data: results };

  } catch (error) {
    console.error("Error extracting stats:", error);
    return { success: false, error: error.message };
  }
}
