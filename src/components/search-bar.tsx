"use client";

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Loader2, Sparkles, MapPin } from "lucide-react";

const SAMPLE_PROMPTS = [
  "2 days in Old Delhi street food and heritage walk",
  "3 days backpacking in Meghalaya waterfalls and living root bridges",
  "Weekend solo trip to Rishikesh for cafes, yoga, and river rafting",
];

interface SearchBarProps {
  prompt: string;
  setPrompt: (value: string) => void;
  isLoading: boolean;
  onGenerate: (overridePrompt?: string) => void;
}

export function SearchBar({
  prompt,
  setPrompt,
  isLoading,
  onGenerate,
}: SearchBarProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200">
          <MapPin className="h-3.5 w-3.5" />
          AI-Powered Travel Architect
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Where are you{" "}
          <span className="bg-linear-to-r from-indigo-600 via-violet-600 to-teal-500 bg-clip-text text-transparent">
            heading next?
          </span>
        </h1>
        <p className="text-sm text-slate-600">
          Describe your trip duration, pace, and interests. Edit, reorder, or
          customize every stop once generated.
        </p>
      </div>

      <Card className="border-indigo-100 bg-white/90 shadow-md shadow-indigo-100/50 backdrop-blur-xs">
        <CardContent className="space-y-3 pt-4">
          <Textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                onGenerate();
              }
            }}
            placeholder="e.g., 3 days in Kyoto focusing on early morning temples, matcha cafes, and local izakayas..."
            className="resize-none border-indigo-100 bg-slate-50/50 text-base focus-visible:ring-indigo-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Tip: Press{" "}
              <kbd className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 font-mono text-indigo-700">
                Ctrl + Enter
              </kbd>{" "}
              to generate
            </span>
            <Button
              onClick={() => onGenerate()}
              disabled={!prompt.trim() || isLoading}
              className="bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:from-indigo-700 hover:to-violet-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Planning Route...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Itinerary
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* One-Click Colorful Example Prompts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-indigo-900/70">Try:</span>
        {SAMPLE_PROMPTS.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => onGenerate(sample)}
            className="rounded-full border border-indigo-200/80 bg-white px-3 py-1 text-xs font-medium text-indigo-700 shadow-2xs transition hover:border-violet-300 hover:bg-linear-to-r hover:from-indigo-50 hover:to-violet-50"
          >
            {sample}
          </button>
        ))}
      </div>
    </section>
  );
}