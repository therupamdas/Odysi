import { createGroq } from "@ai-sdk/groq";
import { generateText, Output } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { ItinerarySchema } from "../../../lib/schema";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing from environment variables." },
        { status: 500 },
      );
    }

    const body = await req.json();
    const prompt = body?.prompt;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "A valid prompt is required." },
        { status: 400 },
      );
    }

    const groq = createGroq({ apiKey });

    const result = await generateText({
      model: groq("openai/gpt-oss-120b"),

      output: Output.object({
        schema: ItinerarySchema,
      }),
      prompt: `
        You are an expert travel planner.
        Create an actionable and realistic day-by-day itinerary.

        User request:
        ${prompt}

        Requirements:
        - Organize the itinerary by day.
        - Include 2-4 distinct stops per day.
        - Keep stops geographically practical and chronological.
        - Include heritage, food, and cultural experiences when relevant.
        - Follow the exact output schema.
      `,
      temperature: 0.3,
    });

    if (!result.output) {
      return NextResponse.json(
        { error: "Groq returned an empty itinerary." },
        { status: 422 },
      );
    }

    return NextResponse.json(result.output, { status: 200 });
  } catch (error: unknown) {
    console.error("AI Generation Error:", error);

    const message = error instanceof Error ? error.message : String(error);

    if (
      message.includes("TypeValidationError") ||
      message.includes("validation")
    ) {
      return NextResponse.json(
        {
          error:
            "The AI model returned data that did not match the expected schema.",
          details: message,
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate itinerary.",
        details: message,
      },
      { status: 500 },
    );
  }
}
