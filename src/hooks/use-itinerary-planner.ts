"use client";

import { useEffect, useRef, useState } from "react";
import { Itinerary, ItinerarySchema, SavedSession, Stop } from "../lib/schema";
import { ensureDefaultBlocks } from "../lib/default-blocks";
import { toast } from "sonner";

const STORAGE_KEY = "odysi_saved_sessions_v1";

export function useItineraryPlanner() {
  const [prompt, setPrompt] = useState("");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [chaosMode, setChaosMode] = useState<"none" | "malformed" | "timeout">("none");
  const [sessions, setSessions] = useState<SavedSession[]>([]);

  // Concurrency & Race Condition Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  // Load saved sessions from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSessions(JSON.parse(raw));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const persistSessions = (updated: SavedSession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota errors
    }
  };

  const handleSaveSession = () => {
    if (!itinerary) return;
    const newSession: SavedSession = {
      id: `${Date.now()}`,
      updatedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      prompt,
      itinerary,
    };
    persistSessions([newSession, ...sessions.slice(0, 14)]);
    toast.success("Session saved! Reload anytime from the top bar.");
  };

  const handleLoadSession = (s: SavedSession) => {
    setPrompt(s.prompt);
    setItinerary(s.itinerary);
    setError(null);
    toast.info(`Loaded "${s.itinerary.tripTitle}"`);
  };

  const handleDeleteSession = (id: string) => {
    persistSessions(sessions.filter((s) => s.id !== id));
    toast("Session removed");
  };

  // Core AI Generation & Refinement Request Handler
  const executePlanRequest = async (
    activePrompt: string,
    refinementInstruction?: string
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    if (refinementInstruction) {
      setIsRefining(true);
    } else {
      setIsLoading(true);
      setStreamStatus("Connecting to AI...");
    }
    setError(null);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activePrompt,
          currentItinerary: refinementInstruction ? itinerary : undefined,
          refinementPrompt: refinementInstruction,
          stream: true,
          simulateError: chaosMode === "none" ? undefined : chaosMode,
        }),
        signal: controller.signal,
      });

      if (currentRequestId !== requestIdRef.current) return;

      const contentType = response.headers.get("content-type") || "";

      // 1. Progressive NDJSON Stream Handling
      if (
        response.ok &&
        contentType.includes("application/x-ndjson") &&
        response.body
      ) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line);
            if (event.type === "status") {
              setStreamStatus(event.message);
            } else if (event.type === "partial" && event.itinerary) {
              setItinerary(ensureDefaultBlocks(event.itinerary));
            } else if (event.type === "final") {
              const parsed = ItinerarySchema.safeParse(event.itinerary);
              if (!parsed.success) {
                throw new Error("Received malformed streamed itinerary.");
              }
              setItinerary(ensureDefaultBlocks(parsed.data));
            }
          }
        }
        return;
      }

      // 2. Standard JSON Response Handling
      const data = await response.json();
      if (currentRequestId !== requestIdRef.current) return;

      if (!response.ok) {
        throw new Error(
          data.error || `Server responded with status ${response.status}`
        );
      }

      const normalizedData = {
        ...data,
        blocks: Array.isArray(data.blocks) ? data.blocks : [],
      };

      const parsed = ItinerarySchema.safeParse(normalizedData);
      if (!parsed.success) {
        throw new Error("Received malformed itinerary structure from server.");
      }

      setItinerary(ensureDefaultBlocks(parsed.data));
      if (refinementInstruction) {
        toast.success("Itinerary refined!");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      if (currentRequestId === requestIdRef.current) {
        setError({
          title: refinementInstruction
            ? "Could not refine itinerary"
            : "Could not generate itinerary",
          message:
            err instanceof Error
              ? err.message
              : "An unexpected network error occurred.",
        });
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefining(false);
        setStreamStatus(null);
      }
    }
  };

  const handleGenerate = (overridePrompt?: string) => {
    const activePrompt = (overridePrompt ?? prompt).trim();
    if (!activePrompt) return;
    if (overridePrompt) setPrompt(overridePrompt);
    executePlanRequest(activePrompt);
  };

  const handleRefine = (refinementInstruction: string) => {
    if (!itinerary) return;
    executePlanRequest(prompt || itinerary.tripTitle, refinementInstruction);
  };

  // Interactive Block & Stop Mutations
  const handleToggleChecklistItem = (blockIndex: number, itemId: string) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      const updatedBlocks = prev.blocks.map((block, idx) => {
        if (idx !== blockIndex || block.type !== "checklist") return block;
        return {
          ...block,
          items: block.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      });
      return { ...prev, blocks: updatedBlocks };
    });
  };

  const handleMoveStop = (
    dayNumber: number,
    index: number,
    direction: "up" | "down"
  ) => {
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

  return {
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
  };
}