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

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const promptText = `
      Analyze this football match stats screenshot. 
      Extract the data and return it ONLY as a valid JSON object matching the schema.
      
      Requirements:
      - Do not include markdown formatting or backticks like \`\`\`json.
      - Map the stats perfectly to the home and away teams.
      - If a stat is not found, return "-".
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
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                home: {
                    type: Type.OBJECT,
                    properties: {
                        team_name: { type: Type.STRING },
                        score: { type: Type.STRING },
                        possession: { type: Type.STRING },
                        shots: { type: Type.STRING },
                        shots_on_target: { type: Type.STRING },
                        fouls: { type: Type.STRING },
                        offsides: { type: Type.STRING },
                        corner_kicks: { type: Type.STRING },
                        free_kicks: { type: Type.STRING },
                        passes: { type: Type.STRING },
                        successful_passes: { type: Type.STRING },
                        crosses: { type: Type.STRING },
                        interceptions: { type: Type.STRING },
                        tackles: { type: Type.STRING },
                        saves: { type: Type.STRING },
                    }
                },
                away: {
                    type: Type.OBJECT,
                    properties: {
                        team_name: { type: Type.STRING },
                        score: { type: Type.STRING },
                        possession: { type: Type.STRING },
                        shots: { type: Type.STRING },
                        shots_on_target: { type: Type.STRING },
                        fouls: { type: Type.STRING },
                        offsides: { type: Type.STRING },
                        corner_kicks: { type: Type.STRING },
                        free_kicks: { type: Type.STRING },
                        passes: { type: Type.STRING },
                        successful_passes: { type: Type.STRING },
                        crosses: { type: Type.STRING },
                        interceptions: { type: Type.STRING },
                        tackles: { type: Type.STRING },
                        saves: { type: Type.STRING },
                    }
                }
            }
        }
      }
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
