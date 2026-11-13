"use client";

import { useEffect, useRef, useState } from "react";
import { useItineraryPlanner } from "../hooks/use-itinerary-planner";
import { Navbar } from "../components/navbar";
import { SearchBar } from "../components/search-bar";
import { ItineraryOutput } from "../components/itinerary-output";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { AlertCircle, Compass, RotateCcw } from "lucide-react";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const searchInputRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    prompt,
    setPrompt,
    itinerary,
    isLoading,
    isRefining,
    streamStatus,
    error,
    chaosMode,
    setChaosMode,
    sessions,
    handleGenerate,
    handleRefine,
    handleSaveSession,
    handleLoadSession,
    handleDeleteSession,
    handleToggleChecklistItem,
    handleMoveStop,
    handleRemoveStop,
    handleAddStop,
  } = useItineraryPlanner();

  // Global Keyboard Shortcuts: Ctrl/Cmd+K (focus input) & Alt+D (toggle theme)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setDarkMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen flex-col bg-linear-to-br from-indigo-50/60 via-white to-teal-50/50 text-slate-900 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 dark:text-slate-100">
        <Navbar
          chaosMode={chaosMode}
          setChaosMode={setChaosMode}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          sessions={sessions}
          onLoadSession={handleLoadSession}
          onDeleteSession={handleDeleteSession}
        />

        <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 pt-8">
          <SearchBar
            prompt={prompt}
            setPrompt={setPrompt}
            isLoading={isLoading}
            streamStatus={streamStatus}
            onGenerate={handleGenerate}
            inputRef={searchInputRef}
          />

          {/* Error Banner */}
          {error && (
            <Alert
              variant="destructive"
              className="border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200"
            >
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <AlertTitle className="font-semibold">{error.title}</AlertTitle>
              <AlertDescription className="mt-1 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span>{error.message}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerate()}
                  className="border-rose-300 bg-white text-rose-900 hover:bg-rose-100 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-200"
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Retry Request
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-2/3 bg-indigo-100/70 dark:bg-slate-800" />
                <Skeleton className="h-4 w-full bg-indigo-100/50 dark:bg-slate-800" />
              </div>
              {[1, 2].map((n) => (
                <Card
                  key={n}
                  className="border-indigo-100 dark:border-slate-800 dark:bg-slate-900">
                  <CardContent className="space-y-4 pt-6">
                    <Skeleton className="h-6 w-1/3 bg-indigo-100/70 dark:bg-slate-800" />
                    <Skeleton className="h-16 w-full rounded-lg bg-indigo-50 dark:bg-slate-800/60" />
                    <Skeleton className="h-16 w-full rounded-lg bg-indigo-50 dark:bg-slate-800/60" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !itinerary && !error && (
            <div className="rounded-2xl border border-dashed border-indigo-200 bg-white/70 px-4 py-16 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900/50">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-100 to-teal-100 text-indigo-600 dark:from-indigo-950 dark:to-teal-950 dark:text-indigo-400">
                <Compass className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                No itinerary generated yet
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                Enter your destination above or pick a sample prompt to stream a
                day-by-day plan with budget charts and checklists.
              </p>
            </div>
          )}

          {/* Collapsible Itinerary Output */}
          {!isLoading && itinerary && (
            <ItineraryOutput
              itinerary={itinerary}
              isRefining={isRefining}
              onRefine={handleRefine}
              onSaveSession={handleSaveSession}
              onToggleChecklistItem={handleToggleChecklistItem}
              onMoveStop={handleMoveStop}
              onRemoveStop={handleRemoveStop}
              onAddStop={handleAddStop}
            />
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}