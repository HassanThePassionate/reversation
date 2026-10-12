import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { MS_PER_MINUTE } from "@/lib/constants";
import { findAvailableResources } from "@/lib/services/availability.service";
import { availabilitySearchSchema } from "@/lib/validation/availability";

export interface ParsedAvailabilityQuery {
  queryDate: string;
  queryTime: string;
  queryDuration: number;
  startLocal: string;
  endLocal: string;
  formattedEndTime: string;
}

export function parseAvailabilityQuery(
  raw: {
    date?: string;
    startTime?: string;
    duration?: string;
    typeId?: string;
    minCapacity?: string;
  },
  tz: string
): ParsedAvailabilityQuery {
  const queryDate = raw.date ?? formatInTimeZone(new Date(), tz, "yyyy-MM-dd");
  const queryTime = raw.startTime ?? "10:00";
  const queryDuration = raw.duration ? Number(raw.duration) : 60;
  const startDateObj = fromZonedTime(`${queryDate}T${queryTime}:00`, tz);
  const endDateObj = new Date(
    startDateObj.getTime() + queryDuration * MS_PER_MINUTE
  );

  return {
    queryDate,
    queryTime,
    queryDuration,
    startLocal: `${queryDate}T${queryTime}`,
    endLocal: formatInTimeZone(endDateObj, tz, "yyyy-MM-dd'T'HH:mm"),
    formattedEndTime: formatInTimeZone(endDateObj, tz, "HH:mm"),
  };
}

export async function executeAvailabilitySearch(
  raw: {
    date?: string;
    startTime?: string;
    duration?: string;
    typeId?: string;
    minCapacity?: string;
  },
  tz: string
) {
  const q = parseAvailabilityQuery(raw, tz);
  const parsed = await availabilitySearchSchema.safeParseAsync({
    date: q.queryDate,
    startTime: q.queryTime,
    duration: q.queryDuration,
    typeId: raw.typeId || undefined,
    minCapacity: raw.minCapacity ? Number(raw.minCapacity) : undefined,
  });

  const matching = parsed.success
    ? await findAvailableResources({
        date: parsed.data.date ?? q.queryDate,
        startTime: parsed.data.startTime ?? q.queryTime,
        duration: parsed.data.duration,
        typeId: parsed.data.typeId,
        minCapacity: parsed.data.minCapacity,
      })
    : [];

  const error = !parsed.success
    ? Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") ||
      "Invalid parameters"
    : undefined;

  return { q, matching, error };
}
