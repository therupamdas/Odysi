"use client";

import { useState } from "react";
import { Day, Stop } from "../lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";

interface ItineraryDayProps {
  day: Day;
  onMoveStop: (
    dayNumber: number,
    index: number,
    direction: "up" | "down"
  ) => void;
  onRemoveStop: (dayNumber: number, index: number) => void;
  onAddStop: (dayNumber: number, newStop: Stop) => void;
}

export function ItineraryDay({
  day,
  onMoveStop,
  onRemoveStop,
  onAddStop,
}: ItineraryDayProps) {
  // Track which stop keys are currently expanded
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state for custom stop (matches StopSchema: id, time, activity, location, notes, category)
  const [time, setTime] = useState("02:00 PM");
  const [activity, setActivity] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Sightseeing");
  const [notes, setNotes] = useState("");

  const toggleExpand = (key: string) => {
    setExpandedIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreateStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim() || !location.trim()) return;

    const newStop: Stop = {
      id: `custom-${day.dayNumber}-${Date.now()}`,
      time: time.trim() || "Afternoon",
      activity: activity.trim(),
      location: location.trim(),
      notes: notes.trim() || "Custom added itinerary stop.",
      category: category.trim() || "Custom",
    };

    onAddStop(day.dayNumber, newStop);
    setTime("02:00 PM");
    setActivity("");
    setLocation("");
    setCategory("Sightseeing");
    setNotes("");
    setIsAddOpen(false);
  };

  return (
    <Card className="border-indigo-100/80 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 bg-white pb-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Badge className="bg-indigo-600 text-white hover:bg-indigo-700">
              Day {day.dayNumber}
            </Badge>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {day.theme}
            </CardTitle>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {day.stops.length} {day.stops.length === 1 ? "stop" : "stops"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        {day.stops.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No stops left for Day {day.dayNumber}. Add a custom stop below.
          </div>
        ) : (
          day.stops.map((stop: Stop, index: number) => {
            // Guaranteed unique composite key so React never throws a duplicate key warning
            const stopKey = `${day.dayNumber}-${stop.id || "stop"}-${index}`;
            const isExpanded = !!expandedIds[stopKey];

            return (
              <div
                key={stopKey}
                className="rounded-lg border border-slate-200 bg-white p-3.5 transition-all hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-indigo-700"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Time badge + Category + Activity + Location */}
                  <div
                    onClick={() => toggleExpand(stopKey)}
                    className="flex-1 cursor-pointer select-none space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-indigo-50 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        {stop.time}
                      </Badge>
                      {stop.category && (
                        <Badge
                          variant="outline"
                          className="border-teal-200 bg-teal-50/70 text-[11px] font-medium text-teal-700 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
                        >
                          <Tag className="mr-1 h-2.5 w-2.5" />
                          {stop.category}
                        </Badge>
                      )}
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {stop.activity}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
                      <span>{stop.location}</span>
                    </div>
                  </div>

                  {/* Right: Reorder, Expand, Delete Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      disabled={index === 0}
                      onClick={() => onMoveStop(day.dayNumber, index, "up")}
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      disabled={index === day.stops.length - 1}
                      onClick={() => onMoveStop(day.dayNumber, index, "down")}
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      onClick={() => toggleExpand(stopKey)}
                      title={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                      onClick={() => onRemoveStop(day.dayNumber, index)}
                      title="Remove stop"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expandable Details Drawer */}
                {isExpanded && (
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                    <p className="leading-relaxed">
                      {stop.notes || "No additional notes for this stop."}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Add Custom Stop Modal */}
        <div className="pt-1">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger className="inline-flex h-8 w-full items-center justify-center rounded-md border border-dashed border-indigo-200 bg-white px-3 text-xs font-medium text-indigo-700 shadow-2xs transition-colors hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Custom Stop to Day {day.dayNumber}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md dark:border-slate-800 dark:bg-slate-900">
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  Add Stop to Day {day.dayNumber}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateStop} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Time *
                    </label>
                    <input
                      required
                      placeholder="e.g., 10:30 AM"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="Food">Food</option>
                      <option value="Heritage">Heritage</option>
                      <option value="Nature">Nature</option>
                      <option value="Cafe">Cafe</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Sightseeing">Sightseeing</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Activity Name *
                  </label>
                  <input
                    required
                    placeholder="e.g., Sunset Kayaking"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Location *
                  </label>
                  <input
                    required
                    placeholder="e.g., Backwater Jetty"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Notes / Tips / Est. Cost
                  </label>
                  <Textarea
                    rows={2}
                    placeholder="Any booking tips, duration, or estimated cost..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Insert Stop
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}