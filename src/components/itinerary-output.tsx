"use client";

import { useState } from "react";
import { Itinerary, Stop } from "../lib/schema";
import { ItineraryDay } from "./itenary-day";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  ChevronDown,
  ChevronUp,
  CalendarDays,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";

interface ItineraryOutputProps {
  itinerary: Itinerary;
  onMoveStop: (dayNumber: number, index: number, direction: "up" | "down") => void;
  onRemoveStop: (dayNumber: number, index: number) => void;
  onAddStop: (dayNumber: number, newStop: Stop) => void;
}

export function ItineraryOutput({
  itinerary,
  onMoveStop,
  onRemoveStop,
  onAddStop,
}: ItineraryOutputProps) {
  // Overall output collapsible state
  const [isOutputOpen, setIsOutputOpen] = useState(true);

  // Per-day collapsible state (tracks collapsed dayNumbers)
  const [collapsedDays, setCollapsedDays] = useState<Record<number, boolean>>({});

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

  return (
    <section className="space-y-5">
      {/* Summary Header Card with Collapse Toggle */}
      <div className="overflow-hidden rounded-2xl border border-indigo-200 bg-linear-to-r from-indigo-600 via-violet-600 to-teal-600 p-0.5 shadow-lg shadow-indigo-100">
        <div className="rounded-[14px] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {itinerary.tripTitle}
                </h2>
                <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200 border-teal-200 text-xs font-semibold">
                  <CalendarDays className="mr-1 h-3.5 w-3.5" />
                  {itinerary.durationDays}{" "}
                  {itinerary.durationDays === 1 ? "Day" : "Days"}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {itinerary.summary}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOutputOpen((prev) => !prev)}
              className="border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100"
            >
              {isOutputOpen ? (
                <>
                  <ChevronUp className="mr-1.5 h-4 w-4" />
                  Hide Plan
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1.5 h-4 w-4" />
                  Show Plan ({itinerary.days.length} Days)
                </>
              )}
            </Button>
          </div>

          {isOutputOpen && (
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={expandAllDays}
                className="h-7 text-xs text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <ChevronsUpDown className="mr-1 h-3.5 w-3.5" />
                Expand All Days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={collapseAllDays}
                className="h-7 text-xs text-slate-600 hover:bg-slate-100"
              >
                <ChevronsDownUp className="mr-1 h-3.5 w-3.5" />
                Collapse All Days
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Days List */}
      {isOutputOpen && (
        <div className="space-y-4">
          {itinerary.days.map((day) => {
            const isDayCollapsed = !!collapsedDays[day.dayNumber];
            return (
              <div
                key={day.dayNumber}
                className="overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-xs transition"
              >
                {/* Collapsible Day Bar */}
                <button
                  type="button"
                  onClick={() => toggleDay(day.dayNumber)}
                  className="flex w-full items-center justify-between bg-linear-to-r from-indigo-50/80 via-violet-50/50 to-teal-50/40 px-4 py-3 text-left transition hover:from-indigo-100/70"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      {day.dayNumber}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {day.theme || `Day ${day.dayNumber} Plan`}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-indigo-200 bg-white text-xs text-indigo-700"
                    >
                      {day.stops.length} {day.stops.length === 1 ? "Stop" : "Stops"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-indigo-600">
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

                {/* Day Content */}
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