"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  CalendarDays,
  CalendarSearch,
  ChevronRight,
  DoorOpen,
  LayoutDashboard,
  PlusCircle,
} from "lucide-react";

const icons = {
  dashboard: LayoutDashboard,
  reservations: CalendarDays,
  mine: CalendarCheck,
  resources: DoorOpen,
  availability: CalendarSearch,
  add: PlusCircle,
} as const;

interface SidebarNavLinkProps {
  href: string;
  label: string;
  icon: keyof typeof icons;
}

export function SidebarNavLink({ href, label, icon }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const Icon = icons[icon];
  const isActive =
    pathname === href ||
    (href !== "/dashboard" &&
      pathname.startsWith(`${href}/`) &&
      !(href === "/reservations" && pathname.startsWith("/reservations/mine")));

  return (
    <Link
      href={href}
      className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
        isActive
          ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
            isActive
              ? "text-white"
              : "text-slate-400 group-hover:text-slate-600"
          }`}
        />
        <span>{label}</span>
      </div>
      <ChevronRight
        className={`h-3.5 w-3.5 transition-transform ${
          isActive
            ? "text-white/80"
            : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-500"
        }`}
      />
    </Link>
  );
}
