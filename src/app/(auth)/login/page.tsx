import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <main className="bg-muted/40 flex min-h-screen items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border p-8 shadow-xs">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Sign in to manage and reserve meeting rooms
          </p>
        </div>

        <LoginForm />

        <div className="text-slate-500 mt-6 space-y-1 border-t pt-4 text-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-300">Demo credentials:</p>
          <p>Admin: admin@example.com / Admin@123</p>
          <p>Member: member@example.com / Member@123</p>
        </div>
      </div>
    </main>
  );
}
