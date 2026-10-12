import Link from "next/link";
import {
  CalendarDays,
  CalendarCheck,
  CalendarSearch,
  DoorOpen,
  LayoutDashboard,
} from "lucide-react";

const mobileLinks = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/reservations", label: "Meetings", icon: CalendarDays },
  { href: "/reservations/mine", label: "Mine", icon: CalendarCheck },
  { href: "/resources", label: "Rooms", icon: DoorOpen },
  { href: "/availability", label: "Schedule", icon: CalendarSearch },
];

export function MobileNav() {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="bg-card/95 fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t backdrop-blur-md lg:hidden"
    >
      {mobileLinks.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-blue-600"
          >
            <Icon className="h-4 w-4" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
