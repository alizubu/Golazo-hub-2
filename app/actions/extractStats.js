'use server';

import { GoogleGenAI, Type, Schema } from '@google/genai';

// Initialize the Google Gen AI SDK
// It automatically picks up GEMINI_API_KEY from process.env
const ai = new GoogleGenAI({});

export async function extractMatchStats(formData) {
  const file = formData.get('image');
  if (!file) {
    throw new Error('No image provided');
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Please upload a JPG, JPEG, or PNG image.' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

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

    // Using the Interactions API as requested
    const interaction = await ai.interactions.create({
      model: "gemini-2.5-flash",
      input: [
        { text: promptText },
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        }
      ]
    });

    const responseText = interaction.output_text || interaction.outputText;
    
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
