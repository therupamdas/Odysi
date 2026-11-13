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
    const { prompt, currentItinerary, refinementPrompt, simulateError } = body;

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

    // Build prompt for either initial generation or follow-up refinement
    const fullPrompt =
      refinementPrompt && currentItinerary
        ? `
        You are an expert travel planner.
        Update the existing itinerary based on the user's refinement instruction.

        Original trip request:
        ${prompt}

        Current Itinerary JSON:
        ${JSON.stringify(currentItinerary)}

        Refinement instruction:
        ${refinementPrompt}

        Requirements:
        - Modify the existing itinerary to satisfy the refinement instruction.
        - Keep unaffected days and stops intact unless the instruction asks to change them.
        - Include 3 blocks in the "blocks" array (1 "chart", 1 "checklist", 1 "card").
        - For unused string fields in a block, pass "". For unused array fields in a block, pass [].
      `
        : `
        You are an expert travel planner.
        Create an actionable, realistic day-by-day itinerary.

        User request:
        ${prompt}

        Requirements:
        - Organize chronologically by day.
        - Include 2-4 distinct stops per day.
        - Keep stops geographically practical.
        - Include 3 helpful blocks in the "blocks" array:
          1. One "chart" block (e.g., Estimated Budget Breakdown with "unit": "₹", populated "data" array, "items": [], "subtitle": "", "content": "", "badge": "").
          2. One "checklist" block (e.g., Pre-Trip Essentials with populated "items" array, "data": [], "subtitle": "", "content": "", "badge": "", "unit": "").
          3. One "card" block (e.g., Local Pro Tip with populated "subtitle", "content", "badge", and "data": [], "items": [], "unit": "").
        - Follow the exact output schema.
      `;

    // 3. Structured Generation with AbortSignal Propagation
    const result = await generateText({
      model: groq("openai/gpt-oss-20b"),
      maxOutputTokens: 4096,
      output: Output.object({
        schema: ItinerarySchema,
      }),
      prompt: fullPrompt,
      temperature: 0.2,
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