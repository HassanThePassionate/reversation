"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  error: Error;
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <div className="bg-card flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
        Something went wrong
      </h2>
      <p className="mt-1 max-w-md text-xs text-slate-500">{error.message}</p>
      <Button
        size="sm"
        onClick={() => reset()}
        className="mt-5 gap-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Try again</span>
      </Button>
    </div>
  );
}
