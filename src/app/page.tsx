"use client";

import { useRef, useState } from "react";
import { Itinerary, ItinerarySchema, Stop } from "../lib/schema";
import { ItineraryDay } from "../components/itenary-day";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { toast } from "sonner";
import {
  AlertCircle,
  Compass,
  Loader2,
  RotateCcw,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

const SAMPLE_PROMPTS = [
  "2 days in Old Delhi street food and heritage walk",
  "3 days backpacking in Meghalaya waterfalls and living root bridges",
  "Weekend solo trip to Rishikesh for cafes, yoga, and river rafting",
];

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [chaosMode, setChaosMode] = useState<"none" | "malformed" | "timeout">("none");

  // Concurrency & Race Condition Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const handleGenerate = async (overridePrompt?: string) => {
    const activePrompt = (overridePrompt ?? prompt).trim();
    if (!activePrompt) return;

    if (overridePrompt) {
      setPrompt(overridePrompt);
    }

    // 1. Cancel any in-flight request to prevent race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activePrompt,
          simulateError: chaosMode === "none" ? undefined : chaosMode,
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      // Ignore if a newer request was already fired
      if (currentRequestId !== requestIdRef.current) return;

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      // 2. Client-side Zod validation guard
      const parsed = ItinerarySchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Received malformed itinerary structure from server.");
      }

      setItinerary(parsed.data);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Silently ignore intentionally aborted requests
      }

      if (currentRequestId === requestIdRef.current) {
        setError({
          title: "Could not generate itinerary",
          message: err instanceof Error ? err.message : "An unexpected network error occurred.",
        });
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Reorder stops within a day
  const handleMoveStop = (dayNumber: number, index: number, direction: "up" | "down") => {
    setItinerary((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        days: prev.days.map((day) => {
          if (day.dayNumber !== dayNumber) return day;
          const targetIndex = direction === "up" ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= day.stops.length) return day;

          const updatedStops = [...day.stops];
          const [movedItem] = updatedStops.splice(index, 1);
          updatedStops.splice(targetIndex, 0, movedItem);
          return { ...day, stops: updatedStops };
        }),
      };
    });
  };

  // Remove stop with Undo toast
  const handleRemoveStop = (dayNumber: number, index: number) => {
    if (!itinerary) return;
    const targetDay = itinerary.days.find((d) => d.dayNumber === dayNumber);
    const removedStop = targetDay?.stops[index];
    if (!removedStop) return;

    setItinerary((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        days: prev.days.map((day) => {
          if (day.dayNumber !== dayNumber) return day;
          return {
            ...day,
            stops: day.stops.filter((_, idx) => idx !== index),
          };
        }),
      };
    });

    toast(`Removed "${removedStop.activity}"`, {
      description: `Day ${dayNumber} updated`,
      action: {
        label: "Undo",
        onClick: () => {
          setItinerary((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              days: prev.days.map((day) => {
                if (day.dayNumber !== dayNumber) return day;
                const restored = [...day.stops];
                restored.splice(index, 0, removedStop);
                return { ...day, stops: restored };
              }),
            };
          });
        },
      },
    });
  };

  // Insert manual stop into a day
  const handleAddStop = (dayNumber: number, newStop: Stop) => {
    setItinerary((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        days: prev.days.map((day) =>
          day.dayNumber === dayNumber
            ? { ...day, stops: [...day.stops, newStop] }
            : day
        ),
      };
    });
    toast.success(`Added "${newStop.activity}" to Day ${dayNumber}`);
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Compass className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">odysi</span>
            <Badge variant="outline" className="hidden text-xs sm:inline-flex">
              Structured AI Planner
            </Badge>
          </div>

          {/* Chaos / Failure Simulation Selector for Testing Resilience */}
          <div className="flex items-center gap-2 text-xs">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
            <span className="hidden text-slate-500 sm:inline">Test Resilience:</span>
            <select
              value={chaosMode}
              onChange={(e) => setChaosMode(e.target.value as "none" | "malformed" | "timeout")}
              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-medium text-slate-700"
            >
              <option value="none">Normal AI Output</option>
              <option value="malformed">Simulate Bad JSON (422)</option>
              <option value="timeout">Simulate Timeout (504)</option>
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 pt-8">
        {/* Prompt Input Card */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Where are you heading next?
            </h1>
            <p className="text-sm text-slate-600">
              Describe your trip duration, pace, and interests. Edit, reorder, or customize every stop once generated.
            </p>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="space-y-3 pt-4">
              <Textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="e.g., 3 days in Kyoto focusing on early morning temples, matcha cafes, and local izakayas..."
                className="resize-none border-slate-200 text-base focus-visible:ring-slate-900"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Tip: Press <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">Ctrl + Enter</kbd> to generate
                </span>
                <Button
                  onClick={() => handleGenerate()}
                  disabled={!prompt.trim()}
                  className="bg-slate-900 text-white hover:bg-slate-800"
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

          {/* One-Click Example Prompts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Try:</span>
            {SAMPLE_PROMPTS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleGenerate(sample)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                {sample}
              </button>
            ))}
          </div>
        </section>

        {/* Error Banner with Retry */}
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="font-semibold">{error.title}</AlertTitle>
            <AlertDescription className="mt-1 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span>{error.message}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGenerate()}
                className="border-red-300 bg-white text-red-900 hover:bg-red-100"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Retry Request
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading Skeleton State */}
        {isLoading && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
            {[1, 2].map((n) => (
              <Card key={n} className="border-slate-200">
                <CardContent className="space-y-4 pt-6">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !itinerary && !error && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center px-4">
            <Compass className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-base font-semibold text-slate-900">
              No itinerary generated yet
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Enter your destination and travel preferences above, or click one of the example prompts to build an editable day-by-day plan.
            </p>
          </div>
        )}

        {/* Generated Itinerary View */}
        {!isLoading && itinerary && (
          <section className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {itinerary.tripTitle}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {itinerary.durationDays} {itinerary.durationDays === 1 ? "Day" : "Days"}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {itinerary.summary}
              </p>
            </div>

            <div className="space-y-5">
              {itinerary.days.map((day) => (
                <ItineraryDay
                  key={day.dayNumber}
                  day={day}
                  onMoveStop={handleMoveStop}
                  onRemoveStop={handleRemoveStop}
                  onAddStop={handleAddStop}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}