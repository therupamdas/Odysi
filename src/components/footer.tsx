"use client";

import { Compass, Heart, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-indigo-100 bg-white/80 backdrop-blur-xs">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-4 px-4 py-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-indigo-600 to-teal-500 text-white">
            <Compass className="h-4 w-4" />
          </div>
          <span className="font-bold tracking-tight text-slate-800">odysi</span>
          <span className="text-xs text-slate-400">
            © 2026 All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}