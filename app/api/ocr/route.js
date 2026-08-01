import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';

export async function POST(req) {
  try {
    const { image, prompt } = await req.json();
    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    // Tesseract can take a base64 string directly
    const { data: { text } } = await Tesseract.recognize(image, 'eng');
    console.log("OCR Extracted Text:\n", text);

    const stats = { home: {}, away: {} };
    const lines = text.split('\n').map(l => l.trim().toLowerCase()).filter(Boolean);

    // Order matters (e.g., 'shots on target' before 'shots')
    const mappings = {
      'possession': 'possession',
      'shots on target': 'shotsOnTarget',
      'shots': 'shots',
      'fouls': 'fouls',
      'offsides': 'offsides',
      'corners': 'corners',
      'free kicks': 'freeKicks',
      'passes': 'passes',
      'successful passes': 'successfulPasses',
      'crosses': 'crosses',
      'interceptions': 'interceptions',
      'tackles': 'tackles',
      'saves': 'saves'
    };

    // Initialize all to 0
    Object.values(mappings).forEach(key => {
      stats.home[key] = 0;
      stats.away[key] = 0;
    });

    for (const line of lines) {
      for (const [key, jsonKey] of Object.entries(mappings)) {
        if (line.includes(key)) {
          // Format 1: "45 Possession 55"
          const match = line.match(/^(\d+)%?\s+.*\s+(\d+)%?$/);
          if (match) {
            stats.home[jsonKey] = parseInt(match[1], 10);
            stats.away[jsonKey] = parseInt(match[2], 10);
          } else {
            // Format 2: "Possession 45 55"
            const numbers = line.match(/\b(\d+)\b/g);
            if (numbers && numbers.length >= 2) {
              stats.home[jsonKey] = parseInt(numbers[0], 10);
              stats.away[jsonKey] = parseInt(numbers[numbers.length - 1], 10);
            }
          }
          break; // Stop checking other mappings for this line
        }
      }
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process image' }, { status: 500 });
  }
}
