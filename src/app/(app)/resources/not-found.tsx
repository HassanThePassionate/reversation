import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function ResourcesNotFound() {
  return (
    <div className="bg-card flex flex-col items-center justify-center rounded-xl border p-12 text-center shadow-xs">
      <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">
        🔍
      </div>
      <h2 className="mt-4 text-base font-semibold">Resource Not Found</h2>
      <p className="text-muted-foreground mt-1 max-w-sm text-xs">
        The resource you are looking for does not exist or may have been
        removed.
      </p>

      <div className="mt-6">
        <Link href="/resources" className={buttonVariants({ size: "sm" })}>
          Back to Resources
        </Link>
      </div>
    </div>
  );
}
