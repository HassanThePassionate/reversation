import Link from "next/link";
import { Building2, CalendarPlus } from "lucide-react";
import { UserNav } from "@/components/layout/user-nav";
import { buttonVariants } from "@/components/ui/button";
import type { CurrentUser } from "@/lib/services/user.service";

interface TopHeaderProps {
  user: CurrentUser;
}

export function TopHeader({ user }: TopHeaderProps) {
  return (
    <header className="bg-card/90 sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Building2 className="h-4 w-4" />
          </div>
          <span>MeetingRoom</span>
        </Link>
      </div>

      <div className="hidden lg:flex lg:items-center lg:gap-2">
        <span className="text-xs font-medium text-slate-400">Workspace</span>
        <span className="text-xs text-slate-300">/</span>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          Resource Reservations
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/availability"
          className={buttonVariants({
            size: "sm",
            className: "h-8 gap-1.5 rounded-lg bg-blue-600 text-xs font-medium text-white hover:bg-blue-700 shadow-xs",
          })}
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          <span>Quick Book</span>
        </Link>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
        <UserNav user={user} />
      </div>
    </header>
  );
}
