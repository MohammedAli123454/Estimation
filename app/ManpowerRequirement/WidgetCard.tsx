"use client";
import { cn } from "@/lib/utils";
import { FC } from "react";

type WidgetCardProps = {
  title: string;
  selected: boolean;
  onClick: () => void;
};

export const WidgetCard: FC<WidgetCardProps> = ({ title, selected, onClick }) => (
  <div
    className={cn(
      "w-full h-20 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer select-none",
      "shadow-sm",
      selected
        ? "ring-2 ring-blue-400 scale-105"
        : "hover:ring-2 hover:ring-blue-200 hover:scale-[1.025]",
    )}
    onClick={onClick}
    tabIndex={0}
    role="button"
    style={{
      background: selected
        ? "linear-gradient(120deg, #dbeafe 0%, #f0f8ff 100%)"
        : "linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)",
    }}
  >
    <span className={cn(
      "text-base font-semibold tracking-wide p-2",
      selected ? "text-blue-700" : "text-slate-700"
    )}>
      {title}
    </span>
  </div>
);
