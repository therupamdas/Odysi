"use client";

import { Badge } from "./ui/badge";
import { Compass, ShieldAlert } from "lucide-react";

interface NavbarProps {
  chaosMode: "none" | "malformed" | "timeout";
  setChaosMode: (mode: "none" | "malformed" | "timeout") => void;
}

export function Navbar({ chaosMode, setChaosMode }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-indigo-100 bg-white/85 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 via-violet-600 to-teal-500 text-white shadow-sm shadow-indigo-200">
            <Compass className="h-5 w-5" />
          </div>
          <span className="bg-linear-to-r from-indigo-700 via-violet-600 to-teal-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            odysi
          </span>
          {/* <Badge className="hidden border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700 hover:bg-indigo-100 sm:inline-flex">
            Structured AI Planner
          </Badge> */}
        </div>

        {/* Chaos / Failure Simulation Selector */}
        {/* <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/70 px-2.5 py-1 text-xs">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span className="hidden font-medium text-amber-800 sm:inline">
            Test Resilience:
          </span>
          <select
            value={chaosMode}
            onChange={(e) =>
              setChaosMode(e.target.value as "none" | "malformed" | "timeout")
            }
            className="rounded border border-amber-200 bg-white px-2 py-0.5 font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="none">Normal AI Output</option>
            <option value="malformed">Simulate Bad JSON (422)</option>
            <option value="timeout">Simulate Timeout (504)</option>
          </select>
        </div> */}
      </div>
    </header>
  );
}