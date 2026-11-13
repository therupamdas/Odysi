"use client";

import { useRef, useState } from "react";
import { Itinerary, ItinerarySchema, Stop } from "../lib/schema";
import { Navbar } from "../components/navbar";
import { SearchBar } from "../components/search-bar";
import { ItineraryOutput } from "../components/itinerary-output";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { toast } from "sonner";
import { AlertCircle, Compass, RotateCcw } from "lucide-react";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [chaosMode, setChaosMode] = useState<"none" | "malformed" | "timeout">("none");

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const handleGenerate = async (overridePrompt?: string) => {
    const activePrompt = (overridePrompt ?? prompt).trim();
    if (!activePrompt) return;

    if (overridePrompt) {
      setPrompt(overridePrompt);
    }

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

      if (currentRequestId !== requestIdRef.current) return;

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      const parsed = ItinerarySchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Received malformed itinerary structure from server.");
      }

      setItinerary(parsed.data);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
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
    <div className="flex min-h-screen flex-col bg-linear-to-br from-indigo-50/60 via-white to-teal-50/50">
      <Navbar chaosMode={chaosMode} setChaosMode={setChaosMode} />

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 pt-8">
        <SearchBar
          prompt={prompt}
          setPrompt={setPrompt}
          isLoading={isLoading}
          onGenerate={handleGenerate}
        />

        {/* Error Banner with Retry */}
        {error && (
          <Alert variant="destructive" className="border-rose-200 bg-rose-50 text-rose-900">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <AlertTitle className="font-semibold">{error.title}</AlertTitle>
            <AlertDescription className="mt-1 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span>{error.message}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGenerate()}
                className="border-rose-300 bg-white text-rose-900 hover:bg-rose-100"
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
              <Skeleton className="h-8 w-2/3 bg-indigo-100/70" />
              <Skeleton className="h-4 w-full bg-indigo-100/50" />
            </div>
            {[1, 2].map((n) => (
              <Card key={n} className="border-indigo-100">
                <CardContent className="space-y-4 pt-6">
                  <Skeleton className="h-6 w-1/3 bg-indigo-100/70" />
                  <Skeleton className="h-16 w-full rounded-lg bg-indigo-50" />
                  <Skeleton className="h-16 w-full rounded-lg bg-indigo-50" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !itinerary && !error && (
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-white/70 px-4 py-16 text-center shadow-2xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-100 to-teal-100 text-indigo-600">
              <Compass className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              No itinerary generated yet
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Enter your destination and travel preferences above, or click one of
              the colorful sample prompts to build an editable day-by-day plan.
            </p>
          </div>
        )}

        {/* Collapsible Output Component */}
        {!isLoading && itinerary && (
          <ItineraryOutput
            itinerary={itinerary}
            onMoveStop={handleMoveStop}
            onRemoveStop={handleRemoveStop}
            onAddStop={handleAddStop}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}