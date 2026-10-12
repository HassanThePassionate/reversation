import { Suspense } from "react";
import { requireUser } from "@/lib/auth/guards";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";

async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen bg-slate-50/70 dark:bg-slate-950">
      <div className="hidden lg:block lg:shrink-0">
        <Sidebar user={user} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader user={user} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-20 sm:px-8 lg:pb-8">
          <Suspense fallback={null}>{children}</Suspense>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}
