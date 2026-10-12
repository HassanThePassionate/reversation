import Link from "next/link";
import { Building2 } from "lucide-react";
import { SidebarNavLink } from "@/components/layout/sidebar-nav-link";
import type { CurrentUser } from "@/lib/services/user.service";

interface SidebarProps {
  user: CurrentUser;
}

export function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="bg-card text-card-foreground flex h-full w-64 flex-col border-r shadow-xs">
      <div className="flex h-16 items-center gap-2.5 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
          <Building2 className="h-4 w-4" />
        </div>
        <Link
          href="/dashboard"
          className="text-base font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Meeting<span className="text-blue-600">Room</span>
        </Link>
      </div>

      <nav
        className="flex-1 space-y-1.5 px-3 py-4"
        aria-label="Sidebar Navigation"
      >
        <SidebarNavLink href="/dashboard" label="Home" icon="dashboard" />
        <SidebarNavLink
          href="/reservations"
          label="Meetings"
          icon="reservations"
        />
        <SidebarNavLink
          href="/reservations/mine"
          label="My Bookings"
          icon="mine"
        />
        <SidebarNavLink href="/resources" label="Rooms" icon="resources" />
        <SidebarNavLink
          href="/availability"
          label="Schedule"
          icon="availability"
        />

        {user.role === "ADMIN" && (
          <div className="pt-4">
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Admin
            </p>
            <SidebarNavLink href="/resources/new" label="New Room" icon="add" />
          </div>
        )}
      </nav>

      <div className="border-t p-3">
        <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/50">
          <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
            {user.name}
          </p>
          <p className="truncate text-[10px] text-slate-500">{user.email}</p>
        </div>
      </div>
    </aside>
  );
}
