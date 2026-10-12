"use client";

import { useActionState } from "react";
import { AlertTriangle, Lock, LogIn, Mail } from "lucide-react";
import { loginAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const inputClass =
    "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:outline-none w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm shadow-xs dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 disabled:opacity-50";

  return (
    <form action={formAction} className="space-y-4">
      {state && !state.success && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={isPending}
            autoComplete="email"
            placeholder="name@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            id="password"
            name="password"
            type="password"
            required
            disabled={isPending}
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClass}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full gap-2 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-xs"
      >
        <LogIn className="h-4 w-4" />
        <span>{isPending ? "Signing in..." : "Sign in"}</span>
      </Button>
    </form>
  );
}

