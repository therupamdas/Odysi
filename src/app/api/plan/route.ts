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
        { status: 500 }
      );
    }

    const body = await req.json();
    const { prompt, simulateError } = body;

    // 1. Intentional Chaos Mode for Demo & Interview Verification
    if (simulateError === "malformed") {
      return NextResponse.json(
        {
          error: "Model returned malformed JSON that failed Zod schema validation.",
          details: "Expected array for 'days', received string.",
        },
        { status: 422 }
      );
    }

    if (simulateError === "timeout") {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return NextResponse.json(
        { error: "Upstream LLM provider timed out after 15000ms." },
        { status: 504 }
      );
    }

    // 2. Input Validation
    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Please enter a valid trip description." },
        { status: 400 }
      );
    }

    const groq = createGroq({ apiKey });

    // 3. Structured Generation with AbortSignal Propagation
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      output: Output.object({
        schema: ItinerarySchema,
      }),
      prompt: `
        You are an expert travel planner.
        Create an actionable, realistic day-by-day itinerary.

        User request:
        ${prompt}

        Requirements:
        - Organize chronologically by day.
        - Include 2-4 distinct stops per day.
        - Keep stops geographically practical.
        - Assign unique string IDs to each stop (e.g., "day1-stop1").
        - Follow the exact output schema.
      `,
      temperature: 0.3,
      abortSignal: req.signal,
    });

    if (!result.output) {
      return NextResponse.json(
        { error: "Model returned an empty response." },
        { status: 422 }
      );
    }

    // Double-verify output against schema at runtime before sending to client
    const parsed = ItinerarySchema.safeParse(result.output);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "AI output failed runtime schema verification.",
          details: parsed.error.issues[0]?.message,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(parsed.data, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Request aborted" }, { status: 499 });
    }

    console.error("AI Generation Error:", error);
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: "Failed to generate itinerary. Please try again.",
        details: message,
      },
      { status: 500 }
    );
  }
}