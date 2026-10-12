"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ResourcesError({ error, reset }: ErrorProps) {
  return (
    <div className="bg-card flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
        Failed to load resources
      </h2>
      <p className="mt-1 max-w-md text-xs text-slate-500">
        {error.message ||
          "An unexpected error occurred while loading resources."}
      </p>
      <div className="mt-5 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          className="gap-1.5 rounded-xl"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </Button>
        <Link
          href="/dashboard"
          className="hover:bg-slate-100 text-slate-600 inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
