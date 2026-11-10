import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { ItinerarySchema } from "../../../lib/schema"; 


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required and must not be empty." },
        { status: 400 }
      );
    }

    // Call Gemini via AI SDK structured output
    const { object: itinerary } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: ItinerarySchema,
      prompt: `You are an expert travel planner. Create an actionable, realistic day-by-day itinerary based on this description:\n\n"${prompt}"\n\nEnsure every day has 2-4 distinct stops organized sequentially.`,
      temperature: 0.4,
    });

    return NextResponse.json(itinerary, { status: 200 });
  } catch (error: any) {
    console.error("AI Generation failed:", error);

    // Handles the LLM failing the Zod schema
    if (error?.name === "TypeValidationError") {
      return NextResponse.json(
        {
          error: "The AI model returned data that did not match the expected format.",
          details: error.message,
        },
        { status: 422 }
      );
    }

    // Handles rate limits, network disconnects, or invalid API key
    return NextResponse.json(
      {
        error: "Failed to generate itinerary. Please try again.",
        details: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}