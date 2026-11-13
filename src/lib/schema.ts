import { z } from "zod";

// All properties MUST be required primitive or array types for Groq strict json_schema mode.
// Avoid .optional() and .nullable() so the grammar compiler has zero 'anyOf' branches.
export const StopSchema = z.object({
  time: z.string().describe("Time of the stop, e.g., '09:00 AM'"),
  activity: z.string().describe("Name of the activity or place"),
  location: z.string().describe("Neighborhood, address, or landmark"),
  notes: z.string().describe("Helpful tip, duration, or cost note"),
  category: z.string().describe("e.g., Food, Heritage, Nature, Cafe, Adventure"),
});

export const DaySchema = z.object({
  dayNumber: z.number().describe("Sequential day number starting from 1"),
  theme: z.string().describe("Theme or title for the day"),
  stops: z.array(StopSchema),
});

// 100% flat required types: pass "" for unused strings and [] for unused arrays
export const BlockSchema = z.object({
  type: z.enum(["card", "chart", "checklist"]),
  title: z.string().describe("Title of the block"),
  subtitle: z.string().describe("Subtitle if type is 'card', otherwise ''"),
  content: z.string().describe("Body text if type is 'card', otherwise ''"),
  badge: z.string().describe("Short badge label if type is 'card', otherwise ''"),
  unit: z.string().describe("Currency/unit like '₹' if type is 'chart', otherwise ''"),
  data: z
    .array(
      z.object({
        label: z.string(),
        value: z.number(),
      })
    )
    .describe("Chart bars if type is 'chart', otherwise []"),
  items: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        checked: z.boolean(),
      })
    )
    .describe("Checklist items if type is 'checklist', otherwise []"),
});

export const ItinerarySchema = z.object({
  tripTitle: z.string().describe("Catchy title for the trip"),
  durationDays: z.number().describe("Total number of days"),
  summary: z.string().describe("Brief 1-2 sentence overview of the itinerary"),
  days: z.array(DaySchema),
  blocks: z.array(BlockSchema),
});

export type Stop = z.infer<typeof StopSchema>;
export type Day = z.infer<typeof DaySchema>;
export type AIBlock = z.infer<typeof BlockSchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;

export interface SavedSession {
  id: string;
  updatedAt: string;
  prompt: string;
  itinerary: Itinerary;
}