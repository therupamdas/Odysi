# Odysi — Structured AI Trip Planner

Odysi transforms free-form travel descriptions into an interactive, stateful day-by-day itinerary. Rather than streaming unstructured chatbot text, it enforces a strict runtime JSON schema on LLM outputs and hands full state control over to the user for reordering, expanding, deleting, and customizing stops.

## Tech Stack

- **Framework:** Next.js (App Router), React, TypeScript
- **UI & Styling:** Tailwind CSS, shadcn/ui, Lucide Icons, Sonner (toasts)
- **AI & Validation:** Vercel AI SDK (`ai` + `@ai-sdk/groq`), Groq (`openai/gpt-oss-20b`), Zod

---

## Local Setup & Running

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd odysi