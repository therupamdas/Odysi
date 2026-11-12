
import { z } from "zod";

export const StopSchema = z.object({
  id: z.string().describe("Unique identifier like stop-1, stop-2"),

  timeSlot: z.enum([
    "Morning",
    "Afternoon",
    "Evening",
    "Night",
  ]),

  activity: z.string().describe("Name of the activity or attraction"),

  location: z.string().describe(
    "Specific neighborhood, landmark, or venue"
  ),

  description: z.string().describe(
    "1-2 sentences on what to do or logistical tips"
  ),

  estimatedCost: z.string().nullable().describe(
    "Estimated cost, e.g. Free, $15, ₹500. Use null if unknown."
  ),
});

export const DayPlanSchema = z.object({
  dayNumber: z.number().int(),

  theme: z.string().describe(
    "Theme or focus of this day"
  ),

  stops: z.array(StopSchema),
});

export const ItinerarySchema = z.object({
  tripTitle: z.string().describe(
    "Concise, catchy title for the trip"
  ),

  summary: z.string().describe(
    "A 2-sentence summary of the trip premise"
  ),

  durationDays: z.number().int(),

  days: z.array(DayPlanSchema),
});

export type Stop = z.infer<typeof StopSchema>;
export type DayPlan = z.infer<typeof DayPlanSchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;
