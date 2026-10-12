import Link from "next/link";
import { DoorOpen, FileQuestion, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="bg-card flex max-w-md flex-col items-center rounded-2xl border p-10 shadow-xs">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40">
          <FileQuestion className="h-7 w-7" />
        </div>
        <span className="text-slate-300 dark:text-slate-600 mt-4 font-mono text-5xl font-extrabold tracking-tight">
          404
        </span>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Page Not Found
        </h1>
        <p className="text-slate-500 mt-2 max-w-xs text-xs">
          The page or resource you are looking for does not exist or may have
          been moved.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/dashboard"
            className={buttonVariants({
              size: "sm",
              className: "h-9 gap-1.5 rounded-xl bg-blue-600 font-medium text-white hover:bg-blue-700 shadow-xs",
            })}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/resources"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "h-9 gap-1.5 rounded-xl",
            })}
          >
            <DoorOpen className="h-3.5 w-3.5" />
            <span>Browse Rooms</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

