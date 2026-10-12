"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

interface EditResourceErrorProps {
  error: Error;
  reset: () => void;
}

export default function EditResourceError({
  error,
  reset,
}: EditResourceErrorProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-xl border p-5 text-xs">
        <h2 className="text-sm font-semibold">
          Failed to load resource for editing
        </h2>
        <p className="text-muted-foreground mt-1">{error.message}</p>
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={() => reset()}>
            Try again
          </Button>
          <Link
            href="/resources"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to Resources
          </Link>
        </div>
      </div>
    </div>
  );
}
