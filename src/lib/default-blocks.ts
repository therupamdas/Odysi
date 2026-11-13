import { Itinerary } from "./schema";

export function ensureDefaultBlocks(data: Itinerary): Itinerary {
  if (data.blocks && data.blocks.length > 0) return data;

  return {
    ...data,
    blocks: [
      {
        type: "chart",
        title: "Estimated Daily Budget Breakdown",
        subtitle: "",
        content: "",
        badge: "",
        unit: "₹",
        data: [
          { label: "Stay & Lodging", value: 3200 * data.durationDays },
          { label: "Food & Cafes", value: 1500 * data.durationDays },
          { label: "Local Transport", value: 900 * data.durationDays },
          { label: "Tickets & Activities", value: 1100 * data.durationDays },
        ],
        items: [],
      },
      {
        type: "checklist",
        title: "Pre-Trip Essentials",
        subtitle: "",
        content: "",
        badge: "",
        unit: "",
        data: [],
        items: [
          { id: "c1", text: "Download offline maps for all stops", checked: false },
          { id: "c2", text: "Carry cash for local street vendors", checked: false },
          { id: "c3", text: "Book early morning entry tickets", checked: true },
        ],
      },
      {
        type: "card",
        title: "Best Pacing Strategy",
        subtitle: "AI Route Optimizer",
        content:
          "Start outdoor heritage or nature stops before 8:30 AM to beat crowds and midday heat, reserving indoor cafes for 1–3 PM.",
        badge: "Pro Tip",
        unit: "",
        data: [],
        items: [],
      },
    ],
  };
}