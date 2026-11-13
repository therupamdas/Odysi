"use client";

import { RefObject } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Loader2, Sparkles, MapPin, Keyboard } from "lucide-react";

const SAMPLE_PROMPTS = [
  "2 days in Old Delhi street food and heritage walk",
  "3 days backpacking in Meghalaya waterfalls and living root bridges",
  "Weekend solo trip to Rishikesh for cafes, yoga, and river rafting",
];

interface SearchBarProps {
  prompt: string;
  setPrompt: (value: string) => void;
  isLoading: boolean;
  streamStatus: string | null;
  onGenerate: (overridePrompt?: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}

export function SearchBar({
  prompt,
  setPrompt,
  isLoading,
  streamStatus,
  onGenerate,
  inputRef,
}: SearchBarProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
          <MapPin className="h-3.5 w-3.5" />
          Streaming AI Travel Architect
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Where are you{" "}
          <span className="bg-linear-to-r from-indigo-600 via-violet-500 to-teal-400 bg-clip-text text-transparent">
            heading next?
          </span>
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Describe your trip duration, pace, and interests. Streamed live with
          interactive charts, checklists, and follow-up refinement.
        </p>
      </div>

      <Card className="border-indigo-100 bg-white/90 shadow-md shadow-indigo-100/40 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none">
        <CardContent className="space-y-3 pt-4">
          <Textarea
            ref={inputRef}
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
            className="resize-none border-indigo-100 bg-slate-50/50 text-base focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Keyboard className="h-3.5 w-3.5 text-indigo-500" />
              <span>
                <kbd className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 font-mono text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300">
                  Ctrl+Enter
                </kbd>{" "}
                Run •{" "}
                <kbd className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 font-mono text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300">
                  Ctrl+K
                </kbd>{" "}
                Focus •{" "}
                <kbd className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 font-mono text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300">
                  Alt+D
                </kbd>{" "}
                Theme
              </span>
            </div>

            <Button
              onClick={() => onGenerate()}
              disabled={!prompt.trim() || isLoading}
              className="bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-sm transition-transform active:scale-95 hover:from-indigo-700 hover:to-violet-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {streamStatus || "Streaming Plan..."}
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
        <span className="text-xs font-semibold text-indigo-900/70 dark:text-indigo-300">
          Try:
        </span>
        {SAMPLE_PROMPTS.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => onGenerate(sample)}
            className="rounded-full border border-indigo-200/80 bg-white px-3 py-1 text-xs font-medium text-indigo-700 shadow-2xs transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700"
          >
            {sample}
          </button>
        ))}
      </div>
    </section>
  );
}