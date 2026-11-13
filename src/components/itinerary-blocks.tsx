"use client";

import { AIBlock } from "../lib/schema";
import { Badge } from "./ui/badge";
import { CheckSquare, Square, BarChart3, Lightbulb } from "lucide-react";

interface ItineraryBlocksProps {
  blocks: AIBlock[];
  onToggleChecklistItem: (blockIndex: number, itemId: string) => void;
}

export function ItineraryBlocks({
  blocks,
  onToggleChecklistItem,
}: ItineraryBlocksProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {blocks.map((block, blockIdx) => {
        if (block.type === "card") {
          return (
            <div
              key={blockIdx}
              className="group flex flex-col justify-between rounded-xl border border-indigo-100 bg-white p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Insight Card
                  </span>
                  {block.badge && (
                    <Badge className="border-indigo-200 bg-indigo-50 text-[11px] text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {block.badge}
                    </Badge>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">
                  {block.title}
                </h4>
                {block.subtitle && (
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {block.subtitle}
                  </p>
                )}
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {block.content ?? ""}
                </p>
              </div>
            </div>
          );
        }

        if (block.type === "chart" && block.data) {
          const chartData = block.data;
          const unit = block.unit ?? "₹";
          const maxVal = Math.max(...chartData.map((d) => d.value), 1);
          const total = chartData.reduce((acc, d) => acc + d.value, 0);

          return (
            <div
              key={blockIdx}
              className="flex flex-col justify-between rounded-xl border border-teal-100 bg-white p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Breakdown Chart
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Total: {unit}
                    {total.toLocaleString()}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">
                  {block.title}
                </h4>

                <div className="space-y-2.5 pt-1">
                  {chartData.map((item, idx) => {
                    const widthPercent = Math.round((item.value / maxVal) * 100);
                    return (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                          <span>{item.label}</span>
                          <span className="font-mono">
                            {unit}
                            {item.value.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-indigo-500 via-violet-500 to-teal-400 transition-all duration-500"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }

        if (block.type === "checklist" && block.items) {
          const checklistItems = block.items;
          const completedCount = checklistItems.filter((i) => i.checked).length;

          return (
            <div
              key={blockIdx}
              className="flex flex-col justify-between rounded-xl border border-violet-100 bg-white p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    <CheckSquare className="h-3.5 w-3.5" />
                    Interactive Checklist
                  </span>
                  <Badge
                    variant="outline"
                    className="border-violet-200 text-[11px] text-violet-700 dark:border-violet-800 dark:text-violet-300"
                  >
                    {completedCount}/{checklistItems.length} Done
                  </Badge>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">
                  {block.title}
                </h4>

                <ul className="space-y-1.5 pt-1">
                  {checklistItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onToggleChecklistItem(blockIdx, item.id)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-xs transition hover:bg-violet-50/70 dark:hover:bg-slate-800"
                      >
                        {item.checked ? (
                          <CheckSquare className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
                        ) : (
                          <Square className="h-4 w-4 shrink-0 text-slate-400" />
                        )}
                        <span
                          className={
                            item.checked
                              ? "text-slate-400 line-through dark:text-slate-500"
                              : "font-medium text-slate-700 dark:text-slate-200"
                          }
                        >
                          {item.text}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}