import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { requireUser } from "@/lib/auth/guards";
import { DEFAULT_ORG_TIMEZONE } from "@/lib/constants";
import { env } from "@/lib/env";
import { NotFoundError } from "@/lib/errors";
import { getResourcesAvailabilityNow } from "@/lib/services/availability.service";
import { getResourceById } from "@/lib/services/resource.service";
import { ResourceHeader } from "@/components/resources/resource-header";
import { BookingForm } from "@/components/reservations/booking-form";
import {
  TimelineSection,
  TimelineSkeleton,
} from "@/components/resources/timeline-section";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    date?: string;
    startTime?: string;
    endTime?: string;
  }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const res = await getResourceById(id).catch(() => null);
  return { title: res ? res.name : "Resource Details" };
}

export default async function ResourceDetailPage(props: PageProps) {
  const [{ id }, { date, startTime, endTime }, user] = await Promise.all([
    props.params,
    props.searchParams,
    requireUser(),
  ]);

  const [resource, availabilityMap] = await Promise.all([
    getResourceById(id),
    getResourcesAvailabilityNow([id]),
  ]).catch((error) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  const availability = availabilityMap[id];
  const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;
  const todayStr = formatInTimeZone(new Date(), tz, "yyyy-MM-dd");
  const selectedDate =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayStr;

  return (
    <div className="space-y-6">
      <ResourceHeader
        resource={{ ...resource, availability }}
        isAdmin={user.role === "ADMIN"}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<TimelineSkeleton />}>
            <TimelineSection resourceId={id} date={selectedDate} />
          </Suspense>
        </div>

        <div>
          <BookingForm
            resourceId={id}
            isActive={resource.isActive}
            defaultDate={selectedDate}
            defaultStartTime={startTime}
            defaultEndTime={endTime}
          />
        </div>
      </div>
    </div>
  );
}
