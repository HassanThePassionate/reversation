import Link from "next/link";

export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  itemName?: string;
  buildPageUrl: (page: number) => string;
}

export function Pagination({
  page,
  totalPages,
  total,
  itemName = "items",
  buildPageUrl,
}: PaginationProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-muted-foreground text-xs">
        Page <span className="text-foreground font-semibold">{page}</span> of{" "}
        <span className="text-foreground font-semibold">{totalPages || 1}</span>{" "}
        ({total} total {itemName})
      </p>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildPageUrl(page - 1)}
            className="hover:bg-muted inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium transition"
          >
            Previous
          </Link>
        ) : (
          <span className="text-muted-foreground inline-flex h-8 cursor-not-allowed items-center rounded-lg border px-3 text-xs opacity-50">
            Previous
          </span>
        )}

        {page < totalPages ? (
          <Link
            href={buildPageUrl(page + 1)}
            className="hover:bg-muted inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium transition"
          >
            Next
          </Link>
        ) : (
          <span className="text-muted-foreground inline-flex h-8 cursor-not-allowed items-center rounded-lg border px-3 text-xs opacity-50">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
