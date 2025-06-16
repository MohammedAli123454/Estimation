// app/page.tsx or components/LandingPage.tsx

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListChecks, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-3xl w-full text-center border border-gray-200">
        <div className="flex items-center justify-center mb-5">
          <span className="rounded-full bg-blue-100 p-3">
            <ListChecks className="text-blue-600" size={36} />
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          Manhour Estimation Tool
        </h1>
        <p className="text-gray-700 mb-6 text-lg font-medium">
          A simple way to estimate your project’s manpower requirements.
        </p>
        <ul className="text-left text-gray-700 mb-8 text-base space-y-3 px-4">
          <li className="flex items-start gap-2">
            <ArrowRight className="text-blue-500 mt-1" size={18} />
            Enter itemized scope and job details.
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="text-blue-500 mt-1" size={18} />
            Specify manpower categories and quantities.
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="text-blue-500 mt-1" size={18} />
            Get instant calculation of total required manhours.
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="text-blue-500 mt-1" size={18} />
            Download or share your estimation for planning or proposals.
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="text-blue-500 mt-1" size={18} />
            Save time and avoid manual errors in project estimation.
          </li>
          <li className="flex items-start gap-2 font-semibold text-gray-900">
            <ArrowRight className="text-green-600 mt-1" size={18} />
            <span>
              Lastly, you can <span className="text-green-700 font-bold">export the overall calculated man hours into Excel</span> for further analysis or reporting.
            </span>
          </li>
        </ul>
        <Link href="/ManpowerRequirement">
          <Button size="lg" className="w-full flex items-center justify-center gap-2">
            Start Estimating
            <ArrowRight size={20} />
          </Button>
        </Link>
        <div className="mt-7 text-gray-400 text-xs">
          Empowering your project planning with clarity and confidence.
        </div>
      </div>
    </div>
  );
}
