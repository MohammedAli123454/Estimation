import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface Props {
  selected?: boolean;
  onClick?: () => void;
  code: string;
  description: string;
  rate: string;
}

export function ManpowerWidgetCard({ selected, onClick, code, description, rate }: Props) {
  return (
    <div
      className={cn(
        "relative w-full min-w-[210px] max-w-xs h-20 flex items-center rounded-3xl cursor-pointer select-none transition-all duration-200 border-2",
        selected
          ? "border-blue-400 bg-gradient-to-b from-blue-50 to-blue-100 ring-2 ring-blue-400"
          : "border-yellow-200 bg-gradient-to-b from-[#fff7d6] to-[#ffe8b7] hover:ring-2 hover:ring-blue-400 hover:scale-[1.025] shadow-[0_1px_2px_0_rgba(251,191,36,0.07)]"
      )}
      tabIndex={0}
      role="group"
      onClick={onClick}
    >
      <CardContent className="flex flex-row items-center justify-between w-full px-4 py-2">
        <span className="font-medium text-yellow-900 truncate pr-2">{description}</span>
        <span className="font-bold text-blue-700 text-base flex-shrink-0">
          {Number(rate).toFixed(2)}{" "}
          <span className="text-xs font-semibold text-yellow-900">SR</span>
        </span>
      </CardContent>
      <span className="absolute top-2 right-2">
        {selected ? (
          <CheckCircle2 size={22} className="text-blue-600" />
        ) : (
          <span className="inline-block w-5 h-5 rounded-full border-2 border-gray-300 bg-white"></span>
        )}
      </span>
    </div>
  );
}
