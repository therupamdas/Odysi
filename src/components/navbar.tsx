"use client";

import { useState } from "react";
import { SavedSession } from "../lib/schema";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Compass,
  ShieldAlert,
  Moon,
  Sun,
  History,
  Trash2,
  FolderOpen,
} from "lucide-react";

interface NavbarProps {
  chaosMode: "none" | "malformed" | "timeout";
  setChaosMode: (mode: "none" | "malformed" | "timeout") => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  sessions: SavedSession[];
  onLoadSession: (session: SavedSession) => void;
  onDeleteSession: (id: string) => void;
}

export function Navbar({
  chaosMode,
  setChaosMode,
  darkMode,
  setDarkMode,
  sessions,
  onLoadSession,
  onDeleteSession,
}: NavbarProps) {
  const [showSessions, setShowSessions] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-indigo-100 bg-white/85 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/85">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 via-violet-600 to-teal-500 text-white shadow-sm">
            <Compass className="h-5 w-5" />
          </div>
          <span className="bg-linear-to-r from-indigo-600 via-violet-500 to-teal-500 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            odysi
          </span>
          <Badge className="hidden border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 sm:inline-flex">
            Structured AI Planner
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Saved Sessions Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSessions((prev) => !prev)}
              className="h-8 gap-1.5 border-indigo-200 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <History className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Sessions ({sessions.length})</span>
            </Button>

            {showSessions && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-indigo-100 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Saved Trips
                  </span>
                  <button
                    onClick={() => setShowSessions(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
                {sessions.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">
                    No saved sessions yet.
                  </p>
                ) : (
                  <ul className="max-h-60 space-y-1.5 overflow-y-auto">
                    {sessions.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 p-2 text-xs hover:bg-indigo-50/50 dark:border-slate-800 dark:hover:bg-slate-800"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onLoadSession(s);
                            setShowSessions(false);
                          }}
                          className="flex flex-1 flex-col text-left"
                        >
                          <span className="font-semibold text-slate-800 line-clamp-1 dark:text-slate-200">
                            {s.itinerary.tripTitle}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {s.updatedAt} • {s.itinerary.durationDays}d
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSession(s.id)}
                          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                          title="Delete session"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Chaos Selector */}
          {/* <div className="flex items-center gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50/70 px-2 py-1 text-xs dark:border-amber-900/60 dark:bg-amber-950/40">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <select
              value={chaosMode}
              onChange={(e) =>
                setChaosMode(e.target.value as "none" | "malformed" | "timeout")
              }
              className="rounded border border-amber-200 bg-white px-1.5 py-0.5 font-medium text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="none">Normal AI</option>
              <option value="malformed">Bad JSON (422)</option>
              <option value="timeout">Timeout (504)</option>
            </select>
          </div> */}

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Dark Mode (Alt + D)"
            className="h-8 w-8 rounded-lg p-0 text-slate-600 hover:bg-indigo-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}