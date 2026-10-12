import { prisma } from "@/lib/db";

export interface ResourceUtilization {
  resourceId: string;
  resourceName: string;
  bookedHours: number;
}

export async function getUtilization(range: {
  startDate: Date | string;
  endDate: Date | string;
}): Promise<ResourceUtilization[]> {
  const start =
    range.startDate instanceof Date
      ? range.startDate
      : new Date(range.startDate);
  const end =
    range.endDate instanceof Date ? range.endDate : new Date(range.endDate);

  const rows = await prisma.$queryRaw<
    Array<{
      resourceId: string;
      resourceName: string;
      bookedHours: number | null;
    }>
  >`
    SELECT
      r.id AS "resourceId",
      r.name AS "resourceName",
      COALESCE(
        SUM(
          CASE
            WHEN res.id IS NOT NULL THEN
              EXTRACT(EPOCH FROM (
                LEAST(res."endTime", ${end}::timestamptz) - GREATEST(res."startTime", ${start}::timestamptz)
              )) / 3600.0
            ELSE 0
          END
        ),
        0
      )::float AS "bookedHours"
    FROM "resources" r
    LEFT JOIN "reservations" res ON res."resourceId" = r.id
      AND res."status" = 'CONFIRMED'
      AND res."startTime" < ${end}::timestamptz
      AND res."endTime" > ${start}::timestamptz
    WHERE r."isActive" = true
    GROUP BY r.id, r.name
    ORDER BY "bookedHours" DESC, r.name ASC;
  `;

  return rows.map((row) => ({
    resourceId: row.resourceId,
    resourceName: row.resourceName,
    bookedHours: Math.round(Number(row.bookedHours ?? 0) * 100) / 100,
  }));
}
