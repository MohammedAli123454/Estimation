"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FC } from "react";

type WidgetCardProps = {
  title: string;
  selected: boolean;
  onClick: () => void;
};

export const WidgetCard: FC<WidgetCardProps> = ({ title, selected, onClick }) => (
  <Card
    className={cn(
      "w-full cursor-pointer px-4 py-3 flex items-center justify-center text-center border-2 transition-all duration-200 h-24 shadow-none",
      selected
        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-300 scale-105 shadow-lg"
        : "hover:shadow-lg hover:border-blue-400"
    )}
    onClick={onClick}
    tabIndex={0}
    role="button"
  >
    <CardHeader className="w-full p-0">
      <CardTitle className={cn("text-base font-bold", selected && "text-blue-700")}>
        {title}
      </CardTitle>
    </CardHeader>
  </Card>
);
