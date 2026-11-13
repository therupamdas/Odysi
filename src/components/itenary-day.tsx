"use client";

import { useState } from "react";
import { DayPlan, Stop } from "../lib/schema";
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
  Trash2,
  Wallet,
} from "lucide-react";

interface ItineraryDayProps {
  day: DayPlan;
  onMoveStop: (
    dayNumber: number,
    index: number,
    direction: "up" | "down",
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
  // Track which stop IDs are currently expanded
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state for custom stop
  const [activity, setActivity] = useState("");
  const [location, setLocation] = useState("");
  const [timeSlot, setTimeSlot] = useState<Stop["timeSlot"]>("Afternoon");
  const [description, setDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim() || !location.trim()) return;

    const newStop: Stop = {
      id: `custom-${Date.now()}`,
      timeSlot,
      activity: activity.trim(),
      location: location.trim(),
      description: description.trim() || "Custom added itinerary stop.",
      estimatedCost: estimatedCost.trim() || null,
    };

    onAddStop(day.dayNumber, newStop);
    setActivity("");
    setLocation("");
    setDescription("");
    setEstimatedCost("");
    setIsAddOpen(false);
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-white pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Badge className="bg-slate-900 text-white hover:bg-slate-800">
              Day {day.dayNumber}
            </Badge>
            <CardTitle className="text-lg font-semibold text-slate-900">
              {day.theme}
            </CardTitle>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {day.stops.length} {day.stops.length === 1 ? "stop" : "stops"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        {day.stops.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
            No stops left for Day {day.dayNumber}. Add a custom stop below.
          </div>
        ) : (
          day.stops.map((stop: Stop, index: number) => {
            const isExpanded = !!expandedIds[stop.id];
            return (
              <div
                key={stop.id}
                className="rounded-lg border border-slate-200 bg-white p-3.5 transition-all hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Time badge + Title + Location */}
                  <div
                    onClick={() => toggleExpand(stop.id)}
                    className="flex-1 cursor-pointer select-none space-y-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        {stop.timeSlot}
                      </Badge>
                      <h4 className="font-semibold text-slate-900">
                        {stop.activity}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{stop.location}</span>
                    </div>
                  </div>

                  {/* Right: Reorder, Expand, Delete Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-slate-900"
                      disabled={index === 0}
                      onClick={() => onMoveStop(day.dayNumber, index, "up")}
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-slate-900"
                      disabled={index === day.stops.length - 1}
                      onClick={() => onMoveStop(day.dayNumber, index, "down")}
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-slate-900"
                      onClick={() => toggleExpand(stop.id)}
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
                      className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      onClick={() => onRemoveStop(day.dayNumber, index)}
                      title="Remove stop"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expandable Details Drawer */}
                {isExpanded && (
                  <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600 space-y-2">
                    <p className="leading-relaxed">{stop.description}</p>
                    {stop.estimatedCost && (
                      <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <Wallet className="h-3.5 w-3.5 text-slate-500" />
                        Est. Cost: {stop.estimatedCost}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Add Custom Stop Modal */}
        <div className="pt-1">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger className="inline-flex h-8 w-full items-center justify-center rounded-md border border-dashed border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-xs transition-colors hover:bg-slate-100 hover:text-slate-900">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Custom Stop to Day {day.dayNumber}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Stop to Day {day.dayNumber}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateStop} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-medium text-slate-700">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) =>
                      setTimeSlot(e.target.value as Stop["timeSlot"])
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">
                    Activity Name *
                  </label>
                  <input
                    required
                    placeholder="e.g., Sunset Kayaking"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">
                    Location *
                  </label>
                  <input
                    required
                    placeholder="e.g., Backwater Jetty"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">
                    Estimated Cost
                  </label>
                  <input
                    placeholder="e.g., ₹800 or Free"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">
                    Notes / Tips
                  </label>
                  <Textarea
                    rows={2}
                    placeholder="Any booking tips or things to carry..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 text-sm"
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full">
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
