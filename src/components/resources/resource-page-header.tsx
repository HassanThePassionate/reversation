import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function ResourcePageHeader({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Meeting Rooms & Resources
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Browse and reserve rooms, conference halls, and shared assets
        </p>
      </div>
      {isAdmin && (
        <Link
          href="/resources/new"
          className={buttonVariants({
            size: "sm",
            className: "h-9 gap-1.5 rounded-xl bg-blue-600 font-medium text-white hover:bg-blue-700 shadow-xs",
          })}
        >
          <Plus className="h-4 w-4" />
          <span>New Room</span>
        </Link>
      )}
    </div>
  );
}
