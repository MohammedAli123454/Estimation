"use client";
import { cn } from "@/lib/utils";
import { FC } from "react";

type WidgetCardProps = {
  title?: string;
  selected?: boolean;
  onClick?: () => void;
};

export const WidgetCard: FC<WidgetCardProps> = ({ title, selected, onClick }) => (
  <div
    className={cn(
      "w-full h-20 flex items-center justify-center rounded-3xl cursor-pointer select-none",
      "transition-all duration-200",
      "border-2 border-yellow-200", // softer yellow border
      "shadow-[0_1px_2px_0_rgba(251,191,36,0.07)]", // even softer, barely-there shadow
      selected
        ? "ring-2 ring-blue-400 scale-105"
        : "hover:ring-2 hover:ring-blue-200 hover:scale-[1.025]"
    )}
    onClick={onClick}
    tabIndex={0}
    role="button"
    style={{
      background: "linear-gradient(180deg, #fff7d6 0%, #ffe8b7 100%)" // lighter yellow
    }}
  >
    {title && (
      <span className={cn(
        "text-base font-semibold tracking-wide p-2",
        selected ? "text-blue-700" : "text-yellow-900"
      )}>
        {title}
      </span>
    )}
  </div>
);
