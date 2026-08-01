import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured in .env.local" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const { image, prompt } = await req.json();
    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    // Extract base64 and mime type from data URI
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const mimeType = image.includes(';') ? image.split(';')[0].split(':')[1] : 'image/jpeg';

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        { 
          role: 'user', 
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt + "\nRespond ONLY with a valid JSON object matching the requested structure. Do not wrap in markdown blocks." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsedData = JSON.parse(response.text);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process image' }, { status: 500 });
  }
}
