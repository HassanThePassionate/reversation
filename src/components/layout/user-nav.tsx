import { LogOut, User } from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import type { CurrentUser } from "@/lib/services/user.service";

interface UserNavProps {
  user: CurrentUser;
}

export function UserNav({ user }: UserNavProps) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <User className="h-4 w-4" />
        </div>
        <div className="hidden text-left text-xs sm:block">
          <p className="max-w-[120px] truncate font-semibold text-slate-800 dark:text-slate-200">
            {user.name}
          </p>
          <span className="inline-block rounded-md bg-blue-50 px-1.5 py-0.2 text-[9px] font-bold uppercase text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {user.role}
          </span>
        </div>
      </div>

      <form action={logoutAction}>
        <Button
          variant="ghost"
          size="sm"
          type="submit"
          className="h-8 gap-1.5 px-2.5 text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400"
          aria-label="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </form>
    </div>
  );
}
