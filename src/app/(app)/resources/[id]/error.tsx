"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ResourceDetailError({ error, reset }: ErrorProps) {
  return (
    <div className="bg-card border-destructive/20 flex flex-col items-center justify-center rounded-xl border p-12 text-center shadow-xs">
      <div className="bg-destructive/10 text-destructive flex h-12 w-12 items-center justify-center rounded-full">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-semibold">
        Failed to load resource schedule
      </h2>
      <p className="text-muted-foreground mt-1 max-w-md text-xs">
        {error.message ||
          "An unexpected error occurred while loading this resource."}
      </p>

      <div className="mt-6 flex gap-3">
        <Button variant="outline" size="sm" onClick={reset}>
          Try Again
        </Button>
        <Link
          href="/resources"
          className="text-muted-foreground hover:text-foreground inline-flex h-8 items-center px-3 text-xs font-medium transition"
        >
          Back to Resources
        </Link>
      </div>
    </div>
  );
}
