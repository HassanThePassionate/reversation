import Link from "next/link";
import { Plus } from "lucide-react";
import { UserNav } from "@/components/layout/user-nav";
import type { CurrentUser } from "@/lib/services/user.service";

interface NavbarProps {
  user: CurrentUser;
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resources", label: "Resources" },
  { href: "/reservations", label: "Reservations" },
  { href: "/availability", label: "Availability" },
];

export function Navbar({ user }: NavbarProps) {
  const linkClass =
    "hover:text-foreground focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 rounded-md px-1.5 py-1 text-xs font-medium transition sm:text-sm";

  return (
    <header className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link
            href="/dashboard"
            className="focus-visible:ring-ring shrink-0 text-sm font-bold tracking-tight focus-visible:ring-2 focus-visible:outline-none"
          >
            ReserveHub
          </Link>

          <nav
            aria-label="Main Navigation"
            className="text-muted-foreground flex items-center gap-1.5 overflow-x-auto py-1 sm:gap-3"
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
            {user.role === "ADMIN" && (
              <Link
                href="/resources/new"
                className="text-primary focus-visible:ring-ring shrink-0 rounded-md px-1.5 py-1 text-xs font-semibold hover:underline focus-visible:ring-2 focus-visible:outline-none"
              >
                <Plus className="mr-1 inline size-3.5" aria-hidden="true" />
                New
              </Link>
            )}
          </nav>
        </div>

        <UserNav user={user} />
      </div>
    </header>
  );
}
