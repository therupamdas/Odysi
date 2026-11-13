"use client";

import { useState } from "react";
import { Itinerary, Stop } from "../lib/schema";
import { ItineraryDay } from "./itenary-day";
import { ItineraryBlocks } from "./itinerary-blocks";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  ChevronDown,
  ChevronUp,
  CalendarDays,
  ChevronsDownUp,
  ChevronsUpDown,
  Wand2,
  Loader2,
  BookmarkCheck,
} from "lucide-react";

const QUICK_REFINEMENTS = [
  "Make it more budget-friendly",
  "Add a local food & cafe focus",
  "Slow down the pace with fewer stops",
  "Add packing checklist & budget chart",
];

interface ItineraryOutputProps {
  itinerary: Itinerary;
  isRefining: boolean;
  onRefine: (refinementInstruction: string) => void;
  onSaveSession: () => void;
  onToggleChecklistItem: (blockIndex: number, itemId: string) => void;
  onMoveStop: (dayNumber: number, index: number, direction: "up" | "down") => void;
  onRemoveStop: (dayNumber: number, index: number) => void;
  onAddStop: (dayNumber: number, newStop: Stop) => void;
}

export function ItineraryOutput({
  itinerary,
  isRefining,
  onRefine,
  onSaveSession,
  onToggleChecklistItem,
  onMoveStop,
  onRemoveStop,
  onAddStop,
}: ItineraryOutputProps) {
  const [isOutputOpen, setIsOutputOpen] = useState(true);
  const [collapsedDays, setCollapsedDays] = useState<Record<number, boolean>>({});
  const [refineInput, setRefineInput] = useState("");

  const toggleDay = (dayNumber: number) => {
    setCollapsedDays((prev) => ({
      ...prev,
      [dayNumber]: !prev[dayNumber],
    }));
  };

  const expandAllDays = () => setCollapsedDays({});
  const collapseAllDays = () => {
    const allCollapsed: Record<number, boolean> = {};
    itinerary.days.forEach((d) => {
      allCollapsed[d.dayNumber] = true;
    });
    setCollapsedDays(allCollapsed);
  };

  const handleRefineSubmit = (customText?: string) => {
    const text = (customText ?? refineInput).trim();
    if (!text || isRefining) return;
    onRefine(text);
    if (!customText) setRefineInput("");
  };

  return (
    <section className="space-y-6 transition-all duration-300">
      {/* Summary Header Card */}
      <div className="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-500 p-0.5 shadow-lg shadow-indigo-100/50 dark:border-slate-700 dark:shadow-none">
        <div className="rounded-[14px] bg-white p-5 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                  {itinerary.tripTitle}
                </h2>
                <Badge className="border-teal-200 bg-teal-100 text-xs font-semibold text-teal-800 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  <CalendarDays className="mr-1 h-3.5 w-3.5" />
                  {itinerary.durationDays}{" "}
                  {itinerary.durationDays === 1 ? "Day" : "Days"}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {itinerary.summary}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSaveSession}
                className="border-teal-200 bg-teal-50/60 text-teal-700 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-300"
              >
                <BookmarkCheck className="mr-1.5 h-4 w-4" />
                Save Session
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOutputOpen((prev) => !prev)}
                className="border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300"
              >
                {isOutputOpen ? (
                  <>
                    <ChevronUp className="mr-1.5 h-4 w-4" />
                    Hide Plan
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1.5 h-4 w-4" />
                    Show Plan ({itinerary.days.length}d)
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Refinement Loop Bar (Edit Existing Itinerary in Place) */}
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleRefineSubmit();
                  }
                }}
                placeholder="Refine this plan (e.g., 'Swap Day 2 afternoon for a sunset cruise' or 'Add a budget chart')..."
                className="flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <Button
                size="sm"
                onClick={() => handleRefineSubmit()}
                disabled={!refineInput.trim() || isRefining}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {isRefining ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Refining...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                    Refine Plan
                  </>
                )}
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Quick refine:
              </span>
              {QUICK_REFINEMENTS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={isRefining}
                  onClick={() => handleRefineSubmit(chip)}
                  className="rounded-full border border-indigo-200/70 bg-white px-2.5 py-0.5 text-[11px] text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-300"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {isOutputOpen && (
            <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={expandAllDays}
                className="h-7 text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-slate-800"
              >
                <ChevronsUpDown className="mr-1 h-3.5 w-3.5" />
                Expand All Days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={collapseAllDays}
                className="h-7 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ChevronsDownUp className="mr-1 h-3.5 w-3.5" />
                Collapse All Days
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Polymorphic AI Blocks (Cards, Charts, Checklists) */}
      {isOutputOpen && itinerary.blocks && itinerary.blocks.length > 0 && (
        <ItineraryBlocks
          blocks={itinerary.blocks}
          onToggleChecklistItem={onToggleChecklistItem}
        />
      )}

      {/* Collapsible Days List */}
      {isOutputOpen && (
        <div className="space-y-4">
          {itinerary.days.map((day) => {
            const isDayCollapsed = !!collapsedDays[day.dayNumber];
            return (
              <div
                key={day.dayNumber}
                className="overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-xs transition-all duration-200 dark:border-slate-800 dark:bg-slate-900"
              >
                <button
                  type="button"
                  onClick={() => toggleDay(day.dayNumber)}
                  className="flex w-full items-center justify-between bg-gradient-to-r from-indigo-50/80 via-violet-50/50 to-teal-50/40 px-4 py-3 text-left transition hover:from-indigo-100/70 dark:from-slate-800/90 dark:via-slate-800/60 dark:to-slate-800/40"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      {day.dayNumber}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {day.theme || `Day ${day.dayNumber} Plan`}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-indigo-200 bg-white text-xs text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-300"
                    >
                      {day.stops.length} {day.stops.length === 1 ? "Stop" : "Stops"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {isDayCollapsed ? (
                      <>
                        <span>Expand</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>Collapse</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    )}
                  </div>
                </button>

                {!isDayCollapsed && (
                  <div className="p-2 sm:p-4">
                    <ItineraryDay
                      day={day}
                      onMoveStop={onMoveStop}
                      onRemoveStop={onRemoveStop}
                      onAddStop={onAddStop}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}