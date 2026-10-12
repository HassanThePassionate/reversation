"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginErrorProps {
  error: Error;
  reset: () => void;
}

export default function LoginError({ error, reset }: LoginErrorProps) {
  return (
    <div className="bg-card w-full max-w-md space-y-4 rounded-2xl border p-8 shadow-xs">
      <div className="rounded-xl border border-rose-200/60 bg-rose-50 p-4 text-xs dark:bg-rose-950/40 dark:border-rose-900/40">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <h2 className="text-sm font-bold">Authentication Error</h2>
        </div>
        <p className="mt-1 text-slate-500">{error.message}</p>
        <Button
          size="sm"
          className="mt-4 gap-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => reset()}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try again</span>
        </Button>
      </div>
    </div>
  );
}

