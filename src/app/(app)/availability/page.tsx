import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guards";
import { DEFAULT_ORG_TIMEZONE } from "@/lib/constants";
import { env } from "@/lib/env";
import { executeAvailabilitySearch } from "@/lib/services/availability-params";
import { listResourceTypes } from "@/lib/services/resource.service";
import { AvailabilityForm } from "@/components/availability/availability-form";
import { AvailabilityHeader } from "@/components/availability/availability-header";
import { AvailabilityResults } from "@/components/availability/availability-results";

export const metadata: Metadata = {
  title: "Find Availability",
};

interface AvailabilityPageProps {
  searchParams: Promise<{
    date?: string;
    startTime?: string;
    duration?: string;
    typeId?: string;
    minCapacity?: string;
  }>;
}

export default async function AvailabilityPage({
  searchParams,
}: AvailabilityPageProps) {
  await requireUser();
  const raw = await searchParams;
  const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;

  const [{ q, matching, error }, types] = await Promise.all([
    executeAvailabilitySearch(raw, tz),
    listResourceTypes(),
  ]);

  return (
    <div className="space-y-6">
      <AvailabilityHeader />

      <AvailabilityForm
        types={types}
        defaultValues={{
          date: q.queryDate,
          startTime: q.queryTime,
          duration: q.queryDuration,
          typeId: raw.typeId,
          minCapacity: raw.minCapacity ? Number(raw.minCapacity) : undefined,
        }}
      />

      {error ? (
        <div
          role="alert"
          className="border-destructive/20 bg-destructive/10 text-destructive rounded-xl border p-4 text-xs"
        >
          {error}
        </div>
      ) : (
        <AvailabilityResults
          resources={matching}
          queryTime={q.queryTime}
          formattedEndTime={q.formattedEndTime}
          queryDate={q.queryDate}
          startLocal={q.startLocal}
          endLocal={q.endLocal}
        />
      )}
    </div>
  );
}
