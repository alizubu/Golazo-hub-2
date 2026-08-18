'use server';

import { GoogleGenAI } from '@google/genai';

function getApiKeys() {
  // Support both GEMINI_API_KEYS (comma separated) and GEMINI_API_KEY
  const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
  const keys = keysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
  if (keys.length === 0) {
    throw new Error("No Gemini API keys found in environment.");
  }
  return keys;
}

export async function extractMatchStats(formData) {
  try {
    const file = formData.get('image');
    if (!file) {
      throw new Error('No image provided');
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPG, JPEG, or PNG image.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // The image is already compressed client-side, so we just convert directly to base64
    const base64Image = rawBuffer.toString('base64');
    const mimeType = file.type;

    const promptText = `
      Analyze this football match stats screenshot. 
      Extract the data and return it ONLY as a valid JSON object matching the exact schema below.
      
      Requirements:
      - Do not include markdown formatting or backticks like \`\`\`json.
      - Map the stats perfectly to the home and away teams.
      - If a stat is not found, return "-".

      SCHEMA (MUST USE EXACTLY THESE KEYS):
      {
        "home": {
            "possession": "", "shots": "", "shots_on_target": "", 
            "fouls": "", "offsides": "", "corner_kicks": "", "free_kicks": "", "passes": "", 
            "successful_passes": "", "crosses": "", "interceptions": "", "tackles": "", "saves": ""
        },
        "away": {
            "possession": "", "shots": "", "shots_on_target": "", 
            "fouls": "", "offsides": "", "corner_kicks": "", "free_kicks": "", "passes": "", 
            "successful_passes": "", "crosses": "", "interceptions": "", "tackles": "", "saves": ""
        }
      }
    `;

    const apiKeys = getApiKeys();
    let responseText = "";
    let success = false;
    let lastError = null;
    
    // Key Rotation Loop
    for (const key of apiKeys) {
      if (success) break;
      
      const ai = new GoogleGenAI({ apiKey: key });
      
      // Retry Loop for the current key
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: [
              {
                inlineData: {
                  data: base64Image,
                  mimeType: mimeType
                }
              },
              promptText
            ],
            config: {
              responseMimeType: "application/json"
            }
          });
          
          responseText = response.text || "";
          success = true;
          break; // break retry loop on success
        } catch (err) {
          lastError = err;
          // Check for 429 (Rate Limit) or 503 (Unavailable)
          const isOverloaded = err?.status === 429 || err?.status === 503 || err?.code === 503 || err?.message?.includes('503') || err?.message?.includes('429');
          
          if (isOverloaded) {
            console.warn(`Gemini API Overloaded (Key ${key.substring(0,4)}...). Attempt ${attempt + 1}/2.`);
            if (attempt < 1) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2s before retrying same key
            }
          } else {
            // Hard error (e.g., 400 Bad Request) - abort immediately
            throw err;
          }
        }
      }
    }
    
    if (!success) {
      throw lastError || new Error("Failed to extract stats. All API keys exhausted or unavailable.");
    }
    
    // Parse the JSON safely (in case it still wrapped it in markdown)
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    const results = JSON.parse(cleanJson);
    
    return { success: true, data: results };

  } catch (error) {
    console.error("Error extracting stats with Gemini:", error);
    return { success: false, error: error.message };
  }
}

