import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({}); // Uses GEMINI_API_KEY from .env.local

export async function POST(req: Request) {
  try {
    const { message, imageBase64 } = await req.json();

    let contents;

    if (imageBase64) {
      contents = [
        { text: "Describe this image in clear, structured points:" },
        { image: { data: imageBase64, mimeType: "image/png" } },
      ];
    } else {
      contents = [{ text: `Answer concisely in 1-2 sentences: ${message}` }];
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking for faster responses
        },
      },
    });

    const reply = response?.text || "No reply from API";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json({ reply: "Error: Could not get response." });
  }
}